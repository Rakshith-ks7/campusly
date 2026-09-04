import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { StudentProfile, MatchingWeights, Project } from './types';
import { dataService } from './services/dataService';
import { DEFAULT_WEIGHTS } from './services/matchingAlgorithm';

// Auth Provider & Guards
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';

// Global Components
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { MatchingWeightsDrawer } from './components/MatchingWeightsDrawer';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AuthModal } from './components/AuthModal';
import { CampusAlertPopup } from './components/CampusAlertPopup';

// Dedicated Auth Pages
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';

// Community Platform Pages
import { HomePage } from './pages/HomePage';
import { StudentDirectoryPage } from './pages/StudentDirectoryPage';
import { ProjectMarketplacePage } from './pages/ProjectMarketplacePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AiTeamBuilderPage } from './pages/AiTeamBuilderPage';
import { TeamWorkspacePage } from './pages/TeamWorkspacePage';
import { ProfilePage } from './pages/ProfilePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ProgrammingHubPage } from './pages/ProgrammingHubPage';
import { ExamPrepHubPage } from './pages/ExamPrepHubPage';
import { ContentCreatorHubPage } from './pages/ContentCreatorHubPage';
import { FriendsHubPage } from './pages/FriendsHubPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ClubsPage } from './pages/ClubsPage';
import { MessagesPage } from './pages/MessagesPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser: fbUser, studentProfile } = useAuth();
  
  // Real authenticated student profile from AuthContext
  const fallbackUser = dataService.getCurrentUser();
  const [currentUser, setCurrentUser] = useState<StudentProfile>(studentProfile || fallbackUser);
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);
  
  // Sync when studentProfile updates from AuthProvider
  useEffect(() => {
    if (studentProfile) {
      setCurrentUser(studentProfile);
    }
  }, [studentProfile]);

  // Modals
  const [weightsDrawerOpen, setWeightsDrawerOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleProjectCreated = (_project: Project) => {
    // Handled in service
  };

  return (
    <div className="min-h-screen bg-[#FFF8F8] text-[#262626] flex flex-col selection:bg-[#FFE4E6] selection:text-[#E63946] font-['Inter',sans-serif]">
      
      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onCreateProjectClick={() => setCreateProjectOpen(true)}
        onAuthClick={() => setAuthModalOpen(true)}
      />

      {/* Main Routed Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Routes>
          
          {/* Public Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicOnlyRoute>
                <SignUpPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicOnlyRoute>
                <ForgotPasswordPage />
              </PublicOnlyRoute>
            } 
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Guided Onboarding */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />

          {/* Core Home (Dynamic: Shows personalized dashboard when logged in) */}
          <Route 
            path="/" 
            element={
              <HomePage 
                currentUser={currentUser} 
                weights={weights} 
                onOpenWeightsDrawer={() => setWeightsDrawerOpen(true)} 
              />
            } 
          />

          {/* Campus Discovery & 4 Hubs */}
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/discover/programming" element={<ProgrammingHubPage />} />
          <Route path="/discover/exams" element={<ExamPrepHubPage />} />
          <Route path="/discover/creators" element={<ContentCreatorHubPage />} />
          <Route path="/discover/friends" element={<FriendsHubPage />} />

          {/* Communities & Events */}
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:id" element={<CommunityDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/clubs" element={<ClubsPage />} />

          {/* Administration */}
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/* Projects & Team Finder */}
          <Route 
            path="/students" 
            element={
              <StudentDirectoryPage 
                currentUser={currentUser} 
                weights={weights} 
                onOpenWeightsDrawer={() => setWeightsDrawerOpen(true)} 
              />
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ProjectMarketplacePage 
                currentUser={currentUser} 
                onCreateProjectClick={() => setCreateProjectOpen(true)} 
              />
            } 
          />
          <Route 
            path="/projects/:id" 
            element={<ProjectDetailPage currentUser={currentUser} />} 
          />

          {/* Protected Pages */}
          <Route 
            path="/ai-builder" 
            element={
              <ProtectedRoute>
                <AiTeamBuilderPage currentUser={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workspace" 
            element={
              <ProtectedRoute>
                <TeamWorkspacePage currentUser={currentUser} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage 
                  currentUser={currentUser} 
                  onProfileUpdated={(updated) => setCurrentUser(updated)} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <ProfilePage 
                  currentUser={currentUser} 
                  onProfileUpdated={(updated) => setCurrentUser(updated)} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/messages/:conversationId" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <MatchingWeightsDrawer
        isOpen={weightsDrawerOpen}
        onClose={() => setWeightsDrawerOpen(false)}
        weights={weights}
        onWeightsChange={setWeights}
      />

      <CreateProjectModal
        isOpen={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        currentUser={currentUser}
        onProjectCreated={handleProjectCreated}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onUserAuthenticated={(user) => setCurrentUser(user)}
      />

      {/* Non-Disturbing Campus Hackathon & Event Alert Popup */}
      <CampusAlertPopup />

      {/* Clean Student-Friendly Footer */}
      <footer className="bg-white border-t border-[#E5E5E5] py-8 pb-24 md:pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/campusly-logo.jpg"
              alt="Campusly Logo"
              className="w-7 h-7 object-contain rounded-md border border-[#E5E5E5] bg-white"
            />
            <span className="font-heading font-semibold text-sm text-[#262626]">
              Campus<span className="text-[#E63946]">ly</span>
            </span>
            <span className="text-xs text-[#666666]">
              — Connect. Collaborate. Grow Together.
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#666666]">
            <Link
              to="/feedback"
              className="hover:text-[#E63946] transition font-medium"
            >
              Give Feedback
            </Link>
            <span className="text-[#E5E5E5]">•</span>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-[#E63946] fill-[#E63946]" />
              <span>for collegiate collaboration</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Fixed Mobile Bottom Navigation */}
      <BottomNavigation
        currentUser={currentUser}
        onCreateProjectClick={() => setCreateProjectOpen(true)}
      />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
