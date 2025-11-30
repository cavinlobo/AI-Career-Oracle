import { UserSkill, MarketData } from '../lib/supabase';

export interface PredictionResult {
  successScore: number;
  marketDemandScore: number;
  careerReadinessScore: number;
  factors: {
    skillDiversity: number;
    marketAlignment: number;
    experienceLevel: number;
    trendingSkills: number;
    highValueSkills: number;
  };
}

export function calculateSuccessScore(
  userSkills: UserSkill[],
  marketData: MarketData[]
): PredictionResult {
  const marketMap = new Map(marketData.map(m => [m.skill_name.toLowerCase(), m]));

  const skillDiversity = calculateSkillDiversity(userSkills);
  const marketAlignment = calculateMarketAlignment(userSkills, marketMap);
  const experienceLevel = calculateExperienceLevel(userSkills);
  const trendingSkills = calculateTrendingSkillsScore(userSkills, marketMap);
  const highValueSkills = calculateHighValueSkillsScore(userSkills, marketMap);

  const weights = {
    skillDiversity: 0.15,
    marketAlignment: 0.30,
    experienceLevel: 0.20,
    trendingSkills: 0.20,
    highValueSkills: 0.15
  };

  const successScore = Math.round(
    skillDiversity * weights.skillDiversity +
    marketAlignment * weights.marketAlignment +
    experienceLevel * weights.experienceLevel +
    trendingSkills * weights.trendingSkills +
    highValueSkills * weights.highValueSkills
  );

  const marketDemandScore = Math.round((marketAlignment + trendingSkills) / 2);

  const careerReadinessScore = Math.round(
    (successScore * 0.6) + (experienceLevel * 0.4)
  );

  return {
    successScore: Math.min(100, Math.max(0, successScore)),
    marketDemandScore: Math.min(100, Math.max(0, marketDemandScore)),
    careerReadinessScore: Math.min(100, Math.max(0, careerReadinessScore)),
    factors: {
      skillDiversity: Math.round(skillDiversity),
      marketAlignment: Math.round(marketAlignment),
      experienceLevel: Math.round(experienceLevel),
      trendingSkills: Math.round(trendingSkills),
      highValueSkills: Math.round(highValueSkills)
    }
  };
}

function calculateSkillDiversity(userSkills: UserSkill[]): number {
  if (userSkills.length === 0) return 0;

  const uniqueSkills = new Set(userSkills.map(s => s.skill_name.toLowerCase()));
  const skillCount = uniqueSkills.size;

  let diversityScore = 0;
  if (skillCount >= 15) diversityScore = 100;
  else if (skillCount >= 10) diversityScore = 85;
  else if (skillCount >= 7) diversityScore = 70;
  else if (skillCount >= 5) diversityScore = 55;
  else if (skillCount >= 3) diversityScore = 40;
  else diversityScore = 25;

  const avgProficiency = userSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / userSkills.length;
  const proficiencyBonus = (avgProficiency - 3) * 5;

  return Math.min(100, diversityScore + proficiencyBonus);
}

function calculateMarketAlignment(
  userSkills: UserSkill[],
  marketMap: Map<string, MarketData>
): number {
  if (userSkills.length === 0) return 0;

  let totalAlignment = 0;
  let matchedSkills = 0;

  userSkills.forEach(skill => {
    const marketInfo = marketMap.get(skill.skill_name.toLowerCase());
    if (marketInfo) {
      const proficiencyWeight = skill.proficiency_level / 5;
      const demandWeight = marketInfo.demand_score / 100;
      totalAlignment += (demandWeight * 70 + proficiencyWeight * 30) * 100;
      matchedSkills++;
    }
  });

  if (matchedSkills === 0) return 30;

  const averageAlignment = totalAlignment / matchedSkills;
  const coverageBonus = (matchedSkills / userSkills.length) * 15;

  return Math.min(100, averageAlignment + coverageBonus);
}

function calculateExperienceLevel(userSkills: UserSkill[]): number {
  if (userSkills.length === 0) return 0;

  const totalYears = userSkills.reduce((sum, s) => sum + (s.years_experience || 0), 0);
  const avgYears = totalYears / userSkills.length;

  let experienceScore = 0;
  if (avgYears >= 8) experienceScore = 100;
  else if (avgYears >= 5) experienceScore = 85;
  else if (avgYears >= 3) experienceScore = 70;
  else if (avgYears >= 2) experienceScore = 55;
  else if (avgYears >= 1) experienceScore = 40;
  else experienceScore = 25;

  const avgProficiency = userSkills.reduce((sum, s) => sum + s.proficiency_level, 0) / userSkills.length;
  const proficiencyBonus = (avgProficiency - 3) * 8;

  return Math.min(100, experienceScore + proficiencyBonus);
}

