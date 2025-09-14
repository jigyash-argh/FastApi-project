import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import Navbar from '../components/Navbar'; // Corrected path
import heroImage from '../assets/ChefAsset.jpg'; // Corrected path
import QuickAdd from './QuickAdd';

const LandingPage = () => {
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#FFF8F0] flex flex-col items-center justify-center">
        <main className="overflow-hidden w-full">
          {/* Increased vertical padding for more space */}
          <section className="container mx-auto px-6 py-32 md:py-40">
            <motion.div
              className="grid md:grid-cols-2 gap-16 items-center" // Increased gap
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* --- Left Column: Text Content --- */}
              <div className="text-center md:text-left">
                {/* Restored the star rating section */}
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center md:justify-start items-center gap-2 mb-4"
                >
                  <div className="flex text-amber-500">
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                    <Star size={20} fill="currentColor" />
                  </div>
                  <p className="text-base text-gray-600 font-medium">
                    Loved by 10,000+ bachelors
                  </p>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight"
                >
                  Turn Your Leftovers Into a{' '}
                  <span className="text-orange-500">Masterpiece.</span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mt-8 text-xl text-gray-600 max-w-lg mx-auto md:mx-0"
                >
                  Stop staring at a fridge full of random ingredients. With our
                  AI, you can turn what you have into a delicious, easy-to-make
                  meal in seconds.
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="mt-12 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6"
                >
                  {/* --- Animated "Start Cooking" Button --- */}
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                     
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Link
                      to="/create"
                      className="w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 text-lg"
                    >
                      Start Cooking Now
                      <ArrowRight size={24} />
                    </Link>
                  </motion.div>

                  {/* --- Animated "Learn More" Button --- */}
                  <motion.div
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '9999px' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Link
                      to="/about"
                      className="w-full sm:w-auto text-gray-700  rounded-full hover:bg-orange-500 font-bold hover:text-white transition-colors text-lg py-4  px-10"
                    >
                      Learn More
                    </Link>
                  </motion.div>
                </motion.div>
              </div>

              {/* --- Right Column: Image --- */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative flex justify-center"
              >
                <div className="absolute w-4/5 h-4/5 bg-amber-200 rounded-full blur-3xl -z-10" />
                <img
                  src={heroImage}
                  alt="Happy chef holding a dish"
                  className="w-full max-w-lg rounded-3xl object-cover shadow-2xl"
                  onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x800/FFF8F0/F97316?text=Chef'; }}
                />
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
      <div>
        <QuickAdd/>
      </div>
    </>
  );
};

export default LandingPage;
