import React from "react";

const NutrientCard = ({ label, value, unit = "", color = "bg-indigo-500", icon = null }) => {
  return (
    <div className={`p-5 rounded-xl shadow-md text-white ${color} flex items-center justify-between md:h-48`}>
      <div>
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-2xl font-bold">{value}{unit}</p>
      </div>
      {icon && <div className="text-white text-4xl">{icon}</div>}
    </div>
  );
};

export default NutrientCard;
