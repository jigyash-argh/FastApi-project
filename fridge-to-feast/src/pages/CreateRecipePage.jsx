// -------------------------------------------------------------------------
// File: src/pages/CreateRecipePage.jsx (Updated)
// A beautiful, modern chat interface with Light & Dark modes.
// -------------------------------------------------------------------------
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, UtensilsCrossed, Clock, Flame, Users, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

const ThemeToggle = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -30 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.2 }}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </motion.div>
            </AnimatePresence>
        </button>
    );
};

// --- MAIN PAGE COMPONENT ---
const CreateRecipePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Welcome! 🍳 What ingredients do you have in your fridge today? List them out and I'll whip up a recipe for you.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: inputValue }]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, {
        sender: 'ai', isRecipe: true,
        recipe: {
          title: 'Spicy Garlic Chicken & Rice', prepTime: '10 mins', cookTime: '20 mins', servings: '1 person',
          instructions: [
            'Rinse rice under cold water. Cook according to package directions.',
            'While rice cooks, dice the chicken breast into bite-sized cubes and mince the garlic.',
            'Heat a pan over medium-high heat. Add a splash of oil, then sauté the chicken until golden brown.',
            'Add the minced garlic and your favorite spices. Cook for another minute until fragrant.',
            'Combine the cooked rice with the chicken. Mix everything together and serve hot!',
          ],
        },
      }]);
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gradient-to-br dark:from-[#171133] dark:to-[#0C061F] transition-colors duration-300 font-sans">
      <div className="max-w-4xl mx-auto h-full flex flex-col">

        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <GiKnifeForkCreate size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-display">AI Recipe Creator</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your personal kitchen assistant</p>
                </div>
            </div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>

        {/* Chat Area */}
        <main className="flex-grow overflow-y-auto p-6 space-y-8">
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
                      : 'bg-gray-100 dark:bg-[#2F264D]/50 dark:backdrop-blur-sm text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-white/10 shadow-md'
                  }`}
                >
                  {msg.isRecipe ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <UtensilsCrossed className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">{msg.recipe.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500 dark:text-orange-400"/> <strong className="font-semibold text-gray-800 dark:text-gray-200">Prep:</strong> {msg.recipe.prepTime}</span>
                            <span className="flex items-center gap-2"><Flame size={16} className="text-orange-500 dark:text-orange-400"/> <strong className="font-semibold text-gray-800 dark:text-gray-200">Cook:</strong> {msg.recipe.cookTime}</span>
                            <span className="flex items-center gap-2"><Users size={16} className="text-orange-500 dark:text-orange-400"/> <strong className="font-semibold text-gray-800 dark:text-gray-200">Servings:</strong> {msg.recipe.servings}</span>
                        </div>
                        <hr className="border-gray-200 dark:border-white/10" />
                        <ol className="list-decimal list-inside space-y-3 marker:text-orange-500 dark:marker:text-orange-400 marker:font-semibold">
                            {msg.recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                    </div>
                  ) : <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p> }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4 items-end">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <GiKnifeForkCreate size={18} />
                </div>
                <div className="p-4 bg-gray-100 dark:bg-[#2F264D]/50 rounded-2xl rounded-bl-none border border-gray-200 dark:border-white/10 shadow-md h-[44px]">
                    <LoadingIndicator />
                </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Input Form */}
        <footer className="p-4 flex-shrink-0 bg-white/80 dark:bg-[#0C061F]/50 backdrop-blur-sm border-t border-gray-200 dark:border-white/10">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., chicken, rice, onion..."
              className="w-full pl-5 pr-14 py-3 rounded-full bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200
                         border-2 border-transparent placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-white/10
                         focus:ring-2 focus:ring-orange-500/30
                         transition-all duration-300"
            />
            <motion.button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white
                         disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:scale-100
                         transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-slate-900"
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
