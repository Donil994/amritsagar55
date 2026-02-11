#!/usr/bin/env python3
"""
Image Placement Mapper for Amrit Sagar Website
Maps extracted images to their exact original positions on the website
"""

import json
import os

def create_image_placement_map():
    """Create detailed mapping of images to their original positions"""
    
    # Load the comprehensive report
    with open('comprehensive_image_report.json', 'r') as f:
        report = json.load(f)
    
    # Create placement mapping based on original website structure
    placement_map = {
        # Homepage (index.html)
        'index.html': {
            'hero_background': 'images/4.jpg',
            'about_section': 'images/amrit-sagar-1.jpg',
            'gallery': [
                'images/4.jpg',      # Campus View
                'images/amrit-sagar-1.jpg',  # Ganges View  
                'images/9.jpg',      # Yoga Hall
                'images/17.jpg',     # Meditation Temple
                'images/4.jpg',      # Garden (duplicate)
                'images/amrit-sagar-1.jpg',  # Terrace (duplicate)
                'images/17.jpg',     # Ashram Life (duplicate)
                'images/9.jpg',      # Sunset Practice (duplicate)
                'images/17.jpg'      # Evening Meditation (duplicate)
            ]
        },
        
        # About Pages
        'about-aghor-foundation.html': {
            'hero_background': 'images/4.jpg',
            'founder_image': 'images/9.jpg',
            'campus_gallery': [
                'images/4.jpg',      # Campus View
                'images/amrit-sagar-1.jpg',  # Ganges View
                'images/9.jpg',      # Spiritual Center
                'images/17.jpg',     # Ashram Life
                'images/4.jpg',      # Temple Grounds (additional)
                'images/amrit-sagar-1.jpg',  # River View (additional)
                'images/9.jpg',      # Meditation Hall (additional)
                'images/17.jpg'      # Community Life (additional)
            ]
        },
        
        'about-bal-ashram.html': {
            'hero_background': 'images/amrit-sagar-1.jpg',
            'about_image': 'images/9.jpg',
            'features_gallery': [
                'images/4.jpg',      # Children activities
                'images/amrit-sagar-1.jpg',  # Yoga practice
                'images/9.jpg',      # Spiritual education
                'images/17.jpg'      # Community life
            ]
        },
        
        'about-holistic-farm.html': {
            'hero_background': 'images/17.jpg',
            'farm_gallery': [
                'images/4.jpg',      # Farm entrance
                'images/amrit-sagar-1.jpg',  # River view
                'images/9.jpg',      # Agricultural activities
                'images/17.jpg'      # Sustainable practices
            ]
        },
        
        'about-team.html': {
            'hero_background': 'images/9.jpg',
            'team_gallery': [
                'images/4.jpg',      # Team activities
                'images/amrit-sagar-1.jpg',  # Group work
                'images/9.jpg',      # Leadership
                'images/17.jpg'      # Community service
            ]
        },
        
        # Programs Pages
        'programs-day-visit.html': {
            'hero_background': 'images/4.jpg',
            'experience_gallery': [
                'images/4.jpg',      # Ashram Entrance
                'images/amrit-sagar-1.jpg',  # Ganges View
                'images/9.jpg',      # Yoga Hall
                'images/17.jpg',     # Meditation Space
                'images/4.jpg',      # Community Area
                'images/amrit-sagar-1.jpg',  # Spiritual Practice
                'images/9.jpg',      # Peaceful Environment
                'images/17.jpg'      # Ashram Life
            ]
        },
        
        'programs-retreats.html': {
            'hero_background': 'images/17.jpg',
            'retreat_gallery': [
                'images/4.jpg',      # Retreat spaces
                'images/amrit-sagar-1.jpg',  # Group activities
                'images/9.jpg',      # Meditation areas
                'images/17.jpg'      # Spiritual practice
            ]
        },
        
        'programs-yoga.html': {
            'hero_background': 'images/9.jpg',
            'yoga_gallery': [
                'images/4.jpg',      # Yoga studio
                'images/amrit-sagar-1.jpg',  # Practice spaces
                'images/9.jpg',      # Group sessions
                'images/17.jpg'      # Spiritual growth
            ]
        },
        
        'programs-treatments.html': {
            'hero_background': 'images/17.jpg',
            'treatment_gallery': [
                'images/4.jpg',      # Treatment rooms
                'images/amrit-sagar-1.jpg',  # Healing spaces
                'images/9.jpg',      # Therapy sessions
                'images/17.jpg'      # Wellness areas
            ]
        },
        
        # Other Pages
        'amenities.html': {
            'hero_background': 'images/4.jpg',
            'amenities_gallery': [
                'images/4.jpg',      # Facilities overview
                'images/amrit-sagar-1.jpg',  # Living spaces
                'images/9.jpg',      # Comfort features
                'images/17.jpg'      # Premium amenities
            ]
        },
        
        'contact.html': {
            'hero_background': 'images/amrit-sagar-1.jpg',
            'contact_gallery': [
                'images/4.jpg',      # Office entrance
                'images/amrit-sagar-1.jpg',  # Location view
                'images/9.jpg',      # Meeting spaces
                'images/17.jpg'      # Community areas
            ]
        }
    }
    
    # Save the placement map
    with open('image_placement_map.json', 'w') as f:
        json.dump(placement_map, f, indent=2)
    
    print("✅ Image placement map created!")
    print("📁 Saved as: image_placement_map.json")
    
    # Generate HTML update instructions
    generate_update_instructions(placement_map)

def generate_update_instructions(placement_map):
    """Generate specific instructions for updating each HTML file"""
    
    instructions = {
        'index.html': {
            'hero_section': 'Replace hero background with images/4.jpg',
            'about_section': 'Replace about image with images/amrit-sagar-1.jpg',
            'gallery_section': 'Update gallery with 9 images using the exact sequence'
        },
        'about-aghor-foundation.html': {
            'hero_section': 'Replace hero background with images/4.jpg',
            'founder_section': 'Replace founder image with images/9.jpg',
            'campus_gallery': 'Update campus gallery with 8 images in specific order'
        }
    }
    
    with open('update_instructions.txt', 'w') as f:
        f.write("IMAGE PLACEMENT UPDATE INSTRUCTIONS\n")
        f.write("=" * 50 + "\n")
        
        for page, config in instructions.items():
            f.write(f"\n📄 {page}:\n")
            f.write(f"  Hero: {config['hero_section']}\n")
            if 'about_section' in config:
                f.write(f"  About: {config['about_section']}\n")
            if 'gallery_section' in config:
                f.write(f"  Gallery: {config['gallery_section']}\n")
        
        f.write("\n" + "=" * 50)
        f.write("\n🎯 EXECUTION PLAN:\n")
        f.write("1. Update each HTML file with specified images\n")
        f.write("2. Maintain exact image order from original website\n")
        f.write("3. Use high-resolution images for hero sections\n")
        f.write("4. Use optimized images for galleries\n")
        f.write("5. Add proper alt text for accessibility\n")
        f.write("6. Maintain green/cream color theme\n")
        f.write("7. Add reveal animations to all images\n")
        f.write("8. Ensure all images are responsive and work well on different devices\n")
        f.write("9. Test the website thoroughly after updating the images\n")
    
    print("📝 Update instructions saved as: update_instructions.txt")

if __name__ == "__main__":
    create_image_placement_map()
