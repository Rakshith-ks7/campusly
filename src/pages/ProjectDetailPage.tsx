import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StudentProfile, TeamRoleSlot } from '../types';
import { dataService } from '../services/dataService';
import { calculateStudentMatch } from '../services/matchingAlgorithm';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft,
  FolderKanban,
  Check,
  X
} from 'lucide-react';

interface Props {
  currentUser: StudentProfile;
}

export const ProjectDetailPage: React.FC<Props> = ({ currentUser }) => {
  const { id } = useParams<{ id: string }>();

  const project = dataService.getProjectById(id || '');
  const [applyModalRole, setApplyModalRole] = useState<TeamRoleSlot | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [, setRefreshState] = useState(0);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-heading font-semibold text-[#262626]">Project Not Found</h2>
        <Link to="/projects" className="text-[#E63946] hover:underline text-sm mt-3 inline-block font-medium">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  const isCreator = project.creatorId === currentUser.id;
  const projectApplications = dataService.getAllApplications().filter(a => a.projectId === project.id);

  const matchResult = calculateStudentMatch(currentUser, project.requiredSkills, project.tags, project.locationName);

  const handleOpenApply = (role: TeamRoleSlot) => {
    setApplyModalRole(role);
    setAppliedSuccess(false);
    setApplyMessage(`Hi ${project.creatorName}, I'd love to join ${project.title} as ${role.title}. I have experience with ${role.skills.join(', ')}.`);
  };

  const handleSendApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalRole) return;

    dataService.applyToRole(
      project.id,
      applyModalRole.id,
      applyModalRole.title,
      applyMessage,
      matchResult.overallMatch
    );

    setAppliedSuccess(true);
    setTimeout(() => {
      setApplyModalRole(null);
      setAppliedSuccess(false);
      setRefreshState(prev => prev + 1);
    }, 1500);
  };

  const handleApplicationDecision = (appId: string, decision: 'accepted' | 'rejected') => {
    dataService.updateApplicationStatus(appId, decision);
    setRefreshState(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Back navigation */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#666666] hover:text-[#E63946] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Main Project Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
              {project.category}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5]">
              {project.difficulty}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5]">
              {project.locationType}
            </span>
          </div>

          {project.teamId && (
            <Link
              to={`/workspace?teamId=${project.teamId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Go to Team Workspace</span>
            </Link>
          )}
        </div>

        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            {project.title}
          </h1>
          <p className="text-sm text-[#666666] mt-2.5 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Project Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#E5E5E5] text-xs">
          <div>
            <span className="text-[#666666] block mb-0.5">Target Deadline</span>
            <span className="font-semibold text-[#262626] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
              {project.deadline}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block mb-0.5">Campus Location</span>
            <span className="font-semibold text-[#262626] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#E63946]" />
              {project.locationName}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block mb-0.5">Project Lead</span>
            <span className="font-semibold text-[#262626] flex items-center gap-1.5">
              <img src={project.creatorAvatar} alt="" className="w-4 h-4 rounded-full object-cover border border-[#E5E5E5]" />
              {project.creatorName}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block mb-0.5">Your Match Fit</span>
            <span className="font-semibold text-[#E63946]">
              {matchResult.overallMatch}% Match
            </span>
          </div>
        </div>

        {/* Required Skills */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider block mb-2">
            Required Skills
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills.map((sk) => (
              <span key={sk} className="skill-tag">
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Team Role Roster Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg text-[#262626]">Team Roles</h2>
            <p className="text-xs text-[#666666]">Review existing members and open positions</p>
          </div>
          <span className="text-xs font-semibold text-[#E63946] bg-[#FFF1F2] px-3 py-1 rounded-full border border-[#FFE4E6]">
            {project.roles.filter(r => r.isFilled).length} / {project.roles.length} Members Filled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.roles.map((role) => (
            <div
              key={role.id}
              className={`p-5 rounded-xl border transition ${
                role.isFilled
                  ? 'bg-white border-[#E5E5E5]'
                  : 'bg-white border-[#FECDD3] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    role.isFilled
                      ? 'bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5]'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {role.isFilled ? 'Filled' : 'Open Vacancy'}
                  </span>
                  <h3 className="font-heading font-semibold text-base text-[#262626] mt-2">{role.title}</h3>
                </div>

                {!role.isFilled && !isCreator && (
                  <button
                    onClick={() => handleOpenApply(role)}
                    className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                  >
                    Join Team
                  </button>
                )}
              </div>

              {/* Skills for role */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.skills.map((sk) => (
                  <span key={sk} className="skill-tag">
                    {sk}
                  </span>
                ))}
              </div>

              {/* Assigned member if filled */}
              {role.isFilled && role.assignedStudentName && (
                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center gap-2">
                  <img
                    src={role.assignedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                    alt={role.assignedStudentName}
                    className="w-6 h-6 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div className="text-xs text-[#666666]">
                    <span>Filled by: </span>
                    <strong className="text-[#262626]">{role.assignedStudentName}</strong>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Creator Review Applications Panel */}
      {isCreator && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-base text-[#262626]">
              Pending Team Applications ({projectApplications.filter(a => a.status === 'pending').length})
            </h2>
            <span className="text-xs text-[#666666]">Visible to you as creator</span>
          </div>

          {projectApplications.length === 0 ? (
            <p className="text-xs text-[#666666] py-3 text-center">No applications received yet.</p>
          ) : (
            <div className="space-y-3">
              {projectApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={app.applicantAvatar}
                      alt={app.applicantName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-semibold text-sm text-[#262626]">{app.applicantName}</h4>
                        <span className="text-[11px] font-medium bg-[#FFF1F2] text-[#E63946] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                          {app.matchScore}% Match
                        </span>
                      </div>
                      <div className="text-xs text-[#E63946] font-medium mt-0.5">
                        Applied for: {app.roleTitle}
                      </div>
                      <p className="text-xs text-[#666666] mt-1">
                        "{app.message}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'accepted')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleApplicationDecision(app.id, 'rejected')}
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-[#666666] hover:text-rose-600 text-xs font-medium rounded-lg border border-[#E5E5E5] flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                        app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Role Application Modal */}
      {applyModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
              <div>
                <h3 className="font-heading font-semibold text-base text-[#262626]">
                  Apply for {applyModalRole.title}
                </h3>
                <p className="text-xs text-[#666666]">{project.title}</p>
              </div>
              <button
                onClick={() => setApplyModalRole(null)}
                className="text-[#666666] hover:text-[#262626] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appliedSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-heading font-semibold text-base text-[#262626]">Application Submitted!</h4>
                <p className="text-xs text-[#666666]">
                  The project lead will review your profile compatibility.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendApplication} className="mt-4 space-y-3.5">
                <div className="p-3 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-between text-xs text-[#E63946]">
                  <span>Your Match Score:</span>
                  <span className="font-bold text-sm">{matchResult.overallMatch}% Match</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Introductory Message</label>
                  <textarea
                    rows={4}
                    value={applyMessage}
                    onChange={(e) => setApplyMessage(e.target.value)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalRole(null)}
                    className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
