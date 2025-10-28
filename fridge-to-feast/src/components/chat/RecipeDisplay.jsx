import React from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Clock, Flame, Users, ChefHat, Zap } from 'lucide-react';
import RecipeActions from './RecipeActions';

const RecipeDisplay = ({ recipe, youtube_link, image_url }) => {
  let parsedRecipe = recipe;
  
  if (typeof recipe === 'string') {
    try {
      parsedRecipe = JSON.parse(recipe);
    } catch (error) {
      parsedRecipe = recipe;
    }
  }

  const isStructuredRecipe = parsedRecipe && typeof parsedRecipe === 'object' && parsedRecipe.title;

  if (!isStructuredRecipe) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 font-display">Your Recipe</h3>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed break-words">
            {typeof parsedRecipe === 'string' ? parsedRecipe : 'Recipe details not available'}
          </pre>
        </div>
        {image_url && (
          <motion.img 
            src={image_url} 
            alt="Recipe" 
            className="mt-4 rounded-2xl shadow-lg max-w-full h-auto border border-gray-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          />
        )}
        {youtube_link && (
          <motion.a 
            href={youtube_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 mt-4 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            Watch Cooking Tutorial
          </motion.a>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Recipe Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg shadow-lg">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-display bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {parsedRecipe.title}
            </h3>
            {parsedRecipe.description && (
              <p className="text-gray-600 mt-1 text-sm">{parsedRecipe.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Stats */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm text-blue-800 font-semibold">Prep Time</div>
          <div className="text-lg font-bold text-blue-900">{parsedRecipe.prepTime}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-sm text-orange-800 font-semibold">Cook Time</div>
          <div className="text-lg font-bold text-orange-900">{parsedRecipe.cookTime}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
          <div className="text-sm text-emerald-800 font-semibold">Servings</div>
          <div className="text-lg font-bold text-emerald-900">{parsedRecipe.servings}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
          <Flame className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-sm text-red-800 font-semibold">Calories</div>
          <div className="text-lg font-bold text-red-900">
            {parsedRecipe.calories_per_serving || 'N/A'}
          </div>
        </div>
      </motion.div>

      {/* Ingredients & Instructions - same as before */}
      {/* ... (keep the existing ingredients and instructions code) */}

      {/* Recipe Actions */}
      <RecipeActions recipe={parsedRecipe} />
    </motion.div>
  );
};

export default RecipeDisplay;