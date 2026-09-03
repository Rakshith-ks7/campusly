import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { StudyResource, StudyGroup } from '../types';
import { 
  BookOpen, 
  Users, 
  Download, 
  Upload, 
  Calendar, 
  Plus, 
  Check, 
  Search,
  FileText,
  Clock
} from 'lucide-react';

export const ExamPrepHubPage: React.FC = () => {
  const currentUser = dataService.getCurrentUser();
  const allStudents = dataService.getAllStudents();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(dataService.getAllStudyGroups());
  const [resources, setResources] = useState<StudyResource[]>(dataService.getAllStudyResources());

  // Filters for finding study partners
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  
  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);

  // New Resource Form state
  const [resSubject, setResSubject] = useState('DBMS');
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState<StudyResource['fileType']>('Notes PDF');
  const [resSemester, setResSemester] = useState('Semester 4');

  // New Group Form state
  const [groupSubject, setGroupSubject] = useState('');
  const [groupSemester, setGroupSemester] = useState('Semester 3');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupNextDate, setGroupNextDate] = useState('Saturday, 5:00 PM');
  const [groupNextTopic, setGroupNextTopic] = useState('');

  const subjects = ['All', 'Data Structures', 'DBMS', 'Operating Systems', 'Mathematics', 'Computer Networks'];

  // Matching study partners
  const studyPartners = allStudents.filter(s => {
    if (s.id === currentUser.id) return false;
    const matchesSubject = selectedSubject === 'All' || 
      s.skills.some(sk => sk.name.toLowerCase().includes(selectedSubject.toLowerCase())) ||
      s.bio.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchesAvail = selectedAvailability === 'All' || s.availability.includes(selectedAvailability);
    return matchesSubject && matchesAvail;
  });

  const handleJoinGroup = (groupId: string) => {
    dataService.joinStudyGroup(groupId);
    setStudyGroups(dataService.getAllStudyGroups());
  };

  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;

    const newRes = dataService.addStudyResource({
      subject: resSubject,
      title: resTitle,
      fileType: resType,
      semester: resSemester,
      authorName: currentUser.name,
      authorCollege: currentUser.college
    });

    setResources([newRes, ...resources]);
    setResTitle('');
    setUploadModalOpen(false);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupSubject.trim()) return;

    const newGroup = dataService.createStudyGroup({
      subject: groupSubject,
      semester: groupSemester,
      description: groupDesc || 'Student collaborative study group',
      nextSessionDate: groupNextDate,
      nextSessionTopic: groupNextTopic || 'General Chapter Review',
      creatorName: currentUser.name,
      creatorAvatar: currentUser.avatar
    });

    setStudyGroups([newGroup, ...studyGroups]);
    setGroupSubject('');
    setGroupDesc('');
    setNewGroupModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Collaboration</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Exam Preparation Hub
          </h1>
          <p className="text-sm text-[#E63946] font-medium">
            "Study together. Help each other. Prepare better."
          </p>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Find study partners for tricky courses, download verified lecture notes & question papers, and organize peer revision sessions for mid-terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setNewGroupModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs font-medium rounded-lg transition"
          >
            + Create Study Group
          </button>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Share Notes / Paper</span>
          </button>
        </div>
      </div>

      {/* Find Study Partners Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E63946]" />
              <span>Find Study Partners</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Connect with students preparing for the same subjects and exams
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666666] font-medium hidden sm:inline">Availability:</span>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="bg-white border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] focus:outline-none"
            >
              <option value="All">All Schedules</option>
              <option value="10-20">10-20 hrs/wk</option>
              <option value="20+">20+ hrs/wk (Intensive)</option>
            </select>
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`text-xs px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                selectedSubject === sub
                  ? 'bg-[#E63946] text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#FECDD3]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Study Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyPartners.slice(0, 6).map((student) => (
            <div
              key={student.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-4 shadow-xs transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-[#262626]">{student.name}</h3>
                    <p className="text-xs text-[#666666]">{student.department.split('&')[0]} • {student.year}</p>
                  </div>
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] text-xs text-[#666666]">
                  <span className="font-semibold text-[#262626]">Study focus: </span>
                  {student.skills[0]?.name || 'Core Engineering Subjects'}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-xs text-[#666666] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#999999]" />
                  <span>{student.availability}</span>
                </span>
                <Link
                  to={`/students?q=${encodeURIComponent(student.name)}`}
                  className="px-3 py-1 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Study Groups */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E63946]" />
            <span>Active Study Groups</span>
          </h2>
          <p className="text-xs text-[#666666]">
            Course-specific revision squads meeting weekly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studyGroups.map((group) => {
            const isJoined = group.members.includes(currentUser.id);
            return (
              <div
                key={group.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                      {group.semester}
                    </span>
                    <span className="text-xs text-[#666666]">{group.memberCount} members</span>
                  </div>

                  <h3 className="font-heading font-semibold text-base text-[#262626]">{group.subject}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{group.description}</p>
                  
                  <div className="p-2.5 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] space-y-0.5">
                    <div className="text-[11px] font-semibold text-[#262626]">Next Session:</div>
                    <div className="text-xs text-[#E63946] font-medium">{group.nextSessionDate}</div>
                    <div className="text-[11px] text-[#666666] truncate">{group.nextSessionTopic}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={isJoined}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                    isJoined
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#E63946] hover:bg-[#D62839] text-white'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Member of Group</span>
                    </>
                  ) : (
                    <span>Join Group</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shared Resources & Notes Library */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E63946]" />
              <span>Shared Notes & Question Papers</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Verified study material contributed by campus peers and toppers
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="text-xs font-semibold text-[#E63946] hover:underline"
          >
            + Upload Notes
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-4 shadow-xs transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                    {res.fileType}
                  </span>
                  <span className="text-[11px] text-[#999999]">{res.semester}</span>
                </div>

                <h4 className="font-semibold text-xs text-[#262626] leading-snug">
                  {res.title}
                </h4>

                <div className="text-[11px] text-[#666666]">
                  By {res.authorName} • {res.authorCollege}
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-[#666666]">
                  {res.downloads} downloads
                </span>
                <button
                  onClick={() => alert(`Downloading "${res.title}"...`)}
                  className="px-2.5 py-1 rounded bg-[#FFF8F8] hover:bg-[#FFF1F2] text-[#E63946] text-xs font-medium border border-[#E5E5E5] flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" />
                  <span>Get</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Resource Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-heading font-semibold text-base text-[#262626] mb-3">
              Share Study Notes or Question Paper
            </h3>
            <form onSubmit={handleUploadResource} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management Systems"
                  value={resSubject}
                  onChange={(e) => setResSubject(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 Handwritten Formula Sheet & Examples"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-2.5 py-2 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="Notes PDF">Notes PDF</option>
                    <option value="Question Paper">Question Paper</option>
                    <option value="Formula Sheet">Formula Sheet</option>
                    <option value="Lab Manual">Lab Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Semester</label>
                  <input
                    type="text"
                    value={resSemester}
                    onChange={(e) => setResSemester(e.target.value)}
                    placeholder="Semester 4"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Study Group Modal */}
      {newGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-heading font-semibold text-base text-[#262626] mb-3">
              Create New Study Group
            </h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Course / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems & Shell Scripting"
                  value={groupSubject}
                  onChange={(e) => setGroupSubject(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Description & Goal</label>
                <textarea
                  rows={2}
                  placeholder="What will the group focus on? (e.g. Solving past 5 years papers together)"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Next Session Date</label>
                  <input
                    type="text"
                    value={groupNextDate}
                    onChange={(e) => setGroupNextDate(e.target.value)}
                    placeholder="Sunday, 4:00 PM"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Session Topic</label>
                  <input
                    type="text"
                    value={groupNextTopic}
                    onChange={(e) => setGroupNextTopic(e.target.value)}
                    placeholder="Virtual Memory Paging"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewGroupModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Start Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
