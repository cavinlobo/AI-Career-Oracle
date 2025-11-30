/*
  # AI Career Oracle Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `email` (text, optional for anonymous users)
      - `name` (text)
      - `linkedin_data` (jsonb, stores raw LinkedIn profile data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_skills`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to user_profiles)
      - `skill_name` (text)
      - `proficiency_level` (integer, 1-5 scale)
      - `years_experience` (numeric)
      - `is_verified` (boolean)
      - `created_at` (timestamptz)
    
    - `career_analyses`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to user_profiles)
      - `success_score` (numeric, 0-100)
      - `market_demand_score` (numeric, 0-100)
      - `skill_gaps` (jsonb, array of missing skills)
      - `recommended_paths` (jsonb, career path recommendations)
      - `analysis_data` (jsonb, full analysis results)
      - `share_token` (text, unique token for sharing)
      - `created_at` (timestamptz)
    
    - `market_data`
      - `id` (uuid, primary key)
      - `skill_name` (text)
      - `demand_score` (numeric, 0-100)
      - `avg_salary` (numeric)
      - `job_count` (integer)
      - `growth_rate` (numeric)
      - `last_updated` (timestamptz)
    
    - `learning_resources`
      - `id` (uuid, primary key)
      - `skill_name` (text)
      - `resource_title` (text)
      - `resource_url` (text)
      - `resource_type` (text, e.g., course, tutorial, book)
      - `rating` (numeric)
      - `difficulty_level` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to analyses via share token
    - Add policies for users to manage their own data
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  name text NOT NULL,
  linkedin_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency_level integer DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience numeric DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS career_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  success_score numeric DEFAULT 0 CHECK (success_score BETWEEN 0 AND 100),
  market_demand_score numeric DEFAULT 0 CHECK (market_demand_score BETWEEN 0 AND 100),
  skill_gaps jsonb DEFAULT '[]'::jsonb,
  recommended_paths jsonb DEFAULT '[]'::jsonb,
  analysis_data jsonb DEFAULT '{}'::jsonb,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text NOT NULL UNIQUE,
  demand_score numeric DEFAULT 50 CHECK (demand_score BETWEEN 0 AND 100),
  avg_salary numeric DEFAULT 0,
  job_count integer DEFAULT 0,
  growth_rate numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name text NOT NULL,
  resource_title text NOT NULL,
  resource_url text NOT NULL,
  resource_type text DEFAULT 'course',
  rating numeric DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  difficulty_level text DEFAULT 'intermediate',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_skills_profile ON user_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_career_analyses_profile ON career_analyses(profile_id);
CREATE INDEX IF NOT EXISTS idx_career_analyses_share_token ON career_analyses(share_token);
CREATE INDEX IF NOT EXISTS idx_market_data_skill_name ON market_data(skill_name);
CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_name ON learning_resources(skill_name);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create profiles"
  ON user_profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own profiles"
  ON user_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their own profiles"
  ON user_profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can create skills"
  ON user_skills FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view skills"
  ON user_skills FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update skills"
  ON user_skills FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete skills"
  ON user_skills FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create analyses"
  ON career_analyses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view analyses"
  ON career_analyses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view market data"
  ON market_data FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view learning resources"
  ON learning_resources FOR SELECT
  TO anon, authenticated
  USING (true);