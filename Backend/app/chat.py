import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import json

def get_recipe_and_video(query):
    llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.environ.get("GEMINI_API_KEY"))

    prompt_template = """
    You are a culinary assistant. Based on the user's query, provide a recipe, a YouTube link for a video of the recipe, and a search term for an image of the dish.
    The user's query is: {query}

    Please provide the output in a JSON format with the following keys: "recipe", "youtube_link", "image_search_term".
    The "recipe" should be a string containing the ingredients and instructions.
    The "youtube_link" should be a URL to a YouTube video.
    The "image_search_term" should be a simple string to search for an image of the dish.
    """
    

    prompt = PromptTemplate(
        input_variables=["query"],
        template=prompt_template,
    )

    chain = LLMChain(llm=llm, prompt=prompt)
    response = chain.run(query)

    try:
        # The response should be a JSON string, so we parse it.
        data = json.loads(response)
        recipe = data.get("recipe")
        youtube_link = data.get("youtube_link")
        image_search_term = data.get("image_search_term")

        # Placeholder for image generation. We will implement this later.
        image_url = f"https://source.unsplash.com/500x500/?{image_search_term.replace(' ', '+')}"

        return {
            "recipe": recipe,
            "youtube_link": youtube_link,
            "image_url": image_url
        }
    except json.JSONDecodeError:
        # Fallback in case the response is not a valid JSON
        return {
            "recipe": "Could not generate a recipe for your query. Please try again.",
            "youtube_link": None,
            "image_url": None
        }
