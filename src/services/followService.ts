import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from './firebase';
import { FollowStats, StudentProfile } from '../types';
import { firestoreService } from './firestoreService';

// LocalStorage cache key prefix for instantaneous UI feedback & offline resilience
const FOLLOW_STORAGE_PREFIX = 'campusly_following_';

export class FollowService {
  private static instance: FollowService;

  public static getInstance(): FollowService {
    if (!FollowService.instance) {
      FollowService.instance = new FollowService();
    }
    return FollowService.instance;
  }

  /**
   * Follow a fellow student.
   * Creates:
   * 1. students/{currentUid}/following/{targetUid}
   * 2. students/{targetUid}/followers/{currentUid}
   * 3. students/{targetUid}/notifications (via Firestore)
   */
  public async followUser(
    currentUid: string,
    targetUid: string,
    currentStudent?: StudentProfile,
    targetStudent?: StudentProfile
  ): Promise<boolean> {
    if (!currentUid || !targetUid || currentUid === targetUid) return false;

    const now = new Date().toISOString();

    // 1. Update local cache for instant UI response
    const cachedFollowing = this.getLocalFollowing(currentUid);
    if (!cachedFollowing.includes(targetUid)) {
      cachedFollowing.push(targetUid);
      localStorage.setItem(FOLLOW_STORAGE_PREFIX + currentUid, JSON.stringify(cachedFollowing));
    }

    try {
      // 2. Firestore subcollection writes
      const followingRef = doc(db, 'students', currentUid, 'following', targetUid);
      await setDoc(followingRef, {
        targetUid,
        createdAt: now
      }, { merge: true });

      const followerRef = doc(db, 'students', targetUid, 'followers', currentUid);
      await setDoc(followerRef, {
        followerUid: currentUid,
        createdAt: now
      }, { merge: true });

      // 3. Send real Firestore notification to target student
      const senderName = currentStudent?.name || 'A student';
      await firestoreService.sendNotification(targetUid, {
        actorUid: currentUid,
        title: 'New Follower! 👤',
        message: `${senderName} started following your profile on Campusly.`,
        link: `/profile/${currentUid}`,
        type: 'connection'
      });

      return true;
    } catch (err) {
      console.warn('Firestore followUser fallback to local cache:', err);
      return true;
    }
  }

  /**
   * Unfollow a student
   */
  public async unfollowUser(currentUid: string, targetUid: string): Promise<boolean> {
    if (!currentUid || !targetUid) return false;

    // 1. Remove from local cache
    const cachedFollowing = this.getLocalFollowing(currentUid);
    const updated = cachedFollowing.filter(id => id !== targetUid);
    localStorage.setItem(FOLLOW_STORAGE_PREFIX + currentUid, JSON.stringify(updated));

    try {
      // 2. Firestore deletes
      const followingRef = doc(db, 'students', currentUid, 'following', targetUid);
      await deleteDoc(followingRef);

      const followerRef = doc(db, 'students', targetUid, 'followers', currentUid);
      await deleteDoc(followerRef);

      return true;
    } catch (err) {
      console.warn('Firestore unfollowUser fallback:', err);
      return true;
    }
  }

  /**
   * Check if currentUid follows targetUid
   */
  public async isFollowing(currentUid: string, targetUid: string): Promise<boolean> {
    if (!currentUid || !targetUid) return false;

    // Fast local cache check
    const cached = this.getLocalFollowing(currentUid);
    if (cached.includes(targetUid)) return true;

    try {
      const followingRef = doc(db, 'students', currentUid, 'following', targetUid);
      const snap = await getDoc(followingRef);
      if (snap.exists()) {
        if (!cached.includes(targetUid)) {
          cached.push(targetUid);
          localStorage.setItem(FOLLOW_STORAGE_PREFIX + currentUid, JSON.stringify(cached));
        }
        return true;
      }
      return false;
    } catch (err) {
      return cached.includes(targetUid);
    }
  }

  /**
   * Check if two users mutually follow each other (A follows B AND B follows A)
   */
  public async checkMutualFollow(uidA: string, uidB: string): Promise<boolean> {
    if (!uidA || !uidB || uidA === uidB) return false;

    const [aFollowsB, bFollowsA] = await Promise.all([
      this.isFollowing(uidA, uidB),
      this.isFollowing(uidB, uidA)
    ]);

    return aFollowsB && bFollowsA;
  }

  /**
   * Get followers and following counts for a user from real Firestore subcollections
   */
  public async getFollowStats(uid: string): Promise<FollowStats> {
    if (!uid) return { followersCount: 0, followingCount: 0 };

    try {
      const [followersSnap, followingSnap] = await Promise.all([
        getDocs(collection(db, 'students', uid, 'followers')),
        getDocs(collection(db, 'students', uid, 'following'))
      ]);

      const followersCount = followersSnap.size;
      const followingCount = followingSnap.size;

      return { followersCount, followingCount };
    } catch (err) {
      const cachedFollowing = this.getLocalFollowing(uid);
      return {
        followersCount: 0,
        followingCount: cachedFollowing.length
      };
    }
  }

  /**
   * Get list of following UIDs
   */
  public async getFollowingList(uid: string): Promise<string[]> {
    if (!uid) return [];
    try {
      const snap = await getDocs(collection(db, 'students', uid, 'following'));
      const list: string[] = [];
      snap.forEach(d => list.push(d.id));
      return list;
    } catch (err) {
      return this.getLocalFollowing(uid);
    }
  }

  /**
   * Get list of follower UIDs
   */
  public async getFollowersList(uid: string): Promise<string[]> {
    if (!uid) return [];
    try {
      const snap = await getDocs(collection(db, 'students', uid, 'followers'));
      const list: string[] = [];
      snap.forEach(d => list.push(d.id));
      return list;
    } catch (err) {
      return [];
    }
  }

  private getLocalFollowing(uid: string): string[] {
    try {
      const raw = localStorage.getItem(FOLLOW_STORAGE_PREFIX + uid);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const followService = FollowService.getInstance();
