import { useChat } from '../contexts/ChatContext';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, UtensilsCrossed, Clock, Flame, Users, ChefHat, Star, Heart, Share2, Bookmark, Timer, Zap } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// --- ICONS ---
const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);

// --- HELPER COMPONENTS ---
const LoadingIndicator = () => (
  <motion.div
    initial={{ transition: { staggerChildren: 0.1 } }}
    animate={{ transition: { staggerChildren: 0.1 } }}
    className="flex items-center justify-center gap-1.5 h-full"
  >
    {[...Array(3)].map((_, i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
        animate={{ 
          y: [0, -8, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          ease: 'easeInOut', 
          delay: i * 0.1 
        }}
      />
    ))}
  </motion.div>
);

// Floating Action Buttons for Recipe
const RecipeActions = ({ recipe }) => {
  const [isCooked, setIsCooked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cookLoading, setCookLoading] = useState(false);

  // Get recipe name from the recipe object
  const recipeName = recipe?.title;

  // Check if this recipe is already favorited when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!recipeName) return;
      
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await axios.get('http://127.0.0.1:8000/favorites', {
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
        `http://127.0.0.1:8000/favorites/${encodeURIComponent(recipeName)}`, 
        {}, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Toggle the local state
      setIsLiked(!isLiked);
      
      // Show feedback to user
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
      // Use ACTUAL calories from AI response
      const calories = recipe.calories_per_serving || 400; // Fallback to 400 if not provided
      
      const cookedData = {
        recipe_name: recipe.title,
        calories: calories,
        servings: 1, // Default to 1 serving
        recipe_data: {
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          calories_per_serving: calories // Include calorie info in recipe data
        }
      };

      await axios.post(
        'http://127.0.0.1:8000/cooked-recipes',
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

// Enhanced Recipe Display Component
const RecipeDisplay = ({ recipe, youtube_link, image_url }) => {
  // FIX: Parse recipe if it's a JSON string from reload
  let parsedRecipe = recipe;
  
  if (typeof recipe === 'string') {
    try {
      parsedRecipe = JSON.parse(recipe);
    } catch (error) {
      // If it's not JSON, keep it as string
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

      {/* Ingredients */}
      {parsedRecipe.ingredients && parsedRecipe.ingredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <ChefHat size={18} className="text-white" />
            </div>
            Ingredients
          </h4>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
            <ul className="grid gap-3">
              {parsedRecipe.ingredients.map((ingredient, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-center gap-3 text-gray-700 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                  <span className="group-hover:text-purple-700 transition-colors duration-200 break-words">
                    {ingredient}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {parsedRecipe.instructions && parsedRecipe.instructions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Zap size={18} className="text-white" />
            </div>
            Instructions
          </h4>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 space-y-4">
            {parsedRecipe.instructions.map((step, index) => (
              <motion.div 
                key={index}
                className="flex gap-4 items-start group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed group-hover:text-amber-900 transition-colors duration-200 pt-1 break-words">
                  {step}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Image and YouTube Link */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {image_url && (
          <div className="flex-1">
            <img 
              src={image_url} 
              alt="Recipe" 
              className="w-full h-64 object-cover rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            />
          </div>
        )}
        {youtube_link && (
          <div className="flex-1">
            <motion.a 
              href={youtube_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full h-64 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex flex-col items-center justify-center text-white hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 group p-6 text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span className="text-xl font-bold mb-2">Watch Tutorial</span>
              <span className="text-red-100 text-sm">Step-by-step video guide</span>
            </motion.a>
          </div>
        )}
      </motion.div>

      {/* Recipe Actions */}
      <RecipeActions recipe={parsedRecipe} />
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const CreateRecipePage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Use chat context to refresh sidebar
  const { refreshChatHistory } = useChat();

  // FIX: Parse messages from history to handle JSON strings
  const parseMessageFromHistory = (message) => {
    if (message.sender === 'ai') {
      try {
        // Try to parse the text as JSON for recipe data
        const parsedData = JSON.parse(message.text);
        if (parsedData && typeof parsedData === 'object') {
          return {
            ...message,
            isRecipe: true,
            recipe: parsedData,
            youtube_link: parsedData.youtube_link,
            image_url: parsedData.image_url
          };
        }
      } catch (error) {
        // If it's not JSON, keep it as regular text
        return message;
      }
    }
    return message;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (chatId) {
        const token = localStorage.getItem('userToken');
        if (token) {
          try {
            const response = await axios.get(`http://127.0.0.1:8000/history/${chatId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            // FIX: Parse all messages to handle JSON recipes
            const parsedMessages = response.data.messages.map(parseMessageFromHistory);
            setMessages(parsedMessages);
          } catch (error) {
            console.error("Failed to fetch messages:", error);
          }
        }
      } else {
        setMessages([
          {
            sender: 'ai',
            text: "Welcome! 🍳 What ingredients do you have in your fridge today? List them out and I'll whip up a delicious recipe for you!",
          },
        ]);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { 
      sender: 'user', 
      text: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const token = localStorage.getItem('userToken');
    
    if (token && chatId) {
      try {
        await axios.post(`http://127.0.0.1:8000/history/${chatId}/messages`, userMessage, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Failed to save user message:", error);
      }
    }

    try {
      const aiResponse = await axios.post('http://127.0.0.1:8000/chat', 
        { message: inputValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiMessage = {
        sender: 'ai',
        isRecipe: true,
        recipe: aiResponse.data,
        youtube_link: aiResponse.data.youtube_link,
        image_url: aiResponse.data.image_url,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (token && chatId) {
        try {
          // FIX: Save the structured data as JSON string for persistence
          await axios.post(`http://127.0.0.1:8000/history/${chatId}/messages`, { 
            sender: 'ai', 
            text: JSON.stringify(aiResponse.data), // Save as JSON string
            timestamp: new Date().toISOString()
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error("Failed to save AI message:", error);
        }
      }

      // Refresh the sidebar chat history after successful AI response
      refreshChatHistory();

    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = { 
        sender: 'ai', 
        text: "Sorry, I couldn't generate a recipe right now. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">

        {/* Enhanced Header */}
        <motion.header 
          className="flex justify-between items-center p-6 border-b border-gray-200/50 bg-transparent backdrop-blur-sm flex-shrink-0"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GiKnifeForkCreate size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-display">
                AI Recipe Creator
              </h1>
              <p className="text-gray-500 text-sm">Your personal kitchen assistant 🍳</p>
            </div>
          </div>
          <motion.div 
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full text-sm font-semibold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            Ready to Cook!
          </motion.div>
          <Link to="/dashboard">
            <div className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform hover:from-purple-600 hover:to-indigo-700">
              Go to Dashboard
            </div>
          </Link>
        </motion.header>

        {/* Enhanced Chat Area - REMOVED SCROLLBAR */}
        <main className="flex-grow overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={`${index}-${msg.timestamp}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  layout: { duration: 0.3 }
                }}
                className={`flex gap-4 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg flex-shrink-0 mt-1"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <GiKnifeForkCreate size={20} />
                  </motion.div>
                )}
                
                <motion.div 
                  className={`max-w-2xl p-6 rounded-3xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none shadow-xl'
                      : 'bg-white text-gray-700 rounded-bl-none border border-gray-200/50 shadow-lg'
                  }`}
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {msg.isRecipe ? (
                    <RecipeDisplay 
                      recipe={msg.recipe}
                      youtube_link={msg.youtube_link}
                      image_url={msg.image_url}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed break-words text-lg">{msg.text}</p>
                  )}
                </motion.div>
                
                {msg.sender === 'user' && (
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center text-white shadow-lg flex-shrink-0 mt-1"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                  >
                    <Users size={20} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start gap-4 items-start"
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg flex-shrink-0"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <GiKnifeForkCreate size={20} />
              </motion.div>
              <motion.div 
                className="p-6 bg-white rounded-3xl rounded-bl-none border border-gray-200/50 shadow-lg w-48"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <LoadingIndicator />
              </motion.div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Enhanced Input Form */}
        <motion.footer 
          className="p-6 flex-shrink-0 bg-transparent backdrop-blur-sm border-t border-gray-200/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSendMessage} className="relative">
            <motion.input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tell me what ingredients you have... 🥕 🍗 🍚"
              className="w-full pl-6 pr-20 py-4 rounded-2xl bg-white text-gray-800
                         border-2 border-gray-300/50 placeholder-gray-500 text-lg
                         focus:outline-none focus:border-emerald-500/50 focus:bg-white
                         focus:ring-4 focus:ring-emerald-500/20
                         transition-all duration-300 shadow-lg"
              disabled={isLoading}
              whileFocus={{ scale: 1.02 }}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white
                         disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-lg"
              whileHover={{ scale: isLoading ? 1 : 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={isLoading ? { rotate: 360 } : {}}
              transition={isLoading ? { rotate: { duration: 1, repeat: Infinity, ease: "linear" } } : {}}
            >
              <Send size={22} />
            </motion.button>
          </form>
          <motion.p 
            className="text-center text-gray-500 text-sm mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Try: "chicken, rice, vegetables" or "quick breakfast ideas" 🍳
          </motion.p>
        </motion.footer>
      </div>
    </div>
  );
};

export default CreateRecipePage;