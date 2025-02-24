// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu after clicking a link
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Form Validation and Submission
const nutritionForm = document.getElementById('nutritionForm');
const contactForm = document.getElementById('contactForm');

if (nutritionForm) {
    nutritionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'foods') {
                if (!data[key]) {
                    data[key] = [];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        // Validate form
        if (!data.babyName || !data.age || !data.foods || data.foods.length === 0) {
            alert('Please fill in all required fields and select at least one food item.');
            return;
        }

        try {
            // Show loading state
            const submitBtn = this.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
            submitBtn.disabled = true;

            // Prepare data for Google Sheets
            const timestamp = new Date().toISOString();
            const selectedFoods = data.foods.join(', ');
            
            // Send data to Google Sheets
            const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    timestamp: timestamp,
                    babyName: data.babyName,
                    age: data.age,
                    locality: data.locality,
                    selectedFoods: selectedFoods
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save data');
            }

            // Convert form data to query string for results page
            const queryString = new URLSearchParams(data).toString();
            
            // Redirect to results page with form data
            window.location.href = `results.html?${queryString}`;
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error saving your data. Please try again.');
            
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.getElementById('sendMessageBtn');
        const formStatus = document.getElementById('formStatus');
        
        // Validate form
        if (!nameInput.value || !emailInput.value || !messageInput.value) {
            showFormStatus('Please fill in all fields.', 'error');
            return;
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showFormStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Prepare email parameters
        const templateParams = {
            to_email: 'surojitdutta712250@gmail.com',
            from_name: nameInput.value,
            from_email: emailInput.value,
            message: messageInput.value
        };

        // Send email using EmailJS
        emailjs.send('service_xxxxxxx', 'template_xxxxxxx', templateParams)
            .then(function(response) {
                showFormStatus('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
            }, function(error) {
                showFormStatus('Sorry, there was an error sending your message. Please try again later.', 'error');
                console.error('EmailJS error:', error);
            })
            .finally(function() {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            });
    });
}

// Helper function to show form status messages
function showFormStatus(message, type) {
    const formStatus = document.getElementById('formStatus');
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
    
    // Hide the message after 5 seconds
    setTimeout(() => {
        formStatus.className = 'form-status';
    }, 5000);
}

// Performance optimization utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll-based animations
const optimizedAnimateOnScroll = debounce(() => {
    const elements = document.querySelectorAll('.service-card, .form-group, .about-content');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }
    });
}, 50);

// Optimize form interactions
const optimizedEnhanceFormInteractions = () => {
    const formGroups = document.querySelectorAll('.form-group');
    const submitBtn = document.querySelector('.submit-btn');

    // Use passive event listeners for better scroll performance
    formGroups.forEach(group => {
        group.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = group.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                group.style.transform = `perspective(1000px) rotateX(${(y - rect.height / 2) / 20}deg) rotateY(${-(x - rect.width / 2) / 20}deg) translateZ(10px)`;
            });
        }, { passive: true });

        group.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                group.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        }, { passive: true });
    });

    if (submitBtn) {
        submitBtn.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = submitBtn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                submitBtn.style.transform = `perspective(1000px) rotateX(${deltaY * 5}deg) rotateY(${deltaX * 5}deg) translateZ(10px) scale(1.05)`;
            });
        }, { passive: true });
    }
};

// Optimize intersection observer
const optimizedObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.classList.add('visible');
            });
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '50px'
});

// Initialize optimized animations
document.addEventListener('DOMContentLoaded', () => {
    // Reduce initial animations
    setTimeout(() => {
        document.body.classList.add('animations-ready');
    }, 500);

    // Optimize form animations
    optimizedEnhanceFormInteractions();

    // Observe elements with optimized observer
    document.querySelectorAll('.tracker-section, .form-group, .food-item, .stat-card, .feature-card, .service-card')
        .forEach(element => optimizedObserver.observe(element));

    // Add optimized scroll listener
    window.addEventListener('scroll', optimizedAnimateOnScroll, { passive: true });
}, { passive: true });

function toggleCheckboxes(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="foods"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// Form Animations with Intersection Observer
const observeForm = () => {
    const formSection = document.querySelector('.tracker-section');
    const formGroups = document.querySelectorAll('.form-group');
    
    const formObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // If it's the form section, trigger form group animations
                if (entry.target.classList.contains('tracker-section')) {
                    formGroups.forEach((group, index) => {
                        setTimeout(() => {
                            group.classList.add('visible');
                        }, 200 * (index + 1));
                    });
                }
            }
        });
    }, {
        threshold: 0.2
    });

    // Observe form section
    formObserver.observe(formSection);
};

