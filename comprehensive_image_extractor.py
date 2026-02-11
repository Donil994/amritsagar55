#!/usr/bin/env python3
"""
Comprehensive Amrit Sagar Website Image Extractor
Extracts and downloads ALL images from the entire website including all sub-pages
"""

import requests
from bs4 import BeautifulSoup
import re
import os
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import json
from urllib.parse import urljoin

class ComprehensiveImageExtractor:
    def __init__(self):
        self.base_url = "http://amritsagar.org/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.extracted_urls = set()
        self.all_images = []
        self.output_dir = "images"
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
    
    def get_page_content(self, url):
        """Get page content with error handling"""
        try:
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            return response.text, response.url
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None, url
    
    def extract_images_from_html(self, html_content, base_url):
        """Extract all image URLs from HTML content"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        images = []
        
        # Find all img tags
        for img in soup.find_all('img'):
            src = img.get('src')
            if src:
                # Convert relative URLs to absolute
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = urljoin(base_url, src)
                elif not src.startswith(('http://', 'https://')):
                    src = urljoin(base_url, src)
                
                # Filter for relevant images
                if self.is_valid_image_url(src):
                    images.append(src)
        
        # Find background images in style attributes
        style_tags = soup.find_all(style=True)
        for tag in style_tags:
            style = tag.get('style', '')
            # Extract background-image URLs
            bg_pattern = r'background-image:\s*url\(["\']?(.*?)["\']?\)'
            matches = re.findall(bg_pattern, style, re.IGNORECASE)
            for match in matches:
                bg_url = match[1]
                if bg_url.startswith('//'):
                    bg_url = 'https:' + bg_url
                elif bg_url.startswith('/'):
                    bg_url = urljoin(base_url, bg_url)
                elif not bg_url.startswith(('http://', 'https://')):
                    bg_url = urljoin(base_url, bg_url)
                
                if self.is_valid_image_url(bg_url):
                    images.append(bg_url)
        
        return list(set(images))  # Remove duplicates
    
    def is_valid_image_url(self, url):
        """Check if URL is a valid image we want to download"""
        # Skip small icons, placeholders, and external images
        skip_patterns = [
            'icon', 'favicon', 'logo', 'avatar', 'gravatar',
            'placeholder', 'default', 'blank', 'spacer',
            'data:image', 'base64', 'svg', 'icon-',
            'wp-content/themes', 'wp-includes', 'wp-admin'
        ]
        
        url_lower = url.lower()
        return not any(pattern in url_lower for pattern in skip_patterns)
    
    def discover_all_pages(self, start_url):
        """Discover all pages on the website"""
        print("🔍 Discovering all pages...")
        
        # Start with main page
        pages = [start_url]
        
        try:
            content, actual_url = self.get_page_content(start_url)
            if content:
                soup = BeautifulSoup(content, 'html.parser')
                
                # Find all links
                for link in soup.find_all('a', href=True):
                    href = link.get('href')
                    if href:
                        # Convert to absolute URL
                        if href.startswith('//'):
                            href = 'https:' + href
                        elif href.startswith('/'):
                            href = urljoin(self.base_url, href)
                        elif not href.startswith(('http://', 'https://', 'mailto:', 'tel:')):
                            href = urljoin(self.base_url, href)
                        
                        # Only include internal pages
                        if 'amritsagar.org' in href and href not in pages:
                            pages.append(href)
                
                # Also find menu items and navigation
                nav_links = soup.find_all('nav')
                for nav in nav_links:
                    for link in nav.find_all('a', href=True):
                        href = link.get('href')
                        if href and 'amritsagar.org' in href:
                            if href.startswith('/'):
                                href = urljoin(self.base_url, href)
                            if href not in pages:
                                pages.append(href)
        
        except Exception as e:
            print(f"Error discovering pages: {e}")
        
        return list(set(pages))
    
    def download_image(self, url, filename=None):
        """Download a single image"""
        if url in self.extracted_urls:
            return
        
        try:
            print(f"⬇️ Downloading: {url}")
            response = self.session.get(url, timeout=20)
            response.raise_for_status()
            
            # Generate filename
            if not filename:
                parsed_url = urllib.parse.urlparse(url)
                path = parsed_url.path
                if path:
                    filename = os.path.basename(path)
                else:
                    filename = f"image_{len(self.all_images)}.jpg"
            
            # Add extension if missing
            if not any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                filename += '.jpg'
            
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            self.extracted_urls.add(url)
            self.all_images.append({
                'url': url,
                'filename': filename,
                'filepath': filepath,
                'size': len(response.content)
            })
            
            print(f"✅ Downloaded: {filename}")
            
        except Exception as e:
            print(f"❌ Error downloading {url}: {e}")
    
    def extract_all_images(self):
        """Main method to extract all images from the entire website"""
        print("🌐 Starting Comprehensive Image Extraction")
        print(f"📁 Output directory: {self.output_dir}")
        print("=" * 60)
        
        # Discover all pages
        pages = self.discover_all_pages(self.base_url)
        print(f"📄 Found {len(pages)} pages to analyze")
        
        # Extract images from all pages
        all_image_urls = set()
        
        for i, page_url in enumerate(pages):
            print(f"\n📄 Processing page {i+1}/{len(pages)}: {page_url}")
            
            content, actual_url = self.get_page_content(page_url)
            if content:
                images = self.extract_images_from_html(content, actual_url)
                all_image_urls.update(images)
                print(f"   Found {len(images)} images on this page")
            
            time.sleep(1)  # Be respectful to the server
        
        # Remove duplicates and filter
        unique_images = list(all_image_urls)
        valid_images = [img for img in unique_images if self.is_valid_image_url(img)]
        
        print(f"\n🖼️ Total unique images found: {len(unique_images)}")
        print(f"✅ Valid images to download: {len(valid_images)}")
        
        # Download images
        print(f"\n⬇️ Starting download of {len(valid_images)} images...")
        print("=" * 60)
        
        # Download with threading for speed
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for img_url in valid_images:
                future = executor.submit(self.download_image, img_url)
                futures.append(future)
            
            # Wait for all downloads to complete
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"Download error: {e}")
        
        print(f"\n✅ Successfully downloaded {len(self.all_images)} images")
        print(f"📁 Images saved to: {self.output_dir}/")
        
        # Save comprehensive report
        self.save_comprehensive_report(pages, valid_images)
    
    def save_comprehensive_report(self, pages, image_urls):
        """Save detailed report of extraction"""
        report = {
            'extraction_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'base_url': self.base_url,
            'total_pages_found': len(pages),
            'pages_analyzed': pages,
            'total_images_found': len(image_urls),
            'images_downloaded': len(self.all_images),
            'all_image_urls': sorted(list(image_urls)),
            'downloaded_images': self.all_images,
            'file_sizes': {img['filename']: img['size'] for img in self.all_images}
        }
        
        with open('comprehensive_image_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 Comprehensive report saved to: comprehensive_image_report.json")

def main():
    """Main execution function"""
    extractor = ComprehensiveImageExtractor()
    
    try:
        extractor.extract_all_images()
        
        print("\n" + "=" * 60)
        print("🎉 Comprehensive image extraction completed!")
        print(f"📁 Check the '{extractor.output_dir}' folder for all downloaded images")
        print("📊 Check 'comprehensive_image_report.json' for detailed analysis")
        
    except KeyboardInterrupt:
        print("\n⚠️ Extraction interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during extraction: {e}")

if __name__ == "__main__":
    main()
