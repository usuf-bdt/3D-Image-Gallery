// // Import GSAP from CDN (add to HTML head if needed)
// // <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

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
        this.radius = 460;
        this.autoRotateTimeline = null;
        this.isAutoRotating = false;
        
        this.init();
    }
    
    init() {
        this.createNavigationControls();
        this.positionItems();
        this.bindEvents();
        this.entranceAnimation();
        
        // Start auto-rotation after entrance animation
        setTimeout(() => {
            this.startAutoRotate();
        }, 2000);
    }
    
    createNavigationControls() {
        const navControls = document.createElement('div');
        navControls.className = 'nav-controls';
        navControls.innerHTML = `
            <button class="nav-btn" id="prevBtn">← Previous</button>
            <button class="nav-btn auto-rotate-btn active" id="autoRotateBtn">Auto Rotate</button>
            <button class="nav-btn" id="nextBtn">Next →</button>
        `;
        document.body.appendChild(navControls);
        
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        
        for (let i = 0; i < this.itemCount; i++) {
            const dot = document.createElement('div');
            dot.className = `progress-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(i));
            progressIndicator.appendChild(dot);
        }
        
        document.body.appendChild(progressIndicator);
        
        this.prevBtn = document.querySelector('#prevBtn');
        this.nextBtn = document.querySelector('#nextBtn');
        this.autoRotateBtn = document.querySelector('#autoRotateBtn');
        this.progressDots = document.querySelectorAll('.progress-dot');
    }
    
    positionItems() {
        this.items.forEach((item, index) => {
            const angle = index * this.angleStep;
            const radian = (angle * Math.PI) / 180;
            
            const x = Math.cos(radian) * this.radius;
            const z = Math.sin(radian) * this.radius;
            const y = Math.sin(radian * 0.3) * 30;
            
            item.style.setProperty('--i', index + 1);
            
            gsap.set(item, {
                x: x,
                y: y,
                z: z,
                rotationY: angle + 45,
                rotationX: Math.sin(radian) * 3,
                transformOrigin: "center center",
                force3D: true
            });
        });
        
        this.updateCenterImage(0);
    }
    
    bindEvents() {
        this.items.forEach((item) => {
            item.addEventListener('click', () => this.openModal(item));
            
            // Add hover animations
            item.addEventListener('mouseenter', () => {
                if (this.isAutoRotating) {
                    this.pauseAutoRotate();
                }
                
                gsap.to(item, {
                    scale: 1.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            item.addEventListener('mouseleave', () => {
                if (this.isAutoRotating) {
                    this.resumeAutoRotate();
                }
                
                gsap.to(item, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });
        
        this.centerImage.addEventListener('click', () => {
            this.openModal(this.items[this.currentIndex]);
        });
        
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        this.prevBtn.addEventListener('click', () => this.rotate(-this.angleStep));
        this.nextBtn.addEventListener('click', () => this.rotate(this.angleStep));
        this.autoRotateBtn.addEventListener('click', () => this.toggleAutoRotate());
        
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
        
        gsap.timeline()
            .to(centerImg, {
                opacity: 0,
                scale: 0.9,
                duration: 0.3,
                ease: "power2.out"
            })
            .call(() => {
                centerImg.src = img.src;
                centerImg.alt = img.alt;
            })
            .to(centerImg, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(1.7)"
            });
    }
    
    rotate(angle) {
        this.currentRotation += angle;
        const steps = angle / this.angleStep;
        this.currentIndex = (this.currentIndex + Math.round(steps)) % this.itemCount;
        if (this.currentIndex < 0) this.currentIndex += this.itemCount;
        
        const tl = gsap.timeline();
        
        tl.to(this.slider, {
            rotationY: this.currentRotation,
            duration: 1.2,
            ease: "power2.inOut"
        });
        
        this.items.forEach((item, index) => {
            const itemAngle = (index * this.angleStep) + 90;
            const radian = ((index * this.angleStep - this.currentRotation) * Math.PI) / 180;
            const newY = Math.sin(radian * 0.3) * 30;
            
            tl.to(item, {
                rotationY: itemAngle - this.currentRotation,
                rotationX: Math.sin(radian) * 3,
                y: newY,
                duration: 1.2,
                ease: "power2.inOut",
                force3D: true
            }, 0);
            
            if (index === this.currentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        this.updateCenterImage(this.currentIndex);
        this.updateProgressIndicator();
    }
    
    goToSlide(targetIndex) {
        const currentAngle = this.currentIndex * this.angleStep;
        const targetAngle = targetIndex * this.angleStep;
        let rotationAngle = targetAngle - currentAngle;
        
        if (Math.abs(rotationAngle) > 180) {
            rotationAngle = rotationAngle > 0 ? rotationAngle - 360 : rotationAngle + 360;
        }
        
        this.rotate(rotationAngle);
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
        if (this.autoRotateTimeline) return;
        
        this.autoRotateTimeline = gsap.timeline({
            repeat: -1,
            onRepeat: () => {
                this.currentRotation += this.angleStep;
                this.currentIndex = (this.currentIndex + 1) % this.itemCount;
                this.updateProgressIndicator();
                this.updateCenterImage(this.currentIndex);
            }
        });
        
        this.autoRotateTimeline
            .to(this.slider, {
                rotationY: "+=360",
                duration: 20,
                ease: "none"
            })
            .to(this.items, {
                rotationY: "-=360",
                duration: 20,
                ease: "none"
            }, 0);
        
        this.isAutoRotating = true;
        this.autoRotateBtn.classList.add('active');
    }
    
    pauseAutoRotate() {
        if (this.autoRotateTimeline) {
            this.autoRotateTimeline.pause();
        }
    }
    
    resumeAutoRotate() {
        if (this.autoRotateTimeline) {
            this.autoRotateTimeline.resume();
        }
    }
    
    stopAutoRotate() {
        if (this.autoRotateTimeline) {
            this.autoRotateTimeline.kill();
            this.autoRotateTimeline = null;
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
        
        const tl = gsap.timeline();
        
        tl.fromTo(this.modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: "power2.out" }
        )
        .fromTo(this.modal.querySelector('.modal-content'),
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
            },
            "-=0.2"
        )
        .fromTo([
            this.modal.querySelector('.modal-header'),
            this.modal.querySelector('.modal-image'),
            this.modal.querySelector('#modalTitle'),
            this.modal.querySelector('#modalDescription'),
            this.modal.querySelector('.modal-btn')
        ], {
            opacity: 0,
            y: 30,
            scale: 0.8
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "back.out(1.2)"
        }, "-=0.3");
        
        this.stopAutoRotate();
    }
    
    closeModal() {
        const tl = gsap.timeline({
            onComplete: () => {
                this.modal.style.display = 'none';
                if (this.autoRotateBtn.classList.contains('active')) {
                    this.startAutoRotate();
                }
            }
        });
        
        tl.to([
            this.modal.querySelector('.modal-btn'),
            this.modal.querySelector('#modalDescription'),
            this.modal.querySelector('#modalTitle'),
            this.modal.querySelector('.modal-image'),
            this.modal.querySelector('.modal-header')
        ], {
            opacity: 0,
            y: -20,
            scale: 0.8,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in"
        })
        .to(this.modal.querySelector('.modal-content'), {
            scale: 0.5,
            opacity: 0,
            y: -100,
            rotationY: -15,
            filter: "blur(10px)",
            duration: 0.4,
            ease: "power2.in"
        }, "-=0.2")
        .to(this.modal, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out"
        }, "-=0.2");
    }
    
    entranceAnimation() {
        const tl = gsap.timeline();
        
        tl.fromTo(this.items, {
            opacity: 0,
            scale: 0,
            rotationX: -90,
            z: -500
        }, {
            opacity: 0.8,
            scale: 1,
            rotationX: (index) => {
                const angle = index * this.angleStep;
                const radian = (angle * Math.PI) / 180;
                return Math.sin(radian) * 3;
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
        })
        .fromTo(this.centerImage, {
            opacity: 0,
            scale: 0,
            rotationY: 360,
            z: -200
        }, {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            z: 100,
            duration: 1.5,
            ease: "back.out(1.7)"
        }, "-=1")
        .fromTo('.nav-controls', {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5")
        .fromTo('.progress-indicator', {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.6")
        .fromTo(this.progressDots, {
            scale: 0,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=0.4");
        
        // Add floating animation to center image
        gsap.to(this.centerImage, {
            y: "+=15",
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') {
        console.error('GSAP library not found. Please include GSAP in your HTML.');
        return;
    }
    
    gsap.config({
        force3D: true,
        nullTargetWarn: false,
    });
    
    const gallery = new RotatingGallery();
    window.gallery = gallery;
}); 