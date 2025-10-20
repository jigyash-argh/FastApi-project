import React, { useState } from 'react';
import NutrientCard from '../components/ui/NutrientCard';

import {
  FireIcon,     // Calories
  BoltIcon,     // Protein
  CakeIcon,     // Carbs
  BeakerIcon    // Fats
} from '@heroicons/react/24/solid';

const Dashboard = () => {
  const weeklyTotals = {
    calories: 2200,
    protein: 130,
    carbs: 280,
    fats: 70,
  };

  // User info state
  const [showAbout, setShowAbout] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    goalCalories: 2200,
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit (You can integrate API call here)
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('User details updated!'); // Replace with real update logic
    setShowAbout(false);
  };

  return (
    <div className='relative px-6 py-8'>
      {/* Header */}
      <div className='flex flex-col items-center mt-5'>
        <h1 className='text-white font-bold text-4xl'>Dashboard</h1>

        {/* About Me Button */}
        <button
          onClick={() => setShowAbout(prev => !prev)}
          className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700 text-white font-semibold"
        >
          {showAbout ? 'Close About Me' : 'About Me'}
        </button>
      </div>

      {/* About Me Section */}
      {showAbout && (
        <div className="max-w-md mx-auto mt-6 p-6 bg-gray-800 rounded shadow-md text-white">
          <h2 className="text-2xl font-semibold mb-4">User Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={userDetails.name}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={userDetails.age}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Daily Calorie Goal</label>
              <input
                type="number"
                name="goalCalories"
                value={userDetails.goalCalories}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-700 text-white"
                min="0"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 py-2 bg-green-600 rounded hover:bg-green-700 font-semibold"
            >
              Update Details
            </button>
          </form>
        </div>
      )}

      {/* Nutrient Cards with icons */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-10'>
        <NutrientCard
          label="Calories"
          value={weeklyTotals.calories}
          unit=" kcal"
          color="bg-red-500"
          icon={<FireIcon className="w-8 h-8" />}
        />
        <NutrientCard
          label="Protein"
          value={weeklyTotals.protein}
          unit="g"
          color="bg-green-500"
          icon={<BoltIcon className="w-8 h-8" />}
        />
        <NutrientCard
          label="Carbs"
          value={weeklyTotals.carbs}
          unit="g"
          color="bg-blue-500"
          icon={<CakeIcon className="w-8 h-8" />}
        />
        <NutrientCard
          label="Fats"
          value={weeklyTotals.fats}
          unit="g"
          color="bg-yellow-500"
          icon={<BeakerIcon className="w-8 h-8" />}
        />
      </div>
    </div>
  );
};

export default Dashboard;
