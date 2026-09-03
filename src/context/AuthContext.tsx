import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  FirebaseUser, 
  onAuthStateChanged,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle as fbLoginWithGoogle,
  logoutFirebase,
  sendUserVerificationEmail,
  sendUserPasswordReset,
  updateAuthProfile
} from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import { dataService } from '../services/dataService';
import { StudentProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  onboardingCompleted: boolean;
  signUp: (name: string, email: string, pass: string) => Promise<FirebaseUser>;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
  updateProfileData: (updates: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile from Firestore or fallback
  const syncProfile = async (fbUser: FirebaseUser) => {
    let profile = await firestoreService.getStudentProfile(fbUser.uid);
    if (!profile) {
      // Check if dataService has it cached
      const cached = dataService.getStudentById(fbUser.uid);
      if (cached) {
        profile = cached;
      } else {
        // Create initial profile in Firestore preserving Google photoURL
        profile = await firestoreService.createInitialStudentProfile(
          fbUser.uid,
          fbUser.displayName || 'Campus Student',
          fbUser.email || '',
          fbUser.photoURL || undefined,
          Boolean(fbUser.emailVerified)
        );
      }
    } else if (fbUser.photoURL && profile.avatar.startsWith('/avatars/avatar-1')) {
      // Enhance initial default avatar with real Google photo if available
      profile.avatar = fbUser.photoURL;
      firestoreService.updateStudentProfile(fbUser.uid, { avatar: fbUser.photoURL });
    }

    setStudentProfile(profile);
    dataService.updateProfile(profile);
    dataService.setCurrentUser(profile.id);
    return profile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          await syncProfile(user);
        } catch (err) {
          console.warn('Profile sync warning on auth change:', err);
        }
      } else {
        setCurrentUser(null);
        setStudentProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (name: string, email: string, pass: string): Promise<FirebaseUser> => {
    const user = await registerWithEmail(email, pass);
    if (name) {
      try {
        await updateAuthProfile(user, { displayName: name });
      } catch (err) {
        console.warn('Could not update displayName:', err);
      }
    }

    // Create Firestore record
    const profile = await firestoreService.createInitialStudentProfile(user.uid, name, email);
    setStudentProfile(profile);
    dataService.updateProfile(profile);
    dataService.setCurrentUser(profile.id);

    // Send email verification safely
    try {
      await sendUserVerificationEmail(user);
    } catch (err) {
      console.warn('Verification email send notice:', err);
    }

    return user;
  };

  const login = async (email: string, pass: string): Promise<FirebaseUser> => {
    const user = await loginWithEmail(email, pass);
    await syncProfile(user);
    return user;
  };

  const loginWithGoogle = async (): Promise<FirebaseUser> => {
    const user = await fbLoginWithGoogle();
    await syncProfile(user);
    return user;
  };

  const logout = async (): Promise<void> => {
    await logoutFirebase();
    setCurrentUser(null);
    setStudentProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendUserPasswordReset(email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendUserVerificationEmail(auth.currentUser);
    }
  };

  const reloadUser = async (): Promise<void> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setCurrentUser(auth.currentUser);
      await syncProfile(auth.currentUser);
    }
  };

  const updateProfileData = async (updates: Partial<StudentProfile>): Promise<void> => {
    if (!currentUser || !studentProfile) return;
    const merged = { ...studentProfile, ...updates };
    setStudentProfile(merged);
    dataService.updateProfile(merged);
    await firestoreService.updateStudentProfile(currentUser.uid, updates);
  };

  const isEmailVerified = Boolean(currentUser?.emailVerified);
  const onboardingCompleted = Boolean(studentProfile?.onboardingCompleted);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        studentProfile,
        loading,
        isEmailVerified,
        onboardingCompleted,
        signUp,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        sendVerificationEmail,
        reloadUser,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
