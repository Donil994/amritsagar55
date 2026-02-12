// Vercel Serverless Function for Donation Processing
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Parse request body
        const body = JSON.parse(req.body);
        const { 
            currency, 
            amount, 
            donationType, 
            name, 
            email, 
            phone, 
            purpose, 
            message, 
            paymentMethod 
        } = body;

        // Basic validation
        const errors = [];
        
        if (!currency || !['USD', 'INR'].includes(currency)) {
            errors.push('Valid currency (USD or INR) is required');
        }
        
        if (!amount || amount < 1) {
            errors.push('Donation amount must be at least 1');
        }
        
        if (amount > 100000) {
            errors.push('Donation amount cannot exceed 100,000');
        }
        
        if (!name || name.trim().length < 2) {
            errors.push('Name is required and must be at least 2 characters');
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Valid email address is required');
        }
        
        if (!donationType || !['one-time', 'monthly'].includes(donationType)) {
            errors.push('Valid donation type is required');
        }
        
        if (!paymentMethod || !['card', 'paypal', 'upi', 'bank'].includes(paymentMethod)) {
            errors.push('Valid payment method is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // Create donation record
        const donationData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            currency: currency.toUpperCase(),
            amount: parseFloat(amount),
            donationType,
            purpose: purpose || 'general',
            message: message ? message.trim() : '',
            paymentMethod,
            status: 'pending',
            timestamp: new Date().toISOString(),
            id: 'DON' + Date.now(),
            ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown'
        };

        // Store in memory (in production, save to database)
        if (!global.donations) {
            global.donations = [];
        }
        global.donations.push(donationData);

        // Log the donation
        console.log('New donation submission:', {
            ...donationData,
            timestamp: new Date().toISOString()
        });

        // Generate payment URL based on payment method
        const paymentUrl = generatePaymentUrl(donationData);

        // Send email notification (placeholder - implement with your email service)
        try {
            // Example: await sendDonationNotification(donationData);
            console.log('Donation notification would be sent here');
        } catch (emailError) {
            console.error('Email notification failed:', emailError);
            // Don't fail the request if email fails
        }

        // Return success response
        res.status(201).json({
            success: true,
            message: 'Thank you for your donation! Redirecting to payment...',
            data: {
                id: donationData.id,
                name: donationData.name,
                email: donationData.email,
                amount: donationData.amount,
                currency: donationData.currency,
                paymentUrl: paymentUrl,
                transactionId: donationData.id
            }
        });

    } catch (error) {
        console.error('Donation processing error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate payment URL based on payment method and currency
function generatePaymentUrl(donationData) {
    const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://amritsagar55.vercel.app' 
        : 'http://localhost:5000';
    
    const params = new URLSearchParams({
        amount: donationData.amount,
        currency: donationData.currency,
        transactionId: donationData.id,
        name: donationData.name,
        email: donationData.email,
        donationType: donationData.donationType
    });

    switch (donationData.paymentMethod) {
        case 'paypal':
            // PayPal URL (sandbox for development)
            const paypalUrl = donationData.currency === 'USD' 
                ? 'https://www.sandbox.paypal.com/cgi-bin/webscr'
                : 'https://www.paypal.com/cgi-bin/webscr';
            
            return `${paypalUrl}?cmd=_donations&business=donations@amritsagar.org&item_name=Donation&amount=${donationData.amount}&currency_code=${donationData.currency}&return=${baseUrl}/donate/success&cancel_return=${baseUrl}/donate/cancel`;

        case 'upi':
            // UPI payment URL (for INR only)
            if (donationData.currency !== 'INR') {
                throw new Error('UPI is only available for INR donations');
            }
            return `upi://pay?pa=amritsagar@upi&pn=Amrit%20Sagar&am=${donationData.amount}&cu=INR&tn=Donation`;

        case 'bank':
            // Bank transfer instructions page
            return `${baseUrl}/donate/bank-transfer?${params.toString()}`;

        case 'card':
        default:
            // Credit/debit card payment (Stripe or similar)
            return `${baseUrl}/donate/card-payment?${params.toString()}`;
    }
}
