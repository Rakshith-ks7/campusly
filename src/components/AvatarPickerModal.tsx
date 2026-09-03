import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';

export const AVAILABLE_AVATARS: string[] = Array.from({ length: 28 }, (_, i) => `/avatars/avatar-${i + 1}.png`);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSelectAvatar: (avatarUrl: string) => void;
}

export const AvatarPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSelectAvatar
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E63946]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-[#262626]">
                Choose Your Campusly Avatar
              </h3>
              <p className="text-xs text-[#666666]">
                Select an illustrated student avatar for your profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#999999] hover:text-[#262626] hover:bg-[#FFF8F8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Avatar Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
            {AVAILABLE_AVATARS.map((avatarUrl, idx) => {
              const isSelected = currentAvatar === avatarUrl;
              return (
                <button
                  key={avatarUrl}
                  type="button"
                  onClick={() => {
                    onSelectAvatar(avatarUrl);
                    onClose();
                  }}
                  className={`group relative aspect-square rounded-2xl p-1 border-2 transition-all duration-150 flex items-center justify-center hover:scale-105 ${
                    isSelected
                      ? 'border-[#E63946] bg-[#FFF1F2] shadow-xs'
                      : 'border-[#E5E5E5] hover:border-[#FECDD3] bg-[#FFF8F8]'
                  }`}
                  title={`Avatar #${idx + 1}`}
                >
                  <img
                    src={avatarUrl}
                    alt={`Avatar ${idx + 1}`}
                    className="w-full h-full object-contain rounded-full"
                  />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E63946] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E5E5E5] bg-[#FFF8F8] rounded-b-2xl text-xs text-[#666666]">
          <span>Click any avatar to apply it instantly to your profile</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#262626] hover:bg-[#FFF1F2] transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
