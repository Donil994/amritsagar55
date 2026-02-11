const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    personalInfo: {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please enter a valid email address'
            ]
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
            maxlength: [20, 'Phone number cannot exceed 20 characters']
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true
        },
        emergencyContact: {
            name: String,
            phone: String,
            relationship: String
        }
    },
    program: {
        type: {
            type: String,
            required: [true, 'Program type is required'],
            enum: ['day-visit', 'retreat', 'yoga-class', 'private-yoga', 'treatment', 'custom']
        },
        name: {
            type: String,
            required: [true, 'Program name is required'],
            trim: true
        },
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: [1, 'Duration must be at least 1 day']
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required']
        },
        participants: {
            adults: {
                type: Number,
                required: true,
                min: [1, 'At least 1 adult is required'],
                max: [25, 'Maximum 25 adults allowed']
            },
            children: {
                type: Number,
                min: [0, 'Children cannot be negative'],
                max: [10, 'Maximum 10 children allowed'],
                default: 0
            }
        },
        specialRequests: String,
        experience: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        }
    },
    accommodation: {
        type: {
            type: String,
            enum: ['single', 'double', 'dormitory', 'no-accommodation'],
            default: 'no-accommodation'
        },
        checkIn: Date,
        checkOut: Date,
        specialNeeds: String
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'refunded', 'cancelled'],
            default: 'pending'
        },
        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0, 'Amount cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'bank-transfer', 'online'],
            default: 'online'
        },
        transactionId: String,
        paidAt: Date
    },
    status: {
        type: String,
        enum: ['inquiry', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
        default: 'inquiry'
    },
    source: {
        type: String,
        enum: ['website', 'email', 'phone', 'walk-in', 'referral'],
        default: 'website'
    },
    notes: [{
        content: String,
        author: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ 'personalInfo.email': 1 });
bookingSchema.index({ 'program.startDate': -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });

// Virtual for total participants
bookingSchema.virtual('totalParticipants').get(function() {
    return this.program.participants.adults + this.program.participants.children;
});

// Virtual for total nights
bookingSchema.virtual('totalNights').get(function() {
    if (this.accommodation.checkIn && this.accommodation.checkOut) {
        const diffTime = Math.abs(this.accommodation.checkOut - this.accommodation.checkIn);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
});

// Virtual for booking amount
bookingSchema.virtual('bookingAmount').get(function() {
    // Calculate based on program type and duration
    const baseRates = {
        'day-visit': 50,
        'retreat': 150,
        'yoga-class': 20,
        'private-yoga': 100,
        'treatment': 80,
        'custom': 120
    };
    
    const rate = baseRates[this.program.type] || 100;
    return rate * this.totalParticipants * this.program.duration;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
    // Validate dates
    if (this.program.startDate >= this.program.endDate) {
        next(new Error('End date must be after start date'));
        return;
    }
    
    // Validate accommodation dates
    if (this.accommodation.checkIn && this.accommodation.checkOut) {
        if (this.accommodation.checkIn >= this.accommodation.checkOut) {
            next(new Error('Check-out date must be after check-in date'));
            return;
        }
    }
    
    next();
});

// Static methods
bookingSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$payment.amount' }
            }
        }
    ]);
};

bookingSchema.statics.getUpcomingBookings = function(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    
    return this.find({ 
        'program.startDate': { $lte: date },
        status: { $in: ['confirmed', 'checked-in'] }
    })
    .sort({ 'program.startDate': 1 })
    .populate('personalInfo.email');
};

bookingSchema.statics.getRevenueStats = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                'payment.status': 'paid',
                'payment.paidAt': {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$payment.paidAt' },
                    month: { $month: '$payment.paidAt' }
                },
                revenue: { $sum: '$payment.amount' },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
};

module.exports = mongoose.model('Booking', bookingSchema);
