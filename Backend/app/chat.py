import os
import json
import requests
import re
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
                
                # Generate URLs
                image_url = f"https://source.unsplash.com/500x500/?{image_search.replace(' ', '+')}"
                youtube_link = f"https://www.youtube.com/results?search_query={youtube_search.replace(' ', '+')}+recipe"
                
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
                
                print("✅ Structured recipe generated successfully!")
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
    
    # Specific fallback recipes for common queries
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
            ]
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
            ]
        }
    }
    
    query_lower = query.lower()
    
    # Try to find matching structured recipe
    for key, recipe in structured_recipes.items():
        if key in query_lower:
            image_url = f"https://source.unsplash.com/500x500/?{key}+food"
            youtube_link = f"https://www.youtube.com/results?search_query={key}+recipe"
            return {**recipe, "youtube_link": youtube_link, "image_url": image_url}
    
    # Generic structured fallback
    image_url = f"https://source.unsplash.com/500x500/?{query.replace(' ', '+')}+food"
    youtube_link = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}+recipe"
    
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
        "youtube_link": youtube_link,
        "image_url": image_url
    }

# Add this function that's referenced in main.py
def get_fallback_recipe(query: str) -> Dict:
    """Simple fallback function for main.py"""
    return get_structured_fallback_recipe(query)