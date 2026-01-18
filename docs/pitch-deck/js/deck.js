// Deck Navigation System
class PitchDeck {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 15;
        this.slides = document.querySelectorAll('.slide');
        this.progressBar = document.getElementById('progress-bar');
        this.slideCounter = document.getElementById('slide-counter');
        this.prevButton = document.getElementById('prev-slide');
        this.nextButton = document.getElementById('next-slide');
        
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.prevButton.addEventListener('click', () => this.previousSlide());
        this.nextButton.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === 'Home') this.goToSlide(1);
            if (e.key === 'End') this.goToSlide(this.totalSlides);
            if (e.key >= '0' && e.key <= '9') {
                const slideNum = parseInt(e.key) || 10;
                if (slideNum <= this.totalSlides) this.goToSlide(slideNum);
            }
        });
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
        
        // Mouse wheel navigation (optional)
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (e.deltaY > 50) this.nextSlide();
                if (e.deltaY < -50) this.previousSlide();
            }, 100);
        });
        
        // Update initial state
        this.updateSlideVisibility();
        this.updateProgress();
        this.updateCounter();
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        if (endX < startX - threshold) this.nextSlide();
        if (endX > startX + threshold) this.previousSlide();
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlideVisibility();
            this.updateProgress();
            this.updateCounter();
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlideVisibility();
            this.updateProgress();
            this.updateCounter();
        }
    }
    
    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
            this.currentSlide = slideNumber;
            this.updateSlideVisibility();
            this.updateProgress();
            this.updateCounter();
        }
    }
    
    updateSlideVisibility() {
        this.slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            slide.classList.remove('active', 'prev');
            
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
                // Reinitialize icons for the active slide
                setTimeout(() => {
                    lucide.createIcons();
                }, 100);
            } else if (slideNumber < this.currentSlide) {
                slide.classList.add('prev');
            }
        });
        
        // Update button states
        this.prevButton.disabled = this.currentSlide === 1;
        this.nextButton.disabled = this.currentSlide === this.totalSlides;
        
        // Update button opacity
        this.prevButton.style.opacity = this.currentSlide === 1 ? '0.5' : '1';
        this.nextButton.style.opacity = this.currentSlide === this.totalSlides ? '0.5' : '1';
    }
    
    updateProgress() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        this.progressBar.style.width = `${progress}%`;
    }
    
    updateCounter() {
        this.slideCounter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
    }
    
    // Fullscreen toggle
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    // Export to PDF (placeholder - would need server-side implementation)
    exportToPDF() {
        alert('PDF export would require server-side implementation. For now, use browser print function (Ctrl/Cmd + P)');
    }
}

// Initialize the deck when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const deck = new PitchDeck();
    
    // Add fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fixed top-8 right-8 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-40';
    fullscreenBtn.innerHTML = '<i data-lucide="maximize" class="w-5 h-5"></i>';
    fullscreenBtn.addEventListener('click', () => deck.toggleFullscreen());
    document.body.appendChild(fullscreenBtn);
    
    // Update Lucide icons
    lucide.createIcons();
    
    // Animate elements on slide change
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    });
    
    // Observe all animatable elements
    document.querySelectorAll('.animate-on-view').forEach(el => {
        observer.observe(el);
    });
});

// Chart drawing functions for financial slides
function drawChart(canvasId, data, type = 'bar') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (type === 'bar') {
        // Simple bar chart
        const barWidth = width / data.length;
        const maxValue = Math.max(...data.map(d => d.value));
        
        data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            const x = index * barWidth + barWidth * 0.1;
            const y = height - barHeight - 20;
            
            // Draw bar
            ctx.fillStyle = '#007BFF';
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth * 0.4, height - 5);
            
            // Draw value
            ctx.fillText(`$${item.value}M`, x + barWidth * 0.4, y - 5);
        });
    }
}
