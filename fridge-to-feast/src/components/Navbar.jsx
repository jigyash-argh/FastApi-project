import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const KnifeForkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-orange-500"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 11h14l-1 -7h-12z" />
    <path d="M7 11v11" />
    <path d="M17 11v11" />
    <path d="M12 11v11" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="black"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-7 w-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="black"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const navLinks = [
  { title: "Home", path: "/" },
  { title: "App", path: "/create" },
  { title: "About", path: "/about" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const menuVariants = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 80, damping: 18, staggerChildren: 0.1 },
    },
    exit: { x: "100%", transition: { duration: 0.3 } },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="sticky top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-gray-200 shadow-md"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <KnifeForkIcon />
              <h1 className="text-2xl font-bold font-display tracking-wider">
                Fridge-to-Feast
              </h1>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <motion.div
                key={link.title}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `relative text-lg font-medium transition-colors duration-300 group ${
                      isActive ? "text-orange-500" : "text-black hover:text-orange-500"
                    }`
                  }
                >
                  {link.title}
                  <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Login & Signup shifted more right */}
          <div className="hidden md:flex items-center gap-6 ml-12">
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md transition-all duration-300 text-2xl text-black hover:bg-orange-600 hover:text-white"
              >
                Login
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }}>
              <Link
                to="/signup"
                className="bg-orange-500 text-white font-bold py-2 px-5 text-2xl rounded-full transition-all duration-300 shadow-md shadow-orange-500/30 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-500"
              >
                Sign Up
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-black text-3xl">
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-30 md:hidden"
              onClick={toggleMobileMenu}
            ></motion.div>

            {/* Sidebar */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-40 flex flex-col items-center pt-24 shadow-xl"
            >
              {navLinks.map((link) => (
                <motion.div key={link.title} variants={linkVariants} className="w-full text-center">
                  <NavLink
                    to={link.path}
                    onClick={toggleMobileMenu}
                    className={({ isActive }) =>
                      `block py-4 text-2xl font-semibold transition-colors duration-300 ${
                        isActive ? "text-orange-500" : "text-black hover:text-orange-500"
                      }`
                    }
                  >
                    {link.title}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div variants={linkVariants} className="mt-10 w-full px-8">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/login"
                    onClick={toggleMobileMenu}
                    className="block w-full text-center py-3 text-lg font-semibold text-black rounded-md hover:bg-orange-100 hover:text-orange-600 transition-all duration-300"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/signup"
                    onClick={toggleMobileMenu}
                    className="block w-full text-center bg-orange-500 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-500 text-white font-bold py-3 px-5 rounded-full transition-all duration-300 mt-4 shadow-md shadow-orange-500/30"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
