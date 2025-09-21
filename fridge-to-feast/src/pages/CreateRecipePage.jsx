// -------------------------------------------------------------------------
// File: src/pages/CreateRecipePage.jsx (Updated)
// A beautiful, modern chat interface with Light mode only.
// -------------------------------------------------------------------------
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, UtensilsCrossed, Clock, Flame, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// --- ICONS ---
const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path></svg>
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
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
            />
        ))}
    </motion.div>
);

// --- MAIN PAGE COMPONENT ---
const CreateRecipePage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

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
            setMessages(response.data.messages);
          } catch (error) {
            console.error("Failed to fetch messages:", error);
          }
        }
      } else {
        setMessages([
          {
            sender: 'ai',
            text: "Welcome! 🍳 What ingredients do you have in your fridge today? List them out and I'll whip up a recipe for you.",
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

    const userMessage = { sender: 'user', text: inputValue };
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
        console.error("Failed to send message:", error);
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
        recipe: aiResponse.data.recipe,
        youtube_link: aiResponse.data.youtube_link,
        image_url: aiResponse.data.image_url
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (token && chatId) {
        await axios.post(`http://127.0.0.1:8000/history/${chatId}/messages`, { sender: 'ai', text: JSON.stringify(aiMessage.recipe) }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage = { sender: 'ai', text: "Sorry, I couldn't generate a recipe right now. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-white font-sans">
      <div className="max-w-4xl mx-auto h-full flex flex-col">

        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <GiKnifeForkCreate size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 font-display">AI Recipe Creator</h1>
                    <p className="text-sm text-gray-500">Your personal kitchen assistant</p>
                </div>
            </div>
        </header>

        {/* Chat Area */}
        <main className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`flex gap-4 items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <GiKnifeForkCreate size={18} />
                  </div>
                )}
                <div className={`max-w-lg p-4 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none shadow-lg'
                      : 'bg-orange-50 text-gray-700 rounded-bl-none border border-orange-100 shadow-md'
                  }`}
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                >
                  {msg.isRecipe ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                            <h3 className="text-xl font-bold text-gray-900 font-display">{msg.recipe.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                            <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500"/> <strong className="font-semibold text-gray-800">Prep:</strong> {msg.recipe.prepTime}</span>
                            <span className="flex items-center gap-2"><Flame size={16} className="text-orange-500"/> <strong className="font-semibold text-gray-800">Cook:</strong> {msg.recipe.cookTime}</span>
                            <span className="flex items-center gap-2"><Users size={16} className="text-orange-500"/> <strong className="font-semibold text-gray-800">Servings:</strong> {msg.recipe.servings}</span>
                        </div>
                        <hr className="border-orange-100" />
                        <ol className="list-decimal list-inside space-y-3 marker:text-orange-500 marker:font-semibold">
                            {msg.recipe.instructions.map((step, i) => (
                              <li key={i} className="break-words">{step}</li>
                            ))}
                        </ol>
                        {msg.image_url && <img src={msg.image_url} alt="Recipe" className="mt-4 rounded-lg" />}
                        {msg.youtube_link && <a href={msg.youtube_link} target="_blank" rel="noopener noreferrer" className="mt-4 text-orange-500 hover:underline">Watch on YouTube</a>}
                    </div>
                  ) : <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p> }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4 items-end">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <GiKnifeForkCreate size={18} />
                </div>
                <div className="p-4 bg-orange-50 rounded-2xl rounded-bl-none border border-orange-100 shadow-md h-[44px]">
                    <LoadingIndicator />
                </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Input Form */}
        <footer className="p-4 flex-shrink-0 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., chicken, rice, onion..."
              className="w-full pl-5 pr-14 py-3 rounded-full bg-orange-50 text-gray-800
                         border-2 border-transparent placeholder-gray-500
                         focus:outline-none focus:border-orange-500/50 focus:bg-white
                         focus:ring-2 focus:ring-orange-500/30
                         transition-all duration-300"
            />
            <motion.button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white
                         disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Send size={20} />
            </motion.button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default CreateRecipePage;
