import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  email?: string;
  name: string;
  linkedin_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type UserSkill = {
  id: string;
  profile_id: string;
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
  is_verified: boolean;
  created_at: string;
};

export type CareerAnalysis = {
  id: string;
  profile_id: string;
  success_score: number;
  market_demand_score: number;
  skill_gaps: string[];
  recommended_paths: RecommendedPath[];
  analysis_data: Record<string, unknown>;
  share_token: string;
  created_at: string;
};

export type RecommendedPath = {
  title: string;
  description: string;
  requiredSkills: string[];
  timeline: string;
  salary_range: string;
  demand_score: number;
};

export type MarketData = {
  id: string;
  skill_name: string;
  demand_score: number;
  avg_salary: number;
  job_count: number;
  growth_rate: number;
  last_updated: string;
};

export type LearningResource = {
  id: string;
  skill_name: string;
  resource_title: string;
  resource_url: string;
  resource_type: string;
  rating: number;
  difficulty_level: string;
  created_at: string;
};
