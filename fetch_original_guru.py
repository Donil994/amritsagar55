import requests
from bs4 import BeautifulSoup
import json

def fetch_original_website_content():
    """Fetch content from original website to find guru section"""
    
    base_url = "https://amritsagar.org"
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    
    try:
        print(f"🌐 Fetching: {base_url}")
        response = session.get(base_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all content sections
        content_sections = []
        
        # Look for sections with guru/founder content
        all_sections = soup.find_all(['section', 'div', 'article'])
        
        for section in all_sections:
            section_text = section.get_text().strip()
            
            # Check for guru/founder related content
            if any(keyword in section_text.lower() for keyword in ['baba', 'harihar', 'ramji', 'founder', 'guru', 'spiritual leader']):
                # Find images in this section
                images = section.find_all('img')
                section_images = []
                
                for img in images:
                    src = img.get('src', '')
                    alt = img.get('alt', '')
                    
                    if 'logo' not in src.lower() and 'favicon' not in src.lower():
                        # Convert to absolute URL
                        if src.startswith('//'):
                            src = 'https:' + src
                        elif src.startswith('/'):
                            src = base_url + src
                        
                        section_images.append({
                            'src': src,
                            'alt': alt
                        })
                
                if section_images:  # Only add sections with images
                    content_sections.append({
                        'text': section_text[:200] + '...' if len(section_text) > 200 else section_text,
                        'images': section_images,
                        'html_class': section.get('class', []),
                        'id': section.get('id', '')
                    })
        
        # Save the findings
        with open('original_guru_sections.json', 'w') as f:
            json.dump(content_sections, f, indent=2)
        
        print(f"✅ Found {len(content_sections)} sections with guru/founder content")
        
        for i, section in enumerate(content_sections):
            print(f"\n📝 Section {i+1}:")
            print(f"   Text: {section['text'][:100]}...")
            print(f"   Images: {len(section['images'])}")
            for img in section['images']:
                print(f"   - {img['src']} (alt: {img['alt']})")
        
        return content_sections
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def check_current_guru_image():
    """Check the current guru image in our website"""
    
    # Current guru image info
    current_image = {
        'file': 'images/9.jpg',
        'alt': 'Baba Harihar Ramji',
        'styling': 'border-radius: 15px; box-shadow: var(--shadow-hover);'
    }
    
    print("🔍 Current Guru Image Analysis:")
    print(f"   File: {current_image['file']}")
    print(f"   Alt Text: {current_image['alt']}")
    print(f"   Styling: {current_image['styling']}")
    
    return current_image

if __name__ == "__main__":
    print("🧘‍♂️ Analyzing Original Website Guru Section")
    print("=" * 60)
    
    # Fetch original content
    original_sections = fetch_original_website_content()
    
    # Check current image
    current = check_current_guru_image()
    
    print(f"\n🎯 Analysis Complete:")
    print(f"Original sections found: {len(original_sections)}")
    print(f"Current image: {current['file']}")
    
    if original_sections:
        print(f"\n📋 Recommendation:")
        print("Compare the images found in original sections with current image")
        print("Update if a different image should be used")
    else:
        print(f"\n⚠️ Could not fetch original content for comparison")
