const TECH_SKILLS = [
  'JavaScript', 'Python', 'React', 'TypeScript', 'Node.js', 'Machine Learning',
  'AWS', 'Docker', 'SQL', 'Git', 'REST API', 'GraphQL', 'Vue.js', 'Angular',
  'MongoDB', 'PostgreSQL', 'Kubernetes', 'TensorFlow', 'Data Analysis',
  'Cloud Computing', 'Agile', 'DevOps', 'CI/CD', 'Java', 'C++', 'Go', 'Rust',
  'Swift', 'Kotlin', 'Flutter', 'Django', 'Flask', 'Express', 'Redis',
  'ElasticSearch', 'Apache Kafka', 'Spark', 'Hadoop', 'Tableau', 'Power BI',
  'Figma', 'Sketch', 'Adobe XD', 'UI/UX', 'Product Management', 'Scrum',
  'JIRA', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'HTML', 'CSS', 'SASS',
  'Webpack', 'Babel', 'Jest', 'Cypress', 'Selenium', 'Jenkins', 'Terraform',
  'Ansible', 'Linux', 'Bash', 'PowerShell', 'Azure', 'GCP', 'Firebase',
  'Supabase', 'Next.js', 'Nuxt.js', 'Svelte', 'Tailwind CSS', 'Bootstrap',
  'Material-UI', 'Microservices', 'Serverless', 'GraphQL', 'WebSockets',
  'OAuth', 'JWT', 'API Design', 'System Design', 'Algorithms', 'Data Structures'
];

const SOFT_SKILLS = [
  'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking',
  'Creativity', 'Time Management', 'Adaptability', 'Emotional Intelligence',
  'Conflict Resolution', 'Decision Making', 'Negotiation', 'Public Speaking',
  'Mentoring', 'Project Management', 'Strategic Planning', 'Analytical Thinking'
];

export interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft';
  confidence: number;
}

export function extractSkillsFromText(text: string): ExtractedSkill[] {
  const normalizedText = text.toLowerCase();
  const extractedSkills: ExtractedSkill[] = [];
  const foundSkills = new Set<string>();

  const allSkills = [
    ...TECH_SKILLS.map(s => ({ name: s, category: 'technical' as const })),
    ...SOFT_SKILLS.map(s => ({ name: s, category: 'soft' as const }))
  ];

  allSkills.forEach(({ name, category }) => {
    const lowerName = name.toLowerCase();
    const regex = new RegExp(`\\b${lowerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = normalizedText.match(regex);

    if (matches && !foundSkills.has(lowerName)) {
      foundSkills.add(lowerName);
      extractedSkills.push({
        name,
        category,
        confidence: Math.min(0.7 + (matches.length * 0.1), 1.0)
      });
    }
  });

  const experienceRegex = /(\d+)[\s]*(?:years?|yrs?)[\s]*(?:of[\s]*)?(?:experience[\s]*)?(?:in|with|using)?[\s]*([a-zA-Z0-9+#.\s]+)/gi;
  let match;

  while ((match = experienceRegex.exec(text)) !== null) {
    const years = parseInt(match[1]);
    const skillText = match[2].trim();

    allSkills.forEach(({ name, category }) => {
      if (skillText.toLowerCase().includes(name.toLowerCase()) && !foundSkills.has(name.toLowerCase())) {
        foundSkills.add(name.toLowerCase());
        extractedSkills.push({
          name,
          category,
          confidence: Math.min(0.8 + (years * 0.05), 1.0)
        });
      }
    });
  }

  return extractedSkills.sort((a, b) => b.confidence - a.confidence);
}

export function parseLinkedInProfile(profileText: string): {
  name: string;
  skills: ExtractedSkill[];
  experience: string;
  education: string;
} {
  const lines = profileText.split('\n');

  let name = 'User';
  const nameMatch = profileText.match(/^([A-Z][a-z]+\s[A-Z][a-z]+)/);
  if (nameMatch) {
    name = nameMatch[1];
  }

  const skills = extractSkillsFromText(profileText);

  const experienceSection = profileText.match(/Experience[:\s]+([\s\S]*?)(?=Education|Skills|$)/i);
  const experience = experienceSection ? experienceSection[1].trim().substring(0, 500) : '';

  const educationSection = profileText.match(/Education[:\s]+([\s\S]*?)(?=Experience|Skills|$)/i);
  const education = educationSection ? educationSection[1].trim().substring(0, 300) : '';

  return { name, skills, experience, education };
}

export function estimateProficiencyLevel(skill: ExtractedSkill, yearsExperience: number = 0): number {
  let level = 3;

  if (skill.confidence > 0.9) level = Math.min(5, level + 1);
  if (skill.confidence < 0.75) level = Math.max(1, level - 1);

  if (yearsExperience >= 5) level = Math.min(5, level + 1);
  else if (yearsExperience >= 3) level = Math.min(5, level + 0.5);
  else if (yearsExperience < 1) level = Math.max(1, level - 1);

  return Math.round(level);
}

export function estimateYearsOfExperience(text: string, skillName: string): number {
  const skillLower = skillName.toLowerCase();
  const textLower = text.toLowerCase();

  const directMatch = new RegExp(`(\\d+)\\s*(?:years?|yrs?).*?${skillLower}|${skillLower}.*?(\\d+)\\s*(?:years?|yrs?)`, 'i');
  const match = textLower.match(directMatch);

  if (match) {
    return parseInt(match[1] || match[2]);
  }

  const skillIndex = textLower.indexOf(skillLower);
  if (skillIndex === -1) return 2;

  const contextWindow = textLower.substring(Math.max(0, skillIndex - 100), skillIndex + 100);
  const yearMatches = contextWindow.match(/(\d+)\s*(?:years?|yrs?)/g);

  if (yearMatches && yearMatches.length > 0) {
    const years = yearMatches.map(m => parseInt(m.match(/\d+/)![0]));
    return Math.max(...years);
  }

  return 2;
}
