import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const ChatInput = ({ inputValue, setInputValue, isLoading, handleSendMessage }) => {
  return (
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
  );
};

export default ChatInput;