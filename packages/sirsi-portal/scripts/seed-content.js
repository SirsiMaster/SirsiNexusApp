/**
 * Content Seeder for SirsiNexus
 * Populates Firestore with initial content for all pages
 */

const admin = require('firebase-admin');
const serviceAccount = require('../functions/service-account.json'); // You'll need to download this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sirsi-nexus-live'
});

const db = admin.firestore();

// Team Members Data
const teamMembers = [
  {
    id: 'founder-ceo',
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Former Google Cloud architect with 15+ years building scalable infrastructure. Led teams at AWS and Microsoft Azure.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    linkedin: 'https://linkedin.com/in/alexchen',
    github: 'https://github.com/alexchen',
    order: 1
  },
  {
    id: 'cto',
    name: 'Sarah Martinez',
    role: 'Chief Technology Officer',
    bio: 'AI/ML expert with PhD from MIT. Previously built autonomous systems at Tesla and DeepMind.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    linkedin: 'https://linkedin.com/in/sarahmartinez',
    github: 'https://github.com/sarahm',
    order: 2
  },
  {
    id: 'head-engineering',
    name: 'James Wilson',
    role: 'Head of Engineering',
    bio: 'Full-stack architect with expertise in Rust, Go, and distributed systems. Built infrastructure at Uber and Stripe.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    linkedin: 'https://linkedin.com/in/jameswilson',
    github: 'https://github.com/jwilson',
    order: 3
  },
  {
    id: 'head-product',
    name: 'Emily Zhang',
    role: 'Head of Product',
    bio: 'Product visionary who launched enterprise products at Salesforce and Oracle. Stanford MBA.',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    linkedin: 'https://linkedin.com/in/emilyzhang',
    order: 4
  }
];

