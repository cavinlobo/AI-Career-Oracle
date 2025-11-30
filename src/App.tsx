import { useState, useEffect } from 'react';
import InputForm from './components/InputForm';
import Dashboard from './components/Dashboard';
import { supabase, UserSkill, CareerAnalysis, MarketData, LearningResource } from './lib/supabase';
import { extractSkillsFromText, parseLinkedInProfile, estimateProficiencyLevel, estimateYearsOfExperience } from './utils/skillExtractor';
import { calculateSuccessScore, identifySkillGaps, generateCareerPaths } from './utils/mlPredictor';

function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadMarketData();
    checkSharedAnalysis();
  }, []);

  const loadMarketData = async () => {
    const { data: market } = await supabase
      .from('market_data')
      .select('*')
      .order('demand_score', { ascending: false });

    const { data: resources } = await supabase
      .from('learning_resources')
      .select('*');

    if (market) setMarketData(market);
    if (resources) setLearningResources(resources);
  };

  const checkSharedAnalysis = async () => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');

    if (shareToken) {
      setLoading(true);
      const { data: sharedAnalysis } = await supabase
        .from('career_analyses')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      if (sharedAnalysis) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', sharedAnalysis.profile_id)
          .maybeSingle();

        const { data: skills } = await supabase
          .from('user_skills')
          .select('*')
          .eq('profile_id', sharedAnalysis.profile_id);

        if (profile && skills) {
          setAnalysis(sharedAnalysis as CareerAnalysis);
          setUserSkills(skills as UserSkill[]);
          setUserName(profile.name);
        }
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (data: { name: string; skills: string; isLinkedIn: boolean }) => {
    setLoading(true);
    try {
      let extractedSkills;
      let profileName = data.name;

      if (data.isLinkedIn) {
        const parsed = parseLinkedInProfile(data.skills);
        extractedSkills = parsed.skills;
        profileName = parsed.name || data.name;
      } else {
        extractedSkills = extractSkillsFromText(data.skills);
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          name: profileName,
          linkedin_data: data.isLinkedIn ? { raw: data.skills } : {}
        })
        .select()
        .single();

      if (profileError || !profile) {
        console.error('Profile creation error:', profileError);
        setLoading(false);
        return;
      }

      const skillsToInsert = extractedSkills.map(skill => ({
        profile_id: profile.id,
        skill_name: skill.name,
        proficiency_level: estimateProficiencyLevel(skill),
        years_experience: estimateYearsOfExperience(data.skills, skill.name),
        is_verified: false
      }));

      const { data: insertedSkills } = await supabase
        .from('user_skills')
        .insert(skillsToInsert)
        .select();

      if (!insertedSkills) {
        setLoading(false);
        return;
      }

      const prediction = calculateSuccessScore(insertedSkills as UserSkill[], marketData);
      const skillGaps = identifySkillGaps(insertedSkills as UserSkill[], marketData);
      const careerPaths = generateCareerPaths(insertedSkills as UserSkill[], marketData);

      const { data: newAnalysis } = await supabase
        .from('career_analyses')
        .insert({
          profile_id: profile.id,
          success_score: prediction.successScore,
          market_demand_score: prediction.marketDemandScore,
          skill_gaps: skillGaps,
          recommended_paths: careerPaths,
          analysis_data: {
            careerReadinessScore: prediction.careerReadinessScore,
            factors: prediction.factors
          }
        })
        .select()
        .single();

      if (newAnalysis) {
        setAnalysis(newAnalysis as CareerAnalysis);
        setUserSkills(insertedSkills as UserSkill[]);
        setUserName(profileName);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setUserSkills([]);
    setUserName('User');
    window.history.pushState({}, '', window.location.pathname);
  };

  if (analysis && userSkills.length > 0) {
    return (
      <Dashboard
        analysis={analysis}
        userSkills={userSkills}
        marketData={marketData}
        learningResources={learningResources}
        userName={userName}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <InputForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

export default App;