// Create ripple effect
const createRippleEffect = (e, element) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
};

// Create focus particles
const createFocusParticles = (element) => {
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'focus-particle';
        
        const size = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI * 2;
        const radius = 50;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${50 + Math.cos(angle) * radius}%`;
        particle.style.top = `${50 + Math.sin(angle) * radius}%`;
        
        element.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
};

// Create checkbox particles
const createCheckboxParticles = (element) => {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'checkbox-particle';
        
        const angle = (i / 8) * Math.PI * 2;
        const velocity = 2 + Math.random();
        const size = Math.random() * 6 + 4;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const animation = particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * 50}px, ${Math.sin(angle) * 50}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        element.appendChild(particle);
        animation.onfinish = () => particle.remove();
    }
};

// Animate label with spring effect
const animateLabel = (label, up) => {
    const keyframes = up ? [
        { transform: 'translateY(0) scale(1)', color: 'var(--secondary-color)' },
        { transform: 'translateY(-30px) scale(0.8)', color: 'var(--primary-color)' },
        { transform: 'translateY(-25px) scale(0.8)', color: 'var(--primary-color)' }
    ] : [
        { transform: 'translateY(-25px) scale(0.8)', color: 'var(--primary-color)' },
        { transform: 'translateY(5px) scale(1.1)', color: 'var(--secondary-color)' },
        { transform: 'translateY(0) scale(1)', color: 'var(--secondary-color)' }
    ];

    label.animate(keyframes, {
        duration: 400,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
    });
};

// Create button particles
const createButtonParticles = (x, y) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'button-particle';
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 2 + Math.random();
        const size = Math.random() * 8 + 6;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        const animation = particle.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
            { transform: `translate(${Math.cos(angle) * 100}px, ${Math.sin(angle) * 100}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        });
        
        container.appendChild(particle);
        animation.onfinish = () => particle.remove();
    }

    setTimeout(() => container.remove(), 1000);
};

// Add necessary styles for new animations
const addEnhancedStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 107, 0, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }

        .focus-particle {
            position: absolute;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            opacity: 0.6;
            animation: floatParticle 1s ease-out forwards;
        }

        .checkbox-particle {
            position: absolute;
            top: 50%;
            left: 50%;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
        }

        .button-particle {
            position: absolute;
            top: 50%;
            left: 50%;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
        }

        @keyframes floatParticle {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.6;
            }
            100% {
                transform: translate(-50%, -150%) scale(0);
                opacity: 0;
            }
        }

        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addEnhancedStyles();
    observeForm();
    enhanceFormInteractions();
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.tracker-section, .form-group, .food-item, .stat-card, .feature-card, .service-card').forEach(element => {
    observer.observe(element);
});

// Scroll to Top Functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// Smooth scroll to top when button is clicked
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Reviews Slider Functionality
const reviewSlider = () => {
    const slides = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-review');
    const nextBtn = document.querySelector('.next-review');
    let currentSlide = 0;

    const updateSlides = () => {
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.transform = 'translateX(-50%) scale(0.8)';
            slide.style.opacity = '0';
        });

        dots.forEach(dot => dot.classList.remove('active'));

        slides[currentSlide].classList.add('active');
        slides[currentSlide].style.transform = 'translateX(-50%) scale(1)';
        slides[currentSlide].style.opacity = '1';
        
        dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlides();
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlides();
    };

    // Event Listeners
    nextBtn?.addEventListener('click', () => {
        nextSlide();
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, 5000);
    });

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, 5000);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlides();
            clearInterval(autoSlide);
            autoSlide = setInterval(nextSlide, 5000);
        });
    });

    // Auto slide
    let autoSlide = setInterval(nextSlide, 5000);

    // Pause auto-slide when hovering over the slider
    const sliderContainer = document.querySelector('.reviews-slider');
    sliderContainer?.addEventListener('mouseenter', () => {
        clearInterval(autoSlide);
    });

    sliderContainer?.addEventListener('mouseleave', () => {
        autoSlide = setInterval(nextSlide, 5000);
    });

    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderContainer?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    sliderContainer?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    const handleSwipe = () => {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            clearInterval(autoSlide);
            autoSlide = setInterval(nextSlide, 5000);
        }
    };
};

// Initialize reviews slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    reviewSlider();
});
