import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No revenue data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold mb-2">{payload[0].payload.monthName}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="monthName" 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#9ca3af"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <DataComponent 
          type="monotone" 
          dataKey="paid" 
          stroke="#10b981" 
          fill="#10b981"
          strokeWidth={2}
          name="Paid"
        />
        <DataComponent 
          type="monotone" 
          dataKey="pending" 
          stroke="#f59e0b" 
          fill="#f59e0b"
          strokeWidth={2}
          name="Pending"
        />
        <DataComponent 
          type="monotone" 
          dataKey="overdue" 
          stroke="#ef4444" 
          fill="#ef4444"
          strokeWidth={2}
          name="Overdue"
        />
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
