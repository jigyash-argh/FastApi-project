import React from 'react';
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, PlusSquare, MessageSquare, ChefHat, FlashlightOff } from 'lucide-react';

// --- Mock Authentication Hook ---
// In a real app, this would involve context or a state management library.
const useAuth = () => {

  const user = { loggedIn: true, name: 'Jigyash Shukla', avatar: 'https://placehold.co/100x100/F97316/FFF8F0?text=JS' };
  return user;
};

const AuthLayout = () => {
  const { loggedIn, name, avatar } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  // --- Mock Chat History Data ---
  const chatHistory = [
    'Spicy Chicken & Rice Skillet',
    'Quick Tomato & Basil Pasta',
    'Cheesy Egg Scramble Delight',
    'Garlic Butter Shrimp',
    'Hearty Vegetable Soup',
  ];

  // --- Animation Variants for Framer Motion ---
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="absolute left-0 bottom-0 right-0 top-0 flex bg-slate-50">
      {/* --- Animated Sidebar --- */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-72 flex-shrink-0 bg-white border-r border-slate-200/80 flex flex-col shadow-lg"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="h-20 flex items-center justify-center border-b border-slate-200/80">
          <Link to="/" className="flex items-center gap-2 group">
            <ChefHat className="h-8 w-8 text-amber-500 transition-transform duration-500 ease-out group-hover:rotate-[360deg]" />
            <h1 className="text-2xl font-bold font-display tracking-wide text-slate-900 group-hover:text-amber-600 transition-colors">
              Fridge-to-Feast
            </h1>
          </Link>
        </motion.div>
        
        {/* Main Sidebar Content */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar min-h-0">
          <motion.div variants={itemVariants}>
            <Link
              to="/create"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all mb-8 shadow-lg"
            >
              <PlusSquare size={20} />
              New Recipe
            </Link>
          </motion.div>

          <motion.h3 variants={itemVariants} className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            History
          </motion.h3>
          <nav className="flex flex-col gap-1">
            {chatHistory.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <NavLink
                  to={`/chat/${index}`} // Example dynamic route
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-md text-slate-600 transition-all duration-200 ${
                      isActive 
                        ? 'bg-amber-100/80 text-amber-700 font-semibold' 
                        : 'hover:bg-amber-100/50 hover:text-amber-600'
                    }`
                  }
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{item}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <motion.div variants={itemVariants} className="p-4 border-t border-slate-200/80">
          <div className="flex items-center gap-3">
            <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-amber-200" />
            <div className="flex-grow">
              <p className="font-semibold text-slate-800 text-sm">{name}</p>
              <p className="text-xs text-slate-500">Welcome Back!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100/50"
              aria-label="Log Out"
            >
              <LogOut size={20} />
            </motion.button>
          </div>
        </motion.div>
      </motion.aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
