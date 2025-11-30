import { useState } from 'react';
import { Linkedin, User, Sparkles } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: { name: string; skills: string; isLinkedIn: boolean }) => void;
  loading: boolean;
}

export default function InputForm({ onSubmit, loading }: InputFormProps) {
  const [inputMode, setInputMode] = useState<'linkedin' | 'manual'>('linkedin');
  const [name, setName] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name || 'User',
      skills: skillsInput,
      isLinkedIn: inputMode === 'linkedin'
    });
  };

  const exampleLinkedInText = `John Smith
Senior Software Engineer at Tech Corp

Experience:
- 5 years developing full-stack web applications using React, Node.js, and PostgreSQL
- Led team of 4 developers building microservices architecture with Docker and Kubernetes
- Implemented CI/CD pipelines using Jenkins and AWS
- Expert in TypeScript, JavaScript, Python

Skills: React, Node.js, TypeScript, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, GraphQL, REST API, CI/CD, Agile`;

  const exampleManualText = `JavaScript, React, TypeScript, Node.js, Python, AWS, Docker, SQL, Git, REST API, Agile, Problem Solving, Leadership`;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Career Oracle</h2>
          <p className="text-gray-600">Discover your career potential with AI-powered analysis</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setInputMode('linkedin')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
            inputMode === 'linkedin'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Linkedin className="w-5 h-5" />
          LinkedIn Profile
        </button>
        <button
          type="button"
          onClick={() => setInputMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${
            inputMode === 'manual'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          Manual Input
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {inputMode === 'linkedin' ? 'LinkedIn Profile Content' : 'Your Skills'}
          </label>
          <textarea
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder={
              inputMode === 'linkedin'
                ? 'Paste your LinkedIn profile content here...'
                : 'Enter your skills separated by commas...'
            }
            rows={12}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
            required
          />
          <button
            type="button"
            onClick={() =>
              setSkillsInput(inputMode === 'linkedin' ? exampleLinkedInText : exampleManualText)
            }
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Use example {inputMode === 'linkedin' ? 'profile' : 'skills'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !skillsInput.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Generate Career Analysis'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 Tip:</span>{' '}
          {inputMode === 'linkedin'
            ? 'Copy your entire LinkedIn profile including experience, skills, and education sections for best results.'
            : 'List all your technical and soft skills. Include programming languages, frameworks, tools, and methodologies.'}
        </p>
      </div>
    </div>
  );
}
