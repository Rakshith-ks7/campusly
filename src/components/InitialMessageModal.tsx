import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentProfile } from '../types';
import { chatService } from '../services/chatService';
import { X, Send, Sparkles, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sender: StudentProfile;
  receiver: StudentProfile;
}

export const InitialMessageModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sender,
  receiver
}) => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    setError(null);

    const result = await chatService.sendMessage(sender, receiver, text);
    setSending(false);

    if (result.success) {
      onClose();
      const conversationId = chatService.getConversationId(sender.id, receiver.id);
      navigate(`/messages/${conversationId}`);
    } else {
      setError(result.error || 'Failed to send message request.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#E5E5E5] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-[#FFF8F8]">
          <div className="flex items-center gap-2">
            <span className="text-base">✉️</span>
            <h3 className="font-heading font-bold text-sm sm:text-base text-[#262626]">
              Send Message Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#666666] hover:text-[#262626] hover:bg-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          
          {/* Target User Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FFF8F8] border border-[#E5E5E5]">
            <img
              src={receiver.avatar}
              alt={receiver.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white"
            />
            <div>
              <h4 className="font-heading font-bold text-sm text-[#262626]">
                {receiver.name}
              </h4>
              <p className="text-xs text-[#666666]">
                {receiver.department} • {receiver.college}
              </p>
            </div>
          </div>

          {/* Campusly Rule Notice */}
          <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FFE4E6] text-xs text-[#E63946] flex items-start gap-2.5 leading-relaxed">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-[#E63946]">Initial Message Request Rule:</strong>
              <span>
                You can send 1 introductory message. Once {receiver.name.split(' ')[0]} follows you back, unlimited chatting will unlock automatically!
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#262626]">
              Your Message
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              placeholder={`Hey ${receiver.name.split(' ')[0]}, I saw your profile and would love to collaborate on...`}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3] resize-none"
              required
            />
            <div className="flex justify-between text-[11px] text-[#999999] px-1">
              <span>Shift + Enter for new line</span>
              <span>{text.length}/2000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-[#262626] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              {sending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
