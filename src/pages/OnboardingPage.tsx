import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  BookOpen, 
  Sparkles, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  User, 
  Plus, 
  X,
  Camera
} from 'lucide-react';
import { AvatarPickerModal, AVAILABLE_AVATARS } from '../components/AvatarPickerModal';

export const OnboardingPage: React.FC = () => {
  const { currentUser, studentProfile, updateProfileData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(studentProfile?.avatar || '/avatars/avatar-1.png');
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Step 1: Academic Basics
  const [fullName, setFullName] = useState(studentProfile?.name || currentUser?.displayName || '');
  const [college, setCollege] = useState(studentProfile?.college || 'Kishkinda University');
  const [department, setDepartment] = useState(studentProfile?.department || 'Computer Science & Engineering');
  const [year, setYear] = useState<any>(studentProfile?.year || '1st Year');
  const [semester, setSemester] = useState(studentProfile?.semester || '1st Semester');
  const [location, setLocation] = useState(studentProfile?.location || 'Campus');

  // Step 2: Skills & Interests
  const popularSkills = [
    'Python', 'React', 'C++', 'Java', 'UI/UX Design', 'PyTorch', 
    'Figma', 'TypeScript', 'Data Structures', 'Video Editing', 'Node.js', 'Arduino'
  ];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    studentProfile?.skills?.map(s => s.name) || ['Python']
  );
  const [customSkill, setCustomSkill] = useState('');

  // Step 3: What are you looking for
  const lookingForOptions = [
    'Friends',
    'Project teammates',
    'Hackathon teammates',
    'Coding partners',
    'Study partners',
    'Content creators',
    'Event partners',
    'Club members',
    'Mentors',
    'Networking'
  ];
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>(
    studentProfile?.lookingFor || ['Friends', 'Coding partners', 'Project teammates']
  );

  // Step 4: Bio & Availability
  const [bio, setBio] = useState(
    studentProfile?.bio || 'Passionate student eager to collaborate on projects and meet campus peers!'
  );
  const [availability, setAvailability] = useState<any>(studentProfile?.availability || '10-20 hrs/wk');

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (!selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
    }
    setCustomSkill('');
  };

  const toggleLookingFor = (option: string) => {
    if (selectedLookingFor.includes(option)) {
      setSelectedLookingFor(selectedLookingFor.filter(o => o !== option));
    } else {
      setSelectedLookingFor([...selectedLookingFor, option]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const formattedSkills = selectedSkills.map(s => ({
        name: s,
        category: 'Programming' as const,
        level: 'Intermediate' as const,
        years: 1,
        verified: false
      }));

      await updateProfileData({
        name: fullName || 'Campus Student',
        avatar,
        college,
        university: college,
        department,
        year,
        semester,
        location,
        bio,
        availability,
        skills: formattedSkills,
        lookingFor: selectedLookingFor,
        onboardingCompleted: true,
        updatedAt: new Date().toISOString()
      });

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to complete profile onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 max-w-2xl mx-auto w-full">
      
      {/* Progress Bar & Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/campusly-logo.jpg"
              alt="Campusly Logo"
              className="w-9 h-9 object-contain rounded-xl border border-[#FFE4E6] p-0.5 bg-white shadow-xs"
            />
            <span className="font-heading font-bold text-lg text-[#262626]">
              Campus<span className="text-[#E63946]">ly</span> Onboarding
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
            Step {step} of 4
          </span>
        </div>

        {/* Step Progress indicators */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#E63946]' : 'bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* STEP 1: ACADEMIC BASICS */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                Welcome to Campusly 👋
              </h2>
              <p className="text-xs sm:text-sm text-[#666666]">
                Let's set up your university details so you discover students from your campus
              </p>
            </div>

            <div className="space-y-3.5">
              
              {/* Avatar Selection Widget */}
              <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#262626]">
                    Choose Your Profile Avatar
                  </label>
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(true)}
                    className="text-xs text-[#E63946] hover:underline font-medium"
                  >
                    View all 28 avatars →
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div 
                    className="relative group cursor-pointer shrink-0"
                    onClick={() => setAvatarModalOpen(true)}
                    title="Click to change avatar"
                  >
                    <img
                      src={avatar}
                      alt="Selected Avatar"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#E63946] p-0.5 bg-white shadow-xs group-hover:opacity-90 transition"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Quick Avatar Strip */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {AVAILABLE_AVATARS.slice(0, 6).map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-9 h-9 rounded-full shrink-0 border-2 transition hover:scale-105 ${
                          avatar === av ? 'border-[#E63946] ring-2 ring-[#FFE4E6]' : 'border-[#E5E5E5]'
                        }`}
                      >
                        <img src={av} alt="avatar option" className="w-full h-full object-contain rounded-full" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAvatarModalOpen(true)}
                      className="h-9 px-2.5 rounded-full bg-white border border-[#E5E5E5] text-[11px] font-medium text-[#666666] hover:text-[#E63946] hover:border-[#FECDD3] shrink-0"
                    >
                      +22 more
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">College / University *</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Kishkinda University / IIT Delhi"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Branch / Department *</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Year of Study</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Current Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="e.g. 5th Semester"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!fullName.trim() || !college.trim()}
                className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SKILLS & PASSIONS */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                What Are Your Skills & Passions?
              </h2>
              <p className="text-xs sm:text-sm text-[#666666]">
                Select topics you love to code with, design in, or want to learn
              </p>
            </div>

            {/* Popular Skills Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#262626]">Popular Skills (click to toggle):</label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                          : 'bg-[#FFF8F8] text-[#262626] border-[#E5E5E5] hover:border-[#FECDD3]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Skill */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-[#262626] mb-1">Add custom skill or framework:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                  placeholder="e.g. Flutter, Blender, Golang, ROS..."
                  className="flex-1 bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 bg-white hover:bg-[#FFF8F8] text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl text-xs font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#666666] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: WHAT ARE YOU LOOKING FOR */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                What Are You Looking For on Campus?
              </h2>
              <p className="text-xs sm:text-sm text-[#666666]">
                Tell other students what kinds of collaborations you are open to
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lookingForOptions.map((opt) => {
                const isSelected = selectedLookingFor.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleLookingFor(opt)}
                    className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FFF1F2] border-[#E63946] text-[#E63946] shadow-xs'
                        : 'bg-[#FFF8F8] border-[#E5E5E5] text-[#262626] hover:border-[#FECDD3]'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#E63946]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#666666] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BIO & FINISH */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                You're Almost Ready to Explore!
              </h2>
              <p className="text-xs sm:text-sm text-[#666666]">
                Add a short bio so other students can get to know you
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Short Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell campus what you are building or studying..."
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Weekly Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as any)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#262626] focus:outline-none"
                >
                  <option value="5-10 hrs/wk">5-10 hrs/wk (Part-time)</option>
                  <option value="10-20 hrs/wk">10-20 hrs/wk (Active contributor)</option>
                  <option value="20+ hrs/wk">20+ hrs/wk (Intensive builder)</option>
                  <option value="Full-time Hackathon">Full-time Hackathon mode</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#666666] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="px-6 py-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-xs"
              >
                {saving ? (
                  <span>Setting up your profile...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete & Explore Campusly</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={avatar}
        onSelectAvatar={setAvatar}
      />
    </div>
  );
};
