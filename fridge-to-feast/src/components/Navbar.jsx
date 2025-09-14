import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Menu, X, LogIn } from "lucide-react";

// --- Configuration for Navigation Links ---
const navLinks = [
  { title: "Home", path: "/" },
  { title: "Create Recipe", path: "/create" },
  { title: "About", path: "/about" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- UX FEATURE: Lock body scroll when mobile menu is open ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to reset scroll on component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // --- Animation Variants for Framer Motion ---
  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const mobileMenuVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 150, damping: 25, staggerChildren: 0.08 },
    },
    exit: { x: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <>
      <motion.nav
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="sticky top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* --- Logo --- */}
          <motion.div variants={navItemVariants}>
            <Link to="/" className="flex items-center gap-2 group">
              <ChefHat className="h-8 w-8 text-amber-500 transition-transform duration-500 ease-out group-hover:rotate-[360deg]" />
              <h1 className="text-2xl font-bold font-display tracking-wide text-slate-900 group-hover:text-amber-600 transition-colors">
                Fridge-to-Feast
              </h1>
            </Link>
          </motion.div>

          {/* --- Desktop Navigation with enhanced hover effect --- */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <motion.div key={link.title} variants={navItemVariants}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative text-lg font-medium transition-colors duration-300 py-2 px-4 rounded-lg ${
                      isActive ? "text-white bg-amber-500" : "text-slate-700 hover:text-amber-600"
                    }`
                  }
                >
                  {link.title}
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* --- Desktop Auth Buttons with enhanced hover effects --- */}
          <div className="hidden md:flex items-center gap-4">
            <motion.div variants={navItemVariants}>
              <Link
                to="/login"
                className="flex items-center gap-2 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-amber-100/50 transition-all duration-300 group"
              >
                <LogIn size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                Login
              </Link>
            </motion.div>
            <motion.div variants={navItemVariants}>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold py-2.5 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>

          {/* --- Mobile Menu Button --- */}
          <div className="md:hidden">
            <motion.button whileTap={{ scale: 0.85 }} onClick={toggleMobileMenu} aria-label="Open mobile menu">
              <Menu className="h-7 w-7 text-slate-900" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={toggleMobileMenu}
            ></motion.div>

            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-slate-100 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex justify-end">
                <motion.button whileTap={{ scale: 0.85 }} onClick={toggleMobileMenu} aria-label="Close mobile menu">
                    <X className="h-8 w-8 text-slate-700" />
                </motion.button>
              </div>
              <div className="flex flex-col items-center justify-center h-full gap-8 -mt-16">
                {navLinks.map((link) => (
                  <motion.div key={link.title} variants={navItemVariants}>
                    <NavLink
                      to={link.path}
                      onClick={toggleMobileMenu}
                      className={({ isActive }) =>
                        `text-3xl font-semibold transition-colors duration-300 py-2 px-4 rounded-md ${
                          isActive ? "text-amber-600 bg-amber-100" : "text-slate-800 hover:text-amber-600"
                        }`
                      }
                    >
                      {link.title}
                    </NavLink>
                  </motion.div>
                ))}
                <motion.div variants={navItemVariants} className="mt-12 w-full px-8">
                  <Link
                      to="/login"
                      onClick={toggleMobileMenu}
                      className="block w-full text-center py-4 text-xl font-semibold text-slate-700 bg-slate-200/80 rounded-lg hover:bg-slate-300 transition-all duration-300"
                  >
                      Login
                  </Link>
                  <Link
                      to="/signup"
                      onClick={toggleMobileMenu}
                      className="block w-full text-center bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold py-4 text-xl rounded-lg transition-all duration-300 mt-4 shadow-lg hover:shadow-red-500/40 hover:scale-105 transform"
                  >
                      Sign Up
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

