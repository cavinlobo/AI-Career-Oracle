import { useState } from 'react';
import { Share2, Download, BookOpen, TrendingUp, Target, Award } from 'lucide-react';
import SuccessScore from './SuccessScore';
import RadarChart from './RadarChart';
import HeatMap from './HeatMap';
import RoadmapTimeline from './RoadmapTimeline';
import { CareerAnalysis, UserSkill, MarketData, LearningResource } from '../lib/supabase';

interface DashboardProps {
  analysis: CareerAnalysis;
  userSkills: UserSkill[];
  marketData: MarketData[];
  learningResources: LearningResource[];
  userName: string;
  onReset: () => void;
}

export default function Dashboard({
  analysis,
  userSkills,
  marketData,
  learningResources,
  userName,
  onReset
}: DashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?share=${analysis.share_token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    const exportData = {
      userName,
      analysisDate: new Date(analysis.created_at).toLocaleDateString(),
      successScore: analysis.success_score,
      marketDemandScore: analysis.market_demand_score,
      skills: userSkills.map(s => ({
        name: s.skill_name,
        proficiency: s.proficiency_level,
        experience: s.years_experience
      })),
      skillGaps: analysis.skill_gaps,
      recommendedPaths: analysis.recommended_paths
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const factors = (analysis.analysis_data as { factors?: Record<string, number> })?.factors || {};
  const radarData = [
    { label: 'Skill Diversity', value: factors.skillDiversity || 0 },
    { label: 'Market Alignment', value: factors.marketAlignment || 0 },
    { label: 'Experience', value: factors.experienceLevel || 0 },
    { label: 'Trending Skills', value: factors.trendingSkills || 0 },
    { label: 'High Value Skills', value: factors.highValueSkills || 0 }
  ];

  const topSkillsWithMarket = userSkills
    .map(skill => {
      const market = marketData.find(m => m.skill_name.toLowerCase() === skill.skill_name.toLowerCase());
      return {
        skill: skill.skill_name,
        demand: market?.demand_score || 0,
        salary: market?.avg_salary || 0,
        growth: market?.growth_rate || 0
      };
    })
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 10);

  const skillGapResources = analysis.skill_gaps.slice(0, 5).map(gap => {
    const resources = learningResources.filter(
      r => r.skill_name.toLowerCase() === gap.toLowerCase()
    );
    return { skill: gap, resources };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {userName}'s Career Analysis
              </h1>
              <p className="text-gray-600">
                Generated on {new Date(analysis.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SuccessScore score={analysis.success_score} label="Success Score" />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SuccessScore score={analysis.market_demand_score} label="Market Demand" />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <SuccessScore
              score={(analysis.analysis_data as { careerReadinessScore?: number })?.careerReadinessScore || 0}
              label="Career Readiness"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Skill Assessment</h2>
            </div>
            <RadarChart data={radarData} size={320} />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <Award className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Skill Gaps</h2>
            </div>
            <div className="space-y-3">
              {analysis.skill_gaps.slice(0, 8).map((gap, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                >
                  <span className="font-semibold text-gray-800">{gap}</span>
                  <span className="text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold">
                    HIGH DEMAND
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Market Demand Heatmap</h2>
          </div>
          <HeatMap data={topSkillsWithMarket} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recommended Career Paths</h2>
          </div>
          <RoadmapTimeline
            paths={analysis.recommended_paths}
            currentSkills={userSkills.map(s => s.skill_name)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Learning Resources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGapResources.map((item, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 transition-colors">
                <h3 className="font-bold text-lg text-gray-900 mb-3">{item.skill}</h3>
                {item.resources.length > 0 ? (
                  <div className="space-y-2">
                    {item.resources.slice(0, 2).map((resource, rIdx) => (
                      <a
                        key={rIdx}
                        href={resource.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <div className="font-semibold text-sm text-blue-900 mb-1">
                          {resource.resource_title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="bg-blue-200 px-2 py-0.5 rounded">
                            {resource.resource_type}
                          </span>
                          <span className="bg-gray-200 px-2 py-0.5 rounded">
                            {resource.difficulty_level}
                          </span>
                          <span>⭐ {resource.rating.toFixed(1)}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Search online for learning resources</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
