// -------------------------------------------------------------------------
// File: src/pages/CreateRecipePage.jsx (Updated)
// The main app page with a beautiful chat interface.
// -------------------------------------------------------------------------
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, UtensilsCrossed } from 'lucide-react';

const GiKnifeForkCreate = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M16 1c-2.76 0-5 2.24-5 5v17h2V6c0-1.65 1.35-3 3-3s3 1.35 3 3v16h2V6c0-2.76-2.24-5-5-5m-5 2v3h2V3zm0 5v3h2V8zm0 5v3h2v-3zm0 5v3h2v-3zM4 3v18h2V3z"></path>
  </svg>
);

const CreateRecipePage = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Welcome! What ingredients do you have in your fridge today? List them out and I'll create a recipe for you.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // This is where you will call your FastAPI backend.
    // For now, a timeout simulates the API call.
    setTimeout(() => {
      const aiMessage = {
        sender: 'ai',
        isRecipe: true,
        recipe: {
          title: 'Spicy Garlic Chicken & Rice',
          prepTime: '10 mins',
          cookTime: '20 mins',
          servings: '1',
          instructions: [
            'Cook rice as directed.',
            'Sauté chicken and garlic in a pan.',
            'Mix everything together and serve!',
          ],
        },
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-grow overflow-y-auto pr-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 mb-6 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                <GiKnifeForkCreate size={20} />
              </div>
            )}
            <div className={`max-w-lg p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-orange-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
              }`}
            >
              {msg.isRecipe ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <UtensilsCrossed className="h-6 w-6 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-900">{msg.recipe.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                    <p><strong>Prep:</strong> {msg.recipe.prepTime}</p>
                    <p><strong>Cook:</strong> {msg.recipe.cookTime}</p>
                    <p><strong>Servings:</strong> {msg.recipe.servings}</p>
                  </div>
                  <hr className="my-4" />
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {msg.recipe.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-4">
             <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                <GiKnifeForkCreate size={20} />
              </div>
            <div className="p-4 bg-white rounded-2xl rounded-bl-none border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-150" />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-300" />
                </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-6 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g., chicken, rice, onion..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipePage;
