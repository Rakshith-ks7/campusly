import { db, doc, getDoc, setDoc, updateDoc, collection, getDocs } from './firebase';
import { StudentProfile } from '../types';

const STUDENTS_COLLECTION = 'students';

export class FirestoreService {
  private static instance: FirestoreService;

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  /**
   * Fetch a single student profile by UID from Firestore
   */
  public async getStudentProfile(uid: string): Promise<StudentProfile | null> {
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as StudentProfile;
      }
      return null;
    } catch (err) {
      console.warn(`Firestore getStudentProfile fallback for ${uid}:`, err);
      return null;
    }
  }

  /**
   * Create an initial student profile in Firestore upon registration
   */
  public async createInitialStudentProfile(
    uid: string,
    name: string,
    email: string,
    avatarUrl?: string,
    isVerified: boolean = false
  ): Promise<StudentProfile> {
    const now = new Date().toISOString();
    const initialProfile: StudentProfile = {
      id: uid,
      name: name || 'Campus Student',
      email,
      avatar: avatarUrl || '/avatars/avatar-1.png',
      college: 'Kishkinda University',
      university: 'Kishkinda University',
      department: 'Computer Science & Engineering',
      year: '1st Year',
      semester: '1st Semester',
      location: 'Campus',
      localityRadius: 'Same College',
      bio: 'New student on Campusly looking to connect, learn, and collaborate.',
      skills: [],
      interests: [],
      experienceYears: 0,
      availability: '10-20 hrs/wk',
      links: {},
      reputation: {
        score: 5.0,
        reviewCount: 0,
        completedProjects: 0,
        hackathonWins: 0,
        verifiedSkillsCount: 0
      },
      lookingFor: ['Friends', 'Project teammates'],
      joinedCommunityIds: [],
      registeredEventIds: [],
      connectionIds: [],
      onboardingCompleted: false,
      isVerifiedStudent: isVerified,
      createdAt: now,
      updatedAt: now
    };

    try {
      const docRef = doc(db, STUDENTS_COLLECTION, uid);
      await setDoc(docRef, initialProfile, { merge: true });
    } catch (err) {
      console.warn('Firestore createInitialStudentProfile warning:', err);
    }

    return initialProfile;
  }

  /**
   * Update student profile in Firestore
   */
  public async updateStudentProfile(
    uid: string,
    updates: Partial<StudentProfile>
  ): Promise<void> {
    const updatedAt = new Date().toISOString();
    const dataToUpdate = {
      ...updates,
      updatedAt
    };

    try {
      const docRef = doc(db, STUDENTS_COLLECTION, uid);
      await setDoc(docRef, dataToUpdate, { merge: true });
    } catch (err) {
      console.warn(`Firestore updateStudentProfile warning for ${uid}:`, err);
    }
  }

  /**
   * Fetch all registered students from Firestore for universal discovery
   */
  public async getAllStudents(): Promise<StudentProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
      const students: StudentProfile[] = [];
      snapshot.forEach(docSnap => {
        students.push(docSnap.data() as StudentProfile);
      });
      return students;
    } catch (err) {
      console.warn('Firestore getAllStudents fallback:', err);
      return [];
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
