export type SkillCategory = 
  | 'Programming' 
  | 'Web Development' 
  | 'AI / ML' 
  | 'Design' 
  | 'Hardware & IoT' 
  | 'Business & Product' 
  | 'Cloud & DevOps';

export interface SkillItem {
  name: string;
  category: SkillCategory;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years: number;
  verified?: boolean;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  photoURL?: string;
  college: string;
  university: string;
  department: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Postgraduate';
  semester: string;
  location: string;
  localityRadius?: 'Same College' | '5 km' | '10 km' | 'City' | 'Remote';
  bio: string;
  skills: SkillItem[];
  interests: string[];
  experienceYears: number;
  availability: '5-10 hrs/wk' | '10-20 hrs/wk' | '20+ hrs/wk' | 'Full-time Hackathon';
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    resume?: string;
  };
  reputation: {
    score: number; // e.g., 4.9
    reviewCount: number;
    completedProjects: number;
    hackathonWins: number;
    verifiedSkillsCount: number;
  };
  lookingFor?: string[];
  joinedCommunityIds?: string[];
  registeredEventIds?: string[];
  connectionIds?: string[];
  isAdmin?: boolean;
  creatorRole?: string;
  creatorLookingFor?: string[];
  onboardingCompleted?: boolean;
  isVerifiedStudent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamRoleSlot {
  id: string;
  title: string;
  skills: string[];
  assignedStudentId?: string;
  assignedStudentName?: string;
  assignedAvatar?: string;
  isFilled: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Hackathon' | 'College Project' | 'Startup / MVP' | 'Research' | 'Open Source' | 'Robotics';
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  teamSize: number;
  maxMembers: number;
  deadline: string;
  locationType: 'Online' | 'Offline' | 'Hybrid';
  locationName: string;
  requiredSkills: string[];
  roles: TeamRoleSlot[];
  difficulty: 'Beginner Friendly' | 'Intermediate' | 'Advanced';
  tags: string[];
  status: 'open' | 'in_progress' | 'completed';
  teamId?: string;
  createdAt: string;
}

export interface TeamMember {
  studentId: string;
  studentName: string;
  avatar: string;
  role: string;
  joinedAt: string;
  isLeader?: boolean;
}

export interface Team {
  id: string;
  projectId: string;
  projectTitle: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMember[];
  createdAt: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface KanbanTask {
  id: string;
  teamId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  assigneeName?: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  createdAt: string;
}

export interface TeamDiscussion {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface ApplicationRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  roleId: string;
  roleTitle: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  applicantCollege: string;
  applicantDepartment: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  matchScore: number;
  createdAt: string;
}

export interface MatchingWeights {
  skills: number;          // Default 40
  interests: number;       // Default 15
  availability: number;    // Default 15
  experience: number;      // Default 10
  projectInterests: number;// Default 10
  location: number;        // Default 5
  education: number;       // Default 5
}

export interface CompatibilityBreakdown {
  skillsScore: number;
  interestsScore: number;
  availabilityScore: number;
  experienceScore: number;
  locationScore: number;
  educationScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface CompatibilityResult {
  studentId: string;
  student: StudentProfile;
  overallMatch: number;
  breakdown: CompatibilityBreakdown;
}

export interface AiTeamRoleRecommendation {
  roleTitle: string;
  requiredSkills: string[];
  recommendedStudent: StudentProfile;
  matchPercentage: number;
  rationale: string;
}

export interface AiTeamBuilderResult {
  projectConcept: string;
  detectedCategory: string;
  extractedRoles: AiTeamRoleRecommendation[];
  averageTeamMatch: number;
  deviceUsed: string;
}

// ----------------------------------------------------
// COLLEGE STUDENT COMMUNITY PLATFORM EXTENSIONS
// ----------------------------------------------------

export type CommunityCategory = 
  | 'Programming' 
  | 'AI & Data' 
  | 'Exam & Academic' 
  | 'Content & Media' 
  | 'Robotics & Hardware' 
  | 'Social & Hobbies' 
  | 'Entrepreneurship' 
  | 'Design & Creative';

export interface CommunityMember {
  studentId: string;
  studentName: string;
  avatar: string;
  role: 'lead' | 'moderator' | 'member';
  joinedAt: string;
}

export interface DiscussionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
}

export interface CommunityDiscussion {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  likes: number;
  likedBy?: string[];
  comments: DiscussionComment[];
  createdAt: string;
}

export interface CommunityResource {
  id: string;
  communityId: string;
  title: string;
  description?: string;
  url: string;
  fileType: 'pdf' | 'notes' | 'repo' | 'link' | 'video';
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
  downloadsCount?: number;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CommunityCategory;
  memberCount: number;
  avatar: string;
  image?: string;
  banner?: string;
  tags: string[];
  rules: string[];
  leadName: string;
  leadAvatar: string;
  createdAt: string;
  isJoined?: boolean;
}

export type EventCategory = 
  | 'Technical' 
  | 'Coding' 
  | 'AI' 
  | 'Career' 
  | 'Workshops' 
  | 'Seminars' 
  | 'Guest Lectures' 
  | 'Cultural' 
  | 'Photography' 
  | 'Club Events' 
  | 'Competitions'
  | 'Academic';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  organizerClub: string;
  organizerName: string;
  organizerAvatar: string;
  seatsTotal: number;
  seatsFilled: number;
  registrationDeadline: string;
  tags: string[];
  image: string;
  isRegistered?: boolean;
  registeredStudentIds?: string[];
  skillsGained?: string[];
}

