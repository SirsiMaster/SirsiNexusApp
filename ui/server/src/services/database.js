const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.connectionString = process.env.DATABASE_URL || 'postgresql://root@localhost:26257/sirsi_nexus?sslmode=disable';
  }

  async initialize() {
    try {
      this.pool = new Pool({
        connectionString: this.connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      console.log('Connected to CockroachDB database');
      await this.ensureTablesExist();
      await this.createSettingsTables();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async ensureTablesExist() {
    const client = await this.pool.connect();
    try {
      // Check if core tables exist
      const result = await client.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `);
      
      if (result.rows.length === 0) {
        console.log('Core tables not found, please run migrations first');
        throw new Error('Database tables not found. Run migrations first.');
      }
      
      await this.createDefaultAdmin();
    } finally {
      client.release();
    }
  }

  async createSettingsTables() {
    const client = await this.pool.connect();
    try {
      // User settings table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category VARCHAR(100) NOT NULL,
          setting_key VARCHAR(100) NOT NULL,
          setting_value JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(user_id, category, setting_key)
        )
      `);

      // User sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // User credentials table (encrypted cloud credentials)
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_credentials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          encrypted_data TEXT NOT NULL,
          description TEXT,
          last_used TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // Infrastructure resources table
      await client.query(`
        CREATE TABLE IF NOT EXISTS infrastructure_resources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          provider VARCHAR(50) NOT NULL,
          region VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          configuration JSONB NOT NULL DEFAULT '{}',
          tags JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // Infrastructure metrics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS infrastructure_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          resource_id UUID NOT NULL REFERENCES infrastructure_resources(id) ON DELETE CASCADE,
          metric_name VARCHAR(100) NOT NULL,
          metric_value DOUBLE PRECISION NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT now()
        )
      `);

      // AI jobs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS ai_jobs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          job_type VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          input_data JSONB,
          output_data JSONB,
          error_message TEXT,
          started_at TIMESTAMPTZ,
          completed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // Notifications table
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT false,
          data JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // Teams table
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);

      // Team members table
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          role VARCHAR(50) DEFAULT 'member',
          joined_at TIMESTAMPTZ DEFAULT now(),
          UNIQUE(team_id, user_id)
        )
      `);

      // Create indexes for performance
      await client.query('CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_infrastructure_user_id ON infrastructure_resources(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_metrics_resource_id ON infrastructure_metrics(resource_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id)');
      
      console.log('Additional tables and indexes created successfully');
    } finally {
      client.release();
    }
  }

  async createDefaultAdmin() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@sirsinexus.com']
      );

      if (result.rows.length === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await client.query(
          'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)',
          ['admin@sirsinexus.com', hashedPassword, 'System Administrator']
        );
        console.log('Default admin user created: admin@sirsinexus.com / admin123');
      }
    } finally {
      client.release();
    }
  }

  async query(text, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // User management methods
  async createUser(userData) {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = uuidv4();
    
    const result = await this.query(
      'INSERT INTO users (id, email, password_hash, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at',
      [id, email, hashedPassword, name]
    );

    return result.rows[0];
  }

  async getUserByEmail(email) {
    const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async getUserById(id) {
    const result = await this.query(
      'SELECT id, email, name, avatar, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async updateUser(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(
      `UPDATE users SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING id, email, name, avatar, created_at, updated_at`,
      [id, ...values]
    );

    return result.rows[0];
  }

  async verifyPassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Update last login
    await this.query('UPDATE users SET last_login = now() WHERE id = $1', [user.id]);

    return this.getUserById(user.id);
  }

  // Settings management
  async getUserSettings(userId, category = null) {
    let query = 'SELECT category, setting_key, setting_value FROM user_settings WHERE user_id = $1';
    let params = [userId];

    if (category) {
      query += ' AND category = $2';
      params.push(category);
    }

    const result = await this.query(query, params);
    
    const settings = {};
    result.rows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      settings[row.category][row.setting_key] = row.setting_value;
    });

    return category ? settings[category] || {} : settings;
  }

  async updateUserSetting(userId, category, key, value) {
    await this.query(
      `INSERT INTO user_settings (user_id, category, setting_key, setting_value, updated_at) 
       VALUES ($1, $2, $3, $4, now()) 
       ON CONFLICT (user_id, category, setting_key) 
       DO UPDATE SET setting_value = $4, updated_at = now()`,
      [userId, category, key, JSON.stringify(value)]
    );

    return this.getUserSettings(userId, category);
  }

  async deleteUserSetting(userId, category, key) {
    await this.query(
      'DELETE FROM user_settings WHERE user_id = $1 AND category = $2 AND setting_key = $3',
      [userId, category, key]
    );
  }

  // Session management
  async createSession(userId, sessionToken, expiresAt, ipAddress, userAgent) {
    return this.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [userId, sessionToken, expiresAt, ipAddress, userAgent]
    );
  }

  async getSession(sessionToken) {
    const result = await this.query(
      'SELECT * FROM user_sessions WHERE session_token = $1 AND expires_at > now()',
      [sessionToken]
    );
    return result.rows[0];
  }

  async deleteSession(sessionToken) {
    return this.query('DELETE FROM user_sessions WHERE session_token = $1', [sessionToken]);
  }

  async deleteExpiredSessions() {
    return this.query('DELETE FROM user_sessions WHERE expires_at <= now()');
  }

  // Infrastructure resources
  async createInfrastructureResource(data) {
    const { userId, projectId, name, type, provider, region, configuration, tags } = data;
    const id = uuidv4();
    
    const result = await this.query(
      `INSERT INTO infrastructure_resources 
       (id, user_id, project_id, name, type, provider, region, configuration, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [id, userId, projectId, name, type, provider, region, JSON.stringify(configuration), JSON.stringify(tags)]
    );

    return result.rows[0];
  }

  async getInfrastructureResources(userId, filters = {}) {
    let query = 'SELECT * FROM infrastructure_resources WHERE user_id = $1';
    let params = [userId];
    let paramIndex = 2;

    if (filters.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.provider) {
      query += ` AND provider = $${paramIndex}`;
      params.push(filters.provider);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.query(query, params);
    return result.rows;
  }

  // AI jobs
  async createAIJob(userId, jobType, inputData) {
    const id = uuidv4();
    
    const result = await this.query(
      'INSERT INTO ai_jobs (id, user_id, job_type, input_data) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, userId, jobType, JSON.stringify(inputData)]
    );

    return result.rows[0];
  }

  async updateAIJob(id, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => {
      if (field === 'output_data' || field === 'input_data') {
        return `${field} = $${index + 2}::jsonb`;
      }
      return `${field} = $${index + 2}`;
    }).join(', ');
    
    const processedValues = values.map(value => {
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });

    const result = await this.query(
      `UPDATE ai_jobs SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...processedValues]
    );

    return result.rows[0];
  }

  // Notifications
  async createNotification(userId, type, title, message, data = {}) {
    const id = uuidv4();
    
    const result = await this.query(
      'INSERT INTO notifications (id, user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userId, type, title, message, JSON.stringify(data)]
    );

    return result.rows[0];
  }

  async getUserNotifications(userId, limit = 50, offset = 0) {
    const result = await this.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    return result.rows;
  }

  async markNotificationAsRead(id, userId) {
    const result = await this.query(
      'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    return result.rows[0];
  }

  isConnected() {
    return this.pool !== null;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

module.exports = DatabaseService;
