// Canvas Animation Class for Instruction Demo
class InstructionCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.particles = [];
    this.connectionDistance = 100;
    this.maxParticles = 50;
    
    // Initialize particles
    this.initParticles();
    
    // Start animation loop
    this.animate();
  }

  initParticles() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: `rgba(16, 185, 129, ${Math.random() * 0.5 + 0.25})`
      });
    }
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw particles and connections
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      
      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - distance/this.connectionDistance) * 0.2})`;
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.fillStyle = p1.color;
      this.ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Update position
      p1.x += p1.vx;
      p1.y += p1.vy;

      // Bounce off walls
      if (p1.x < 0 || p1.x > this.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > this.height) p1.vy *= -1;
    }
  }

  animate() {
    this.drawParticles();
    requestAnimationFrame(() => this.animate());
  }

  // Add particles on demand
  addParticle(x, y) {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x: x || Math.random() * this.width,
        y: y || Math.random() * this.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: `rgba(16, 185, 129, ${Math.random() * 0.5 + 0.25})`
      });
    }
  }

  // Remove particles
  removeParticle() {
    if (this.particles.length > 0) {
      this.particles.pop();
    }
  }

  // Update animation based on state
  updateState(state) {
    switch(state) {
      case 'analyzing':
        this.connectionDistance = 150;
        this.maxParticles = 60;
        break;
      case 'planning':
        this.connectionDistance = 120;
        this.maxParticles = 55;
        break;
      case 'deploying':
        this.connectionDistance = 100;
        this.maxParticles = 50;
        break;
      case 'monitoring':
        this.connectionDistance = 80;
        this.maxParticles = 45;
        break;
      case 'optimizing':
        this.connectionDistance = 90;
        this.maxParticles = 40;
        break;
      case 'idle':
        this.connectionDistance = 100;
        this.maxParticles = 50;
        break;
    }

    // Adjust particle count
    while (this.particles.length > this.maxParticles) {
      this.removeParticle();
    }
    while (this.particles.length < this.maxParticles) {
      this.addParticle();
    }
  }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const canvas = new InstructionCanvas('instruction-canvas');
  
  // Subscribe to state changes if stateMachine is available
  if (window.stateMachine) {
    window.stateMachine.subscribe((state) => {
      canvas.updateState(state);
    });
  }
});
