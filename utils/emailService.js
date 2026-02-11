const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Send email function
const sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Amrit Sagar'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};

// Generate email templates
const generateContactTemplate = (contact) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #2c3e50; }
            .value { padding: 10px; background: white; border-left: 4px solid #e67e22; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🕉 New Contact Form Submission</h1>
                <p>Amrit Sagar Ashram Retreat</p>
            </div>
            <div class="content">
                <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${contact.name}</div>
                </div>
                <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${contact.email}</div>
                </div>
                ${contact.phone ? `
                <div class="field">
                    <div class="label">Phone:</div>
                    <div class="value">${contact.phone}</div>
                </div>
                ` : ''}
                <div class="field">
                    <div class="label">Subject:</div>
                    <div class="value">${contact.subject}</div>
                </div>
                <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${contact.message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="field">
                    <div class="label">Submitted:</div>
                    <div class="value">${new Date(contact.createdAt).toLocaleString()}</div>
                </div>
            </div>
            <div class="footer">
                <p>This email was sent from the Amrit Sagar website contact form.</p>
                <p>IP Address: ${contact.ipAddress || 'Not available'}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateAutoReplyTemplate = (contact) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting Amrit Sagar</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background: #e67e22; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🙏 Thank You for Contacting Us</h1>
                <p>Amrit Sagar Ashram Retreat</p>
            </div>
            <div class="content">
                <p>Dear ${contact.name},</p>
                <p>Thank you for reaching out to Amrit Sagar Ashram Retreat. We have received your message and will get back to you as soon as possible.</p>
                
                <div class="info-box">
                    <strong>Your Message:</strong><br>
                    "${contact.subject}"
                </div>
                
                <p>While you wait, feel free to explore more about our programs and amenities:</p>
                
                <div style="text-align: center;">
                    <a href="https://amritsagar.org" class="btn">Visit Our Website</a>
                </div>
                
                <p><strong>Our Contact Information:</strong></p>
                <ul>
                    <li>📧 Email: india@amritsagar.org</li>
                    <li>📞 Phone: +91 88875 33641</li>
                    <li>📍 Address: Mahesh Nagar Colony, Samne Ghat, Varanasi, UP, 221005</li>
                </ul>
            </div>
            <div class="footer">
                <p>With love and blessings from the Ganges,<br>Amrit Sagar Team</p>
                <p>If you didn't submit this form, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateBookingConfirmationTemplate = (booking) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - Amrit Sagar</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #2c3e50; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .status { padding: 10px; border-radius: 5px; text-align: center; font-weight: bold; }
            .status.pending { background: #f39c12; color: white; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🕉 Booking Received</h1>
                <p>Amrit Sagar Ashram Retreat</p>
            </div>
            <div class="content">
                <p>Dear ${booking.personalInfo.firstName} ${booking.personalInfo.lastName},</p>
                <p>Thank you for your booking request! We have received your submission and will contact you soon to confirm your reservation.</p>
                
                <div class="status pending">
                    Status: Pending Confirmation
                </div>
                
                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Booking Reference:</span>
                        <span>BK${booking._id.toString().slice(-6).toUpperCase()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Program:</span>
                        <span>${booking.program.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span>${booking.program.duration} days</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date:</span>
                        <span>${new Date(booking.program.startDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">End Date:</span>
                        <span>${new Date(booking.program.endDate).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Participants:</span>
                        <span>${booking.totalParticipants} (${booking.program.participants.adults} adults, ${booking.program.participants.children} children)</span>
                    </div>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Our team will review your booking request</li>
                    <li>We'll check availability for your requested dates</li>
                    <li>You'll receive a confirmation email with payment details</li>
                    <li>Once confirmed, your booking will be secured</li>
                </ol>
                
                <p><strong>Questions?</strong> Contact us at india@amritsagar.org or +91 88875 33641</p>
            </div>
            <div class="footer">
                <p>With love and blessings from the Ganges,<br>Amrit Sagar Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Email service functions
exports.sendContactNotification = async (contact) => {
    const html = generateContactTemplate(contact);
    
    await sendEmail({
        to: process.env.ADMIN_EMAIL || 'india@amritsagar.org',
        subject: `New Contact Form: ${contact.subject}`,
        html: html,
        text: `New contact form submission from ${contact.name} (${contact.email}): ${contact.message}`
    });
};

exports.sendAutoReply = async (contact) => {
    const html = generateAutoReplyTemplate(contact);
    
    await sendEmail({
        to: contact.email,
        subject: 'Thank you for contacting Amrit Sagar Ashram',
        html: html,
        text: `Thank you for contacting Amrit Sagar Ashram. We have received your message and will get back to you soon.`
    });
};

exports.sendBookingConfirmation = async (booking) => {
    const html = generateBookingConfirmationTemplate(booking);
    
    await sendEmail({
        to: booking.personalInfo.email,
        subject: 'Booking Confirmation - Amrit Sagar Ashram',
        html: html,
        text: `Thank you for your booking request at Amrit Sagar Ashram. We will contact you soon to confirm your reservation.`
    });
};

exports.sendNewBookingNotification = async (booking) => {
    const html = `
        <h2>New Booking Received</h2>
        <p><strong>Name:</strong> ${booking.personalInfo.firstName} ${booking.personalInfo.lastName}</p>
        <p><strong>Email:</strong> ${booking.personalInfo.email}</p>
        <p><strong>Phone:</strong> ${booking.personalInfo.phone}</p>
        <p><strong>Program:</strong> ${booking.program.name}</p>
        <p><strong>Duration:</strong> ${booking.program.duration} days</p>
        <p><strong>Participants:</strong> ${booking.totalParticipants}</p>
        <p><strong>Total Amount:</strong> $${booking.bookingAmount}</p>
    `;
    
    await sendEmail({
        to: process.env.ADMIN_EMAIL || 'india@amritsagar.org',
        subject: `New Booking: ${booking.program.name}`,
        html: html,
        text: `New booking received for ${booking.program.name}`
    });
};

exports.sendBookingStatusUpdate = async (booking) => {
    const html = `
        <h2>Booking Status Update</h2>
        <p>Your booking status has been updated to: <strong>${booking.status}</strong></p>
        <p>Booking Reference: BK${booking._id.toString().slice(-6).toUpperCase()}</p>
        <p>Program: ${booking.program.name}</p>
    `;
    
    await sendEmail({
        to: booking.personalInfo.email,
        subject: `Booking Status Update - Amrit Sagar`,
        html: html,
        text: `Your booking status has been updated to: ${booking.status}`
    });
};

exports.sendBookingCancellation = async (booking) => {
    const html = `
        <h2>Booking Cancelled</h2>
        <p>Your booking has been cancelled as requested.</p>
        <p>Booking Reference: BK${booking._id.toString().slice(-6).toUpperCase()}</p>
        <p>We hope to see you again soon at Amrit Sagar Ashram.</p>
    `;
    
    await sendEmail({
        to: booking.personalInfo.email,
        subject: 'Booking Cancelled - Amrit Sagar',
        html: html,
        text: 'Your booking has been cancelled as requested.'
    });
};
