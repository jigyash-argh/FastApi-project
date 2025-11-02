import React, { useEffect, useState } from 'react';
import NutrientCard from '../components/ui/NutrientCard';
import axios from 'axios';  
import {
  FireIcon,     // Calories
  BoltIcon,     // Protein
  CakeIcon,     // Carbs
  BeakerIcon,   // Fats
  UserCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  BookOpenIcon,
  ClockIcon
} from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [todayCalories, setTodayCalories] = useState(0);
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [recipesTried, setRecipesTried] = useState(0);
  const [cookingStreak, setCookingStreak] = useState(0);

  // Fetch user data and cooked recipes
  useEffect(() => {
    const get_userData = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError("Please log in to view dashboard");
        return;
      }
      try {
        setIsLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get('http://127.0.0.1:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserDetails(userResponse.data);

        // Fetch dashboard stats which includes cooked recipes
        try {
          const statsResponse = await axios.get('http://127.0.0.1:8000/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const stats = statsResponse.data;
          setTodayCalories(stats.today_calories || 0);
          setCookedRecipes(stats.today_recipes || []);
          setRecipesTried(stats.total_recipes || 0);
          setCookingStreak(stats.streak || 0);
        } catch (statsError) {
          console.log("Dashboard stats endpoint not available, using fallback data");
          // If dashboard stats endpoint fails, try the cooked-recipes endpoint
          try {
            const cookedResponse = await axios.get('http://127.0.0.1:8000/cooked-recipes/today', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            setCookedRecipes(cookedResponse.data.recipes || []);
            setTodayCalories(cookedResponse.data.total_calories || 0);
            setCookingStreak(cookedResponse.data.streak || 0);
            setRecipesTried(cookedResponse.data.total_recipes || 0);
          } catch (cookedError) {
            console.log("No cooked recipes data available");
            // Set default values if no data available
            setTodayCalories(0);
            setCookedRecipes([]);
            setRecipesTried(0);
            setCookingStreak(0);
          }
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    get_userData();
  }, []);

  // Smart weekly totals that adapt to user's calorie goal
  const getWeeklyTotals = () => {
    const baseCalories = userDetails?.goal_calories || 2200;
    return {
      calories: baseCalories,
      protein: Math.round((baseCalories * 0.3) / 4), // 30% of calories from protein
      carbs: Math.round((baseCalories * 0.5) / 4),   // 50% from carbs
      fats: Math.round((baseCalories * 0.2) / 9),    // 20% from fats
    };
  };

  const weeklyTotals = getWeeklyTotals();

  // Calculate daily progress with REAL data from cooked recipes
  const calculateDailyProgress = () => {
    const goal = userDetails?.goal_calories || 2200;
    const consumed = todayCalories; // Real data from cooked recipes
    const progress = Math.min((consumed / goal) * 100, 100);
    
    return {
      consumed,
      goal,
      progress,
      remaining: Math.max(goal - consumed, 0)
    };
  };

  const dailyProgress = calculateDailyProgress();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ 
      ...prev, 
      [name]: name === 'age' || name === 'goal_calories' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const token = localStorage.getItem("userToken");
    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validation
    if (!userDetails.email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    if (userDetails.age < 1 || userDetails.age > 120) {
      setError("Please enter a valid age");
      return;
    }

    if (userDetails.goal_calories < 500) {
      setError("Calorie goal should be at least 500");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        username: userDetails.username,
        email: userDetails.email,
        age: userDetails.age,
        goal_calories: userDetails.goal_calories,
      };

      // Only include password if it's not empty and not the placeholder
      if (password && password.trim() && password !== "*********") {
        payload.password = password;
      }

      const response = await axios.put(
        'http://127.0.0.1:8000/users/me', 
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": 'application/json',
          },
        }
      );

      setUserDetails(response.data);
      setPassword(""); // Reset password field
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        setShowAbout(false);
        setSuccess("");
      }, 2000);
      
    } catch (error) {
      console.error("Update failed:", error);
      setError(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Get calorie recommendation based on age, goal, and actual consumption
  const getCalorieRecommendation = () => {
    const age = userDetails?.age || 25;
    const goal = userDetails?.goal_calories || 2200;
    const consumed = todayCalories;
    
    if (age < 18) return "Consult a doctor for calorie recommendations";
    if (goal < 1200) return "Very low calorie goal - consider increasing for health";
    if (goal > 4000) return "High calorie goal - ensure balanced nutrition";
    
    if (consumed === 0) return "Start cooking to track your calorie intake!";
    if (consumed < goal * 0.5) return "You're below 50% of your goal - time to cook!";
    if (consumed > goal * 1.2) return "You've exceeded your goal - great cooking day!";
    if (consumed >= goal * 0.8) return "Almost at your goal - you're doing great!";
    
    return "Your calorie goal looks good! Maintain balanced macros.";
  };

  // Calculate goal completion percentage
  const calculateGoalCompletion = () => {
    const goal = userDetails?.goal_calories || 2200;
    return Math.min(Math.round((todayCalories / goal) * 100), 100);
  };

  // Format time for cooked recipes
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return "Unknown time";
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return;

    try {
      // Fetch updated dashboard stats
      const statsResponse = await axios.get('http://127.0.0.1:8000/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const stats = statsResponse.data;
      setTodayCalories(stats.today_calories || 0);
      setCookedRecipes(stats.today_recipes || []);
      setRecipesTried(stats.total_recipes || 0);
      setCookingStreak(stats.streak || 0);
    } catch (error) {
      console.log("Could not refresh dashboard data");
    }
  };

  if (isLoading && !userDetails) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-gray-900">
      <div className="min-h-full px-4 sm:px-6 py-6">
        {/* Header with User Info */}
        <div className='flex flex-col items-center mt-5'>
          <div className="flex items-center gap-3 mb-4">
            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-400" />
            <div className="text-center sm:text-left">
              <h1 className='text-white font-bold text-3xl sm:text-4xl'>Dashboard</h1>
              <p className="text-gray-400 text-sm">Welcome back, {userDetails?.username || 'User'}!</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAbout(prev => !prev)}
              className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <UserCircleIcon className="w-5 h-5" />
              {showAbout ? 'Close Profile' : 'Edit Profile'}
            </button>
            
            <button
              onClick={refreshDashboard}
              className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 text-white font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto w-full mt-6">
          {/* Daily Progress Card */}
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Today's Progress</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-400">{dailyProgress.consumed}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Consumed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">{dailyProgress.remaining}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-indigo-400">{dailyProgress.goal}</div>
                <div className="text-gray-400 text-xs sm:text-sm">Daily Goal</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 sm:h-4">
              <div 
                className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
                  dailyProgress.progress > 90 ? 'bg-red-500' : 
                  dailyProgress.progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${dailyProgress.progress}%` }}
              ></div>
            </div>
            <div className="text-center mt-2 text-xs sm:text-sm text-gray-400">
              {dailyProgress.progress.toFixed(1)}% of daily goal
            </div>
          </div>

          {/* Smart Recommendation */}
          <div className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <p className="text-white text-xs sm:text-sm font-medium">
                {getCalorieRecommendation()}
              </p>
            </div>
          </div>

          {/* Today's Cooked Recipes */}
          {cookedRecipes.length > 0 && (
            <div className="mt-6 bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Today's Cooked Recipes ({cookedRecipes.length})
              </h2>
              <div className="space-y-3">
                {cookedRecipes.map((recipe, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{recipe.recipe_name}</h3>
                      <p className="text-gray-400 text-sm">
                        Cooked at {formatTime(recipe.cooked_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">{recipe.calories} kcal</p>
                      <p className="text-gray-400 text-xs">{recipe.servings || 1} serving(s)</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                  <span className="text-white font-bold">Total Today</span>
                  <span className="text-green-400 font-bold">{todayCalories} kcal</span>
                </div>
              </div>
            </div>
          )}

          {/* Nutrient Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6'>
            <NutrientCard
              label="Calories"
              value={weeklyTotals.calories}
              unit=" kcal"
              color="bg-gradient-to-r from-red-500 to-pink-500"
              icon={<FireIcon className="w-6 h-6 sm:w-8 sm:h-8" />}
              description="Daily target"
            />
            <NutrientCard
              label="Protein"
              value={weeklyTotals.protein}
              unit="g"
              color="bg-gradient-to-r from-green-500 to-emerald-500"
              icon={<BoltIcon className="w-6 h-6 sm:w-8 sm:h-8" />}
              description="Muscle building"
            />
            <NutrientCard
              label="Carbs"
              value={weeklyTotals.carbs}
              unit="g"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
              icon={<CakeIcon className="w-6 h-6 sm:w-8 sm:h-8" />}
              description="Energy source"
            />
            <NutrientCard
              label="Fats"
              value={weeklyTotals.fats}
              unit="g"
              color="bg-gradient-to-r from-yellow-500 to-orange-500"
              icon={<BeakerIcon className="w-6 h-6 sm:w-8 sm:h-8" />}
              description="Essential nutrients"
            />
          </div>

          {/* Quick Stats - Now with REAL data */}
          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 sm:gap-6">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-white">{cookingStreak}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Days Streak</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-white">{calculateGoalCompletion()}%</div>
              <div className="text-gray-400 text-xs sm:text-sm">Goal Completion</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <BookOpenIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-white">{recipesTried}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Total Recipes</div>
            </div>
          </div>

          {/* Empty State for No Cooked Recipes */}
          {cookedRecipes.length === 0 && (
            <div className="mt-6 bg-gray-800 rounded-xl p-8 text-center">
              <div className="text-gray-400 mb-3">🍳</div>
              <h3 className="text-white font-semibold mb-2">No Recipes Cooked Today</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start cooking to track your calorie intake and see your progress here!
              </p>
              <button
                onClick={() => window.location.href = '/chat'}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                Find Recipes to Cook
              </button>
            </div>
          )}
        </div>

        {/* About Me Section - Fixed/Overlay */}
        {showAbout && userDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="max-w-md w-full max-h-[90vh] overflow-y-auto p-6 bg-gray-800 rounded-xl shadow-2xl text-white">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6" />
                Edit Profile
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={userDetails.username || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={userDetails.age || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Daily Calorie Goal</label>
                  <input
                    type="number"
                    name="goal_calories"
                    value={userDetails.goal_calories || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    min="500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    New Password (leave empty to keep current)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password to change"
                    className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Minimum 6 characters. Leave blank to keep current password.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-green-600 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAbout(false);
                      setError("");
                      setSuccess("");
                      setPassword("");
                    }}
                    className="flex-1 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 font-semibold transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;