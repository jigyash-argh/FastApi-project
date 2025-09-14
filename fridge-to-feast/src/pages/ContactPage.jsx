import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = () => {
    return (
    <div className="bg-[#FFF8F0]">
      <main className="container mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900">Get in Touch</h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="mt-16 max-w-4xl mx-auto grid md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-xl">
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
                <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-6 w-6 text-orange-500" />
                    <a href="mailto:hello@fridgetofeast.com" className="hover:text-orange-500">hello@fridgetofeast.com</a>
                </div>
                 <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-6 w-6 text-orange-500" />
                    <span>+91 123 456 7890</span>
                </div>
            </div>
            <form className="space-y-6">
                <div>
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="name" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                </div>
                 <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                </div>
                 <div>
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                    <textarea id="message" rows="4" className="mt-1 block w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:ring-orange-500 focus:border-orange-500"></textarea>
                </div>
                <button type="submit" className="w-full py-3 px-4 font-bold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all">
                    Send Message
                </button>
            </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;