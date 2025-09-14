import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, UtensilsCrossed } from 'lucide-react';

// A list of common ingredients for the demo
const availableIngredients = [
  'Chicken', 'Rice', 'Eggs', 'Cheese', 'Onion', 'Tomato', 'Garlic', 'Bell Pepper'
];

const QuickAdd = () => {
  const [selectedIngredients, setSelectedIngredients] = useState(['Chicken', 'Rice', 'Cheese']);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleIngredient = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleGenerateDemo = async () => {
    setIsLoading(true);
    setRecipe(null);
    setError('');

    const ingredientsString = selectedIngredients.join(', ');
    const prompt = `You are a creative chef specializing in simple, delicious meals for bachelors. Create an easy-to-follow recipe using ONLY these ingredients: ${ingredientsString}. Provide the output in the specified JSON format.`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            prepTime: { type: "STRING" },
            cookTime: { type: "STRING" },
            servings: { type: "STRING" },
            instructions: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          },
          required: ["title", "prepTime", "cookTime", "servings", "instructions"]
        }
      }
    };

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0) {
        const recipeJson = result.candidates[0].content.parts[0].text;
        setRecipe(JSON.parse(recipeJson));
      } else {
        throw new Error("No recipe was generated. Please try again.");
      }

    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("Sorry, something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            See It in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Click a few ingredients you have on hand and see the kind of magic our AI can whip up for you.
          </p>
        </motion.div>

        {/* Ingredient Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          {availableIngredients.map((ingredient) => (
            <button
              key={ingredient}
              onClick={() => handleToggleIngredient(ingredient)}
              className={`px-5 py-2 text-base font-semibold rounded-full transition-all duration-300 border-2 ${
                selectedIngredients.includes(ingredient)
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
              }`}
            >
              {ingredient}
            </button>
          ))}
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <button
            onClick={handleGenerateDemo}
            disabled={isLoading || selectedIngredients.length === 0}
            className="flex items-center justify-center gap-3 bg-gray-900 text-white font-bold py-4 px-10 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
          >
            <Sparkles size={22} />
            {isLoading ? 'Thinking...' : 'Generate a Demo Recipe'}
          </button>
        </motion.div>

        {/* Recipe Display Area */}
        <div className="mt-16 min-h-[300px]">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center text-gray-500"
              >
                <Loader className="animate-spin h-12 w-12" />
                <p className="mt-4 text-lg font-medium">Our AI chef is at work...</p>
              </motion.div>
            )}
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 font-semibold"
              >
                {error}
              </motion.p>
            )}
            {recipe && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-left max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="h-8 w-8 text-orange-500" />
                  <h3 className="text-3xl font-bold text-gray-900">{recipe.title}</h3>
                </div>
                <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
                  <p><strong>Prep:</strong> {recipe.prepTime}</p>
                  <p><strong>Cook:</strong> {recipe.cookTime}</p>
                  <p><strong>Servings:</strong> {recipe.servings}</p>
                </div>
                <hr className="my-6" />
                <ol className="list-decimal list-inside space-y-3 text-gray-700 text-lg">
                  {recipe.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default QuickAdd;
