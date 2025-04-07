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

    // Initialize calculator button
    var calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateCosts);
    }

    // Initialize scroll event handler
    window.addEventListener('scroll', updateActiveNavLink);
});

function calculateCosts() {
    var alumniCount = parseInt(document.getElementById('alumni-count')?.value) || 10000;
    var currentSolution = document.getElementById('current-solution')?.value;
    
    if (!currentSolution) return;
    
    var costPerAlumni = {
        'google': 3,
        'other': 3.5
    };
    
    var forwardEmailCost = 3000;
    var currentCost = alumniCount * costPerAlumni[currentSolution];
    var savings = currentCost - forwardEmailCost;
    var savingsPercentage = Math.round((savings / currentCost) * 100);
    
    const currentCostElement = document.getElementById('current-cost');
    const newCostElement = document.getElementById('new-cost');
    const savingsElement = document.getElementById('savings');
    
    if (currentCostElement) {
        currentCostElement.textContent = '$' + currentCost.toLocaleString();
    }
    
    if (newCostElement) {
        newCostElement.textContent = '$3,000';
    }
    
    if (savingsElement) {
        savingsElement.textContent = '$' + savings.toLocaleString() + ' (' + savingsPercentage + '%)';
    }
    
    // Add highlight animation to results
    var resultItems = document.querySelectorAll('.result-item');
    if (resultItems && resultItems.length > 0) {
        for (const item of resultItems) {
            item.classList.add('highlight-animation');
            setTimeout(() => item.classList.remove('highlight-animation'), 1000);
        }
    }
}

function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('nav ul li a');
    
    if (!sections || sections.length === 0 || !navLinks || navLinks.length === 0) return;
    
    let currentSection = '';
    
    for (const section of sections) {
        var sectionTop = section.offsetTop - 100;
        var sectionHeight = section.offsetHeight;
        var sectionId = section.getAttribute('id');
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    }
    
    for (const link of navLinks) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    }
}

// Animate elements on scroll
window.addEventListener('scroll', function() {
    var animatedElements = document.querySelectorAll('.benefit-card, .feature-card, .step, .university-logos .logo-item');
    
    if (!animatedElements || animatedElements.length === 0) return;
    
    for (const element of animatedElements) {
        var elementTop = element.getBoundingClientRect().top;
        var triggerPoint = window.innerHeight / 1.3;
        
        if (elementTop < triggerPoint) {
            element.classList.add('animate');
        }
    }
});

// Form validation function
function validateForm(form) {
    if (!form) return false;
    
    var formInputs = form.querySelectorAll('input, textarea');
    if (!formInputs || formInputs.length === 0) return true;
    
    let isValid = true;
    
    for (const input of formInputs) {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
        
        if (input.type === 'email' && input.value.trim()) {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) {
                input.classList.add('error');
                isValid = false;
            }
        }
    }
    
    return isValid;
}
