import React from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { LogOut, PlusSquare, MessageSquare } from 'lucide-react';

// --- SVG Icon ---
const GiKnifeFork = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);


// --- Mock Authentication ---
const useAuth = () => {
  const user = { loggedIn: true, name: 'Jigyash Shukla', avatar: 'https://placehold.co/100x100/F97316/FFF8F0?text=JS' };
  return user;
};

const AuthLayout = () => {
  const { loggedIn, name, avatar } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  const chatHistory = [
    'Chicken & Rice Skillet',
    'Spicy Egg Scramble',
    'Quick Tomato Pasta',
  ];

  return (
    <div className="flex h-screen bg-[#FFF8F0]">
      {/* --- Sidebar --- */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2">
            <GiKnifeFork className="text-2xl text-orange-500" />
            <h1 className="text-xl font-bold font-display text-gray-900">
              Fridge-to-Feast
            </h1>
          </Link>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          <button className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-600 transition-all mb-6">
            <PlusSquare size={20} />
            New Recipe
          </button>

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">History</h3>
          <nav className="flex flex-col gap-1">
            {chatHistory.map((item, index) => (
              <a key={index} href="#" className="flex items-center gap-2 p-2 rounded-md text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <MessageSquare size={16} />
                <span className="truncate">{item}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-grow">
              <p className="font-semibold text-gray-800">{name}</p>
            </div>
            <button className="text-gray-500 hover:text-orange-500 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;