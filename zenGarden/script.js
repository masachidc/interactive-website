<script>
        document.addEventListener('DOMContentLoaded', () => {
            console.log("Website loaded successfully.");

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // Optional: Add simple hover log for software icons
            const softwareIcons = document.querySelectorAll('.adobe-icon, .software-icon');
            softwareIcons.forEach(icon => {
                icon.addEventListener('mouseenter', () => {
                    // Slight animation logic or logging could go here
                    // Currently handled by CSS hover states
                });
            });
        });
    </script>