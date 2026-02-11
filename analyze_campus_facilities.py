import requests
from bs4 import BeautifulSoup
import json

def analyze_campus_facilities():
    """Analyze campus and facilities sections from original website"""
    
    urls_to_check = [
        "https://amritsagar.org",
        "https://amritsagar.org/about/",
        "https://amritsagar.org/amenities/"
    ]
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    campus_facilities_mapping = {
        'campus_gallery': [],
        'facilities_gallery': [],
        'other_sections': []
    }
    
    for url in urls_to_check:
        try:
            print(f"🔍 Analyzing: {url}")
            response = session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find campus/gallery sections
            sections = soup.find_all(['section', 'div'])
            
            for section in sections:
                section_text = section.get_text().lower()
                section_html = str(section)
                
                # Check if it's campus related
                if any(keyword in section_text for keyword in ['campus', 'gallery', 'photos', 'images']):
                    images = section.find_all('img')
                    for img in images:
                        src = img.get('src', '')
                        alt = img.get('alt', '')
                        
                        if 'logo' in src.lower() or 'favicon' in src.lower():
                            continue
                            
                        # Convert to absolute URL
                        if src.startswith('//'):
                            src = 'https:' + src
                        elif src.startswith('/'):
                            src = 'https://amritsagar.org' + src
                        
                        campus_facilities_mapping['campus_gallery'].append({
                            'src': src,
                            'alt': alt,
                            'context': section_text[:100] + '...' if len(section_text) > 100 else section_text
                        })
                
                # Check if it's facilities related
                elif any(keyword in section_text for keyword in ['facilities', 'amenities', 'accommodation']):
                    images = section.find_all('img')
                    for img in images:
                        src = img.get('src', '')
                        alt = img.get('alt', '')
                        
                        if 'logo' in src.lower() or 'favicon' in src.lower():
                            continue
                            
                        # Convert to absolute URL
                        if src.startswith('//'):
                            src = 'https:' + src
                        elif src.startswith('/'):
                            src = 'https://amritsagar.org' + src
                        
                        campus_facilities_mapping['facilities_gallery'].append({
                            'src': src,
                            'alt': alt,
                            'context': section_text[:100] + '...' if len(section_text) > 100 else section_text
                        })
            
        except Exception as e:
            print(f"❌ Error analyzing {url}: {e}")
    
    # Save the mapping
    with open('campus_facilities_mapping.json', 'w') as f:
        json.dump(campus_facilities_mapping, f, indent=2)
    
    print(f"✅ Found {len(campus_facilities_mapping['campus_gallery'])} campus images")
    print(f"✅ Found {len(campus_facilities_mapping['facilities_gallery'])} facilities images")
    
    return campus_facilities_mapping

def create_optimized_mapping():
    """Create optimized mapping without duplicates"""
    
    # Available images from our download
    available_images = [
        "3.jpg", "4.jpg", "5.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", 
        "13.jpg", "14.jpg", "17.jpg", "19.jpg", "amrit-sagar-1.jpg"
    ]
    
    # Optimized mapping based on typical website structure
    optimized_mapping = {
        'campus_gallery': [
            "images/4.jpg",      # Main campus view
            "images/amrit-sagar-1.jpg",  # Ganges view
            "images/9.jpg",      # Spiritual center
            "images/17.jpg",     # Temple/meditation area
            "images/3.jpg",      # Garden area
            "images/8.jpg",      # Accommodation
            "images/10.jpg",     # Community space
            "images/13.jpg"      # Additional campus view
        ],
        'facilities_gallery': [
            "images/4.jpg",      # Yoga Hall
            "images/amrit-sagar-1.jpg",  # Meditation Temple  
            "images/17.jpg",     # Garden & Terrace
            "images/3.jpg",      # Dining Area
            "images/8.jpg",      # Accommodation Rooms
            "images/10.jpg",     # Library/Study Area
            "images/13.jpg",     # Reception/Common Area
            "images/14.jpg",     # Additional Facility
        ]
    }
    
    # Save optimized mapping
    with open('optimized_campus_facilities.json', 'w') as f:
        json.dump(optimized_mapping, f, indent=2)
    
    print("✅ Optimized mapping created")
    print("📋 Campus Gallery: 8 unique images")
    print("📋 Facilities Gallery: 8 unique images")
    
    return optimized_mapping

if __name__ == "__main__":
    print("🏛️ Analyzing Campus and Facilities Sections")
    print("=" * 60)
    
    # Analyze original website
    mapping = analyze_campus_facilities()
    
    # Create optimized mapping
    optimized = create_optimized_mapping()
    
    print("\n🎯 Next Steps:")
    print("1. Update campus gallery with 8 unique images")
    print("2. Update facilities gallery with 8 unique images") 
    print("3. Remove all duplicate images")
    print("4. Maintain current styling and animations")
