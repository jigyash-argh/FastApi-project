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

def get_reliable_image_url(search_term: str) -> str:
    """Generate more reliable Unsplash URLs with better formatting"""
    clean_term = re.sub(r'[^\w\s]', '', search_term).strip().replace(' ', '+')
    return f"https://source.unsplash.com/featured/500x500/?{clean_term},food,recipe"

def get_better_image_search_term(query: str, recipe_title: str) -> str:
    """Generate more specific and reliable image search terms"""
    base_term = recipe_title if recipe_title else query
    clean_term = re.sub(r'\b(recipe|how to make|easy|simple|best|delicious)\b', '', base_term.lower())
    return f"{clean_term.strip()} food"

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
                    missing_keys = [key for key in required_keys if key not in recipe_data]
                    raise ValueError(f"Missing required keys: {missing_keys}")
                
                # Process the data with better error handling
                title = recipe_data.get("title", f"Delicious {query}").strip()
                prep_time = recipe_data.get("prepTime", "15-20 mins").strip()
                cook_time = recipe_data.get("cookTime", "30-45 mins").strip()
                servings = recipe_data.get("servings", "2-4 people").strip()
                
                # Ensure ingredients and instructions are proper arrays
                ingredients = recipe_data.get("ingredients", [])
                if isinstance(ingredients, str):
                    ingredients = [line.strip() for line in ingredients.replace(',', '\n').split('\n') if line.strip()]
                
                instructions = recipe_data.get("instructions", [])
                if isinstance(instructions, str):
                    instructions = [line.strip() for line in instructions.split('\n') if line.strip()]
                elif isinstance(instructions, list) and instructions:
                    instructions = [str(step).strip() for step in instructions if step]
                
                # Generate better search terms
                youtube_search = recipe_data.get("youtube_search_term", query).strip()
                image_search = recipe_data.get("image_search_term", query).strip()
                
                # Generate reliable URLs
                image_url = get_reliable_image_url(image_search)
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
                raise Exception(f"Failed to parse recipe data: {str(e)}")
                
        else:
            error_msg = f"API error: {response.status_code} - {response.text}"
            print(f"❌ {error_msg}")
            raise Exception(f"API request failed: {error_msg}")
            
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise Exception(f"Recipe generation failed: {str(e)}")


# Since your main.py expects this function, but you don't want fallbacks,
# this function will now just throw an exception instead of providing fallback
def get_structured_fallback_recipe(query: str) -> Dict:
    """
    This function is kept for compatibility but now throws an exception
    since you don't want fallback responses
    """
    raise Exception("Fallback recipes are disabled. Recipe generation failed for: " + query)


# Keep this function for main.py compatibility
def get_fallback_recipe(query: str) -> Dict:
    """Simple fallback function for main.py - now throws exception"""
    raise Exception("Fallback recipes are disabled")