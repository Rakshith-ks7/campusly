import React from 'react';
import { MatchingWeights } from '../types';
import { Sliders, RotateCcw, X, Info } from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../services/matchingAlgorithm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  weights: MatchingWeights;
  onWeightsChange: (weights: MatchingWeights) => void;
}

export const MatchingWeightsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  weights,
  onWeightsChange,
}) => {
  if (!isOpen) return null;

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleChange = (key: keyof MatchingWeights, val: number) => {
    onWeightsChange({
      ...weights,
      [key]: val,
    });
  };

  const handleReset = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  const items: { key: keyof MatchingWeights; label: string; desc: string }[] = [
    { key: 'skills', label: 'Skills & Tech Stack', desc: 'Overlap in programming languages, frameworks, and skill level.' },
    { key: 'interests', label: 'Domain Interests', desc: 'Shared passion in topics like Robotics, FinTech, or EcoTech.' },
    { key: 'availability', label: 'Weekly Availability', desc: 'Alignment with required weekly commitment (e.g. 20+ hrs/wk).' },
    { key: 'experience', label: 'Prior Experience', desc: 'Years of building and project seniority level.' },
    { key: 'projectInterests', label: 'Project Alignment', desc: 'Direct synergy with the current project goals.' },
    { key: 'location', label: 'Proximity / Locality', desc: 'Prioritize students from same college or campus radius.' },
    { key: 'education', label: 'Department & Academic Year', desc: 'Department and seniority compatibility.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-l border-[#E5E5E5] p-6 h-full overflow-y-auto flex flex-col justify-between shadow-xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#FFF1F2] text-[#E63946]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-base text-[#262626]">Matching Criteria</h3>
                <p className="text-xs text-[#666666]">Customize what matters most for your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#666666] hover:text-[#262626] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-3.5 p-3 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-start gap-2.5 text-xs text-[#666666]">
            <Info className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
            <div>
              Total allocation: <strong className="text-[#E63946]">{total}%</strong>. Adjust sliders to fine-tune how compatibility scores are calculated.
            </div>
          </div>

          {/* Sliders */}
          <div className="mt-5 space-y-4">
            {items.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-[#262626]">{label}</span>
                  <span className="font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded border border-[#FFE4E6] text-[11px]">
                    {weights[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="5"
                  value={weights[key]}
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="w-full accent-[#E63946] h-1.5 bg-[#FFF8F8] rounded-lg appearance-none cursor-pointer border border-[#E5E5E5]"
                />
                <p className="text-[11px] text-[#666666]">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#666666] hover:text-[#262626] bg-[#FFF8F8] hover:bg-[#FFF1F2] border border-[#E5E5E5] rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-[#E63946] hover:bg-[#D62839] rounded-lg transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
