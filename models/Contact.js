const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
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
        trim: true,
        maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    source: {
        type: String,
        enum: ['contact-form', 'booking-form', 'general-inquiry'],
        default: 'contact-form'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'closed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: String,
        trim: true
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
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ priority: 1 });

// Virtual for response time
contactSchema.virtual('responseTime').get(function() {
    if (this.status === 'resolved' && this.notes.length > 0) {
        const firstResponse = this.notes.find(note => note.author !== 'System');
        if (firstResponse) {
            return Math.floor((firstResponse.timestamp - this.createdAt) / (1000 * 60 * 60 * 24));
        }
    }
    return null;
});

// Static methods
contactSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

contactSchema.statics.getRecentContacts = function(days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return this.find({ createdAt: { $gte: date } })
        .sort({ createdAt: -1 })
        .limit(10);
};

module.exports = mongoose.model('Contact', contactSchema);
