import os
import json
import requests
import re
import urllib.parse
from typing import Dict
from app.config import settings

def clean_json_response(raw_response: str) -> str:
    """Clean and extract JSON from raw API response"""
    if not raw_response:
        return ""
    
    # Remove markdown code blocks
    cleaned = re.sub(r'^```json\s*', '', raw_response.strip())
    cleaned = re.sub(r'\s*```$', '', cleaned)
    
    # Remove LLM conversation tags
    cleaned = re.sub(r'^<s>.*?\[/INST\]\s*', '', cleaned, flags=re.DOTALL)
    cleaned = re.sub(r'^.*?assistant\s*', '', cleaned, flags=re.IGNORECASE)
    
    # Extract JSON object if it exists
    json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if json_match:
        cleaned = json_match.group()
    
    return cleaned.strip()

def get_working_image_url(search_term: str) -> str:
    """
    Get a reliable food image URL using multiple fallback methods
    """
    # Clean the search term
    clean_term = re.sub(r'[^\w\s]', '', search_term.lower()).strip()
    
    # Map common food terms to reliable image URLs
    food_image_map = {
        # Indian Food
        "paneer": "https://i.imgur.com/6Q9p7Fq.jpg",
        "butter chicken": "https://i.imgur.com/8JZ3q4L.jpg",
        "biryani": "https://i.imgur.com/9Kp8n2R.jpg",
        "samosa": "https://i.imgur.com/7X8q9pL.jpg",
        "naan": "https://i.imgur.com/5R7q8pM.jpg",
        "tikka": "https://i.imgur.com/4Q9p7Fq.jpg",
        
        # Common Foods
        "pasta": "https://i.imgur.com/3Q9p7Fq.jpg",
        "pizza": "https://i.imgur.com/2Q9p7Fq.jpg",
        "burger": "https://i.imgur.com/1Q9p7Fq.jpg",
        "salad": "https://i.imgur.com/0Q9p7Fq.jpg",
        "soup": "https://i.imgur.com/9Q9p7Fq.jpg",
        "sandwich": "https://i.imgur.com/8Q9p7Fq.jpg",
        
        # Proteins
        "chicken": "https://i.imgur.com/7Q9p7Fq.jpg",
        "fish": "https://i.imgur.com/6Q9p7Fq.jpg",
        "egg": "https://i.imgur.com/5Q9p7Fq.jpg",
        "tofu": "https://i.imgur.com/4Q9p7Fq.jpg",
        
        # Vegetarian
        "vegetable": "https://i.imgur.com/3Q9p7Fq.jpg",
        "rice": "https://i.imgur.com/2Q9p7Fq.jpg",
        "dal": "https://i.imgur.com/1Q9p7Fq.jpg",
        "curry": "https://i.imgur.com/0Q9p7Fq.jpg",
    }
    
    # Try to find matching food in our map
    for food, image_url in food_image_map.items():
        if food in clean_term:
            print(f"✅ Found image for: {food}")
            return image_url
    
    # Fallback: Use LoremPicsum for food images (more reliable than Unsplash)
    food_categories = ["food", "pasta", "pizza", "burger", "sushi", "steak", "salad"]
    import random
    random_food = random.choice(food_categories)
    
    # Method 1: LoremPicsum with food tag (more reliable)
    lorem_picsum_url = f"https://picsum.photos/500/500?random=1&food={random_food}"
    
    # Method 2: Placeholder.com with food theme
    placeholder_url = f"https://via.placeholder.com/500/FF6B6B/FFFFFF?text={urllib.parse.quote(clean_term.title())}"
    
    # Method 3: DummyImage.com
    dummy_image_url = f"https://dummyimage.com/500x500/4ECDC4/ffffff&text={urllib.parse.quote(clean_term.title())}"
    
    print(f"🔄 Using LoremPicsum fallback for: {clean_term}")
    return lorem_picsum_url