// Blog Posts Data
const blogPosts = [
  {
    id: 'introducing-sirsinexus',
    title: 'Introducing SirsiNexus: The Future of Intelligent Infrastructure',
    slug: 'introducing-sirsinexus',
    excerpt: 'Today, we\'re excited to announce SirsiNexus, a revolutionary AI-powered infrastructure platform that thinks, learns, and evolves with your business.',
    content: `
# Introducing SirsiNexus: The Future of Intelligent Infrastructure

Today marks a significant milestone in the evolution of cloud infrastructure management. We're thrilled to introduce SirsiNexus, an AI-powered platform that fundamentally reimagines how enterprises manage their cloud resources.

## The Problem We're Solving

Modern enterprises struggle with:
- **Complexity**: Managing multi-cloud environments across AWS, Azure, and GCP
- **Reactive Operations**: Fixing problems after they occur instead of preventing them
- **Cost Overruns**: Inability to predict and optimize resource usage
- **Skill Gaps**: Finding and retaining cloud expertise

## Our Solution: Autonomous Infrastructure

SirsiNexus embeds AI agents directly into your infrastructure that:

### 1. Predict and Prevent
Our agents analyze millions of data points to predict failures weeks before they occur, automatically implementing preventive measures.

### 2. Self-Heal
When issues arise, SirsiNexus doesn't just alert you—it automatically fixes problems, reroutes traffic, and maintains service continuity.

### 3. Optimize Continuously
Beyond simple auto-scaling, our AI understands your business patterns and optimizes costs across your entire multi-cloud environment.

## Key Features

- **Zero-Touch Operations**: From deployment to optimization
- **Natural Language Control**: Describe what you need in plain English
- **Multi-Cloud Native**: Seamless management across all major providers
- **Enterprise Security**: Built-in compliance and security intelligence

## Get Started Today

Join the infrastructure revolution. Sign up for early access at [sirsi.ai](https://sirsi.ai).

*The future of infrastructure is autonomous. The future is SirsiNexus.*
    `,
    author: 'Alex Chen',
    category: 'Announcement',
    tags: ['launch', 'ai', 'infrastructure', 'cloud'],
    publishedAt: new Date('2024-12-01'),
    readTime: 5,
    featured: true,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop'
  },
  {
    id: 'ai-agents-infrastructure',
    title: 'How AI Agents Are Revolutionizing Infrastructure Management',
    slug: 'ai-agents-infrastructure',
    excerpt: 'Explore how autonomous AI agents can manage, optimize, and heal your infrastructure without human intervention.',
    content: `
# How AI Agents Are Revolutionizing Infrastructure Management

The era of manual infrastructure management is ending. AI agents are taking over, and they're doing a better job than humans ever could.

## What Are Infrastructure AI Agents?

Infrastructure AI agents are autonomous software entities that:
- Monitor system health in real-time
- Make decisions based on learned patterns
- Execute changes without human approval
- Learn from outcomes to improve over time

## Real-World Applications

### Predictive Scaling
Traditional auto-scaling reacts to load. AI agents predict load based on:
- Historical patterns
- Business events
- External factors (weather, news, social media)
- Correlated system behaviors

### Intelligent Cost Optimization
Our agents have saved enterprises millions by:
- Identifying unused resources
- Rightsizing instances based on actual usage
- Negotiating spot instance pricing
- Moving workloads to optimal regions

### Security Response
AI agents detect and respond to threats in milliseconds:
- Anomaly detection across all layers
- Automatic isolation of compromised resources
- Predictive threat modeling
- Compliance validation

## The Results Speak for Themselves

- **73% reduction** in infrastructure incidents
- **47% decrease** in cloud costs
- **99.99% uptime** achieved
- **6x faster** deployment times

## The Future is Autonomous

We're just scratching the surface. Future capabilities include:
- Cross-cloud optimization
- Business-aware decision making
- Predictive capacity planning
- Autonomous architecture evolution

Ready to let AI manage your infrastructure? [Get started with SirsiNexus](https://sirsi.ai).
    `,
    author: 'Sarah Martinez',
    category: 'Technology',
    tags: ['ai', 'agents', 'automation', 'devops'],
    publishedAt: new Date('2024-12-05'),
    readTime: 7,
    featured: true,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop'
  },
  {
    id: 'cost-optimization-guide',
    title: 'The Ultimate Guide to Cloud Cost Optimization with AI',
    slug: 'cost-optimization-guide',
    excerpt: 'Learn how AI-driven optimization can reduce your cloud costs by up to 60% while improving performance.',
    content: `
# The Ultimate Guide to Cloud Cost Optimization with AI

Cloud costs are spiraling out of control for most enterprises. Here's how AI changes the game.

## The Hidden Cost Crisis

Most organizations are overspending on cloud by 35-45% due to:
- Overprovisioned resources
- Idle instances
- Inefficient architectures
- Lack of visibility

## AI-Powered Optimization Strategies

### 1. Predictive Resource Management
AI analyzes usage patterns to:
- Predict future resource needs
- Automatically scale down during low usage
- Pre-warm resources before traffic spikes

### 2. Intelligent Workload Placement
Our AI agents optimize placement by:
- Analyzing cost across regions
- Considering data transfer costs
- Balancing performance requirements
- Leveraging spot instances intelligently

### 3. Continuous Architecture Optimization
AI continuously evolves your architecture:
- Suggests more efficient service configurations
- Identifies opportunities for serverless migration
- Recommends reserved instance purchases
- Optimizes data storage tiers

## Case Study: 60% Cost Reduction

A Fortune 500 client achieved:
- **$2.8M annual savings**
- **Better performance** than before
- **Zero manual intervention**
- **ROI in 3 months**

## Get Started with AI Optimization

Start your cost optimization journey:
1. Connect your cloud accounts
2. Let AI analyze your usage
3. Review recommendations
4. Enable autonomous optimization
5. Watch costs drop

[Start saving with SirsiNexus](https://sirsi.ai/pricing)
    `,
    author: 'James Wilson',
    category: 'Best Practices',
    tags: ['cost-optimization', 'cloud', 'savings', 'efficiency'],
    publishedAt: new Date('2024-12-10'),
    readTime: 10,
    featured: false,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop'
  }
];

