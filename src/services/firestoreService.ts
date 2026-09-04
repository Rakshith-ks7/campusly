import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from './firebase';
import { StudentProfile, NotificationItem } from '../types';

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
   * Helper to normalize a Firestore student document into the standard StudentProfile interface
   */
  private normalizeStudent(docId: string, d: any): StudentProfile {
    return {
      id: d.uid || d.id || docId,
      name: d.fullName || d.name || 'Campus Student',
      email: d.email || '',
      avatar: d.photoURL || d.profilePhoto || d.avatar || '/avatars/avatar-1.png',
      photoURL: d.photoURL || d.profilePhoto || d.avatar || undefined,
      college: d.college || d.university || 'Campus',
      university: d.university || d.college || 'Campus',
      department: d.branch || d.department || 'Student',
      year: d.year || '1st Year',
      semester: d.semester || '1st Semester',
      location: d.location || 'Campus',
      localityRadius: d.localityRadius || 'Same College',
      bio: d.bio || '',
      skills: Array.isArray(d.skills) ? d.skills : [],
      interests: Array.isArray(d.interests) ? d.interests : [],
      experienceYears: d.experienceYears || 0,
      availability: d.availability || '10-20 hrs/wk',
      links: d.links || d.socialLinks || {},
      reputation: d.reputation || {
        score: 5.0,
        reviewCount: 0,
        completedProjects: 0,
        hackathonWins: 0,
        verifiedSkillsCount: 0
      },
      lookingFor: Array.isArray(d.lookingFor) ? d.lookingFor : ['Friends', 'Project teammates'],
      joinedCommunityIds: Array.isArray(d.joinedCommunityIds) ? d.joinedCommunityIds : [],
      registeredEventIds: Array.isArray(d.registeredEventIds) ? d.registeredEventIds : [],
      connectionIds: Array.isArray(d.connectionIds) ? d.connectionIds : [],
      isAdmin: Boolean(d.isAdmin),
      onboardingCompleted: Boolean(d.onboardingCompleted),
      isVerifiedStudent: Boolean(d.isVerifiedStudent),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    };
  }

  /**
   * Fetch a single student profile by UID from Firestore
   */
  public async getStudentProfile(uid: string): Promise<StudentProfile | null> {
    if (!uid) return null;
    try {
      const docRef = doc(db, STUDENTS_COLLECTION, uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return this.normalizeStudent(snapshot.id, snapshot.data());
      }
      return null;
    } catch (err) {
      console.warn(`Firestore getStudentProfile warning for ${uid}:`, err);
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
    const cleanAvatar = avatarUrl || '/avatars/avatar-1.png';
    const cleanName = name || 'Campus Student';

    const initialData = {
      uid,
      id: uid,
      fullName: cleanName,
      name: cleanName,
      email,
      profilePhoto: cleanAvatar,
      avatar: cleanAvatar,
      college: 'Kishkinda University',
      university: 'Kishkinda University',
      branch: 'Computer Science & Engineering',
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
      socialLinks: {},
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
      await setDoc(docRef, initialData, { merge: true });
    } catch (err) {
      console.warn('Firestore createInitialStudentProfile warning:', err);
    }

    return this.normalizeStudent(uid, initialData);
  }

  /**
   * Update student profile in Firestore
   */
  public async updateStudentProfile(
    uid: string,
    updates: Partial<StudentProfile>
  ): Promise<void> {
    if (!uid) return;
    const updatedAt = new Date().toISOString();
    
    // Write dual keys for maximum compatibility
    const dataToUpdate: any = {
      ...updates,
      updatedAt
    };

    if (updates.name) {
      dataToUpdate.fullName = updates.name;
    }
    if (updates.department) {
      dataToUpdate.branch = updates.department;
    }
    if (updates.avatar) {
      dataToUpdate.profilePhoto = updates.avatar;
    }
    if (updates.photoURL) {
      dataToUpdate.photoURL = updates.photoURL;
      if (!updates.avatar) {
        dataToUpdate.avatar = updates.photoURL;
        dataToUpdate.profilePhoto = updates.photoURL;
      }
    }
    if (updates.college) {
      dataToUpdate.university = updates.college;
    }

    try {
      const docRef = doc(db, STUDENTS_COLLECTION, uid);
      await setDoc(docRef, dataToUpdate, { merge: true });

      // Mirror photoURL to users/{userId}.photoURL as required
      if (updates.photoURL !== undefined || updates.avatar !== undefined) {
        const photoToSave = updates.photoURL !== undefined ? updates.photoURL : updates.avatar;
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, { 
          uid,
          photoURL: photoToSave,
          avatar: photoToSave,
          updatedAt 
        }, { merge: true });
      }
    } catch (err) {
      console.warn(`Firestore updateStudentProfile warning for ${uid}:`, err);
    }
  }

  /**
   * Remove profile photo: resets photoURL and sets avatar back to default
   */
  public async removeProfilePhoto(uid: string): Promise<void> {
    if (!uid) return;
    const defaultAvatar = '/avatars/avatar-1.png';
    await this.updateStudentProfile(uid, {
      avatar: defaultAvatar,
      photoURL: ''
    });
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        uid,
        photoURL: '',
        avatar: defaultAvatar,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn(`removeProfilePhoto users warning for ${uid}:`, err);
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
        students.push(this.normalizeStudent(docSnap.id, docSnap.data()));
      });
      return students;
    } catch (err) {
      console.error('Firestore getAllStudents error:', err);
      throw err;
    }
  }

  /**
   * Search real students in Firestore, excluding current user
   */
  public async searchStudents(rawQuery: string, currentUid?: string): Promise<StudentProfile[]> {
    const queryStr = rawQuery.toLowerCase().trim();
    const all = await this.getAllStudents();
    const otherStudents = currentUid ? all.filter(s => s.id !== currentUid) : all;
    
    if (!queryStr) return otherStudents;

    return otherStudents.filter(s => 
      s.name.toLowerCase().includes(queryStr) ||
      s.department.toLowerCase().includes(queryStr) ||
      s.college.toLowerCase().includes(queryStr) ||
      s.skills.some(sk => sk.name.toLowerCase().includes(queryStr)) ||
      s.interests.some(i => i.toLowerCase().includes(queryStr)) ||
      (s.lookingFor && s.lookingFor.some(lf => lf.toLowerCase().includes(queryStr)))
    );
  }

  /**
   * Send a notification to a recipient student in Firestore
   */
  public async sendNotification(
    recipientUid: string,
    notif: {
      actorUid?: string;
      title: string;
      message: string;
      link: string;
      type: 'connection' | 'event' | 'project' | 'chat';
    }
  ): Promise<void> {
    if (!recipientUid) return;
    try {
      const now = new Date().toISOString();
      const notifsCol = collection(db, STUDENTS_COLLECTION, recipientUid, 'notifications');
      const newDoc = doc(notifsCol);
      await setDoc(newDoc, {
        id: newDoc.id,
        studentId: recipientUid,
        actorUid: notif.actorUid || '',
        title: notif.title,
        message: notif.message,
        link: notif.link,
        type: notif.type,
        read: false,
        createdAt: now,
        timestamp: 'Just now'
      });
    } catch (err) {
      console.warn(`Firestore sendNotification warning to ${recipientUid}:`, err);
    }
  }

  /**
   * Real-time subscription to notifications for a student
   */
  public subscribeToNotifications(
    studentId: string,
    callback: (notifications: NotificationItem[]) => void
  ): () => void {
    if (!studentId) {
      callback([]);
      return () => {};
    }

    try {
      const notifsCol = collection(db, STUDENTS_COLLECTION, studentId, 'notifications');
      const q = query(notifsCol, orderBy('createdAt', 'desc'), limit(40));

      return onSnapshot(q, (snapshot) => {
        const notifs: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          notifs.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
        callback(notifs);
      }, (err) => {
        console.warn('Firestore subscribeToNotifications warning:', err);
        callback([]);
      });
    } catch (err) {
      console.warn('Firestore subscribeToNotifications error:', err);
      return () => {};
    }
  }

  /**
   * Mark a notification as read
   */
  public async markNotificationRead(studentId: string, notifId: string): Promise<void> {
    if (!studentId || !notifId) return;
    try {
      const notifRef = doc(db, STUDENTS_COLLECTION, studentId, 'notifications', notifId);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      console.warn('markNotificationRead warning:', err);
    }
  }
}

export const firestoreService = FirestoreService.getInstance();
