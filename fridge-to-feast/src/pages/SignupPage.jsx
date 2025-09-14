import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const SignupPage = () => {
  return (
    <div className="bg-[#FFF8F0] min-h-screen">
      <Navbar />
      <div className="flex items-center justify-center py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900">Create an Account</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
              <input type="text" id="name" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
              <input type="email" id="email" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label htmlFor="password"className="text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <button type="submit" className="w-full py-3 px-4 font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all">
              Sign Up
            </button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-orange-500 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;