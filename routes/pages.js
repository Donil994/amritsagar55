const express = require('express');
const router = express.Router();

// Page content data (could be moved to database later)
const pageContent = {
    home: {
        title: 'Amrit Sagar - An Ashram Retreat on the Ganges',
        description: 'Experience tranquil living at Amrit Yoga Holistic Center in Varanasi. Daily yoga, meditation, and spiritual retreats on the sacred Ganges River.',
        keywords: ['ashram', 'retreat', 'yoga', 'meditation', 'varanasi', 'ganges', 'spiritual']
    },
    about: {
        title: 'About Aghor Foundation - Amrit Sagar',
        description: 'Learn about Aghor Foundation, a non-profit organization dedicated to combining service and spirituality in Varanasi, India.',
        keywords: ['aghor foundation', 'service', 'spirituality', 'varanasi', 'charity']
    },
    amenities: {
        title: 'Amenities - Amrit Sagar Ashram',
        description: 'Discover the amenities at Amrit Sagar Ashram including yoga classes, meditation, meals, accommodations, and more.',
        keywords: ['amenities', 'facilities', 'yoga hall', 'meditation', 'accommodation']
    },
    programs: {
        title: 'Programs - Amrit Sagar',
        description: 'Explore our programs including day visits, retreats, yoga classes, and holistic treatments at Amrit Sagar Ashram.',
        keywords: ['programs', 'retreats', 'yoga classes', 'meditation', 'treatments']
    },
    contact: {
        title: 'Contact Us - Amrit Sagar',
        description: 'Get in touch with Amrit Sagar Ashram in Varanasi. Contact us for bookings, inquiries, and more information.',
        keywords: ['contact', 'booking', 'inquiry', 'varanasi', 'phone', 'email']
    }
};

// @desc    Get page metadata
// @route    GET /api/pages/:page
// @access   Public
router.get('/:page', (req, res) => {
    const page = req.params.page.toLowerCase();
    
    if (!pageContent[page]) {
        return res.status(404).json({
            success: false,
            message: 'Page not found'
        });
    }

    res.json({
        success: true,
        data: pageContent[page]
    });
});

// @desc    Get all page metadata
// @route    GET /api/pages
// @access   Public
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: pageContent
    });
});

module.exports = router;
