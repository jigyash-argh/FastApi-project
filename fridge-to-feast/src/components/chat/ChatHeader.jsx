import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);

const ChatHeader = () => {
  return (
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
  );
};

export default ChatHeader;