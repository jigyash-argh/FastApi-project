import React, { useState, useEffect } from 'react';
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, PlusSquare, MessageSquare, ChefHat, ChevronsLeft, Trash2, X } from 'lucide-react';
import axios from 'axios';

const AuthLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setLoading(false);
        return; // No token, user will be redirected
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // If token is invalid, clear it and redirect
        localStorage.removeItem('userToken');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const response = await axios.get('http://127.0.0.1:8000/history', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setChatHistory(response.data.map(item => item.title));
        } catch (error) {
          console.error("Failed to fetch history:", error);
        }
      }
    };

    fetchHistory();
  }, []);

  const handleNewRecipe = async () => {
    const chatName = prompt("Please enter a name for your new recipe chat:");
    if (chatName) {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          await axios.post('http://127.0.0.1:8000/history', { title: chatName }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setChatHistory([chatName, ...chatHistory]);
          navigate('/chat');
        } catch (error) {
          console.error("Failed to create history item:", error);
        }
      }
    }
  };

  const handleSelectToggle = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedChats([]);
  };

  const handleChatSelect = (title) => {
    setSelectedChats(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleDeleteSelected = async () => {
    const token = localStorage.getItem('userToken');
    if (token && selectedChats.length > 0) {
      try {
        await axios.delete('http://127.0.0.1:8000/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { titles: selectedChats },
        });
        setChatHistory(prev => prev.filter(chat => !selectedChats.includes(chat)));
        setIsSelectMode(false);
        setSelectedChats([]);
      } catch (error) {
        console.error("Failed to delete chat history:", error);
      }
    }
  };

  // --- Animation Variants for Framer Motion ---
  const sidebarVariants = {
    collapsed: { width: '80px', transition: { duration: 0.3, ease: 'easeInOut' } },
    expanded: { width: '288px', transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

if (loading) {
  return (
    <div className="flex items-center justify-center h-screen space-x-2">
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.6s]"></div>
    </div>
  );
}


  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="absolute left-0 bottom-0 right-0 top-0 flex bg-slate-50 dark:bg-gray-800">
      {/* --- Animated Sidebar --- */}
      <motion.aside
        variants={sidebarVariants}
        initial="expanded"
        animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
        className="relative bg-white dark:bg-gray-900 border-r border-slate-200/80 dark:border-gray-700 flex flex-col shadow-lg"
      >
        {/* Collapse Button */}
        <motion.button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-1/2 z-10 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronsLeft size={16} />
          </motion.div>
        </motion.button>

        {/* Logo */}
        <motion.div variants={itemVariants} className="h-20 flex items-center justify-center border-b border-slate-200/80 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 group">
            <ChefHat className="h-8 w-8 text-amber-500 transition-transform duration-500 ease-out group-hover:rotate-[360deg]" />
            {!isSidebarCollapsed && (
              <h1 className="text-2xl font-bold font-display tracking-wide text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Fridge-to-Feast
              </h1>
            )}
          </Link>
        </motion.div>
        
        {/* Main Sidebar Content */}
        <div className="flex-grow p-4 overflow-y-auto custom-scrollbar min-h-0">
          <motion.div variants={itemVariants}>
            <button
              onClick={handleNewRecipe}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all mb-8 shadow-lg"
            >
              <PlusSquare size={20} />
              {!isSidebarCollapsed && 'New Recipe'}
            </button>
          </motion.div>

          {!isSidebarCollapsed && (
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                History
              </h3>
              <button onClick={handleSelectToggle} className="text-sm text-amber-600 hover:text-amber-800 font-semibold">
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
            </motion.div>
          )}
          <nav className="flex flex-col gap-1">
            {chatHistory.map((item, index) => (
              <motion.div key={index} variants={itemVariants} className="flex items-center gap-2">
                {isSelectMode && !isSidebarCollapsed && (
                  <input
                    type="checkbox"
                    checked={selectedChats.includes(item)}
                    onChange={() => handleChatSelect(item)}
                    className="form-checkbox h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                )}
                <NavLink
                  to={`/chat/${encodeURIComponent(item)}`}
                  className={({ isActive }) =>
                    `flex-grow flex items-center gap-3 p-2.5 rounded-md text-slate-600 dark:text-gray-300 transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-100/80 text-amber-700 font-semibold dark:bg-gray-700 dark:text-amber-400'
                        : 'hover:bg-amber-100/50 hover:text-amber-600 dark:hover:bg-gray-700/50 dark:hover:text-amber-400'
                    }`
                  }
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate text-sm font-medium">{item}</span>}
                </NavLink>
              </motion.div>
            ))}
          </nav>
          {isSelectMode && !isSidebarCollapsed && (
            <motion.div variants={itemVariants} className="mt-4">
              <button
                onClick={handleDeleteSelected}
                disabled={selectedChats.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-all"
              >
                <Trash2 size={16} />
                Delete ({selectedChats.length})
              </button>
            </motion.div>
          )}
        </div>

        {/* User Profile Section */}
        <motion.div variants={itemVariants} className="p-4 border-t border-slate-200/80 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src={`https://placehold.co/100x100/F97316/FFF8F0?text=${user.username.charAt(0).toUpperCase()}`} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-amber-200" />
            {!isSidebarCollapsed && (
              <div className="flex-grow">
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{user.username}</p>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100/50 dark:hover:bg-gray-700"
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
