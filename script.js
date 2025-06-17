document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const currentYearElem = document.getElementById('current-year');
    if (currentYearElem) {
        currentYearElem.textContent = new Date().getFullYear();
    }

    // Theme Switcher (for both nav and potential old button)
    const themeToggles = document.querySelectorAll('#theme-toggle-nav, #theme-toggle'); // Selects both
    const body = document.body;

    const updateThemeUI = (theme) => {
        themeToggles.forEach(toggle => {
            const icon = toggle.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                if (toggle.querySelector('.toggle-text')) toggle.querySelector('.toggle-text').textContent = 'Light Mode';
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                if (toggle.querySelector('.toggle-text')) toggle.querySelector('.toggle-text').textContent = 'Dark Mode';
            }
        });
    };

    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
    body.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            let newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeUI(newTheme);
        });
    });


    // Intersection Observer for scroll animations
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('#navbar ul li a');

    const sectionObserverOptions = {
        root: null,
        threshold: 0.15, // A bit more visible before animating
        rootMargin: "0px 0px -50px 0px" // Trigger a bit earlier when scrolling down
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Active Nav Link highlighting
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
                // observer.unobserve(entry.target); // Keep observing for nav active state
            } else {
                 // Optional: Remove active class if section is not intersecting
                 // This can be jumpy if thresholds are not well-tuned
                // navLinks.forEach(link => {
                //     if (link.getAttribute('href').substring(1) === entry.target.id) {
                //         link.classList.remove('active');
                //     }
                // });
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Smooth scroll for nav links (already handled by CSS scroll-behavior, but good for specific cases)
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // CSS handles smooth scroll, this is more for direct manipulation if needed
            // e.preventDefault();
            // const targetId = this.getAttribute('href').substring(1);
            // const targetElement = document.getElementById(targetId);
            // if (targetElement) {
            //     window.scrollTo({
            //         top: targetElement.offsetTop - document.getElementById('navbar').offsetHeight,
            //         behavior: 'smooth'
            //     });
            // }
            // Highlight active link immediately on click (CSS :active also works)
             navLinks.forEach(l => l.classList.remove('active'));
             this.classList.add('active');
        });
    });


    // Company Logos (Clearbit)
    const companyLogos = document.querySelectorAll('.company-logo');
    companyLogos.forEach(img => {
        img.onerror = function() {
            this.style.display = 'none';
        };
    });

    // Contact Form Submission (Formspree)
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const formData = new FormData(contactForm);
            
            // Basic client-side validation (optional, Formspree also validates)
            let isValid = true;
            if (!formData.get('name').trim()) isValid = false;
            if (!formData.get('email').trim() || !formData.get('email').includes('@')) isValid = false; // Simple email check
            if (!formData.get('message').trim()) isValid = false;

            if (!isValid) {
                formStatus.textContent = 'Please fill out all required fields correctly.';
                formStatus.className = 'form-status error';
                return;
            }

            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status';

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Thanks for your message! I will get back to you soon.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                    }
                    formStatus.className = 'form-status error';
                }
            } catch (error) {
                formStatus.textContent = 'Oops! There was a network error. Please try again.';
                formStatus.className = 'form-status error';
            }
        });
    }
});