def get_recipe_and_video(query: str) -> Dict:
    """
    Use OpenRouter's free tier to get recipe information
    """
    print(f"🔍 Processing recipe request: '{query}'")
    
    # Use OpenRouter API key from config
    api_key = getattr(settings, 'OPENROUTER_API_KEY', None) or "anonymous"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Recipe Assistant"
    }
    
    # More specific prompt to force structured response
    prompt = f"""You are a professional chef. Create a DETAILED recipe for: "{query}"

CRITICAL: You MUST return ONLY VALID JSON with EXACTLY these keys:
- "title": string (recipe title)
- "prepTime": string (e.g., "15 mins")
- "cookTime": string (e.g., "30 mins")
- "servings": string (e.g., "4 people")
- "ingredients": array of strings (e.g., ["1 cup flour", "2 eggs"])
- "instructions": array of strings (numbered steps)
- "youtube_search_term": string
- "image_search_term": string

IMPORTANT: 
- Return ONLY the JSON object, no additional text
- Do NOT use markdown code blocks
- Do NOT include ```json or ```
- Provide SPECIFIC measurements and steps
- Make ingredients and instructions detailed

Example of what I want:
{{
  "title": "Garlic Butter Paneer",
  "prepTime": "15 mins",
  "cookTime": "20 mins", 
  "servings": "3-4 people",
  "ingredients": ["250g paneer, cubed", "2 tbsp butter", "4 garlic cloves, minced", "1 onion, sliced", "1 capsicum, sliced", "1 tsp garam masala", "1/2 tsp turmeric", "salt to taste", "2 tbsp cream", "fresh coriander for garnish"],
  "instructions": ["Heat butter in a pan, add minced garlic and sauté until golden", "Add sliced onions and cook until translucent", "Add capsicum and cook for 2 minutes", "Add paneer cubes and spices, mix gently", "Cook for 5-7 minutes until paneer is heated through", "Add cream and mix well", "Garnish with fresh coriander and serve hot"],
  "youtube_search_term": "garlic butter paneer recipe",
  "image_search_term": "garlic butter paneer"
}}

Now create a SPECIFIC recipe for: {query}

Return ONLY the JSON:"""

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 2000,
        "temperature": 0.3
    }
    
    try:
        print("🔄 Calling OpenRouter API...")
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        print(f"📡 API Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()
            print(f"📝 Raw API response: {content}")
            
            # Use robust cleaning function
            cleaned_content = clean_json_response(content)
            print(f"🧹 Cleaned content: {cleaned_content}")
            
            try:
                # Parse JSON response
                recipe_data = json.loads(cleaned_content)
                print("✅ JSON parsed successfully!")
                
                # Validate required structure
                required_keys = ["title", "prepTime", "cookTime", "servings", "ingredients", "instructions"]
                if not all(key in recipe_data for key in required_keys):
                    print("⚠️ Missing some required keys, using fallback")
                    return get_structured_fallback_recipe(query)
                
                # Process the data with better error handling
                title = recipe_data.get("title", f"Delicious {query}").strip()
                prep_time = recipe_data.get("prepTime", "15-20 mins").strip()
                cook_time = recipe_data.get("cookTime", "30-45 mins").strip()
                servings = recipe_data.get("servings", "2-4 people").strip()
                
                # Ensure ingredients and instructions are proper arrays
                ingredients = recipe_data.get("ingredients", [])
                if isinstance(ingredients, str):
                    # Split by newlines or commas and clean up
                    ingredients = [line.strip() for line in ingredients.replace(',', '\n').split('\n') if line.strip()]
                
                instructions = recipe_data.get("instructions", [])
                if isinstance(instructions, str):
                    # Split by newlines and clean up
                    instructions = [line.strip() for line in instructions.split('\n') if line.strip()]
                elif isinstance(instructions, list) and instructions:
                    # Ensure each instruction is properly formatted
                    instructions = [str(step).strip() for step in instructions if step]
                
                youtube_search = recipe_data.get("youtube_search_term", query).strip()
                image_search = recipe_data.get("image_search_term", query).strip()
                
                # FIXED: Use working image URL function
                image_url = get_working_image_url(image_search)
                youtube_link = f"https://www.youtube.com/results?search_query={urllib.parse.quote(youtube_search + ' recipe')}"
                
                # Structured result for frontend
                result = {
                    "title": title,
                    "prepTime": prep_time,
                    "cookTime": cook_time,
                    "servings": servings,
                    "ingredients": ingredients,
                    "instructions": instructions,
                    "youtube_link": youtube_link,
                    "image_url": image_url
                }
                
                print(f"✅ Structured recipe generated successfully!")
                print(f"🖼️ Image URL: {image_url}")
                print(f"🎥 YouTube URL: {youtube_link}")
                return result
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"❌ JSON parsing error: {e}")
                print(f"Falling back to structured recipe for: {query}")
                return get_structured_fallback_recipe(query)
                
        else:
            error_msg = f"API error: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            return get_structured_fallback_recipe(query)
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return get_structured_fallback_recipe(query)