// Job Listings Data
const jobListings = [
  {
    id: 'senior-rust-engineer',
    title: 'Senior Rust Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    experience: 'Senior',
    salary: '$180k - $250k + equity',
    description: `
We're looking for a Senior Rust Engineer to build the core infrastructure engine of SirsiNexus.

**What You'll Do:**
- Design and implement high-performance systems in Rust
- Build distributed systems that scale to millions of operations
- Optimize for sub-millisecond latency
- Contribute to open-source Rust ecosystem

**Requirements:**
- 5+ years of systems programming experience
- 2+ years of production Rust experience
- Deep understanding of concurrent programming
- Experience with distributed systems

**Nice to Have:**
- Contributions to Rust open-source projects
- Experience with WASM
- Cloud provider internals knowledge
- Previous startup experience
    `,
    responsibilities: [
      'Design and implement core infrastructure engine',
      'Optimize system performance and reliability',
      'Mentor junior engineers',
      'Contribute to technical architecture decisions'
    ],
    requirements: [
      '5+ years systems programming',
      '2+ years Rust in production',
      'Distributed systems expertise',
      'Strong CS fundamentals'
    ],
    benefits: [
      'Competitive salary + equity',
      'Full remote flexibility',
      'Unlimited PTO',
      'Top-tier health insurance',
      '$5k learning budget'
    ],
    publishedAt: new Date('2024-12-08'),
    active: true
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    department: 'AI/ML',
    location: 'Remote (Global)',
    type: 'Full-time',
    experience: 'Senior',
    salary: '$200k - $300k + equity',
    description: `
Join us in building the AI brain of SirsiNexus. We need an ML Engineer who can create autonomous systems that learn and adapt.

**What You'll Do:**
- Develop ML models for infrastructure optimization
- Implement reinforcement learning for decision making
- Build predictive models for failure prevention
- Scale ML systems to production

**Requirements:**
- MS/PhD in ML, CS, or related field
- 3+ years of production ML experience
- Expertise in PyTorch or TensorFlow
- Experience with MLOps and model deployment

**Nice to Have:**
- Research publications in ML/AI
- Experience with reinforcement learning
- Infrastructure/DevOps background
- Time series forecasting expertise
    `,
    responsibilities: [
      'Develop and deploy ML models',
      'Research new AI techniques',
      'Optimize model performance',
      'Build ML infrastructure'
    ],
    requirements: [
      'Advanced degree in ML/CS',
      '3+ years ML in production',
      'PyTorch/TensorFlow expertise',
      'MLOps experience'
    ],
    benefits: [
      'Top-tier compensation',
      'Conference attendance',
      'GPU resources for research',
      'Publication opportunities',
      'Flexible hours'
    ],
    publishedAt: new Date('2024-12-09'),
    active: true
  },
  {
    id: 'developer-advocate',
    title: 'Developer Advocate',
    department: 'Developer Relations',
    location: 'Remote (US)',
    type: 'Full-time',
    experience: 'Mid-Senior',
    salary: '$140k - $180k + equity',
    description: `
Be the voice of SirsiNexus in the developer community. We need someone who loves teaching, writing, and building.

**What You'll Do:**
- Create technical content (blogs, videos, tutorials)
- Speak at conferences and meetups
- Build demo applications and examples
- Engage with the developer community

**Requirements:**
- 3+ years in DevRel or engineering
- Excellent communication skills
- Experience with cloud platforms
- Active in developer communities

**Nice to Have:**
- Existing audience/following
- Conference speaking experience
- Open source contributions
- Video production skills
    `,
    responsibilities: [
      'Create technical content',
      'Speak at events',
      'Build community',
      'Gather developer feedback'
    ],
    requirements: [
      '3+ years DevRel/Engineering',
      'Strong communication skills',
      'Cloud platform knowledge',
      'Community engagement'
    ],
    benefits: [
      'Conference travel budget',
      'Content creation tools',
      'Flexible schedule',
      'Remote work',
      'Learning opportunities'
    ],
    publishedAt: new Date('2024-12-10'),
    active: true
  }
];

