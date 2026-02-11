// Contact Form Real-time Functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formMessage = document.getElementById('formMessage');
    
    // Form validation patterns
    const validationPatterns = {
        name: /^[a-zA-Z\s]{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\+]?[1-9][\d]{0,15}$/
    };
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    // Validate individual field
    function validateField(field) {
        const errorSpan = field.parentElement.querySelector('.form-error');
        let isValid = true;
        let errorMessage = '';
        
        // Check if field is required and empty
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Validate based on field type
        if (field.value.trim() && isValid) {
            switch(field.type) {
                case 'text':
                    if (field.name === 'name' && !validationPatterns.name.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid name (2-50 characters, letters only)';
                    }
                    break;
                case 'email':
                    if (!validationPatterns.email.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    if (field.value && !validationPatterns.phone.test(field.value.replace(/[\s\-\(\)]/g, ''))) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
                case 'select-one':
                    if (!field.value) {
                        isValid = false;
                        errorMessage = 'Please select a subject';
                    }
                    break;
                case 'textarea':
                    if (field.value.length < 10) {
                        isValid = false;
                        errorMessage = 'Message must be at least 10 characters long';
                    } else if (field.value.length > 1000) {
                        isValid = false;
                        errorMessage = 'Message must be less than 1000 characters';
                    }
                    break;
            }
        }
        
        // Show or hide error
        if (!isValid) {
            field.classList.add('error');
            errorSpan.textContent = errorMessage;
            errorSpan.style.display = 'block';
        } else {
            field.classList.remove('error');
            errorSpan.textContent = '';
            errorSpan.style.display = 'none';
        }
        
        return isValid;
    }
    
    // Clear field error
    function clearFieldError(field) {
        const errorSpan = field.parentElement.querySelector('.form-error');
        field.classList.remove('error');
        errorSpan.textContent = '';
        errorSpan.style.display = 'none';
    }
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            showMessage('Please correct the errors in the form', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        btnLoader.style.display = 'inline-block';
        submitBtn.querySelector('i.fa-paper-plane').style.display = 'none';
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            // Simulate API call (replace with actual endpoint)
            const response = await simulateContactFormSubmission(data);
            
            if (response.success) {
                showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
                contactForm.reset();
                clearAllErrors();
            } else {
                showMessage('Something went wrong. Please try again later.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnLoader.style.display = 'none';
            submitBtn.querySelector('i.fa-paper-plane').style.display = 'inline';
        }
    });
    
    // Simulate contact form submission (replace with actual API call)
    async function simulateContactFormSubmission(data) {
        try {
            // Try to send to real API endpoint
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Form submitted successfully:', result);
                return { success: true, data: result };
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.log('API error:', errorData);
                return { 
                    success: false, 
                    message: errorData.message || 'Submission failed' 
                };
            }
        } catch (error) {
            console.log('Network error, using fallback:', error);
            return await fallbackSubmission(data);
        }
    }
    
    // Fallback submission for demo purposes
    async function fallbackSubmission(data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate success response (90% success rate for demo)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            // Store in localStorage for demo purposes
            const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
        }
        
        return { success: isSuccess };
    }
    
    // Show message to user
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
        
        // Scroll to message
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Clear all errors
    function clearAllErrors() {
        inputs.forEach(input => clearFieldError(input));
    }
    
    // Character counter for message field
    const messageField = document.getElementById('message');
    const messageCounter = document.createElement('div');
    messageCounter.className = 'char-counter';
    messageField.parentElement.appendChild(messageCounter);
    
    messageField.addEventListener('input', function() {
        const charCount = this.value.length;
        const maxLength = 1000;
        
        messageCounter.textContent = `${charCount}/${maxLength} characters`;
        
        if (charCount > maxLength * 0.9) {
            messageCounter.style.color = 'var(--warning-color)';
        } else if (charCount > maxLength) {
            messageCounter.style.color = 'var(--danger-color)';
        } else {
            messageCounter.style.color = 'var(--text-light)';
        }
    });
    
    // Phone number formatting
    const phoneField = document.getElementById('phone');
    phoneField.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0 && !value.startsWith('+')) {
            // Add country code if not present
            if (value.length === 10) {
                value = '+91' + value; // Default to India
            } else if (value.length === 11 && value.startsWith('1')) {
                value = '+' + value; // US format
            }
        }
        
        // Format phone number for display
        if (value.startsWith('+91') && value.length === 13) {
            // Indian format: +91 XXXXX XXXXX
            value = value.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
        } else if (value.startsWith('+1') && value.length === 12) {
            // US format: +1 (XXX) XXX-XXXX
            value = value.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
        }
        
        e.target.value = value;
    });
    
    // Auto-save form data to localStorage
    let autoSaveTimer;
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                const formData = new FormData(contactForm);
                const data = Object.fromEntries(formData.entries());
                localStorage.setItem('contactFormData', JSON.stringify(data));
            }, 1000);
        });
    });
    
    // Restore form data from localStorage on page load
    function restoreFormData() {
        const savedData = localStorage.getItem('contactFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                const field = contactForm.querySelector(`[name="${key}"]`);
                if (field && field.type !== 'checkbox') {
                    field.value = data[key];
                }
            });
        }
    }
    
    // Initialize
    restoreFormData();
    
    // Clear saved data on successful submission
    contactForm.addEventListener('submit', function() {
        localStorage.removeItem('contactFormData');
    });
    
    // Add responsive form behavior
    function handleResponsiveForm() {
        const contactContent = document.querySelector('.contact-content');
        const contactInfo = document.querySelector('.contact-info');
        const contactForm = document.querySelector('.contact-form');
        
        if (window.innerWidth <= 768) {
            contactContent.style.flexDirection = 'column';
            contactInfo.style.marginBottom = '2rem';
        } else {
            contactContent.style.flexDirection = 'row';
            contactInfo.style.marginBottom = '0';
        }
    }
    
    // Handle responsive behavior on resize
    window.addEventListener('resize', handleResponsiveForm);
    handleResponsiveForm();
    
    // Add keyboard navigation
    contactForm.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const formElements = Array.from(inputs);
            const currentIndex = formElements.indexOf(e.target);
            const nextIndex = currentIndex + 1;
            
            if (nextIndex < formElements.length) {
                formElements[nextIndex].focus();
            }
        }
    });
    
    // Add accessibility features
    inputs.forEach(input => {
        input.setAttribute('aria-describedby', `${input.id}-error`);
        input.setAttribute('aria-required', input.hasAttribute('required'));
    });
    
    // Add form progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'form-progress';
    contactForm.insertBefore(progressIndicator, contactForm.firstChild);
    
    function updateProgress() {
        const filledFields = Array.from(inputs).filter(input => input.value.trim() !== '').length;
        const totalFields = inputs.length;
        const progress = (filledFields / totalFields) * 100;
        
        progressIndicator.style.width = `${progress}%`;
        progressIndicator.setAttribute('aria-label', `Form completion: ${Math.round(progress)}%`);
    }
    
    inputs.forEach(input => {
        input.addEventListener('input', updateProgress);
        input.addEventListener('change', updateProgress);
    });
    
    updateProgress();
});
