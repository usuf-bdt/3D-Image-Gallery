// Import GSAP from CDN (add to HTML head if needed)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

class RotatingGallery {
    constructor() {
        this.items = document.querySelectorAll('.item');
        this.slider = document.querySelector('.slider');
        this.centerImage = document.querySelector('.center-image');
        this.modal = document.querySelector('#modal');
        this.modalImg = document.querySelector('#modalImg');
        this.modalTitle = document.querySelector('#modalTitle');
        this.modalDescription = document.querySelector('#modalDescription');
        this.modalBtn = document.querySelector('#modalBtn');
        this.closeBtn = document.querySelector('#closeBtn');
        
        this.currentRotation = 0;
        this.currentIndex = 0;
        this.itemCount = this.items.length;
        this.angleStep = 360 / this.itemCount;
        this.radius = 300; // Adjusted radius for circle
        this.autoRotateInterval = null;
        this.isAutoRotating = false;
        this.wasAutoRotatingBeforeHover = false;
        
        this.init();
    }
    
    init() {
        this.createNavigationControls();
        this.positionItems();
        this.bindEvents();
        
        // Initial entrance animation
        this.entranceAnimation();
        
        // Start auto-rotation after entrance animation completes
        setTimeout(() => {
            this.startAutoRotate();
        }, 2000);
    }
    
    createNavigationControls() {
        // Create navigation controls
        const navControls = document.createElement('div');
        navControls.className = 'nav-controls';
        navControls.innerHTML = `
            <button class="nav-btn" id="prevBtn">← Previous</button>
            <button class="nav-btn auto-rotate-btn active" id="autoRotateBtn">Auto Rotate</button>
            <button class="nav-btn" id="nextBtn">Next →</button>
        `;
        document.body.appendChild(navControls);
        
        // Create progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        
        for (let i = 0; i < this.itemCount; i++) {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(i));
            progressIndicator.appendChild(dot);
        }
        
        document.body.appendChild(progressIndicator);
        