export interface CollegeClub {
  id: string;
  name: string;
  category: string;
  description: string;
  leadName: string;
  leadAvatar: string;
  memberCount: number;
  announcements: { id: string; title: string; content: string; date: string }[];
  logo: string;
  upcomingEventIds: string[];
}

export interface StudyGroup {
  id: string;
  subject: string;
  semester: string;
  description: string;
  memberCount: number;
  members: string[]; // student ids
  nextSessionDate: string;
  nextSessionTopic: string;
  creatorName: string;
  creatorAvatar: string;
}

export interface StudyResource {
  id: string;
  subject: string;
  title: string;
  fileType: 'Notes PDF' | 'Question Paper' | 'Formula Sheet' | 'Lab Manual';
  semester: string;
  authorName: string;
  authorCollege: string;
  downloads: number;
  dateAdded: string;
  downloadUrl?: string;
}

export interface ConnectionRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  fromDepartment: string;
  fromCollege: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  note?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  studentId: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  type: 'connection' | 'event' | 'project' | 'community' | 'general';
  timestamp: string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'discussion' | 'project' | 'event';
  targetId: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  timestamp: string;
}

export interface UniversalSearchResult {
  students: StudentProfile[];
  projects: Project[];
  events: CampusEvent[];
  communities: Community[];
  studyGroups: StudyGroup[];
  discussions: CommunityDiscussion[];
}

// ==========================================
// Follow & Relationships
// ==========================================
export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

// ==========================================
// Chat & Conversation System
// ==========================================
export type ChatStatus = 
  | 'NO_RELATIONSHIP'
  | 'REQUESTED'
  | 'UNLOCKED'
  | 'BLOCKED'
  | 'IGNORED';

export interface ParticipantSummary {
  id: string;
  name: string;
  avatar: string;
  college: string;
  department: string;
}

export interface Conversation {
  id: string; // deterministic: [uidA, uidB].sort().join('_')
  participantIds: string[];
  participantDetails: Record<string, ParticipantSummary>;
  chatStatus: ChatStatus;
  initiatedBy: string;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  archivedFor?: string[];
  deletedFor?: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
  messageType: 'text';
  deletedFor?: string[];
}

// ==========================================
// Privacy & Moderation
// ==========================================
export interface PrivacySettings {
  whoCanFollow: 'Everyone' | 'Campus students only';
  whoCanMessage: 'Everyone' | 'Students I follow' | 'Campus students only';
  showOnlineStatus: boolean;
  showInDiscover: boolean;
}

export interface BlockRecord {
  id: string;
  blockedBy: string;
  blockedUser: string;
  blockedAt: string;
}

export interface UserReport {
  id: string;
  reportedBy: string;
  reportedUser: string;
  conversationId?: string;
  messageId?: string;
  reason: 'Spam' | 'Harassment' | 'Inappropriate content' | 'Fake profile' | 'Scam' | 'Other';
  description?: string;
  createdAt: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

// ==========================================
// Campusly Feedback System
// ==========================================
export type FeedbackType = 
  | 'general' 
  | 'bug' 
  | 'feature' 
  | 'ui_ux' 
  | 'event' 
  | 'project' 
  | 'other';

export type FeedbackStatus = 
  | 'new' 
  | 'reviewing' 
  | 'planned' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed';

export type FeedbackPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export interface BugReportDetails {
  whatWentWrong: string;
  tryingToDo: string;
  expectedBehavior: string;
  actualBehavior: string;
}

export interface FeatureRequestDetails {
  featureTitle: string;
  studentBenefit: string;
  targetAudience: 'Students' | 'Clubs' | 'Project teams' | 'Event organizers' | 'Content creators' | 'Everyone' | 'Other';
}

export interface EventFeedbackDetails {
  eventId: string;
  eventTitle: string;
  rating: number; // 1 to 5
  whatLiked: string;
  whatImprove: string;
  wouldAttendAgain: 'Yes' | 'Maybe' | 'No';
}

export interface ProjectFeedbackDetails {
  projectId: string;
  projectTitle: string;
  communicationRating: number;
  reliabilityRating: number;
  teamworkRating: number;
  contributionNotes: string;
}

export interface FeedbackAdminResponse {
  message: string;
  respondedBy: string;
  respondedAt: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  type: FeedbackType;
  message: string;
  page?: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  anonymous: boolean;
  screenshotUrl?: string;
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Other';
  browser: string;
  contactMe: boolean;
  createdAt: string;
  updatedAt: string;
  bugDetails?: BugReportDetails;
  featureDetails?: FeatureRequestDetails;
  eventDetails?: EventFeedbackDetails;
  projectDetails?: ProjectFeedbackDetails;
  adminResponse?: FeedbackAdminResponse;
}



