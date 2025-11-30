interface HeatMapProps {
  data: {
    skill: string;
    demand: number;
    salary: number;
    growth: number;
  }[];
}

export default function HeatMap({ data }: HeatMapProps) {
  const getHeatColor = (value: number) => {
    if (value >= 90) return 'bg-emerald-600';
    if (value >= 75) return 'bg-emerald-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 45) return 'bg-yellow-500';
    if (value >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatSalary = (salary: number) => {
    return `$${(salary / 1000).toFixed(0)}K`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
              Skill
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
              Market Demand
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
              Avg Salary
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b-2 border-gray-300">
              Growth Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">
                {item.skill}
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 max-w-[120px] overflow-hidden">
                    <div
                      className={`h-full ${getHeatColor(item.demand)} transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold`}
                      style={{ width: `${item.demand}%` }}
                    >
                      {item.demand > 20 && `${item.demand}%`}
                    </div>
                  </div>
                  {item.demand <= 20 && (
                    <span className="text-xs font-semibold text-gray-600">{item.demand}%</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center border-b border-gray-200">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  {formatSalary(item.salary)}
                </span>
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 max-w-[100px] overflow-hidden">
                    <div
                      className={`h-full ${getHeatColor(Math.min(item.growth * 3, 100))} transition-all duration-500 flex items-center justify-center text-white text-xs font-semibold`}
                      style={{ width: `${Math.min(item.growth * 3, 100)}%` }}
                    >
                      {item.growth > 7 && `${item.growth.toFixed(1)}%`}
                    </div>
                  </div>
                  {item.growth <= 7 && (
                    <span className="text-xs font-semibold text-gray-600">{item.growth.toFixed(1)}%</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
