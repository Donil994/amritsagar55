import requests
import os
from urllib.parse import urlparse

# List of image URLs from the main website
image_urls = [
    "https://amritsagar.org/wp-content/uploads/2023/06/4.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/3.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/13.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/19.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/17.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/8.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/13.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/11.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/14.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/10.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/19.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/11.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/5.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/9.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/14.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/5.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/12.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/17.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/8.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/10.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/12.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/3.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/4.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/amrit-sagar-1.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/8-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/5-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/11-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/14-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/3-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/10-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/17-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/13-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/19-600x400_c.jpg",
    "https://amritsagar.org/wp-content/uploads/2023/06/12-600x400_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/17-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/8-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/10-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/5-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/14-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/19-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/3-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/13-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/11-75x50_c.jpg",
    "https://stayontheganges.com/wp-content/uploads/2023/06/12-75x50_c.jpg"
]

def download_image(url, filename):
    """Download an image from URL"""
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def main():
    """Main function to download all images"""
    print("🌐 Downloading Original Images from Main Website")
    print("=" * 60)
    
    # Create original_images directory
    os.makedirs("original_images", exist_ok=True)
    
    downloaded_files = []
    
    for i, url in enumerate(image_urls, 1):
        # Extract filename from URL
        parsed_url = urlparse(url)
        path = parsed_url.path
        filename = os.path.basename(path)
        
        # Create unique filename to avoid conflicts
        if filename in downloaded_files:
            base, ext = os.path.splitext(filename)
            filename = f"{base}_{i}{ext}"
        
        filepath = os.path.join("original_images", filename)
        
        print(f"[{i}/{len(image_urls)}] Downloading: {filename}")
        if download_image(url, filepath):
            downloaded_files.append(filename)
    
    print(f"\n✅ Successfully downloaded {len(downloaded_files)} images")
    print(f"📁 Images saved to: original_images/")
    
    # Save the list of downloaded files
    with open("downloaded_images_list.txt", "w") as f:
        for filename in downloaded_files:
            f.write(f"{filename}\n")
    
    print("📋 Downloaded images list saved to: downloaded_images_list.txt")

if __name__ == "__main__":
    main()
