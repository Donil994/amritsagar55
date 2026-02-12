// Donation Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const donationForm = document.getElementById('donationForm');
    const submitBtn = document.getElementById('submitDonation');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const donationMessage = document.getElementById('donationMessage');
    const currencyBtns = document.querySelectorAll('.currency-btn');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    const paymentOptions = document.querySelectorAll('.payment-option');
    
    let selectedCurrency = 'USD';
    let selectedAmount = 0;
    let selectedPaymentMethod = 'card';
    
    // Currency conversion rates (approximate)
    const exchangeRates = {
        USD: { INR: 83, symbol: '$' },
        INR: { USD: 0.012, symbol: '₹' }
    };
    
    // Preset amounts for different currencies
    const presetAmountsData = {
        USD: [10, 25, 50, 100, 250, 500],
        INR: [500, 1000, 2000, 5000, 10000, 20000]
    };
    
    // Currency selection
    currencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currencyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedCurrency = this.dataset.currency;
            updatePresetAmounts();
            updateCurrencySymbol();
        });
    });
    
    // Update preset amounts based on currency
    function updatePresetAmounts() {
        const amounts = presetAmountsData[selectedCurrency];
        const presetAmountsContainer = document.getElementById('presetAmounts');
        
        presetAmountsContainer.innerHTML = amounts.map(amount => 
            `<button type="button" class="amount-btn" data-amount="${amount}">
                ${exchangeRates[selectedCurrency].symbol}${amount}
            </button>`
        ).join('');
        
        // Re-attach event listeners to new amount buttons
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.addEventListener('click', handleAmountSelection);
        });
    }
    
    // Update currency symbol
    function updateCurrencySymbol() {
        const symbol = exchangeRates[selectedCurrency].symbol;
        document.querySelector('.currency-symbol').textContent = symbol;
    }
    
    // Amount selection
    function handleAmountSelection(e) {
        amountBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        selectedAmount = parseInt(e.target.dataset.amount);
        customAmountInput.value = '';
    }
    
    // Attach event listeners to initial amount buttons
    amountBtns.forEach(btn => {
        btn.addEventListener('click', handleAmountSelection);
    });
    
    // Custom amount input
    customAmountInput.addEventListener('input', function() {
        amountBtns.forEach(btn => btn.classList.remove('active'));
        selectedAmount = parseFloat(this.value) || 0;
    });
    
    // Payment method selection
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.dataset.method;
        });
    });
    
    // Set default payment method
    document.querySelector('[data-method="card"]').classList.add('active');
    
    // Form validation
    function validateForm() {
        const name = document.getElementById('donorName');
        const email = document.getElementById('donorEmail');
        const phone = document.getElementById('donorPhone');
        
        let isValid = true;
        const errors = [];
        
        // Reset error states
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(field => {
            field.classList.remove('error');
        });
        
        // Validate name
        if (!name.value.trim() || name.value.trim().length < 2) {
            showError(name, 'Please enter a valid name');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate phone (optional but if provided, should be valid)
        if (phone.value && phone.value.replace(/\D/g, '').length < 10) {
            showError(phone, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Validate amount
        if (!selectedAmount || selectedAmount < 1) {
            showMessage('Please select or enter a valid donation amount', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(field, message) {
        field.classList.add('error');
        const errorSpan = field.parentElement.querySelector('.form-error');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.style.display = 'block';
        }
    }
    
    function showMessage(message, type) {
        donationMessage.textContent = message;
        donationMessage.className = `form-message ${type}`;
        donationMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                donationMessage.style.display = 'none';
            }, 5000);
        }
        
        donationMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Form submission
    donationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        btnLoader.style.display = 'inline-block';
        submitBtn.querySelector('i.fa-heart').style.display = 'none';
        
        const formData = new FormData(donationForm);
        const donationData = {
            currency: selectedCurrency,
            amount: selectedAmount,
            donationType: formData.get('donationType'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            purpose: formData.get('purpose'),
            message: formData.get('message'),
            paymentMethod: selectedPaymentMethod,
            timestamp: new Date().toISOString()
        };
        
        try {
            const response = await processDonation(donationData);
            
            if (response.success) {
                showMessage('Thank you for your generous donation! You will be redirected to complete your payment.', 'success');
                
                // Redirect to payment processor after 2 seconds
                setTimeout(() => {
                    redirectToPayment(response.paymentUrl);
                }, 2000);
                
                // Reset form
                donationForm.reset();
                amountBtns.forEach(btn => btn.classList.remove('active'));
                selectedAmount = 0;
            } else {
                showMessage(response.message || 'Payment processing failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Donation error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnLoader.style.display = 'none';
            submitBtn.querySelector('i.fa-heart').style.display = 'inline';
        }
    });
    
    // Process donation (mock implementation)
    async function processDonation(data) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would call your backend
        console.log('Processing donation:', data);
        
        // Mock success response
        return {
            success: true,
            paymentUrl: generatePaymentUrl(data),
            transactionId: generateTransactionId()
        };
    }
    
    // Generate payment URL (mock implementation)
    function generatePaymentUrl(data) {
        const baseUrl = window.location.origin;
        const params = new URLSearchParams({
            amount: data.amount,
            currency: data.currency,
            transactionId: generateTransactionId(),
            paymentMethod: data.paymentMethod
        });
        
        // In a real implementation, this would redirect to actual payment processors
        switch (data.paymentMethod) {
            case 'paypal':
                return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
            case 'upi':
                return `upi://pay?${params.toString()}`;
            case 'bank':
                return `${baseUrl}/bank-transfer?${params.toString()}`;
            default: // card
                return `${baseUrl}/card-payment?${params.toString()}`;
        }
    }
    
    // Generate transaction ID
    function generateTransactionId() {
        return 'DON' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    // Redirect to payment
    function redirectToPayment(url) {
        window.open(url, '_blank');
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add animation classes on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Add staggered animations to child elements
                const children = entry.target.querySelectorAll('.slide-up-stagger-1, .slide-up-stagger-2, .slide-up-stagger-3, .slide-up-stagger-4');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
    
    // Initial animations for hero section
    const heroElements = document.querySelectorAll('.hero .slide-up, .hero .slide-up-stagger-1, .hero .slide-up-stagger-2, .hero .slide-up-stagger-3, .hero .slide-up-stagger-4');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('donorPhone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0 && !value.startsWith('+')) {
            if (value.length === 10) {
                value = '+91' + value; // Default to India
            } else if (value.length === 11 && value.startsWith('1')) {
                value = '+' + value; // US format
            }
        }
        
        // Format phone number for display
        if (value.startsWith('+91') && value.length === 13) {
            value = value.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
        } else if (value.startsWith('+1') && value.length === 12) {
            value = value.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
        }
        
        e.target.value = value;
    });
    
    // Add to navigation
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !navMenu.querySelector('a[href="donate.html"]')) {
        const donateLink = document.createElement('li');
        donateLink.className = 'nav-item';
        donateLink.innerHTML = '<a href="donate.html" class="nav-link active">Donate</a>';
        navMenu.appendChild(donateLink);
    }
});
