import { PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#EF4444"];

const CircleChart = ({ value, segments }) => {
  const data = [
    { name: "Pending", value: segments.pending },
    { name: "Approved", value: segments.approved },
    { name: "Rejected", value: segments.rejected },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Staff Applications Card</h3>
      <PieChart width={260} height={260}>
        <Pie
          data={data}
          cx={130}
          cy={130}
          innerRadius={50}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
      <p className="text-center font-bold text-xl mt-2">{value} Total Applications</p>
    </div>
  );
};

export default CircleChart;