function calculateTrendingSkillsScore(
  userSkills: UserSkill[],
  marketMap: Map<string, MarketData>
): number {
  if (userSkills.length === 0) return 0;

  const trendingThreshold = 15;
  let trendingScore = 0;
  let trendingCount = 0;

  userSkills.forEach(skill => {
    const marketInfo = marketMap.get(skill.skill_name.toLowerCase());
    if (marketInfo && marketInfo.growth_rate >= trendingThreshold) {
      const proficiencyWeight = skill.proficiency_level / 5;
      const growthWeight = Math.min(marketInfo.growth_rate / 30, 1);
      trendingScore += (growthWeight * 60 + proficiencyWeight * 40) * 100;
      trendingCount++;
    }
  });

  if (trendingCount === 0) return 30;

  const avgTrendingScore = trendingScore / trendingCount;
  const coverageBonus = Math.min((trendingCount / 5) * 20, 20);

  return Math.min(100, avgTrendingScore + coverageBonus);
}

function calculateHighValueSkillsScore(
  userSkills: UserSkill[],
  marketMap: Map<string, MarketData>
): number {
  if (userSkills.length === 0) return 0;

  const highValueThreshold = 120000;
  let valueScore = 0;
  let highValueCount = 0;

  userSkills.forEach(skill => {
    const marketInfo = marketMap.get(skill.skill_name.toLowerCase());
    if (marketInfo && marketInfo.avg_salary >= highValueThreshold) {
      const proficiencyWeight = skill.proficiency_level / 5;
      const salaryWeight = Math.min(marketInfo.avg_salary / 150000, 1);
      valueScore += (salaryWeight * 60 + proficiencyWeight * 40) * 100;
      highValueCount++;
    }
  });

  if (highValueCount === 0) return 25;

  const avgValueScore = valueScore / highValueCount;
  const coverageBonus = Math.min((highValueCount / 5) * 25, 25);

  return Math.min(100, avgValueScore + coverageBonus);
}

export function identifySkillGaps(
  userSkills: UserSkill[],
  marketData: MarketData[],
  targetRole?: string
): string[] {
  const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));

  const topMarketSkills = marketData
    .filter(m => m.demand_score >= 75)
    .sort((a, b) => {
      const scoreA = a.demand_score * 0.4 + a.growth_rate * 0.3 + (a.avg_salary / 2000) * 0.3;
      const scoreB = b.demand_score * 0.4 + b.growth_rate * 0.3 + (b.avg_salary / 2000) * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, 20);

  const gaps: string[] = [];

  topMarketSkills.forEach(skill => {
    if (!userSkillNames.has(skill.skill_name.toLowerCase())) {
      gaps.push(skill.skill_name);
    }
  });

  return gaps.slice(0, 10);
}

export function generateCareerPaths(
  userSkills: UserSkill[],
  marketData: MarketData[]
): Array<{
  title: string;
  description: string;
  requiredSkills: string[];
  timeline: string;
  salary_range: string;
  demand_score: number;
}> {
  const userSkillNames = new Set(userSkills.map(s => s.skill_name.toLowerCase()));
  const marketMap = new Map(marketData.map(m => [m.skill_name.toLowerCase(), m]));

  const paths = [
    {
      title: 'Senior Full-Stack Developer',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'SQL', 'REST API'],
      description: 'Lead development of web applications with modern technologies',
      timeline: '6-12 months',
      salary_range: '$120,000 - $160,000',
      baseScore: 85
    },
    {
      title: 'Machine Learning Engineer',
      requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'SQL'],
      description: 'Build and deploy ML models for production systems',
      timeline: '12-18 months',
      salary_range: '$140,000 - $180,000',
      baseScore: 92
    },
    {
      title: 'DevOps Engineer',
      requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Python', 'Linux'],
      description: 'Manage infrastructure and automate deployment pipelines',
      timeline: '8-14 months',
      salary_range: '$125,000 - $165,000',
      baseScore: 88
    },
    {
      title: 'Cloud Solutions Architect',
      requiredSkills: ['AWS', 'Cloud Computing', 'Kubernetes', 'Microservices', 'System Design'],
      description: 'Design scalable cloud architecture for enterprise systems',
      timeline: '12-24 months',
      salary_range: '$150,000 - $200,000',
      baseScore: 90
    },
    {
      title: 'Frontend Architect',
      requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Performance Optimization'],
      description: 'Lead frontend architecture and mentor development teams',
      timeline: '6-10 months',
      salary_range: '$130,000 - $170,000',
      baseScore: 82
    }
  ];

  return paths.map(path => {
    const matchingSkills = path.requiredSkills.filter(skill =>
      userSkillNames.has(skill.toLowerCase())
    );
    const matchRate = matchingSkills.length / path.requiredSkills.length;

    const avgDemand = path.requiredSkills.reduce((sum, skill) => {
      const market = marketMap.get(skill.toLowerCase());
      return sum + (market?.demand_score || 50);
    }, 0) / path.requiredSkills.length;

    const demandScore = Math.round(path.baseScore * 0.6 + avgDemand * 0.4);

    return {
      ...path,
      demand_score: demandScore,
      matchRate
    };
  })
    .sort((a, b) => b.matchRate - a.matchRate || b.demand_score - a.demand_score)
    .slice(0, 5);
}
