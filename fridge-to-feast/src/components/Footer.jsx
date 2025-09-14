import React from 'react';
import { Link } from 'react-router-dom';
import { GiKnifeFork } from 'react-icons/gi';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GiKnifeFork className="text-3xl text-orange-500" />
              <h1 className="text-2xl font-bold font-display text-gray-900">
                Fridge-to-Feast
              </h1>
            </Link>
            <p className="text-gray-600 text-center md:text-left">
              Turning your leftovers into delicious masterpieces.
            </p>
          </div>
          <div className="flex justify-center gap-8 text-gray-600 font-semibold">
            <Link to="/about" className="hover:text-orange-500 transition-colors">About</Link>
            <Link to="/app" className="hover:text-orange-500 transition-colors">Create</Link>
            <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
          </div>
          <div className="text-center md:text-right text-gray-500">
            &copy; {new Date().getFullYear()} Fridge-to-Feast. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;