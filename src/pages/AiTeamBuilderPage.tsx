import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StudentProfile, AiTeamBuilderResult } from '../types';
import { dataService } from '../services/dataService';
import { generateTeamFromPrompt, assembleTeamFromAiResult } from '../services/aiTeamBuilder';
import { 
  ArrowRight, 
  RotateCw,
  FolderKanban,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  currentUser: StudentProfile;
}

export const AiTeamBuilderPage: React.FC<Props> = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialPrompt = searchParams.get('prompt') || 
    'I want to build an autonomous search and rescue drone with computer vision and a mission control dashboard.';

  const [prompt, setPrompt] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AiTeamBuilderResult | null>(null);

  const students = dataService.getAllStudents();

  const loadingSteps = [
    'Understanding your project goals...',
    'Identifying needed roles (Engineering, Design, Hardware, Lead)...',
    'Searching student roster for matching skillsets...',
    'Finding students who complement each other...'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);

    try {
      const generated = await generateTeamFromPrompt(prompt, students);
      clearInterval(interval);
      setResult(generated);
    } catch (err) {
      clearInterval(interval);
      console.error('Error in team composition:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('prompt')) {
      handleGenerate();
    }
  }, []);

  const handleAssembleTeam = () => {
    if (!result) return;
    const { team } = assembleTeamFromAiResult(result);
    navigate(`/workspace?teamId=${team.id}`);
  };

  const inspirationChips = [
    'Autonomous drone for disaster survivor search with thermal imaging',
    'AI waste classification and sorting smart bin with IoT sensors',
    'Telemedicine platform for rural clinics with mobile React UI'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Matcher</span>
        </div>
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
          Build Your Squad
        </h1>
        <p className="mt-1 text-sm text-[#666666]">
          Describe what you want to build. We’ll analyze your requirements and recommend student teammates who have the right skills.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-3.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666]">
          What are you planning to build?
        </label>
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Build an autonomous rescue drone with thermal vision and a web dashboard..."
          className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3] transition resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#666666]">Try:</span>
            {inspirationChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(chip)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#FFF8F8] hover:bg-[#FFF1F2] text-[#666666] hover:text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] transition"
              >
                {chip.split(' ')[0]} {chip.split(' ')[1]}...
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer min-h-[44px]"
          >
            {loading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Finding Candidates...</span>
              </>
            ) : (
              <span>Find Recommended Teammates</span>
            )}
          </button>
        </div>

        {/* Loading status ticker */}
        {loading && (
          <div className="mt-4 p-3.5 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] space-y-2">
            <div className="text-xs font-medium text-[#E63946]">
              {loadingSteps[loadingStep]}
            </div>
            <div className="w-full bg-[#FFE4E6] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#E63946] h-full transition-all duration-300 rounded-full"
                style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Output Section */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          
          {/* Summary Card */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                  {result.detectedCategory}
                </span>
                <span className="text-xs text-[#666666]">{result.extractedRoles.length} Recommended Roles</span>
              </div>
              <h2 className="font-heading font-semibold text-lg text-[#262626] mt-1">
                Suggested Squad Roster
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-[#E63946]">
                  {result.averageTeamMatch}%
                </div>
                <div className="text-xs text-[#666666]">Overall Synergy</div>
              </div>

              <button
                onClick={handleAssembleTeam}
                className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5"
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Create Team & Open Workspace</span>
              </button>
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.extractedRoles.map((role, idx) => {
              const student = role.recommendedStudent;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-medium text-[#666666]">
                        Role #{idx + 1}
                      </span>
                      <h3 className="font-heading font-semibold text-base text-[#262626]">
                        {role.roleTitle}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-[#E63946] bg-[#FFF1F2] px-2.5 py-0.5 rounded-full border border-[#FFE4E6]">
                      {role.matchPercentage}% Fit
                    </span>
                  </div>

                  {/* Required skills */}
                  <div className="flex flex-wrap gap-1">
                    {role.requiredSkills.map((sk) => (
                      <span key={sk} className="skill-tag">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Recommended Student Profile */}
                  <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] flex items-center gap-3">
                    <img
                      src={student.photoURL || student.avatar || '/avatars/avatar-1.png'}
                      alt={student.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/avatars/avatar-1.png';
                      }}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#262626] truncate">
                        {student.name}
                      </div>
                      <div className="text-xs text-[#666666] truncate">
                        {student.college} • {student.department.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Natural Language Rationale */}
                  <div className="text-xs text-[#666666] bg-[#FFF1F2] p-2.5 rounded-xl border border-[#FFE4E6] leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E63946] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#262626]">Why this person is a good fit: </strong>
                      {role.rationale}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Call to Action */}
          <div className="pt-2 text-center">
            <button
              onClick={handleAssembleTeam}
              className="w-full sm:w-auto px-6 py-3 bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-semibold rounded-xl transition inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[44px]"
            >
              <span>Confirm Roster & Launch Team Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
