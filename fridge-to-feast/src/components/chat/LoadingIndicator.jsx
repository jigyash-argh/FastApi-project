import React from 'react';
import { motion } from 'framer-motion';

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

export default LoadingIndicator;