// Pricing Tiers Data
const pricingTiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    period: 'month',
    description: 'Perfect for small teams and projects',
    features: [
      'Up to 50 resources',
      'Basic AI optimization',
      'Email support',
      'Single cloud provider',
      'Daily backups',
      'Basic monitoring'
    ],
    limitations: [
      'No custom integrations',
      'Limited to 1 user',
      'No SLA'
    ],
    cta: 'Start Free Trial',
    popular: false,
    order: 1
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499,
    period: 'month',
    description: 'For growing businesses and teams',
    features: [
      'Up to 500 resources',
      'Advanced AI optimization',
      'Priority support',
      'Multi-cloud support',
      'Real-time monitoring',
      'Custom dashboards',
      'API access',
      'Team collaboration',
      '99.9% SLA'
    ],
    limitations: [
      'Limited to 10 users'
    ],
    cta: 'Start Free Trial',
    popular: true,
    order: 2
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'custom',
    description: 'For large organizations with complex needs',
    features: [
      'Unlimited resources',
      'Full AI capabilities',
      'Dedicated support team',
      'All cloud providers',
      'Custom integrations',
      'Advanced security',
      'Compliance tools',
      'Unlimited users',
      'Training included',
      '99.99% SLA',
      'Custom contracts'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    order: 3
  }
];

// Seed function
async function seedContent() {
  try {
    console.log('🌱 Starting content seeding...\n');

    // Seed Team Members
    console.log('Adding team members...');
    const teamBatch = db.batch();
    teamMembers.forEach(member => {
      const ref = db.collection('team').doc(member.id);
      teamBatch.set(ref, {
        ...member,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await teamBatch.commit();
    console.log(`✅ Added ${teamMembers.length} team members`);

    // Seed Blog Posts
    console.log('Adding blog posts...');
    const blogBatch = db.batch();
    blogPosts.forEach(post => {
      const ref = db.collection('blog').doc(post.id);
      blogBatch.set(ref, {
        ...post,
        views: 0,
        likes: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await blogBatch.commit();
    console.log(`✅ Added ${blogPosts.length} blog posts`);

    // Seed Job Listings
    console.log('Adding job listings...');
    const jobsBatch = db.batch();
    jobListings.forEach(job => {
      const ref = db.collection('jobs').doc(job.id);
      jobsBatch.set(ref, {
        ...job,
        applications: 0,
        views: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await jobsBatch.commit();
    console.log(`✅ Added ${jobListings.length} job listings`);

    // Seed Pricing Tiers
    console.log('Adding pricing tiers...');
    const pricingBatch = db.batch();
    pricingTiers.forEach(tier => {
      const ref = db.collection('pricing').doc(tier.id);
      pricingBatch.set(ref, {
        ...tier,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await pricingBatch.commit();
    console.log(`✅ Added ${pricingTiers.length} pricing tiers`);

    // Add site configuration
    console.log('Adding site configuration...');
    await db.collection('config').doc('site').set({
      companyName: 'Sirsi Technologies Inc.',
      tagline: 'Intelligent Infrastructure for the AI Era',
      description: 'SirsiNexus is an AI-powered infrastructure platform that thinks, learns, and evolves with your business.',
      contactEmail: 'hello@sirsi.ai',
      supportEmail: 'support@sirsi.ai',
      socialLinks: {
        twitter: 'https://twitter.com/sirsinexus',
        linkedin: 'https://linkedin.com/company/sirsinexus',
        github: 'https://github.com/SirsiMaster'
      },
      features: {
        signupEnabled: true,
        blogEnabled: true,
        jobsEnabled: true,
        pricingEnabled: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Added site configuration');

    console.log('\n🎉 Content seeding complete!');
    console.log('Visit https://sirsi.ai to see the content');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding content:', error);
    process.exit(1);
  }
}

// Run the seeder
seedContent();
