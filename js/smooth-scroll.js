/* Fix for smooth scrolling to learn-more section */
document.addEventListener('DOMContentLoaded', function() {
    // Handle smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    if (anchorLinks && anchorLinks.length > 0) {
        for (const link of anchorLinks) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                var targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }
});
