#!/usr/bin/env python3
"""
Amrit Sagar Website Image Extractor
Extracts and downloads all images from http://amritsagar.org/
"""

import requests
from bs4 import BeautifulSoup
import re
import os
import urllib.parse
from urllib.parse import urljoin, urlparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import json

class AmritSagarImageExtractor:
    def __init__(self):
        self.base_url = "http://amritsagar.org/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.128 Safari/537.36'
        })
        self.extracted_urls = set()
        self.downloaded_images = []
        self.output_dir = "images"
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
    
    def get_page_content(self, url):
        """Get page content with error handling"""
        try:
            response = self.session.get(url, timeout=10)
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
        
        return list(set(images))  # Remove duplicates
    
    def extract_background_images(self, html_content, base_url):
        """Extract background images from inline styles"""
        if not html_content:
            return []
        
        background_images = []
        
        # Find background-image in style attributes
        pattern = r'background-image:\s*url\(["\']?(.*?)["\']?\)'
        matches = re.findall(pattern, html_content, re.IGNORECASE)
        
        for match in matches:
            img_url = match[1]
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            elif img_url.startswith('/'):
                img_url = urljoin(base_url, img_url)
            elif not img_url.startswith(('http://', 'https://')):
                img_url = urljoin(base_url, img_url)
            
            if self.is_valid_image_url(img_url):
                background_images.append(img_url)
        
        return background_images
    
    def is_valid_image_url(self, url):
        """Check if URL is a valid image we want to download"""
        # Skip small icons, placeholders, and external images
        skip_patterns = [
            'icon', 'favicon', 'logo', 'avatar', 'gravatar',
            'placeholder', 'default', 'blank', 'spacer',
            'data:image', 'base64', 'svg', 'icon-'
        ]
        
        url_lower = url.lower()
        return not any(pattern in url_lower for pattern in skip_patterns)
    
    def discover_pages(self, start_url):
        """Discover all pages on the website"""
        print("Discovering pages...")
        pages = [start_url]
        
        try:
            content, _ = self.get_page_content(start_url)
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
                        if 'amritsagar.org' in href:
                            pages.append(href)
                
                # Also find menu items and navigation
                nav_links = soup.find_all('nav')
                for nav in nav_links:
                    for link in nav.find_all('a', href=True):
                        href = link.get('href')
                        if href and 'amritsagar.org' in href:
                            if href.startswith('/'):
                                href = urljoin(self.base_url, href)
                            pages.append(href)
        
        except Exception as e:
            print(f"Error discovering pages: {e}")
        
        return list(set(pages))
    
    def download_image(self, url, filename=None):
        """Download a single image"""
        if url in self.downloaded_images:
            return
        
        try:
            print(f"Downloading: {url}")
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            # Generate filename
            if not filename:
                parsed_url = urlparse(url)
                path = parsed_url.path
                if path:
                    filename = os.path.basename(path)
                else:
                    filename = f"image_{len(self.downloaded_images)}.jpg"
            
            # Add extension if missing
            if not any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                filename += '.jpg'
            
            filepath = os.path.join(self.output_dir, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            self.downloaded_images.append(url)
            print(f"✅ Downloaded: {filename}")
            
        except Exception as e:
            print(f"❌ Error downloading {url}: {e}")
    
    def extract_all_images(self):
        """Main method to extract all images from the website"""
        print("🔍 Starting Amrit Sagar Image Extraction")
        print(f"📁 Output directory: {self.output_dir}")
        print("=" * 60)
        
        # Start with main page
        main_url = self.base_url
        print(f"🌐 Analyzing main page: {main_url}")
        
        content, actual_url = self.get_page_content(main_url)
        if not content:
            print("❌ Failed to load main page")
            return
        
        # Discover all pages
        pages = self.discover_pages(main_url)
        print(f"📄 Found {len(pages)} pages to analyze")
        
        # Extract images from all pages
        all_images = []
        
        for i, page_url in enumerate(pages):
            print(f"\n📄 Processing page {i+1}/{len(pages)}: {page_url}")
            
            content, actual_url = self.get_page_content(page_url)
            if content:
                # Extract regular images
                images = self.extract_images_from_html(content, actual_url)
                all_images.extend(images)
                
                # Extract background images
                bg_images = self.extract_background_images(content, actual_url)
                all_images.extend(bg_images)
                
                print(f"   Found {len(images)} images on this page")
            
            time.sleep(1)  # Be respectful to the server
        
        # Remove duplicates and filter
        unique_images = list(set(all_images))
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
        
        print(f"\n✅ Successfully downloaded {len(self.downloaded_images)} images")
        print(f"📁 Images saved to: {self.output_dir}/")
        
        # Save report
        self.save_report(valid_images)
    
    def save_report(self, image_urls):
        """Save extraction report"""
        report = {
            'extraction_date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'total_images_found': len(image_urls),
            'images_downloaded': len(self.downloaded_images),
            'image_urls': image_urls,
            'downloaded_files': [f for f in os.listdir(self.output_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp'))]
        }
        
        with open('image_extraction_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📊 Report saved to: image_extraction_report.json")

def main():
    """Main execution function"""
    extractor = AmritSagarImageExtractor()
    
    try:
        extractor.extract_all_images()
        
        print("\n" + "=" * 60)
        print("🎉 Image extraction completed!")
        print(f"📁 Check the '{extractor.output_dir}' folder for all downloaded images")
        print("📊 Check 'image_extraction_report.json' for detailed report")
        
    except KeyboardInterrupt:
        print("\n⚠️ Extraction interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during extraction: {e}")

if __name__ == "__main__":
    main()