        // Store references to new elements
        this.prevBtn = document.querySelector('#prevBtn');
        this.nextBtn = document.querySelector('#nextBtn');
        this.autoRotateBtn = document.querySelector('#autoRotateBtn');
        this.progressDots = document.querySelectorAll('.progress-dot');
    }
    
    positionItems() {
        this.items.forEach((item, index) => {
            const angle = index * this.angleStep;
            const radian = (angle * Math.PI) / 180;
            
            // Calculate circular position
            const x = Math.cos(radian) * this.radius;
            const z = Math.sin(radian) * this.radius;
            
            // Set CSS custom property for additional styling if needed
            item.style.setProperty('--i', index + 1);
            
            gsap.set(item, {
                x: x,
                z: z,
                rotationX: -15,
                rotationY: 0, // Keep items facing forward
                transformOrigin: "center center",
                // force3D: true
            });
        });
        
        // Set initial slider rotation
        gsap.set(this.slider, {
            rotationX: -15,
            rotationY: 0,
            transformOrigin: "center center",
            force3D: true
        });
        
        // Update center image with first item
        this.updateCenterImage(0);
    }
    
    bindEvents() {
        // Item click events for modal
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openModal(item);
            });
        });
        
        // Center image click event
        this.centerImage.addEventListener('click', () => {
            this.openModal(this.items[this.currentIndex]);
        });
        
        // Center image hover events to pause auto-rotation
        this.centerImage.addEventListener('mouseenter', () => {
            this.pauseAutoRotateOnHover();
        });
        
        this.centerImage.addEventListener('mouseleave', () => {
            this.resumeAutoRotateOnHover();
        });
        
        // Modal events
        this.closeBtn.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Navigation events
        this.prevBtn.addEventListener('click', () => {
            this.rotate(-this.angleStep);
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.rotate(this.angleStep);
        });
        
        this.autoRotateBtn.addEventListener('click', () => {
            this.toggleAutoRotate();
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.rotate(-this.angleStep);
                    break;
                case 'ArrowRight':
                    this.rotate(this.angleStep);
                    break;
                case 'Escape':
                    this.closeModal();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoRotate();
                    break;
            }
        });
        
        // Mouse wheel events
        this.slider.addEventListener('wheel', (e) => {
            e.preventDefault();
            const direction = e.deltaY > 0 ? 1 : -1;
            this.rotate(direction * this.angleStep);
        });
    }
    
    updateCenterImage(index) {
        const item = this.items[index];
        const img = item.querySelector('img');
        const centerImg = this.centerImage.querySelector('img');
        
        gsap.to(centerImg, {
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                centerImg.src = img.src;
                centerImg.alt = img.alt;
                gsap.to(centerImg, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                });
            }
        });
    }
    
    rotate(angle) {
        this.currentRotation += angle;
        
        // Calculate new current index
        const steps = angle / this.angleStep;
        this.currentIndex = (this.currentIndex + Math.round(steps)) % this.itemCount;
        if (this.currentIndex < 0) this.currentIndex += this.itemCount;
        
        // Rotate the entire slider
        gsap.to(this.slider, {
            rotationX: -15,
            rotationY: 360,
            duration: 1.2,
            ease: "power2.inOut"
        });
        
        // Move items in a circle while keeping them facing forward
        this.items.forEach((item, index) => {
            const itemAngle = (index * this.angleStep - this.currentRotation);
            const radian = (itemAngle * Math.PI) / 180;
            
            // Calculate new circular position
            const x = Math.cos(radian) * this.radius;
            const z = Math.sin(radian) * this.radius;
            
            gsap.to(item, {
                x: x,
                z: z,
                rotationY: 0, // Keep items facing forward
                rotationX: -15,
                duration: 1.2,
                ease: "power2.inOut",
                force3D: true
            });
            
            // Update active state
            if (index === this.currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update center image
        this.updateCenterImage(this.currentIndex);
        
        // Update progress indicator
        this.updateProgressIndicator();
    }
    
    goToSlide(targetIndex) {
        const currentAngle = this.currentIndex * this.angleStep;
        const targetAngle = targetIndex * this.angleStep;
        const angleDiff = targetAngle - currentAngle;
        
        // Choose the shortest rotation path
        let rotationAngle = angleDiff;
        if (Math.abs(angleDiff) > 180) {
            rotationAngle = angleDiff > 0 ? angleDiff - 360 : angleDiff + 360;
        }
        
        // this.rotate(rotationAngle);
    }
    
    updateProgressIndicator() {
        this.progressDots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    startAutoRotate() {
        if (this.autoRotateInterval) return;
        
        // Create continuous smooth rotation
        this.autoRotateInterval = setInterval(() => {
            this.rotateContinuous();
        }, 2500); // Slightly faster rotation for better visual effect
        
        this.isAutoRotating = true;
        this.autoRotateBtn.classList.add('active');
    }
    
    rotateContinuous() {
        this.currentRotation += this.angleStep;
        
        // Calculate new current index for center image update
        this.currentIndex = (this.currentIndex + 1) % this.itemCount;
        
        // Rotate the entire slider
        gsap.to(this.slider, {
            rotationX: -15,
            rotationY: `+=${this.angleStep}`,
            duration: 2.2,
            ease: "power1.inOut"
        });
        
        // Move items in a circle while keeping them facing forward
        this.items.forEach((item, index) => {
            const itemAngle = (index * this.angleStep - this.currentRotation);
            const radian = (itemAngle * Math.PI) / 180;
            
            // Calculate new circular position
            const x = Math.cos(radian) * this.radius;
            const z = Math.sin(radian) * this.radius;
            
            gsap.to(item, {
                x: x,
                z: z,
                rotationY: 0, // Keep items facing forward
                rotationX: -15,
                duration: 2.2,
                ease: "power1.inOut",
                force3D: true
            });
            
            // Update active state for center image synchronization
            if (index === this.currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update center image and progress indicator
        this.updateCenterImage(this.currentIndex);
        this.updateProgressIndicator();
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
        
        this.isAutoRotating = false;
        this.autoRotateBtn.classList.remove('active');
    }
    
    toggleAutoRotate() {
        if (this.isAutoRotating) {
            this.stopAutoRotate();
        } else {
            this.startAutoRotate();
        }
    }
    
    openModal(item) {
        const img = item.querySelector('img');
        const title = item.getAttribute('data-title');
        const description = item.getAttribute('data-description');
        const url = item.getAttribute('data-url');
        
        this.modalImg.src = img.src;
        this.modalImg.alt = img.alt;
        this.modalTitle.textContent = title;
        this.modalDescription.textContent = description;
        this.modalBtn.onclick = () => window.open(url, '_blank');
        
        this.modal.style.display = 'flex';
        
        // Enhanced modal entrance animation
        gsap.fromTo(this.modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
        
        gsap.fromTo(this.modal.querySelector('.modal-content'),
            { 
                scale: 0.5,
                opacity: 0,
                y: 100,
                rotationY: 15,
                filter: "blur(10px)"
            },
            { 
                scale: 1,
                opacity: 1,
                y: 0,
                rotationY: 0,
                filter: "blur(0px)",
                duration: 0.6,
                ease: "back.out(1.7)"
            }
        );
        
        // Animate modal header
        gsap.fromTo(this.modal.querySelector('.modal-header'),
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: "power2.out" }
        );
        
        // Animate modal image
        gsap.fromTo(this.modal.querySelector('.modal-image'),
            { opacity: 0, scale: 0.8, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" }
        );
        
        // Animate modal title
        gsap.fromTo(this.modal.querySelector('#modalTitle'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" }
        );
        
        // Animate modal description
        gsap.fromTo(this.modal.querySelector('#modalDescription'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.5, ease: "power2.out" }
        );
        
        // Animate modal button
        gsap.fromTo(this.modal.querySelector('.modal-btn'),
            { opacity: 0, scale: 0.8, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, delay: 0.6, ease: "back.out(1.7)" }
        );
        
        // Pause auto-rotation when modal is open
        this.stopAutoRotate();
    }
    
    closeModal() {
        // Enhanced modal exit animation
        gsap.to(this.modal.querySelector('.modal-btn'), {
            opacity: 0,
            scale: 0.8,
            y: 20,
            duration: 0.2,
            ease: "power2.in"
        });
        
        gsap.to(this.modal.querySelector('#modalDescription'), {
            opacity: 0,
            y: -10,
            duration: 0.2,
            delay: 0.05,
            ease: "power2.in"
        });
        
        gsap.to(this.modal.querySelector('#modalTitle'), {
            opacity: 0,
            y: -10,
            duration: 0.2,
            delay: 0.1,
            ease: "power2.in"
        });
        
        gsap.to(this.modal.querySelector('.modal-image'), {
            opacity: 0,
            scale: 0.9,
            y: -20,
            duration: 0.3,
            delay: 0.15,
            ease: "power2.in"
        });
        
        gsap.to(this.modal.querySelector('.modal-content'), {
            scale: 0.5,
            opacity: 0,
            y: -100,
            rotationY: -15,
            filter: "blur(10px)",
            duration: 0.4,
            delay: 0.2,
            ease: "power2.in"
        });
        
        gsap.to(this.modal, {
            opacity: 0,
            duration: 0.3,
            delay: 0.3,
            ease: "power2.out",
            onComplete: () => {
                this.modal.style.display = 'none';
                // Resume auto-rotation if it was active
                if (this.autoRotateBtn.classList.contains('active')) {
                    this.startAutoRotate();
                }
            }
        });
    }
    
    entranceAnimation() {
        // Animate items entrance with circular positioning
        gsap.fromTo(this.items, 
            {
                opacity: 0,
                scale: 0,
                rotationX: -90,
                x: 0,
                z: -500
            },
            {
                opacity: 0.8,
                scale: 1,
                rotationX: -15,
                rotationY: 0, // Keep items facing forward
                x: (index) => {
                    const angle = index * this.angleStep;
                    const radian = (angle * Math.PI) / 180;
                    return Math.cos(radian) * this.radius;
                },
                z: (index) => {
                    const angle = index * this.angleStep;
                    const radian = (angle * Math.PI) / 180;
                    return Math.sin(radian) * this.radius;
                },
                duration: 1.5,
                stagger: 0.15,
                ease: "back.out(1.7)",
                force3D: true
            }
        );
        
        // Animate center image with dramatic entrance
        gsap.fromTo(this.centerImage,
            {
                opacity: 0,
                scale: 0,
                // rotationX: -90,
                z: -200
            },
            {
                opacity: 1,
                scale: 1,
                rotationX: -15,
                rotationY: 0,
                z: 0,
                duration: 1.5,
                delay: 0.3,
                ease: "back.out(1.7)"
            }
        );
        
        // Animate navigation controls
        const navControls = document.querySelector('.nav-controls');
        gsap.fromTo(navControls,
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 1.2,
                ease: "power2.out"
            }
        );
        
        // Animate progress indicator
        const progressIndicator = document.querySelector('.progress-indicator');
        gsap.fromTo(progressIndicator,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 1.4,
                ease: "power2.out"
            }
        );
        
        // Animate progress dots with stagger
        gsap.fromTo(this.progressDots,
            {
                scale: 0,
                opacity: 0
            },
            {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                delay: 1.6,
                stagger: 0.1,
                ease: "back.out(1.7)"
            }
        );
        
        // Add floating animation to center image
        this.addFloatingAnimation();
    }
    
    addFloatingAnimation() {
        gsap.to(this.centerImage, {
            y: 15,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }
    
    // Debug method to verify circular positioning
    debugPositions() {
        console.log('Gallery Debug Info:');
        console.log(`Total items: ${this.itemCount}`);
        console.log(`Angle step: ${this.angleStep}°`);
        console.log(`Radius: ${this.radius}px`);
        
        this.items.forEach((item, index) => {
            const angle = index * this.angleStep;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * this.radius;
            const z = Math.sin(radian) * this.radius;
            console.log(`Item ${index + 1}: angle=${angle}°, x=${x.toFixed(1)}, z=${z.toFixed(1)}`);
        });
    }
    
    // Add hover effects with GSAP and pause functionality
    addHoverEffects() {
        this.items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                // Pause auto-rotation on hover
                this.pauseAutoRotateOnHover();
                
                // Scale up the hovered item
                gsap.to(item, {
                    scale: 1.1,
                    z: 50,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            item.addEventListener('mouseleave', () => {
                // Resume auto-rotation when hover ends
                this.resumeAutoRotateOnHover();
                
                // Scale back to normal
                gsap.to(item, {
                    scale: 1,
                    z: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
    }
    
    // Pause auto-rotation when hovering over items
    pauseAutoRotateOnHover() {
        if (this.isAutoRotating && this.autoRotateInterval) {
            this.wasAutoRotatingBeforeHover = true;
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
            console.log('⏸️ Auto-rotation paused on hover');
        }
    }
    
    // Resume auto-rotation when hover ends
    resumeAutoRotateOnHover() {
        if (this.wasAutoRotatingBeforeHover && !this.autoRotateInterval) {
            this.autoRotateInterval = setInterval(() => {
                this.rotateContinuous();
            }, 2500);
            this.wasAutoRotatingBeforeHover = false;
            console.log('▶️ Auto-rotation resumed after hover');
        }
    }
}

// Initialize the gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP library not found. Please include GSAP in your HTML.');
        console.log('Add this to your HTML head: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>');
        return;
    }
    
    const gallery = new RotatingGallery();
    
    // Make gallery instance globally accessible for debugging
    window.gallery = gallery;
    
    // Debug positioning in console
    setTimeout(() => {
        gallery.debugPositions();
        console.log('🔄 Interactive circular gallery ready! সব ইমেজ center image কে কেন্দ্র করে ঘুরছে। Hover to pause! 🖱️');
    }, 3000);
});

// Performance optimization
gsap.registerPlugin();

// Add smooth scrolling and other enhancements
gsap.config({
    force3D: true,
    nullTargetWarn: false,
}); 