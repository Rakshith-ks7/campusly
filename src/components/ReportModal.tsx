import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'discussion' | 'project' | 'event';
  targetId: string;
  targetTitle?: string;
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle
}) => {
  const [reason, setReason] = useState('Inappropriate Content / Harassment');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = dataService.getCurrentUser();
    dataService.submitReport({
      reporterId: user.id,
      reporterName: user.name,
      targetType,
      targetId,
      targetTitle: targetTitle || targetId,
      reason,
      details
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md shadow-xl p-6">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-[#E63946]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-[#262626]">Safety Report</h3>
              <p className="text-xs text-[#666666]">Help keep the college community safe and respectful</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#999999] hover:text-[#262626]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-heading font-semibold text-base text-[#262626]">Report Submitted</h4>
            <p className="text-xs text-[#666666]">
              Thank you for keeping our campus safe. College moderators will review this within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="p-2.5 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] text-xs text-[#666666]">
              Reporting <strong className="text-[#262626] capitalize">{targetType}</strong>: {targetTitle || targetId}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Reason for report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              >
                <option value="Inappropriate Content / Harassment">Inappropriate Content / Harassment</option>
                <option value="Spam / Commercial Promotion">Spam / Commercial Promotion</option>
                <option value="False Information / Academic Dishonesty">False Information / Academic Dishonesty</option>
                <option value="Impersonation / Privacy Violation">Impersonation / Privacy Violation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Additional details (optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what happened so our moderation team can take appropriate action..."
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