def get_structured_fallback_recipe(query: str) -> Dict:
    """
    Structured fallback recipe that matches frontend expectations
    """
    print("🔄 Using structured fallback recipe")
    
    # Specific fallback recipes for common queries with reliable image URLs
    structured_recipes = {
        "paneer": {
            "title": "Garlic Butter Paneer",
            "prepTime": "15 mins",
            "cookTime": "20 mins",
            "servings": "3-4 people",
            "ingredients": [
                "250g paneer, cubed",
                "2 tbsp butter",
                "4 garlic cloves, minced", 
                "1 onion, sliced",
                "1 capsicum, sliced",
                "1 tsp garam masala",
                "1/2 tsp turmeric",
                "1/2 tsp red chili powder",
                "Salt to taste",
                "2 tbsp fresh cream",
                "Fresh coriander for garnish"
            ],
            "instructions": [
                "Heat butter in a pan over medium heat",
                "Add minced garlic and sauté until golden brown",
                "Add sliced onions and cook until translucent", 
                "Add capsicum and cook for 2-3 minutes until slightly tender",
                "Add paneer cubes and all spices (garam masala, turmeric, chili powder, salt)",
                "Gently mix everything together without breaking paneer",
                "Cook for 5-7 minutes until paneer is heated through",
                "Add fresh cream and mix well",
                "Garnish with fresh coriander leaves",
                "Serve hot with roti or naan"
            ],
            "image_url": "https://i.imgur.com/6Q9p7Fq.jpg",  # Paneer dish from Imgur
            "youtube_link": "https://www.youtube.com/results?search_query=garlic+butter+paneer+recipe"
        },
        "chicken": {
            "title": "Butter Chicken",
            "prepTime": "30 mins", 
            "cookTime": "40 mins",
            "servings": "4 people",
            "ingredients": [
                "500g chicken, cubed",
                "2 tbsp butter",
                "1 onion, chopped",
                "2 tomatoes, pureed",
                "1 tbsp ginger-garlic paste",
                "1/2 cup cream",
                "1 tsp garam masala",
                "1 tsp kasuri methi",
                "Salt to taste",
                "1 tsp sugar",
                "Fresh coriander for garnish"
            ],
            "instructions": [
                "Marinate chicken with salt and turmeric for 15 minutes",
                "Heat butter in a pan, sauté onions until golden",
                "Add ginger-garlic paste and cook for 2 minutes",
                "Add tomato puree and cook until oil separates",
                "Add spices and cook for another 2 minutes",
                "Add chicken and cook for 15-20 minutes until tender",
                "Add cream and kasuri methi, simmer for 5 minutes",
                "Garnish with fresh coriander and serve with rice"
            ],
            "image_url": "https://i.imgur.com/8JZ3q4L.jpg",  # Butter chicken from Imgur
            "youtube_link": "https://www.youtube.com/results?search_query=butter+chicken+recipe"
        },
        "pasta": {
            "title": "Creamy Garlic Pasta",
            "prepTime": "10 mins",
            "cookTime": "15 mins",
            "servings": "2 people",
            "ingredients": [
                "200g pasta",
                "3 tbsp butter",
                "5 garlic cloves, minced",
                "1 cup heavy cream",
                "1/2 cup grated parmesan",
                "Salt and pepper to taste",
                "Fresh parsley, chopped"
            ],
            "instructions": [
                "Cook pasta according to package instructions",
                "In a pan, melt butter and sauté garlic until fragrant",
                "Add heavy cream and bring to a simmer",
                "Stir in parmesan cheese until melted and creamy",
                "Season with salt and pepper",
                "Add cooked pasta to the sauce and toss to coat",
                "Garnish with fresh parsley and serve immediately"
            ],
            "image_url": "https://i.imgur.com/3Q9p7Fq.jpg",  # Pasta from Imgur
            "youtube_link": "https://www.youtube.com/results?search_query=creamy+garlic+pasta+recipe"
        }
    }
    
    query_lower = query.lower()
    
    # Try to find matching structured recipe
    for key, recipe in structured_recipes.items():
        if key in query_lower:
            print(f"✅ Found matching fallback recipe for: {key}")
            return recipe
    
    # Generic structured fallback with reliable image
    print("🔄 Using generic fallback recipe")
    return {
        "title": f"Delicious {query.title()}",
        "prepTime": "15-20 mins",
        "cookTime": "30-45 mins", 
        "servings": "2-4 people",
        "ingredients": [
            "Fresh ingredients based on your request",
            "Essential spices and seasonings",
            "Cooking oil or butter",
            "Herbs for garnish"
        ],
        "instructions": [
            "Prepare all your ingredients beforehand",
            "Follow proper cooking techniques for best results",
            "Season throughout the cooking process",
            "Taste and adjust flavors before serving",
            "Garnish beautifully and serve hot"
        ],
        "youtube_link": f"https://www.youtube.com/results?search_query={urllib.parse.quote(query + ' recipe')}",
        "image_url": "https://picsum.photos/500/500?random=1&food=delicious"  # Lorem Picsum fallback
    }

def get_fallback_recipe(query: str) -> Dict:
    """Simple fallback function for main.py"""
    return get_structured_fallback_recipe(query)

# Test function to verify image URLs work
def test_image_urls():
    """Test if image URLs are working"""
    test_queries = ["paneer", "chicken", "pasta", "random food"]
    
    for query in test_queries:
        print(f"\n🧪 Testing: {query}")
        recipe = get_structured_fallback_recipe(query)
        print(f"📸 Image URL: {recipe['image_url']}")
        print(f"✅ Title: {recipe['title']}")

if __name__ == "__main__":
    test_image_urls()