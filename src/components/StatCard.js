// components/StatCard.jsx
const StatCard = ({ title, value, color }) => {
    return (
      <div className={`p-5 rounded-lg shadow bg-white border-l-4 ${color}`}>
        <h4 className="text-gray-600 text-sm mb-1">{title}</h4>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    );
  };
  
  export default StatCard;
  