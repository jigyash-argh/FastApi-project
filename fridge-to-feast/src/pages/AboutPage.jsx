import React from 'react';
import { motion } from 'framer-motion';
import { GiKnifeFork } from 'react-icons/gi';
import { Sparkles, Users, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <div className="bg-[#FFF8F0]">
      <Navbar />
      <main className="container mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <GiKnifeFork className="mx-auto text-6xl text-orange-500 mb-4" />
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900">Our Mission</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            We believe that cooking should be simple, fun, and sustainable. Fridge-to-Feast was born from a simple idea: to help bachelors and busy individuals reduce food waste and discover the joy of creating delicious meals from what they already have.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mt-24 text-center">
            <div className="p-8">
                <Sparkles className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">AI-Powered</h3>
                <p className="mt-2 text-gray-600">Our smart AI analyzes your ingredients to generate creative and easy-to-follow recipes in seconds.</p>
            </div>
             <div className="p-8">
                <Zap className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Quick & Easy</h3>
                <p className="mt-2 text-gray-600">No more decision fatigue. Get instant inspiration and clear instructions for your next meal.</p>
            </div>
             <div className="p-8">
                <Users className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">For Bachelors</h3>
                <p className="mt-2 text-gray-600">Recipes are tailored for single servings, perfect for students and young professionals.</p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;