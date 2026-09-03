import React, { useState } from 'react';
import { StudentProfile, Project, TeamRoleSlot } from '../types';
import { dataService } from '../services/dataService';
import { X, Plus, Trash2, FolderPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onProjectCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Project['category']>('Hackathon');
  const [locationType, setLocationType] = useState<Project['locationType']>('Hybrid');
  const [locationName, setLocationName] = useState(currentUser.college);
  const [deadline, setDeadline] = useState('In 2 Weeks');
  const [difficulty, setDifficulty] = useState<Project['difficulty']>('Intermediate');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'Python']);
  
  // Roles
  const [roles, setRoles] = useState<{ title: string; skills: string }[]>([
    { title: 'Project Lead', skills: currentUser.skills[0]?.name || 'Python' },
    { title: 'Frontend Developer', skills: 'React, Tailwind CSS' },
    { title: 'UI/UX Designer', skills: 'Figma' }
  ]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(item => item !== s));
  };

  const handleAddRole = () => {
    setRoles([...roles, { title: 'Backend Engineer', skills: 'Node.js, PostgreSQL' }]);
  };

  const handleRemoveRole = (idx: number) => {
    setRoles(roles.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedRoles: TeamRoleSlot[] = roles.map((r, i) => ({
      id: `role-${Date.now()}-${i}`,
      title: r.title,
      skills: r.skills.split(',').map(s => s.trim()),
      isFilled: i === 0,
      assignedStudentId: i === 0 ? currentUser.id : undefined,
      assignedStudentName: i === 0 ? currentUser.name : undefined,
      assignedAvatar: i === 0 ? currentUser.avatar : undefined
    }));

    const newProject = dataService.createProject({
      title,
      description,
      category,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar,
      teamSize: formattedRoles.length,
      maxMembers: formattedRoles.length + 1,
      deadline,
      locationType,
      locationName,
      requiredSkills: skills.length > 0 ? skills : ['React', 'Python'],
      roles: formattedRoles,
      difficulty,
      tags: [category, locationType, 'Recruiting'],
      status: 'open'
    });

    onProjectCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] flex items-center justify-center text-[#E63946]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#262626]">
                Post a Project
              </h2>
              <p className="text-xs text-[#666666]">
                Describe what you want to build and invite students to your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#262626] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI-Powered Smart Campus Assistant"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3.5 py-2 text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="College Project">College Project</option>
                <option value="Startup / MVP">Startup / MVP</option>
                <option value="Research">Research</option>
                <option value="Robotics">Robotics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Experience Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              >
                <option value="Beginner Friendly">Beginner Friendly</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What are you creating? What problem are you trying to solve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          {/* Location & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Working Mode
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              >
                <option value="Online">Online / Remote</option>
                <option value="Offline">Offline (Campus)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Campus / Location
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. In 2 Weeks"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">
              Required Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, Python, UI/UX"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); }}}
                className="flex-1 bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-white hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] rounded-lg text-xs font-medium transition"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map(s => (
                <span
                  key={s}
                  className="skill-tag"
                >
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)}>
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Team Roles */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-[#262626]">
                What roles are you looking for? ({roles.length})
              </label>
              <button
                type="button"
                onClick={handleAddRole}
                className="flex items-center gap-1 text-xs text-[#E63946] hover:underline font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            </div>

            <div className="space-y-2">
              {roles.map((role, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5]">
                  <span className="text-xs text-[#666666] font-medium w-5 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    value={role.title}
                    onChange={(e) => {
                      const updated = [...roles];
                      updated[idx].title = e.target.value;
                      setRoles(updated);
                    }}
                    placeholder="Role Title (e.g. Frontend Developer)"
                    className="flex-1 bg-white border border-[#E5E5E5] rounded px-2.5 py-1 text-xs text-[#262626]"
                  />
                  <input
                    type="text"
                    value={role.skills}
                    onChange={(e) => {
                      const updated = [...roles];
                      updated[idx].skills = e.target.value;
                      setRoles(updated);
                    }}
                    placeholder="Skills (comma separated)"
                    className="flex-1 bg-white border border-[#E5E5E5] rounded px-2.5 py-1 text-xs text-[#262626]"
                  />
                  {idx === 0 ? (
                    <span className="text-[11px] font-medium bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] px-2 py-1 rounded">
                      You (Lead)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx)}
                      className="text-[#999999] hover:text-[#E63946] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-xs font-medium text-white bg-[#E63946] hover:bg-[#D62839] rounded-lg transition"
            >
              Publish Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
