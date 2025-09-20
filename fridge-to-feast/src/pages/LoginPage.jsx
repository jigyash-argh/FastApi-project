import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import axios from 'axios'; // 1. Import axios

// Your GoogleIcon component remains the same
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-.83 0-1.5.67-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
      <path d="M12 22s-8-4-8-10c0-5.52 4.48-10 10-10s10 4.48 10 10c0 6-8 10-8 10z"/>
      <g transform="translate(4,4)">
        <path d="M11.5,8.5H15.5V12.5H11.5z" fill="#4285F4"/>
        <path d="M8.5,11.5H12.5V15.5H8.5z" fill="#34A853"/>
        <path d="M4.5,8.5H8.5V12.5H4.5z" fill="#FBBC05"/>
        <path d="M8.5,4.5H12.5V8.5H8.5z" fill="#EA4335"/>
      </g>
    </svg>
);


const LoginPage = () => {
    // --- STATE MANAGEMENT ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- HANDLER FOR FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setLoading(true);
        const formData= new URLSearchParams();
        formData.append('username',username)
        formData.append('password',password)

        try {
            // Send POST request to the FastAPI '/token' endpoint
            const response = await axios.post('http://127.0.0.1:8000/token',formData,{headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            
            const { access_token } = response.data;
            localStorage.setItem('userToken', access_token);
            
            navigate('/create'); 

        } catch (err) {
            // Handle login errors
            if (err.response && err.response.data) {
                setError(err.response.data.detail || 'An error occurred during login.');
            } else {
                setError('Could not connect to the server. Please try again.');
            }
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    // Animation variants remain the same
    const pageVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20, duration: 0.8, staggerChildren: 0.2, }, }, };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }, };

    return (
        <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-amber-50 p-4">
            <motion.div variants={pageVariants} initial="hidden" animate="visible" className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white rounded-2xl shadow-2xl border border-slate-200/50">
                <motion.div variants={itemVariants} className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Welcome Back!</h2>
                    <p className="mt-2 text-slate-500">Log in to continue your culinary journey.</p>
                </motion.div>
                
                {/* --- Display API Error Message --- */}
                {error && (
                    <motion.div variants={itemVariants} className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        {error}
                    </motion.div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <motion.div variants={itemVariants} className="relative">
                        <label htmlFor="username" className="sr-only">Username</label>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="username" 
                            id="username" 
                            placeholder="Username"
                            value={username} // Bind state
                            onChange={(e) => setUsername(e.target.value)} // Update state
                            className="pl-12 pr-4 py-3 block w-full bg-slate-100/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300" 
                            required
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="relative">
                        <label htmlFor="password"className="sr-only">Password</label>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Password"
                            value={password} // Bind state
                            onChange={(e) => setPassword(e.target.value)} // Update state
                            className="pl-12 pr-4 py-3 block w-full bg-slate-100/80 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-300" 
                            required
                        />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <button 
                            type="submit" 
                            className="w-full py-3 px-4 font-bold text-white bg-gradient-to-r from-amber-500 to-red-500 rounded-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading} // Disable button while loading
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Logging In...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20}/>
                                    <span>Log In</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                </form>

                {/* --- The rest of your component remains the same --- */}
                <motion.div variants={itemVariants} className="relative flex items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <button
                        type="button"
                        className="w-full py-3 px-4 font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-100/80 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                </motion.div>
                
                <motion.p variants={itemVariants} className="text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-amber-600 hover:underline hover:text-red-500 transition-colors">
                        Sign up for free
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
};

export default LoginPage;