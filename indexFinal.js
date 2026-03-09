document.addEventListener('DOMContentLoaded', () => {
    console.log("Website loaded successfully with new interactions.");
    
    // Smooth scroll functionality for local links (like the 'Read Full Bio' button)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // You can add more general-purpose JavaScript functions here
    
    // Example: Fading in elements on scroll (Intersection Observer API)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    // Apply the observer to all sections and cards
    document.querySelectorAll('section, .glass-panel, .project-card').forEach(element => {
        element.classList.add('fade-in-target');
        observer.observe(element);
    });
});