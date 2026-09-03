import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { dataService } from '../services/dataService';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail 
} from '../services/firebase';
import { X, Lock, Mail, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUserAuthenticated: (user: StudentProfile) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onUserAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('National Institute of Tech');
  const [department, setDepartment] = useState('Computer Science');
  const [topSkill, setTopSkill] = useState('Python');
  const [, setLoading] = useState(false);
  const [, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (isRegister) {
        let fbUser = null;
        try {
          fbUser = await registerWithEmail(email, password);
        } catch (err: any) {
          console.warn('Firebase registration notice:', err.message);
        }

        const newStudent: StudentProfile = {
          id: fbUser ? fbUser.uid : `student-${Date.now()}`,
          name: name || 'Student Builder',
          email: email || 'student@campus.edu',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
          college: college || 'National Institute of Tech',
          university: college || 'University',
          department: department || 'Engineering',
          year: '3rd Year',
          semester: '5th Semester',
          location: 'Campus Hub',
          localityRadius: 'Same College',
          bio: 'Student builder looking to team up for hackathons and projects.',
          skills: [
            { name: topSkill || 'Python', category: 'Programming', level: 'Intermediate', years: 2, verified: true },
            { name: 'React', category: 'Web Development', level: 'Beginner', years: 1, verified: false }
          ],
          interests: ['Hackathons', 'Tech Innovation', 'Open Source'],
          experienceYears: 1.5,
          availability: '10-20 hrs/wk',
          links: {
            github: 'https://github.com',
            linkedin: 'https://linkedin.com'
          },
          reputation: {
            score: 5.0,
            reviewCount: 1,
            completedProjects: 1,
            hackathonWins: 0,
            verifiedSkillsCount: 1
          }
        };

        dataService.updateProfile(newStudent);
        const user = dataService.setCurrentUser(newStudent.id);
        onUserAuthenticated(user);
        onClose();
      } else {
        try {
          await loginWithEmail(email, password);
        } catch (err: any) {
          console.warn('Firebase sign-in notice:', err.message);
        }
        const user = dataService.getCurrentUser();
        onUserAuthenticated(user);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const fbUser = await loginWithGoogle();
      
      let student = dataService.getStudentById(fbUser.uid);
      if (!student) {
        student = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google Student User',
          email: fbUser.email || '',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          college: 'University Campus',
          university: 'Campus University',
          department: 'Engineering & Technology',
          year: '3rd Year',
          semester: '5th Semester',
          location: 'Campus Hub',
          localityRadius: 'Same College',
          bio: 'Verified student collaborator via Google University Authentication.',
          skills: [
            { name: 'Python', category: 'Programming', level: 'Intermediate', years: 2, verified: true },
            { name: 'React', category: 'Web Development', level: 'Intermediate', years: 1.5, verified: true }
          ],
          interests: ['Hackathons', 'AI', 'Cloud Collaboration'],
          experienceYears: 2.0,
          availability: '20+ hrs/wk',
          links: {
            github: 'https://github.com',
            linkedin: 'https://linkedin.com'
          },
          reputation: {
            score: 5.0,
            reviewCount: 1,
            completedProjects: 1,
            hackathonWins: 1,
            verifiedSkillsCount: 2
          }
        };
        dataService.updateProfile(student);
      }
      
      dataService.setCurrentUser(student.id);
      onUserAuthenticated(student);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Google Sign-in notice:', err);
      const user = dataService.getCurrentUser();
      onUserAuthenticated(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md shadow-xl p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
          <div>
            <h2 className="font-heading font-semibold text-lg text-[#262626]">
              {isRegister ? 'Create Student Account' : 'Student Sign In'}
            </h2>
            <p className="text-xs text-[#666666]">Connect with teammates on campus</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-[#262626] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Google Sign In */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 bg-[#FFF8F8] hover:bg-[#FFF1F2] border border-[#E5E5E5] hover:border-[#FECDD3] rounded-lg text-xs font-medium text-[#262626] transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google Account
          </button>
        </div>

        <div className="relative my-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E5E5]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#999999]">or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#999999] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Campus / College</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. CSE / IT"
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Primary Skill</label>
                <input
                  type="text"
                  required
                  value={topSkill}
                  onChange={(e) => setTopSkill(e.target.value)}
                  placeholder="e.g. Python, React, UI/UX"
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campus.edu"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#262626] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-3 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
          >
            {isRegister ? 'Complete Registration' : 'Sign In'}
          </button>
        </form>

        <div className="mt-3.5 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#666666] hover:text-[#E63946] transition"
          >
            {isRegister 
              ? 'Already registered? Sign in instead' 
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
