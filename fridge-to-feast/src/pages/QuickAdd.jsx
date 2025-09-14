import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, UtensilsCrossed, ChefHat, Salad, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti'; // We'll add this for a fun effect!

// A list of common ingredients for the demo
const availableIngredients = [
  'Chicken', 'Rice', 'Eggs', 'Cheese', 'Onion', 'Tomato', 'Garlic', 'Bell Pepper',
  'Broccoli', 'Carrot', 'Potatoes', 'Pasta', 'Milk', 'Butter', 'Salt', 'Pepper'
];

const QuickAdd = () => {
  // --- STATE: The component's memory ---
  const [selectedIngredients, setSelectedIngredients] = useState(['Chicken', 'Rice', 'Cheese']);
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ref for the recipe card to scroll to it
  const recipeRef = useRef(null);

  // --- FUNCTIONS: Things the component can do ---

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
    // Enhanced prompt for a more creative and easy-to-understand recipe
    const prompt = `You are a highly creative and encouraging AI chef specializing in simple, delicious meals for busy individuals. Create an easy-to-follow recipe using ONLY these ingredients: ${ingredientsString}. Focus on minimal steps and clear language. Provide a fun, catchy title. Ensure all listed ingredients are used. Provide the output in the specified JSON format.`;

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
        const recipeJsonText = result.candidates[0].content.parts[0].text;
        setRecipe(JSON.parse(recipeJsonText));
        // --- FEATURE: Confetti burst on success! ---
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        // Scroll to the recipe after it's generated
        setTimeout(() => {
          recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        throw new Error("No recipe was generated. Please try again.");
      }

    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("Oops! Couldn't cook up a recipe. Please try different ingredients or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX: What is shown on the screen ---
  return (
    <section className="bg-gradient-to-br from-orange-50 to-red-50 py-24 sm:py-32 overflow-hidden relative">
      <div className="container mx-auto max-w-5xl px-6 text-center">
        {/* --- Titles with animation --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Your Ingredients, Our AI Chef.
            <br />
            <span className="text-orange-600">Delicious Meals.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
            Select what you have, and let our AI create a personalized, easy-to-follow recipe just for you!
          </p>
        </motion.div>

        {/* --- Ingredient Selection with animation --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-wrap justify-center gap-3 p-4 bg-white rounded-xl shadow-lg border border-gray-100"
        >
          {availableIngredients.map((ingredient) => (
            <motion.button
              key={ingredient}
              onClick={() => handleToggleIngredient(ingredient)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 text-base font-semibold rounded-full transition-all duration-300 border-2 flex items-center gap-2 ${
                selectedIngredients.includes(ingredient)
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              {selectedIngredients.includes(ingredient) && <Salad size={18} />} {/* Icon for selected */}
              {ingredient}
            </motion.button>
          ))}
        </motion.div>

        {/* --- Generate Button with animation --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10"
        >
          <button
            onClick={handleGenerateDemo}
            disabled={isLoading || selectedIngredients.length === 0}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-red-500 text-white font-bold py-4 px-10 rounded-full hover:from-orange-700 hover:to-red-600 transition-all duration-300 shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed mx-auto transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-6 w-6" />
                <span>Whipping up magic...</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>Generate My Recipe!</span>
              </>
            )}
          </button>
        </motion.div>

        {/* --- Recipe Display Area with enhanced animations and states --- */}
        <div className="mt-16 min-h-[300px]" ref={recipeRef}>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-gray-500 h-full"
              >
                <Loader className="animate-spin h-12 w-12 text-orange-500" />
                <p className="mt-4 text-xl font-medium">Our AI chef is dreaming up deliciousness...</p>
                <p className="text-sm text-gray-400">This might take a few seconds.</p>
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center text-red-600 h-full bg-red-50 p-6 rounded-xl border border-red-200"
              >
                <XCircle className="h-12 w-12 mb-4" />
                <p className="text-xl font-semibold">{error}</p>
                <p className="text-md text-red-500 mt-2">Please check your ingredients or try again.</p>
              </motion.div>
            )}

            {recipe && !isLoading && !error && (
              <motion.div
                key="recipe"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-left max-w-3xl mx-auto transform hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-4 border-b pb-4 mb-6 border-gray-100">
                  <ChefHat className="h-10 w-10 text-orange-500 flex-shrink-0" />
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                    {recipe.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 mt-6 text-sm text-gray-600 border-b pb-6 mb-6 border-gray-100">
                  <p className="flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-orange-400" />
                    <strong>Prep:</strong> {recipe.prepTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-orange-400" />
                    <strong>Cook:</strong> {recipe.cookTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-orange-400" />
                    <strong>Servings:</strong> {recipe.servings}
                  </p>
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-4 text-gray-700 text-lg">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="leading-relaxed">
                      <span className="font-medium text-gray-800">{step}</span>
                    </li>
                  ))}
                </ol>
                {/* --- Call to Action after recipe --- */}
                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                  <p className="text-gray-600 text-md">
                    Enjoy your AI-generated meal! Want another idea?
                  </p>
                  <button
                    onClick={() => {
                      setRecipe(null); // Clear recipe to show initial state
                      recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="mt-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-500 text-white font-bold py-3 px-8 rounded-full hover:from-purple-700 hover:to-indigo-600 transition-all duration-300 shadow-md transform hover:scale-105"
                  >
                    <Sparkles size={20} /> Generate Another
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- Initial Call to Action (when no recipe, no loading, no error) --- */}
            {!recipe && !isLoading && !error && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-8 rounded-xl border border-gray-100 shadow-sm h-full"
              >
                <ChefHat className="h-16 w-16 text-orange-400 mb-4" />
                <p className="text-xl font-semibold text-gray-800">Ready to cook something new?</p>
                <p className="mt-2 text-md text-gray-600 max-w-sm">
                  Pick your ingredients above and let our AI create a unique recipe for you!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default QuickAdd;