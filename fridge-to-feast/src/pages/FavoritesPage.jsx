import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Users, ChefHat, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshChatHistory } = useChat();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleViewChat = async (recipeName) => {
    const token = localStorage.getItem("userToken");
    
    if (!token) {
      alert('Please log in to view chat');
      return;
    }

    try {
      // Create or get existing chat
      const response=await axios.post(
        "http://127.0.0.1:8000/api/v1/history",
        { title: recipeName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh sidebar to show the new chat
      refreshChatHistory();
      
      // Send the recipe name as a message to get instant response
      await sendRecipeRequest(recipeName, token);

          navigate(`/chat/${encodeURIComponent(recipeName)}`);
      

      
    } catch (err) {
      console.error("Failed to create chat:", err);
      alert("Could not create chat. Please try again.");
    }
  };

  const sendRecipeRequest = async (recipeName, token) => {
    try {
      // Send a message asking for the recipe
      const userMessage = {
        sender: 'user',
        text: `Show me the recipe for ${recipeName}`,
        timestamp: new Date().toISOString()
      };

      // Save user message to chat history
      await axios.post(
        `http://127.0.0.1:8000/api/v1/history/${encodeURIComponent(recipeName)}/messages`,
        userMessage,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Get AI response for the recipe
      const aiResponse = await axios.post(
        'http://127.0.0.1:8000/api/v1/chat',
        { message: `Create a detailed recipe for: ${recipeName}` },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Save AI response to chat history
      const aiMessage = {
        sender: 'ai',
        text: JSON.stringify(aiResponse.data), // Save as JSON string
        timestamp: new Date().toISOString()
      };

      await axios.post(
        `http://127.0.0.1:8000/api/v1/history/${encodeURIComponent(recipeName)}/messages`,
        aiMessage,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Recipe request sent successfully');

    } catch (error) {
      console.error('Failed to send recipe request:', error);
      // Don't throw error here - let the user still navigate to chat
    }
  };

  const fetchFavorites = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeName) => {
    const token = localStorage.getItem('userToken');
    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/favorites/${encodeURIComponent(recipeName)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(favorites.filter(fav => fav !== recipeName));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.6s]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">My Favorite Recipes</h1>
          <p className="text-gray-400 mt-1">Your saved recipes</p>
        </div>
      </div>
      
      {favorites.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Heart size={64} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">Start exploring recipes and click the heart icon to save your favorites!</p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all"
          >
            Explore Recipes
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipeName, index) => (
            <motion.div
              key={recipeName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-amber-500/50 transition-all duration-300"
            >
              {/* Recipe Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <ChefHat size={20} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white truncate max-w-[200px]">
                    {recipeName}
                  </h3>
                </div>
                <button
                  onClick={() => removeFavorite(recipeName)}
                  className="p-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                  title="Remove from favorites"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {/* Recipe Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>Ready in mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>Perfect servings</span>
                  </div>
                </div>
                
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">
                    Click "View in Chat" to see the full recipe with ingredients and instructions!
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleViewChat(recipeName)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                >
                  View in Chat
                </button>
                <button 
                  onClick={() => removeFavorite(recipeName)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;