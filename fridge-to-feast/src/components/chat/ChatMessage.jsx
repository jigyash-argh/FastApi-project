import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import RecipeDisplay from './RecipeDisplay';
import LoadingIndicator from './LoadingIndicator';

const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);

const ChatMessage = ({ msg, isLoading }) => {
  if (isLoading && msg === 'loading') {
    return (
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
    );
  }

  return (
    <motion.div
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
  );
};

export default ChatMessage;