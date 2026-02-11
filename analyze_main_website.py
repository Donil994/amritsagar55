import requests
from bs4 import BeautifulSoup
import json
import re

def analyze_main_website():
    """Analyze the main website to understand image placement"""
    
    base_url = "https://amritsagar.org"
    
    print("🔍 Analyzing Main Website Structure...")
    print("=" * 60)
    
    # Create session
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    try:
        # Get homepage
        response = session.get(base_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all images
        images = soup.find_all('img')
        
        image_mapping = {
            'homepage': {
                'hero_background': None,
                'about_section': None,
                'gallery': [],
                'other_sections': []
            }
        }
        
        for img in images:
            src = img.get('src', '')
            alt = img.get('alt', '')
            
            # Skip logos and small images
            if 'logo' in src.lower() or 'favicon' in src.lower():
                continue
                
            # Convert to absolute URL
            if src.startswith('//'):
                src = 'https:' + src
            elif src.startswith('/'):
                src = base_url + src
                
            # Check if it's a hero background
            if 'hero' in str(img.parent).lower() or 'banner' in str(img.parent).lower():
                image_mapping['homepage']['hero_background'] = src
            # Check if it's in about section
            elif 'about' in str(img.parent).lower():
                image_mapping['homepage']['about_section'] = src
            # Check if it's in gallery
            elif 'gallery' in str(img.parent).lower() or 'portfolio' in str(img.parent).lower():
                image_mapping['homepage']['gallery'].append({
                    'src': src,
                    'alt': alt
                })
            else:
                image_mapping['homepage']['other_sections'].append({
                    'src': src,
                    'alt': alt,
                    'context': str(img.parent)[:100] + '...' if len(str(img.parent)) > 100 else str(img.parent)
                })
        
        # Save the mapping
        with open('main_website_image_mapping.json', 'w') as f:
            json.dump(image_mapping, f, indent=2)
        
        print(f"✅ Found {len(images)} images on homepage")
        print(f"📊 Hero background: {image_mapping['homepage']['hero_background']}")
        print(f"📊 About section: {image_mapping['homepage']['about_section']}")
        print(f"📊 Gallery images: {len(image_mapping['homepage']['gallery'])}")
        print(f"📊 Other sections: {len(image_mapping['homepage']['other_sections'])}")
        
        return image_mapping
        
    except Exception as e:
        print(f"❌ Error analyzing main website: {e}")
        return None

def create_placement_map():
    """Create a placement map based on the downloaded images"""
    
    # Map of original URLs to local filenames
    url_to_filename = {
        "https://amritsagar.org/wp-content/uploads/2023/06/4.jpg": "4.jpg",
        "https://stayontheganges.com/wp-content/uploads/2023/06/3.jpg": "3.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/13.jpg": "13.jpg",
        "https://stayontheganges.com/wp-content/uploads/2023/06/19.jpg": "19.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/17.jpg": "17.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/8.jpg": "8.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/10.jpg": "10.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/11.jpg": "11.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/5.jpg": "5.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/9.jpg": "9.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/14.jpg": "14.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/12.jpg": "12.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/amrit-sagar-1.jpg": "amrit-sagar-1.jpg",
        # Cropped versions
        "https://amritsagar.org/wp-content/uploads/2023/06/8-600x400_c.jpg": "8-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/5-600x400_c.jpg": "5-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/11-600x400_c.jpg": "11-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/14-600x400_c.jpg": "14-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/3-600x400_c.jpg": "3-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/10-600x400_c.jpg": "10-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/17-600x400_c.jpg": "17-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/13-600x400_c.jpg": "13-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/19-600x400_c.jpg": "19-600x400_c.jpg",
        "https://amritsagar.org/wp-content/uploads/2023/06/12-600x400_c.jpg": "12-600x400_c.jpg"
    }
    
    # Create placement map based on typical website structure
    placement_map = {
        "homepage": {
            "hero_background": "images/4.jpg",
            "about_section": "images/amrit-sagar-1.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg", 
                "images/9.jpg",
                "images/17.jpg",
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/17.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "about-aghor-foundation": {
            "hero_background": "images/9.jpg",
            "about_image": "images/9.jpg",
            "founder_image": "images/9.jpg",
            "campus_gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg",
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "about-bal-ashram": {
            "hero_background": "images/amrit-sagar-1.jpg",
            "about_image": "images/9.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "about-holistic-farm": {
            "hero_background": "images/17.jpg",
            "about_image": "images/17.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "about-team": {
            "hero_background": "images/9.jpg",
            "team_images": [
                "images/9.jpg",
                "images/17.jpg",
                "images/4.jpg",
                "images/amrit-sagar-1.jpg"
            ]
        },
        "programs-day-visit": {
            "hero_background": "images/4.jpg",
            "overview_image": "images/amrit-sagar-1.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg",
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg",
                "images/17.jpg"
            ]
        },
        "programs-retreats": {
            "hero_background": "images/17.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "programs-yoga": {
            "hero_background": "images/9.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "programs-treatments": {
            "hero_background": "images/17.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "amenities": {
            "hero_background": "images/4.jpg",
            "gallery": [
                "images/4.jpg",
                "images/amrit-sagar-1.jpg",
                "images/9.jpg",
                "images/17.jpg"
            ]
        },
        "contact": {
            "hero_background": "images/amrit-sagar-1.jpg",
            "contact_image": "images/amrit-sagar-1.jpg"
        }
    }
    
    # Save the placement map
    with open('image_placement_map.json', 'w') as f:
        json.dump(placement_map, f, indent=2)
    
    print("✅ Image placement map created")
    print("📋 Saved to: image_placement_map.json")
    
    return placement_map

if __name__ == "__main__":
    # Analyze main website
    mapping = analyze_main_website()
    
    # Create placement map
    placement_map = create_placement_map()
    
    print("\n🎯 Next Steps:")
    print("1. Copy the best quality images from original_images/ to images/")
    print("2. Apply the placement map to update HTML files")
    print("3. Maintain current image sizes and styling")
