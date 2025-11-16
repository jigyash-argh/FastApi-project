import { useChat } from '../contexts/ChatContext';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, UtensilsCrossed, Clock, Flame, ChefHat, Zap, Heart, CheckCircle } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// KnifeFork icon component
const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);

// LoadingIndicator component
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

// Helper function to transform backend recipe to frontend format
const transformRecipeFromBackend = (backendRecipe) => {
  if (!backendRecipe) return null;
  
  // If it's already in the correct format, return as is
  if (backendRecipe.title && backendRecipe.ingredients && backendRecipe.instructions) {
    return backendRecipe;
  }
  
  // Transform from backend format to frontend format
  return {
    title: backendRecipe.recipe_name || 'Generated Recipe',
    description: 'A delicious recipe generated just for you',
    prepTime: backendRecipe.prepTime || '15 mins',
    cookTime: backendRecipe.cookTime || '30 mins',
    servings: backendRecipe.servings || '4',
    calories_per_serving: backendRecipe.calories_per_serving || 'N/A',
    ingredients: backendRecipe.ingredients || [],
    instructions: backendRecipe.instructions || [],
    youtube_link: backendRecipe.video_url || backendRecipe.youtube_link,
    image_url: backendRecipe.image_url
  };
};

// Recipe Display Component
const RecipeDisplay = ({ recipe, youtube_link, image_url, onLike, onCooked, isLiked = false, isCooked = false }) => {
  let parsedRecipe = recipe;
  
  if (typeof recipe === 'string') {
    try {
      parsedRecipe = JSON.parse(recipe); 
    } catch (error) {
      parsedRecipe = recipe;
    }
  }

  // Transform recipe from backend format
  const transformedRecipe = transformRecipeFromBackend(parsedRecipe);
  const isStructuredRecipe = transformedRecipe && typeof transformedRecipe === 'object' && transformedRecipe.ingredients;

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
        
        <motion.div 
          className="flex gap-3 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={onLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isLiked 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
            {isLiked ? 'Liked' : 'Like'}
          </motion.button>
          
          <motion.button
            onClick={onCooked}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
              isCooked 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={18} className={isCooked ? 'fill-current' : ''} />
            {isCooked ? 'Cooked' : 'Mark as Cooked'}
          </motion.button>
        </motion.div>

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
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg shadow-lg">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-display bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {transformedRecipe.title}
            </h3>
            {transformedRecipe.description && (
              <p className="text-gray-600 mt-1 text-sm">{transformedRecipe.description}</p>
            )}
          </div>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm text-blue-800 font-semibold">Prep Time</div>
          <div className="text-lg font-bold text-blue-900">{transformedRecipe.prepTime}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-sm text-orange-800 font-semibold">Cook Time</div>
          <div className="text-lg font-bold text-orange-900">{transformedRecipe.cookTime}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
          <Users className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
          <div className="text-sm text-emerald-800 font-semibold">Servings</div>
          <div className="text-lg font-bold text-emerald-900">{transformedRecipe.servings}</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
          <Flame className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-sm text-red-800 font-semibold">Calories</div>
          <div className="text-lg font-bold text-red-900">
            {transformedRecipe.calories_per_serving || 'N/A'}
          </div>
        </div>
      </motion.div>

      {transformedRecipe.ingredients && transformedRecipe.ingredients.length > 0 && (
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
              {transformedRecipe.ingredients.map((ingredient, index) => (
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

      {transformedRecipe.instructions && transformedRecipe.instructions.length > 0 && (
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
            {transformedRecipe.instructions.map((step, index) => (
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

      <motion.div 
        className="flex gap-4 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <motion.button
          onClick={onLike}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
            isLiked 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart size={20} className={isLiked ? 'fill-current' : ''} />
          {isLiked ? 'Recipe Liked!' : 'Like this Recipe'}
        </motion.button>
        
        <motion.button
          onClick={onCooked}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
            isCooked 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle size={20} className={isCooked ? 'fill-current' : ''} />
          {isCooked ? 'Marked as Cooked!' : 'I Cooked This'}
        </motion.button>
      </motion.div>

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
    </motion.div>
  );
};

const CreateRecipePage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [currentChatTitle, setCurrentChatTitle] = useState('');
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  const { refreshChatHistory } = useChat();

  // Fetch favorite recipes when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/v1/favorites', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('Favorites response:', response.data);
          setFavoriteRecipes(response.data.favorites || []);
        } catch (error) {
          console.error("Failed to fetch favorites:", error);
          console.error("Error details:", error.response?.data);
        }
      }
    };

    fetchFavorites();
  }, []);

  // FIXED SCROLL BEHAVIOR
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [messages, isLoading]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (chatId) {
        const token = localStorage.getItem('userToken');
        if (token) {
          try {
            console.log('Fetching messages for chat:', chatId);
            const response = await axios.get(`http://127.0.0.1:8000/api/v1/history/${chatId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            console.log('Messages response:', response.data);
            
            // Map API {role, content} to local state {sender, text}
            const apiMessages = response.data.messages?.map(msg => ({
              sender: msg.role,
              text: msg.content,
              isCooked: msg.is_cooked || false
            })) || [];
            
            // Parse messages to identify recipes and set initial states
            const parsedMessages = apiMessages.map(msg => {
              if (msg.sender === 'ai') {
                try {
                  if (typeof msg.text === 'string' && msg.text.trim().startsWith('{')) {
                    const parsedData = JSON.parse(msg.text);
                    if (parsedData && typeof parsedData === 'object') {
                      const recipeName = parsedData.recipe_name || parsedData.title || '';
                      const isLiked = favoriteRecipes.includes(recipeName);
                      
                      return {
                        ...msg,
                        isRecipe: true,
                        recipe: parsedData,
                        youtube_link: parsedData.video_url || parsedData.youtube_link,
                        image_url: parsedData.image_url,
                        isLiked: isLiked,
                        isCooked: msg.isCooked || false
                      };
                    }
                  }
                } catch (error) {
                  console.error("Failed to parse AI message:", error);
                }
              }
              return {
                ...msg,
                isRecipe: false
              };
            });
            
            // Check cooked recipes from backend so cooked status persists across refreshes
            if (token) {
              try {
                const cookedResp = await axios.get('http://127.0.0.1:8000/api/v1/cooked-recipes/recent', {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { limit: 50 }
                });

                // cookedResp may return { cooked_recipes: [...] } or similar
                const cookedList = cookedResp.data.cooked_recipes || cookedResp.data.recipes || [];
                const cookedNames = new Set(cookedList.map(r => (r.recipe_name || r.title || '').toString()));

                const updatedParsed = parsedMessages.map(m => {
                  if (m.isRecipe && m.recipe) {
                    const name = (m.recipe.recipe_name || m.recipe.title || '').toString();
                    return { ...m, isCooked: !!(m.isCooked || cookedNames.has(name)) };
                  }
                  return m;
                });

                setMessages(updatedParsed);
              } catch (err) {
                console.error('Failed to fetch cooked recipes for cooked-state check:', err);
                setMessages(parsedMessages);
              }
            } else {
              setMessages(parsedMessages);
            }
            setCurrentChatTitle(response.data.title || chatId);

          } catch (error) {
            console.error("Failed to fetch messages:", error);
            console.error("Error details:", error.response?.data);
            // If chat not found, redirect to new chat
            if (error.response?.status === 404) {
              navigate('/create-recipe');
            }
          }
        }
      } else {
        // New chat - initialize with welcome message
        setMessages([
          {
            sender: 'ai',
            text: "Welcome! 🍳 What ingredients do you have in your fridge today? List them out and I'll whip up a delicious recipe for you!",
            timestamp: new Date().toISOString(),
            isRecipe: false
          },
        ]);
        setCurrentChatTitle('New Chat');
      }
    };

    fetchMessages();
  }, [chatId, navigate, favoriteRecipes]);

  // FIXED: Like Handler with better error handling
  const handleLike = async (messageIndex) => {
    const token = localStorage.getItem('userToken');
    const message = messages[messageIndex];
    
    if (!message.isRecipe) {
      console.log('Not a recipe message, skipping like');
      return;
    }

    try {
      const recipeName = message.recipe.recipe_name || message.recipe.title || `Recipe-${messageIndex}`;
      console.log('Toggling like for recipe:', recipeName);
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/favorites/${encodeURIComponent(recipeName)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Like response:', response.data);

      const updatedMessages = [...messages];
      updatedMessages[messageIndex].isLiked = response.data.favorited;
      setMessages(updatedMessages);

      if (response.data.favorited) {
        setFavoriteRecipes(prev => [...prev, recipeName]);
      } else {
        setFavoriteRecipes(prev => prev.filter(name => name !== recipeName));
      }

      console.log(`Recipe ${response.data.favorited ? 'added to' : 'removed from'} favorites:`, recipeName);

    } catch (error) {
      console.error("Failed to update favorite status:", error);
      console.error("Error details:", error.response?.data);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  // FIXED: Cooked Recipe Handler with better error handling
  const handleCooked = async (messageIndex) => {
    const token = localStorage.getItem('userToken');
    const message = messages[messageIndex];
    
    if (!message.isRecipe) {
      console.log('Not a recipe message, skipping cooked');
      return;
    }

    try {
      const recipeName = message.recipe.recipe_name || message.recipe.title || `Recipe-${messageIndex}`;
      const isCurrentlyCooked = message.isCooked || false;
      const newCookedStatus = !isCurrentlyCooked;

      console.log('Toggling cooked status for recipe:', recipeName, 'New status:', newCookedStatus);

      if (newCookedStatus) {
        // Mark as cooked - add to cooked recipes
        const calories = message.recipe.calories_per_serving || 
                        message.recipe.calories || 
                        (message.recipe.ingredients ? message.recipe.ingredients.length * 50 : 400);
        
        const recipeData = {
          recipe_name: recipeName,
          calories: parseInt(calories),
          servings: 4,
          cooked_at: new Date().toISOString(),
          recipe_data: {
            title: recipeName,
            ingredients: message.recipe.ingredients || [],
            instructions: message.recipe.instructions || [],
            prepTime: message.recipe.prepTime,
            cookTime: message.recipe.cookTime,
            image_url: message.recipe.image_url,
            video_url: message.recipe.video_url || message.recipe.youtube_link
          }
        };

        console.log("Sending cooked recipe data:", recipeData);

        const cookedResponse = await axios.post(
          'http://127.0.0.1:8000/api/v1/cooked-recipe',
          recipeData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Cooked response:', cookedResponse.data);

        if (cookedResponse.data.id || cookedResponse.data.recipe_name) {
          console.log('Recipe added to cooked recipes:', recipeName);
        }
        // store cooked id on message for future removal
        if (cookedResponse.data.id) {
          updatedMessages[messageIndex] = {
            ...updatedMessages[messageIndex],
            cookedId: cookedResponse.data.id
          };
        }
      }

      // Update local state immediately for better UX
      const updatedMessages = [...messages];
      updatedMessages[messageIndex].isCooked = newCookedStatus;
      setMessages(updatedMessages);

      // Persist cooked status on the message in history
      if (token && currentChatTitle) {
        try {
          await axios.put(
            `http://127.0.0.1:8000/api/v1/history/${encodeURIComponent(currentChatTitle)}/cooked-status`,
            {
              title: currentChatTitle,
              recipe_name: recipeName,
              isCooked: newCookedStatus
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error('Failed to persist message cooked status:', err);
        }
      }

      console.log(`Recipe ${newCookedStatus ? 'marked as' : 'unmarked as'} cooked:`, recipeName);
      
      if (newCookedStatus) {
        alert('Recipe marked as cooked! 🎉 Check your dashboard to see your progress.');
      } else {
        // If unmarking, attempt to remove cooked recipe record from backend
        try {
          // Prefer deleting by stored cookedId if available
          const cookedId = messages[messageIndex]?.cookedId || updatedMessages[messageIndex]?.cookedId;
          if (cookedId) {
            await axios.delete(`http://127.0.0.1:8000/api/v1/cooked-recipes/${encodeURIComponent(cookedId)}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } else {
            // fallback: find recent cooked recipes and delete first matching by name
            const recent = await axios.get('http://127.0.0.1:8000/api/v1/cooked-recipes/recent', {
              headers: { Authorization: `Bearer ${token}` },
              params: { limit: 50 }
            });
            const cookedList = recent.data.cooked_recipes || recent.data.recipes || [];
            const match = cookedList.find(r => (r.recipe_name || r.title || '') === recipeName);
            if (match && match.id) {
              await axios.delete(`http://127.0.0.1:8000/api/v1/cooked-recipes/${encodeURIComponent(match.id)}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
          }

          alert('Recipe unmarked as cooked.');
        } catch (err) {
          console.error('Failed to remove cooked recipe on unmark:', err);
          alert('Recipe unmarked locally, but failed to update server.');
        }
      }

    } catch (error) {
      console.error("Failed to update cooked status:", error);
      console.error("Error details:", error.response?.data);
      
      // Revert local state on error
      const updatedMessages = [...messages];
      updatedMessages[messageIndex].isCooked = message.isCooked;
      setMessages(updatedMessages);
      
      if (error.response?.status === 422) {
        alert('Invalid recipe data. Please try again.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again later.');
      } else {
        alert('Failed to update cooked status. Please try again.');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { 
      sender: 'user', 
      text: inputValue,
      timestamp: new Date().toISOString(),
      isRecipe: false
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const token = localStorage.getItem('userToken');
    
    // If this is a new chat (no chatId), create a new chat history first
    let currentTitle = chatId;
    if (!chatId && token) {
      try {
        // Create a new chat with the first few words of the user's message as title
        const title = inputValue.slice(0, 30) + (inputValue.length > 30 ? '...' : '');
        const response = await axios.post('http://127.0.0.1:8000/api/v1/history', 
          { title },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        currentTitle = response.data.title;
        setCurrentChatTitle(currentTitle);
        // Update URL to include the new chat ID
        navigate(`/create-recipe/${currentTitle}`);
      } catch (error) {
        console.error("Failed to create new chat:", error);
      }
    }

    // Save user message to history if we have a chat title
    if (token && currentTitle) {
      try {
        await axios.post(`http://127.0.0.1:8000/api/v1/history/${currentTitle}/messages`, 
          { role: 'user', content: inputValue }, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Failed to save user message:", error);
      }
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/chat', 
        { message: inputValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Chat response:', response.data);

      const recipeData = response.data;
      const recipeName = recipeData.recipe_name || recipeData.title || '';
      const isLiked = favoriteRecipes.includes(recipeName);

      const aiMessage = {
        sender: 'ai',
        isRecipe: true,
        recipe: recipeData,
        youtube_link: recipeData.video_url || recipeData.youtube_link,
        image_url: recipeData.image_url,
        isLiked: isLiked,
        isCooked: false,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to history if we have a chat title
      if (token && currentTitle) {
        try {
          await axios.post(`http://127.0.0.1:8000/api/v1/history/${currentTitle}/messages`, 
            { 
              role: 'ai', 
              content: JSON.stringify(recipeData)
            }, 
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (error) {
          console.error("Failed to save AI message:", error);
        }
      }

      refreshChatHistory();

    } catch (error) {
      console.error("Failed to get AI response:", error);
      console.error("Error details:", error.response?.data);
      const errorMessage = { 
        sender: 'ai', 
        text: "Sorry, I couldn't generate a recipe right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isRecipe: false
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 font-sans overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col">

        {/* Header */}
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
              <p className="text-gray-500 text-sm">{currentChatTitle}</p>
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

        {/* Chat Area */}
        <main 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => {
              // Skip invalid messages. Allow recipe messages which have `recipe`/`isRecipe` instead of `text`.
              if (!msg || !msg.sender || (!msg.text && !msg.isRecipe && !msg.recipe)) {
                return null;
              }
              
              return (
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
                        onLike={() => handleLike(index)}
                        onCooked={() => handleCooked(index)}
                        isLiked={msg.isLiked}
                        isCooked={msg.isCooked}
                      />
                    ) : (
                      <div>
                        <p className="whitespace-pre-wrap leading-relaxed break-words text-lg">{msg.text}</p>
                        {msg.sender === 'ai' && !msg.isRecipe && (
                          <motion.div 
                            className="flex gap-3 mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <motion.button
                              onClick={() => handleLike(index)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                msg.isLiked 
                                  ? 'bg-red-500 text-white shadow-lg' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Heart size={18} className={msg.isLiked ? 'fill-current' : ''} />
                              {msg.isLiked ? 'Liked' : 'Like'}
                            </motion.button>
                          </motion.div>
                        )}
                      </div>
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
              );
            })}
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

        {/* Input Form */}
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
            Try: &quot;chicken, rice, vegetables&quot; or &quot;quick breakfast ideas&quot; 🍳
          </motion.p>
        </motion.footer>
      </div>
    </div>
  );
};

export default CreateRecipePage;