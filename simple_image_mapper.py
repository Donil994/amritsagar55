#!/usr/bin/env python3
"""
Simple Image Placement Mapper for Amrit Sagar Website
"""

import json

def create_placement_map():
    """Create detailed mapping of images to their original positions"""
    
    placement_map = {
        'index.html': {
            'hero_background': 'images/4.jpg',
            'about_section': 'images/amrit-sagar-1.jpg',
            'gallery': ['images/4.jpg', 'images/amrit-sagar-1.jpg', 'images/9.jpg', 'images/17.jpg']
        },
        'about-aghor-foundation.html': {
            'hero_background': 'images/4.jpg',
            'founder_image': 'images/9.jpg',
            'campus_gallery': ['images/4.jpg', 'images/amrit-sagar-1.jpg', 'images/9.jpg', 'images/17.jpg', 'images/4.jpg', 'images/amrit-sagar-1.jpg', 'images/9.jpg', 'images/17.jpg']
        },
        'about-bal-ashram.html': {
            'hero_background': 'images/amrit-sagar-1.jpg',
            'about_image': 'images/9.jpg'
        },
        'about-holistic-farm.html': {
            'hero_background': 'images/17.jpg'
        },
        'about-team.html': {
            'hero_background': 'images/9.jpg'
        },
        'programs-day-visit.html': {
            'hero_background': 'images/4.jpg'
        },
        'programs-retreats.html': {
            'hero_background': 'images/17.jpg'
        },
        'programs-yoga.html': {
            'hero_background': 'images/9.jpg'
        },
        'programs-treatments.html': {
            'hero_background': 'images/17.jpg'
        },
        'amenities.html': {
            'hero_background': 'images/4.jpg'
        },
        'contact.html': {
            'hero_background': 'images/amrit-sagar-1.jpg'
        }
    }
    
    with open('image_placement_map.json', 'w') as f:
        json.dump(placement_map, f, indent=2)
    
    print("Image placement map created successfully!")
    print("Files to update:")
    for page in placement_map.keys():
        print(f"  - {page}")

if __name__ == "__main__":
    create_placement_map()
