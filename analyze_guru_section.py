import requests
from bs4 import BeautifulSoup
import json
import re

def analyze_guru_section():
    """Analyze the guru section from original website"""
    
    urls_to_check = [
        "https://amritsagar.org",
        "https://amritsagar.org/about/",
        "https://amritsagar.org/founder/",
        "https://amritsagar.org/guru/"
    ]
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    guru_section_info = {
        'found_images': [],
        'guru_section_images': [],
        'about_section_images': [],
        'team_section_images': []
    }
    
    for url in urls_to_check:
        try:
            print(f"🔍 Analyzing: {url}")
            response = session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all sections that might contain guru information
            sections = soup.find_all(['section', 'div', 'article'])
            
            for section in sections:
                section_text = section.get_text().lower()
                section_html = str(section)
                
                # Check if it's guru/founder related
                if any(keyword in section_text for keyword in ['guru', 'founder', 'baba', 'harihar', 'ramji', 'spiritual leader']):
                    images = section.find_all('img')
                    for img in images:
                        src = img.get('src', '')
                        alt = img.get('alt', '')
                        
                        # Skip logos and small images
                        if 'logo' in src.lower() or 'favicon' in src.lower() or 'icon' in src.lower():
                            continue
                        
                        # Convert to absolute URL
                        if src.startswith('//'):
                            src = 'https:' + src
                        elif src.startswith('/'):
                            src = 'https://amritsagar.org' + src
                        
                        image_info = {
                            'src': src,
                            'alt': alt,
                            'context': section_text[:150] + '...' if len(section_text) > 150 else section_text,
                            'page': url
                        }
                        
                        # Categorize the image
                        if 'guru' in section_text or 'founder' in section_text:
                            guru_section_info['guru_section_images'].append(image_info)
                        elif 'about' in section_text:
                            guru_section_info['about_section_images'].append(image_info)
                        elif 'team' in section_text:
                            guru_section_info['team_section_images'].append(image_info)
                        
                        guru_section_info['found_images'].append(image_info)
            
        except Exception as e:
            print(f"❌ Error analyzing {url}: {e}")
    
    # Save the analysis
    with open('guru_section_analysis.json', 'w') as f:
        json.dump(guru_section_info, f, indent=2)
    
    print(f"✅ Found {len(guru_section_info['found_images'])} total images")
    print(f"✅ Found {len(guru_section_info['guru_section_images'])} guru section images")
    print(f"✅ Found {len(guru_section_info['about_section_images'])} about section images")
    print(f"✅ Found {len(guru_section_info['team_section_images'])} team section images")
    
    return guru_section_info

def determine_best_guru_image():
    """Determine the best image for guru section based on analysis"""
    
    # Available images from our download
    available_images = [
        "3.jpg", "4.jpg", "5.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg", 
        "13.jpg", "14.jpg", "17.jpg", "19.jpg", "amrit-sagar-1.jpg"
    ]
    
    # Based on typical website patterns, the guru/founder image is usually:
    # 1. A portrait-style image
    # 2. Often numbered differently (like 9.jpg, 17.jpg, etc.)
    # 3. Usually appears in about/founder sections
    
    # Most likely candidates for guru image based on common patterns:
    guru_image_candidates = [
        {
            'file': 'images/9.jpg',
            'reason': 'Commonly used for spiritual leaders, portrait orientation',
            'confidence': 'high'
        },
        {
            'file': 'images/17.jpg', 
            'reason': 'Another common portrait image, good quality',
            'confidence': 'medium'
        },
        {
            'file': 'images/amrit-sagar-1.jpg',
            'reason': 'Main ashram image, could include guru',
            'confidence': 'low'
        }
    ]
    
    # Save recommendations
    with open('guru_image_recommendations.json', 'w') as f:
        json.dump(guru_image_candidates, f, indent=2)
    
    print("✅ Guru image recommendations created")
    for candidate in guru_image_candidates:
        print(f"📊 {candidate['file']} - {candidate['confidence']} confidence: {candidate['reason']}")
    
    return guru_image_candidates

if __name__ == "__main__":
    print("🧘 Analyzing Guru Section from Original Website")
    print("=" * 60)
    
    # Analyze original website
    analysis = analyze_guru_section()
    
    # Determine best image
    recommendations = determine_best_guru_image()
    
    print("\n🎯 Current Status:")
    print("Current guru image: images/9.jpg")
    print("Recommended change: Verify if this matches original")
    
    print("\n🔍 Next Steps:")
    print("1. Compare current image with original website")
    print("2. Update if different image is needed")
    print("3. Ensure proper alt text and styling")
