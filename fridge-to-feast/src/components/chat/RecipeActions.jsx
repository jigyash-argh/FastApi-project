import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Flame, Share2 } from 'lucide-react';
import axios from 'axios';

const RecipeActions = ({ recipe }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cookLoading, setCookLoading] = useState(false);

  const recipeName = recipe?.title;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!recipeName) return;
      
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const favorites = response.data.favorites || [];
        setIsLiked(favorites.includes(recipeName));
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [recipeName]);

  const handleToggleFavorite = async () => {
    if (!recipeName) {
      console.error('No recipe name available');
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Please log in to save favorites');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/v1/favorites/${encodeURIComponent(recipeName)}`,
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setIsLiked(!isLiked);
      
      if (!isLiked) {
        console.log('Recipe added to favorites!');
      } else {
        console.log('Recipe removed from favorites!');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCooked = async () => {
    if (!recipe) {
      console.error('No recipe data available');
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Please log in to track cooked recipes');
      return;
    }

    setCookLoading(true);
    try {
      const calories = recipe.calories_per_serving || 400;
      
      const cookedData = {
        recipe_name: recipe.title,
        calories: calories,
        servings: 1,
        recipe_data: {
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          calories_per_serving: calories
        }
      };

      await axios.post(
        'http://127.0.0.1:8000/api/v1/cooked-recipe',
        cookedData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsCooked(true);
      alert(`🎉 "${recipe.title}" added to your cooked recipes! ${calories} calories logged.`);
      
    } catch (error) {
      console.error('Failed to mark as cooked:', error);
      alert('Failed to add recipe to cooked history');
    } finally {
      setCookLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex items-center gap-2 mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleFavorite}
        disabled={loading || !recipeName}
        className={`p-2 rounded-full border transition-all duration-300 ${
          isLiked 
            ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/25' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-rose-300 hover:text-rose-500'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMarkAsCooked}
        disabled={cookLoading}
        className={`p-3 rounded-full border transition-all duration-300 flex items-center gap-2 ${
          isCooked 
            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-amber-300 hover:text-amber-500'
        } ${cookLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {cookLoading ? (
          <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Flame size={16} fill={isCooked ? 'currentColor' : 'none'} />
        )}
        <span className="text-sm font-medium">
          {isCooked ? 'Added to Calories' : 'Add to Calories'}
        </span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-500 transition-all duration-300"
      >
        <Share2 size={16} />
      </motion.button>
    </motion.div>
  );
};

export default RecipeActions;