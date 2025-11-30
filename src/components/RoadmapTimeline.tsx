import { CheckCircle, Circle, TrendingUp } from 'lucide-react';

interface RoadmapTimelineProps {
  paths: {
    title: string;
    description: string;
    requiredSkills: string[];
    timeline: string;
    salary_range: string;
    demand_score: number;
  }[];
  currentSkills: string[];
}

export default function RoadmapTimeline({ paths, currentSkills }: RoadmapTimelineProps) {
  const currentSkillsSet = new Set(currentSkills.map(s => s.toLowerCase()));

  const getMatchPercentage = (requiredSkills: string[]) => {
    const matches = requiredSkills.filter(skill =>
      currentSkillsSet.has(skill.toLowerCase())
    );
    return Math.round((matches.length / requiredSkills.length) * 100);
  };

  return (
    <div className="space-y-6">
      {paths.map((path, idx) => {
        const matchPercentage = getMatchPercentage(path.requiredSkills);

        return (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{path.description}</p>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">
                    {path.demand_score}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Demand Score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Timeline</div>
                <div className="text-sm font-semibold text-gray-900">{path.timeline}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Salary Range</div>
                <div className="text-sm font-semibold text-gray-900">{path.salary_range}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Your Progress</span>
                <span className="text-sm font-bold text-blue-600">{matchPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-gray-700 mb-3">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {path.requiredSkills.map((skill, skillIdx) => {
                  const hasSkill = currentSkillsSet.has(skill.toLowerCase());
                  return (
                    <div
                      key={skillIdx}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        hasSkill
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {hasSkill ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {skill}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
