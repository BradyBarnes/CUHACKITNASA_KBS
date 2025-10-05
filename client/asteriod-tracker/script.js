// Get Started Button - Navigate to Main Page
const getStartedBtn = document.getElementById('getStartedBtn');
const landingPage = document.getElementById('landing-page');
const mainPage = document.getElementById('main-page');

if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
        landingPage.classList.remove('active');
        mainPage.classList.add('active');
        
        // Show home section by default
        document.getElementById('home-section').classList.add('active');
    });
}

// Navigation functionality for main page
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionName = button.getAttribute('data-page');
        
        // Hide all sections
        sections.forEach(section => section.classList.remove('active'));
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// Info Page Navigation
const infoNavButtons = document.querySelectorAll('.info-nav-btn');
const infoPages = document.querySelectorAll('.info-page');

infoNavButtons.forEach(button => {
    button.addEventListener('click', () => {
        const pageNum = button.getAttribute('data-info-page');
        
        // Remove active class from all buttons and pages
        infoNavButtons.forEach(btn => btn.classList.remove('active'));
        infoPages.forEach(page => page.classList.remove('active'));
        
        // Add active class to clicked button and corresponding page
        button.classList.add('active');
        const targetPage = document.getElementById(`info-page-${pageNum}`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Smooth scroll to top of info section
            targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add interactive hover effects to info elements
document.addEventListener('DOMContentLoaded', () => {
    // Animate elements on scroll (if they come into view)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all info page paragraphs and lists
    document.querySelectorAll('.info-page p, .info-page ul, .info-page h4').forEach(el => {
        observer.observe(el);
    });
    
    // Add enhanced hover effects to info navigation
    infoNavButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
});

// Add parallax effect to info section background
let infoSection = document.getElementById('info-section');
if (infoSection) {
    infoSection.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const bgBefore = infoSection.querySelector('::before');
        if (bgBefore) {
            infoSection.style.setProperty('--mouse-x', mouseX);
            infoSection.style.setProperty('--mouse-y', mouseY);
        }
    });
}

// Add typewriter effect to info page titles (optional enhancement)
function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Activate typewriter on page change (optional)
infoNavButtons.forEach(button => {
    button.addEventListener('click', () => {
        const pageNum = button.getAttribute('data-info-page');
        const targetPage = document.getElementById(`info-page-${pageNum}`);
        
        if (targetPage) {
            const title = targetPage.querySelector('h3');
            if (title) {
                const originalText = title.textContent;
                setTimeout(() => {
                    typewriterEffect(title, originalText, 30);
                }, 100);
            }
        }
    });
});

// Initialize on load
window.addEventListener('load', () => {
    console.log('NASA Asteroid Tracker loaded successfully!');
});