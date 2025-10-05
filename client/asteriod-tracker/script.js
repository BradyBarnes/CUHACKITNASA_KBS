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

// Initialize on load
window.addEventListener('load', () => {
    console.log('NASA Asteroid Tracker loaded successfully!');
});