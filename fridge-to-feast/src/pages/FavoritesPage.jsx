import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Users, ChefHat, Trash2 } from 'lucide-react';
import axios from 'axios';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await axios.get('http://127.0.0.1:8000/users/me/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId) => {
    const token = localStorage.getItem('userToken');
    try {
      await axios.delete(`http://127.0.0.1:8000/users/me/favorites/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(fav => fav.recipe_id !== recipeId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading favorites...</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">My Favorite Recipes</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No favorite recipes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe, index) => (
            <motion.div
              key={recipe.recipe_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{recipe.title}</h3>
                <button
                  onClick={() => removeFavorite(recipe.recipe_id)}
                  className="text-rose-500 hover:text-rose-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              
              {recipe.image_url && (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-2">
                <h4 className="font-semibold">Ingredients:</h4>
                <ul className="text-sm text-gray-300">
                  {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                    <li key={i}>• {ingredient}</li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-gray-500">+{recipe.ingredients.length - 3} more</li>
                  )}
                </ul>
              </div>
              
              <button 
                onClick={() => removeFavorite(recipe.recipe_id)}
                className="w-full mt-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Remove from Favorites
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;