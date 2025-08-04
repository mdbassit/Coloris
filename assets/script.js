// Initialize Coloris with default settings
document.addEventListener('DOMContentLoaded', function() {
    // Interactive playground controls
    const alphaCheckbox = document.getElementById('alpha-checkbox');
    const swatchesCheckbox = document.getElementById('swatches-checkbox');
    const formatToggleCheckbox = document.getElementById('format-toggle-checkbox');
    const mainConfigCode = document.getElementById('config-code');
    const secondConfigCode = document.getElementById('second-config-code');

    function printConfig(config) {
        config.onChange = null;

        let output = JSON.stringify(config, null, '  ');

        // Remove quotes from properties
        output = output.replace(/"([^"]+)":/g, '$1:');

        // Replace double quotes with single quotes
        output = output.replace(/"/g, "'");

        // Add onChange example
        output = output.replace('null', '(color, inputEl) => {\n    console.log(`The new color is ${color}`);\n  }');

        return output;
    }

    function setFormatRadiosDisabledStatus(status) {
        document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.disabled = status;
        })
    }

    function updateColorisConfig() {
        const config = {};

        // Get current values from radio buttons
        const selectedTheme = document.querySelector('input[name="theme"]:checked').value || 'default';
        const selectedThemeMode = document.querySelector('input[name="theme-mode"]:checked').value || 'light';
        const selectedFormat = document.querySelector('input[name="format"]:checked').value || 'hex';

        if (selectedTheme !== 'default') {
            config.theme = selectedTheme;
        }

        if (selectedThemeMode !== 'light') {
            config.themeMode = selectedThemeMode;
        }

        if (selectedFormat !== 'hex') {
            config.format = selectedFormat;
        }

        if (formatToggleCheckbox.checked) {
            config.formatToggle = true;
            delete config.format;
            setFormatRadiosDisabledStatus(true);
        } else {
            setFormatRadiosDisabledStatus(false);
        }

        if (!alphaCheckbox.checked) {
            config.alpha = false;
        }

        if (swatchesCheckbox.checked) {
            config.swatches = [
                'DarkSlateGray',
                '#2a9d8f',
                '#e9c46a',
                'coral',
                'rgb(231, 111, 81)',
                'Crimson',
                '#023e8a',
                '#0077b6',
                'hsl(194, 100%, 39%)',
                '#00b4d8',
                '#48cae4'
            ];
        }

        // Reset Coloris configuration
        Coloris({
            theme: 'default',
            themeMode: 'light',
            format: 'hex',
            formatToggle: false,
            alpha: true,
            swatches: [],
        });

        // Set the custom configuration of Coloris
        Coloris(config);

        // Update code preview
        const configString = `Coloris(${printConfig(config)});`;
        mainConfigCode.textContent = configString;
        secondConfigCode.textContent = configString;
    }

    document.querySelectorAll('.playground-controls input').forEach(input => {
        input.addEventListener('change', function (e) {
            updateColorisConfig();
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards and other elements for animation
    const featureCards = document.querySelectorAll('.feature-card');
    const installCards = document.querySelectorAll('.install-card');
    
    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    installCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effects to feature cards
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Copy code functionality
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const copyButton = block.parentElement.previousElementSibling.lastElementChild;
        const buttonText = copyButton.textContent;

        copyButton.addEventListener('click', function() {
            const text = block.textContent;

            navigator.clipboard.writeText(text).then(() => {
                copyButton.textContent = 'Copied!';
                
                setTimeout(() => {
                    copyButton.textContent = buttonText;
                }, 2000);
            });
        });
        
        // Add cursor pointer to indicate clickable
        block.style.cursor = 'pointer';
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Keyboard navigation for demo controls
    const demoControls = document.querySelectorAll('select, input[type="checkbox"]');
    demoControls.forEach(control => {
        control.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (this.type === 'checkbox') {
                    this.checked = !this.checked;
                    this.dispatchEvent(new Event('change'));
                }
            }
        });
    });

    // Add color change animation to gradient text
    const gradientTexts = document.querySelectorAll('.gradient-text');
    let hue = 0;
    
    function animateGradient() {
        hue = (hue + 1) % 360;
        gradientTexts.forEach(text => {
            text.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${hue + 60}, 70%, 60%) 100%)`;
            text.style.webkitBackgroundClip = 'text';
            text.style.webkitTextFillColor = 'transparent';
            text.style.backgroundClip = 'text';
        });
        requestAnimationFrame(animateGradient);
    }
    
    // Start gradient animation
    animateGradient();
}); 