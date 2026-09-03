import { 
  StudentProfile, 
  Project, 
  Team, 
  KanbanTask, 
  TeamDiscussion, 
  ApplicationRequest,
  TaskStatus,
  Community,
  CommunityCategory,
  CommunityDiscussion,
  CommunityResource,
  CampusEvent,
  CollegeClub,
  StudyGroup,
  StudyResource,
  ConnectionRequest,
  NotificationItem,
  ReportItem,
  UniversalSearchResult
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_PROJECTS, 
  INITIAL_TEAMS, 
  INITIAL_TASKS, 
  INITIAL_DISCUSSIONS, 
  INITIAL_APPLICATIONS,
  INITIAL_COMMUNITIES,
  INITIAL_COMMUNITY_DISCUSSIONS,
  INITIAL_COMMUNITY_RESOURCES,
  INITIAL_EVENTS,
  INITIAL_CLUBS,
  INITIAL_STUDY_GROUPS,
  INITIAL_STUDY_RESOURCES,
  INITIAL_CONNECTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS
} from './mockData';

const STORAGE_KEYS = {
  STUDENTS: 'tf_students_v1',
  PROJECTS: 'tf_projects_v1',
  TEAMS: 'tf_teams_v1',
  TASKS: 'tf_tasks_v1',
  DISCUSSIONS: 'tf_discussions_v1',
  APPLICATIONS: 'tf_applications_v1',
  CURRENT_USER_ID: 'tf_current_user_id_v1',
  USE_AI_SERVICE: 'tf_use_ai_service_v1',
  COMMUNITIES: 'tf_communities_v1',
  COMM_DISCUSSIONS: 'tf_comm_discussions_v1',
  COMM_RESOURCES: 'tf_comm_resources_v1',
  EVENTS: 'tf_events_v1',
  CLUBS: 'tf_clubs_v1',
  STUDY_GROUPS: 'tf_study_groups_v1',
  STUDY_RESOURCES: 'tf_study_resources_v1',
  CONNECTIONS: 'tf_connections_v1',
  NOTIFICATIONS: 'tf_notifications_v1',
  REPORTS: 'tf_reports_v1'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

export class DataService {
  private static instance: DataService;

  private constructor() {
    this.init();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      setStorage(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      setStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      setStorage(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      setStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISCUSSIONS)) {
      setStorage(STORAGE_KEYS.DISCUSSIONS, INITIAL_DISCUSSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      setStorage(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNITIES)) {
      setStorage(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMM_DISCUSSIONS)) {
      setStorage(STORAGE_KEYS.COMM_DISCUSSIONS, INITIAL_COMMUNITY_DISCUSSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMM_RESOURCES)) {
      setStorage(STORAGE_KEYS.COMM_RESOURCES, INITIAL_COMMUNITY_RESOURCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      setStorage(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
      setStorage(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDY_GROUPS)) {
      setStorage(STORAGE_KEYS.STUDY_GROUPS, INITIAL_STUDY_GROUPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDY_RESOURCES)) {
      setStorage(STORAGE_KEYS.STUDY_RESOURCES, INITIAL_STUDY_RESOURCES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONNECTIONS)) {
      setStorage(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      setStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      setStorage(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_STUDENTS[0].id);
    }
  }

  // ----------------------------------------------------
  // Active User / Persona
  // ----------------------------------------------------
  public getCurrentUser(): StudentProfile {
    const userId = getStorage(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_STUDENTS[0].id);
    const students = this.getAllStudents();
    const user = students.find(s => s.id === userId);
    return user || students[0] || INITIAL_STUDENTS[0];
  }

  public setCurrentUser(studentId: string): StudentProfile {
    setStorage(STORAGE_KEYS.CURRENT_USER_ID, studentId);
    return this.getCurrentUser();
  }

  // ----------------------------------------------------
  // Students
  // ----------------------------------------------------
  public getAllStudents(): StudentProfile[] {
    return getStorage<StudentProfile[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public getStudentById(id: string): StudentProfile | undefined {
    return this.getAllStudents().find(s => s.id === id);
  }

  public updateProfile(updated: StudentProfile): void {
    const students = this.getAllStudents();
    const idx = students.findIndex(s => s.id === updated.id);
    if (idx >= 0) {
      students[idx] = updated;
    } else {
      students.push(updated);
    }
    setStorage(STORAGE_KEYS.STUDENTS, students);
  }

  // ----------------------------------------------------
  // Projects
  // ----------------------------------------------------
  public getAllProjects(): Project[] {
    return getStorage<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  public getProjectById(id: string): Project | undefined {
    return this.getAllProjects().find(p => p.id === id);
  }

  public createProject(projectData: Omit<Project, 'id' | 'createdAt'>): Project {
    const projects = this.getAllProjects();
    const newProject: Project = {
      ...projectData,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    projects.unshift(newProject);
    setStorage(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  public updateProject(updated: Project): void {
    const projects = this.getAllProjects();
    const idx = projects.findIndex(p => p.id === updated.id);
    if (idx >= 0) {
      projects[idx] = updated;
    } else {
      projects.push(updated);
    }
    setStorage(STORAGE_KEYS.PROJECTS, projects);
  }

  // ----------------------------------------------------
  // Teams
  // ----------------------------------------------------
  public getAllTeams(): Team[] {
    return getStorage<Team[]>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  }

  public getTeamById(id: string): Team | undefined {
    return this.getAllTeams().find(t => t.id === id);
  }

  public createTeam(teamData: Omit<Team, 'id' | 'createdAt'>): Team {
    const teams = this.getAllTeams();
    const newTeam: Team = {
      ...teamData,
      id: 'team-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    teams.push(newTeam);
    setStorage(STORAGE_KEYS.TEAMS, teams);
    return newTeam;
  }

  // ----------------------------------------------------
  // Applications
  // ----------------------------------------------------
  public getAllApplications(): ApplicationRequest[] {
    return getStorage<ApplicationRequest[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  public applyToRole(
    projectId: string, 
    roleId: string, 
    roleTitle: string, 
    message: string, 
    matchScore: number
  ): ApplicationRequest {
    const user = this.getCurrentUser();
    const project = this.getProjectById(projectId);
    const applications = this.getAllApplications();

    const newApp: ApplicationRequest = {
      id: 'app-' + Date.now(),
      projectId,
      projectTitle: project?.title || 'Project',
      roleId,
      roleTitle,
      applicantId: user.id,
      applicantName: user.name,
      applicantAvatar: user.avatar,
      applicantCollege: user.college,
      applicantDepartment: user.department,
      status: 'pending',
      message,
      matchScore,
      createdAt: new Date().toISOString().split('T')[0]
    };

    applications.push(newApp);
    setStorage(STORAGE_KEYS.APPLICATIONS, applications);

    // Notify project creator
    if (project) {
      this.addNotification({
        studentId: project.creatorId,
        title: 'New Team Application',
        message: `${user.name} applied for "${roleTitle}" in ${project.title}.`,
        link: `/projects/${project.id}`,
        type: 'project'
      });
    }

    return newApp;
  }

  public updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): void {
    const applications = this.getAllApplications();
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    app.status = status;
    setStorage(STORAGE_KEYS.APPLICATIONS, applications);

    if (status === 'accepted') {
      const project = this.getProjectById(app.projectId);
      if (project) {
        const role = project.roles.find(r => r.id === app.roleId);
        if (role) {
          role.isFilled = true;
          role.assignedStudentId = app.applicantId;
          role.assignedStudentName = app.applicantName;
          role.assignedAvatar = app.applicantAvatar;
        }
        setStorage(STORAGE_KEYS.PROJECTS, this.getAllProjects());
      }

      this.addNotification({
        studentId: app.applicantId,
        title: 'Application Accepted! 🎉',
        message: `Your application for ${app.roleTitle} in ${app.projectTitle} was accepted.`,
        link: `/projects/${app.projectId}`,
        type: 'project'
      });
    }
  }

  // ----------------------------------------------------
  // Tasks (Kanban)
  // ----------------------------------------------------
  public getTasksByTeamId(teamId: string): KanbanTask[] {
    const tasks = getStorage<KanbanTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    return tasks.filter(t => t.teamId === teamId);
  }

  public createTask(taskData: Omit<KanbanTask, 'id' | 'createdAt'>): KanbanTask {
    const tasks = getStorage<KanbanTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const newTask: KanbanTask = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    tasks.push(newTask);
    setStorage(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  }

  public updateTaskStatus(taskId: string, status: TaskStatus): void {
    const tasks = getStorage<KanbanTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      setStorage(STORAGE_KEYS.TASKS, tasks);
    }
  }

  public deleteTask(taskId: string): void {
    const tasks = getStorage<KanbanTask[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    const updated = tasks.filter(t => t.id !== taskId);
    setStorage(STORAGE_KEYS.TASKS, updated);
  }

  // ----------------------------------------------------
  // Team Sprint Discussions
  // ----------------------------------------------------
  public getDiscussionsByTeamId(teamId: string): TeamDiscussion[] {
    const messages = getStorage<TeamDiscussion[]>(STORAGE_KEYS.DISCUSSIONS, INITIAL_DISCUSSIONS);
    return messages.filter(m => m.teamId === teamId);
  }

  public postDiscussionMessage(teamId: string, content: string): TeamDiscussion {
    const user = this.getCurrentUser();
    const messages = getStorage<TeamDiscussion[]>(STORAGE_KEYS.DISCUSSIONS, INITIAL_DISCUSSIONS);
    const newMsg: TeamDiscussion = {
      id: 'msg-' + Date.now(),
      teamId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    messages.push(newMsg);
    setStorage(STORAGE_KEYS.DISCUSSIONS, messages);
    return newMsg;
  }

  // ----------------------------------------------------
  // Communities
  // ----------------------------------------------------
  public getAllCommunities(): Community[] {
    const comms = getStorage<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const user = this.getCurrentUser();
    return comms.map(c => {
      const defaultMock = INITIAL_COMMUNITIES.find(m => m.id === c.id);
      const normalizedImage = c.image || defaultMock?.image || (c.avatar && (c.avatar.startsWith('http') || c.avatar.startsWith('/')) ? c.avatar : '');
      return {
        ...c,
        image: normalizedImage,
        isJoined: user.joinedCommunityIds?.includes(c.id) || false
      };
    });
  }

  public getCommunityById(id: string): Community | undefined {
    return this.getAllCommunities().find(c => c.id === id);
  }

  public getCommunityBySlug(slug: string): Community | undefined {
    return this.getAllCommunities().find(c => c.slug === slug || c.id === slug);
  }

  public joinCommunity(communityId: string): void {
    const user = this.getCurrentUser();
    const comms = getStorage<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const comm = comms.find(c => c.id === communityId);
    
    if (!user.joinedCommunityIds) user.joinedCommunityIds = [];
    if (!user.joinedCommunityIds.includes(communityId)) {
      user.joinedCommunityIds.push(communityId);
      this.updateProfile(user);

      if (comm) {
        comm.memberCount += 1;
        setStorage(STORAGE_KEYS.COMMUNITIES, comms);
      }

      this.addNotification({
        studentId: user.id,
        title: 'Joined Community',
        message: `You are now a member of ${comm?.name || 'the community'}.`,
        link: `/communities/${comm?.id || communityId}`,
        type: 'community'
      });
    }
  }

  public leaveCommunity(communityId: string): void {
    const user = this.getCurrentUser();
    const comms = getStorage<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const comm = comms.find(c => c.id === communityId);

    if (user.joinedCommunityIds) {
      user.joinedCommunityIds = user.joinedCommunityIds.filter(id => id !== communityId);
      this.updateProfile(user);

      if (comm && comm.memberCount > 1) {
        comm.memberCount -= 1;
        setStorage(STORAGE_KEYS.COMMUNITIES, comms);
      }
    }
  }

  public createCommunity(data: {
    name: string;
    description: string;
    category: CommunityCategory;
    emoji?: string;
    avatar?: string;
    tags: string[];
    rules?: string[];
  }): Community {
    const user = this.getCurrentUser();
    const comms = getStorage<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const id = 'comm-' + Date.now();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id;

    const newComm: Community = {
      id,
      name: data.name,
      slug,
      description: data.description,
      category: data.category,
      memberCount: 1,
      avatar: data.avatar || data.emoji || '🚀',
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Campus', 'Community'],
      rules: data.rules && data.rules.length > 0 ? data.rules : ['Respect fellow students', 'No spam or self-promotion', 'Stay collaborative'],
      leadName: user.name,
      leadAvatar: user.avatar,
      createdAt: new Date().toISOString().split('T')[0],
      isJoined: true
    };

    comms.unshift(newComm);
    setStorage(STORAGE_KEYS.COMMUNITIES, comms);

    // Auto-join creator as member
    if (!user.joinedCommunityIds) user.joinedCommunityIds = [];
    if (!user.joinedCommunityIds.includes(id)) {
      user.joinedCommunityIds.push(id);
      this.updateProfile(user);
    }

    this.addNotification({
      studentId: user.id,
      title: 'Hub Created! 🚀',
      message: `Your campus hub "${newComm.name}" is now live for students to join.`,
      link: `/communities/${newComm.id}`,
      type: 'community'
    });

    return newComm;
  }

  public getCommunityDiscussions(communityId?: string): CommunityDiscussion[] {
    const discussions = getStorage<CommunityDiscussion[]>(STORAGE_KEYS.COMM_DISCUSSIONS, INITIAL_COMMUNITY_DISCUSSIONS);
    if (!communityId) return discussions;
    return discussions.filter(d => d.communityId === communityId);
  }

  public addCommunityDiscussion(
    communityId: string, 
    title: string, 
    content: string, 
    tags: string[], 
    category?: string
  ): CommunityDiscussion {
    const user = this.getCurrentUser();
    const discussions = getStorage<CommunityDiscussion[]>(STORAGE_KEYS.COMM_DISCUSSIONS, INITIAL_COMMUNITY_DISCUSSIONS);
    
    const newDisc: CommunityDiscussion = {
      id: 'disc-' + Date.now(),
      communityId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      title,
      content,
      category: category || 'General',
      tags,
      likes: 1,
      likedBy: [user.id],
      comments: [],
      createdAt: 'Just now'
    };

    discussions.unshift(newDisc);
    setStorage(STORAGE_KEYS.COMM_DISCUSSIONS, discussions);
    return newDisc;
  }

  public likeCommunityDiscussion(discussionId: string): void {
    const user = this.getCurrentUser();
    const discussions = getStorage<CommunityDiscussion[]>(STORAGE_KEYS.COMM_DISCUSSIONS, INITIAL_COMMUNITY_DISCUSSIONS);
    const disc = discussions.find(d => d.id === discussionId);
    if (disc) {
      if (!disc.likedBy) disc.likedBy = [];
      const hasLiked = disc.likedBy.includes(user.id);
      if (hasLiked) {
        disc.likedBy = disc.likedBy.filter(id => id !== user.id);
        disc.likes = Math.max(0, disc.likes - 1);
      } else {
        disc.likedBy.push(user.id);
        disc.likes += 1;
      }
      setStorage(STORAGE_KEYS.COMM_DISCUSSIONS, discussions);
    }
  }

  public addDiscussionComment(discussionId: string, content: string): void {
    const user = this.getCurrentUser();
    const discussions = getStorage<CommunityDiscussion[]>(STORAGE_KEYS.COMM_DISCUSSIONS, INITIAL_COMMUNITY_DISCUSSIONS);
    const disc = discussions.find(d => d.id === discussionId);
    if (disc) {
      if (!disc.comments) disc.comments = [];
      disc.comments.push({
        id: 'comm-c-' + Date.now(),
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        content,
        timestamp: 'Just now'
      });
      setStorage(STORAGE_KEYS.COMM_DISCUSSIONS, discussions);
    }
  }

  public getCommunityResources(communityId?: string): CommunityResource[] {
    const resources = getStorage<CommunityResource[]>(STORAGE_KEYS.COMM_RESOURCES, INITIAL_COMMUNITY_RESOURCES);
    if (!communityId) return resources;
    return resources.filter(r => r.communityId === communityId);
  }

  public addCommunityResource(
    communityId: string, 
    title: string, 
    url: string, 
    fileType: CommunityResource['fileType'], 
    description?: string
  ): CommunityResource {
    const user = this.getCurrentUser();
    const resources = getStorage<CommunityResource[]>(STORAGE_KEYS.COMM_RESOURCES, INITIAL_COMMUNITY_RESOURCES);
    
    const newRes: CommunityResource = {
      id: 'res-' + Date.now(),
      communityId,
      title,
      description,
      url: url || '#',
      fileType,
      uploadedById: user.id,
      uploadedByName: user.name,
      createdAt: new Date().toISOString().split('T')[0],
      downloadsCount: 1
    };

    resources.unshift(newRes);
    setStorage(STORAGE_KEYS.COMM_RESOURCES, resources);
    return newRes;
  }

  // ----------------------------------------------------
  // Campus Events & Workshops
  // ----------------------------------------------------
  public getAllEvents(): CampusEvent[] {
    const events = getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const user = this.getCurrentUser();
    return events.map(e => ({
      ...e,
      isRegistered: user.registeredEventIds?.includes(e.id) || e.registeredStudentIds?.includes(user.id) || false
    }));
  }

  public getEventById(id: string): CampusEvent | undefined {
    return this.getAllEvents().find(e => e.id === id);
  }

  public registerForEvent(eventId: string): boolean {
    const user = this.getCurrentUser();
    const events = getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const event = events.find(e => e.id === eventId);
    
    if (!event || event.seatsFilled >= event.seatsTotal) return false;

    if (!event.registeredStudentIds) event.registeredStudentIds = [];
    if (!event.registeredStudentIds.includes(user.id)) {
      event.registeredStudentIds.push(user.id);
      event.seatsFilled += 1;
      setStorage(STORAGE_KEYS.EVENTS, events);

      if (!user.registeredEventIds) user.registeredEventIds = [];
      if (!user.registeredEventIds.includes(eventId)) {
        user.registeredEventIds.push(eventId);
        this.updateProfile(user);
      }

      this.addNotification({
        studentId: user.id,
        title: 'Event Registered! 🎟️',
        message: `You are confirmed for "${event.title}" on ${event.date}.`,
        link: `/events/${event.id}`,
        type: 'event'
      });

      return true;
    }
    return true;
  }

  public cancelEventRegistration(eventId: string): void {
    const user = this.getCurrentUser();
    const events = getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const event = events.find(e => e.id === eventId);

    if (event && event.registeredStudentIds) {
      event.registeredStudentIds = event.registeredStudentIds.filter(id => id !== user.id);
      event.seatsFilled = Math.max(0, event.seatsFilled - 1);
      setStorage(STORAGE_KEYS.EVENTS, events);
    }

    if (user.registeredEventIds) {
      user.registeredEventIds = user.registeredEventIds.filter(id => id !== eventId);
      this.updateProfile(user);
    }
  }

  public createEvent(eventData: Omit<CampusEvent, 'id' | 'seatsFilled'>): CampusEvent {
    const events = getStorage<CampusEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const newEvent: CampusEvent = {
      ...eventData,
      id: 'event-' + Date.now(),
      seatsFilled: 1,
      registeredStudentIds: [this.getCurrentUser().id]
    };
    events.unshift(newEvent);
    setStorage(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  // ----------------------------------------------------
  // College Clubs
  // ----------------------------------------------------
  public getAllClubs(): CollegeClub[] {
    return getStorage<CollegeClub[]>(STORAGE_KEYS.CLUBS, INITIAL_CLUBS);
  }

  public getClubById(id: string): CollegeClub | undefined {
    return this.getAllClubs().find(c => c.id === id);
  }

  // ----------------------------------------------------
  // Study Groups & Academic Resources
  // ----------------------------------------------------
  public getAllStudyGroups(): StudyGroup[] {
    return getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, INITIAL_STUDY_GROUPS);
  }

  public joinStudyGroup(groupId: string): void {
    const user = this.getCurrentUser();
    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, INITIAL_STUDY_GROUPS);
    const group = groups.find(g => g.id === groupId);

    if (group && !group.members.includes(user.id)) {
      group.members.push(user.id);
      group.memberCount += 1;
      setStorage(STORAGE_KEYS.STUDY_GROUPS, groups);

      this.addNotification({
        studentId: user.id,
        title: 'Joined Study Group',
        message: `You joined ${group.subject} study group. Next session: ${group.nextSessionDate}`,
        link: `/discover/exams`,
        type: 'community'
      });
    }
  }

  public createStudyGroup(groupData: Omit<StudyGroup, 'id' | 'memberCount' | 'members'>): StudyGroup {
    const user = this.getCurrentUser();
    const groups = getStorage<StudyGroup[]>(STORAGE_KEYS.STUDY_GROUPS, INITIAL_STUDY_GROUPS);
    const newGroup: StudyGroup = {
      ...groupData,
      id: 'sg-' + Date.now(),
      memberCount: 1,
      members: [user.id]
    };
    groups.unshift(newGroup);
    setStorage(STORAGE_KEYS.STUDY_GROUPS, groups);
    return newGroup;
  }

  public getAllStudyResources(): StudyResource[] {
    return getStorage<StudyResource[]>(STORAGE_KEYS.STUDY_RESOURCES, INITIAL_STUDY_RESOURCES);
  }

  public addStudyResource(resourceData: Omit<StudyResource, 'id' | 'downloads' | 'dateAdded'>): StudyResource {
    const resources = getStorage<StudyResource[]>(STORAGE_KEYS.STUDY_RESOURCES, INITIAL_STUDY_RESOURCES);
    const newRes: StudyResource = {
      ...resourceData,
      id: 'sr-' + Date.now(),
      downloads: 1,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    resources.unshift(newRes);
    setStorage(STORAGE_KEYS.STUDY_RESOURCES, resources);
    return newRes;
  }

  // ----------------------------------------------------
  // Student Connections
  // ----------------------------------------------------
  public getConnectionsForUser(userId?: string): ConnectionRequest[] {
    const currentId = userId || this.getCurrentUser().id;
    const connections = getStorage<ConnectionRequest[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    return connections.filter(c => c.fromId === currentId || c.toId === currentId);
  }

  public sendConnectionRequest(toId: string, note?: string): ConnectionRequest {
    const user = this.getCurrentUser();
    const targetStudent = this.getStudentById(toId);
    const connections = getStorage<ConnectionRequest[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);

    // Check if already exists
    const existing = connections.find(c => 
      (c.fromId === user.id && c.toId === toId) || 
      (c.fromId === toId && c.toId === user.id)
    );
    if (existing) return existing;

    const newConn: ConnectionRequest = {
      id: 'conn-' + Date.now(),
      fromId: user.id,
      fromName: user.name,
      fromAvatar: user.avatar,
      fromDepartment: user.department,
      fromCollege: user.college,
      toId,
      status: 'pending',
      note: note || `Hi! I'd love to connect on campus.`,
      createdAt: 'Just now'
    };

    connections.push(newConn);
    setStorage(STORAGE_KEYS.CONNECTIONS, connections);

    this.addNotification({
      studentId: toId,
      title: 'New Connection Request',
      message: `${user.name} wants to connect with you.`,
      link: `/profile`,
      type: 'connection'
    });

    return newConn;
  }

  public acceptConnectionRequest(requestId: string): void {
    const connections = getStorage<ConnectionRequest[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const conn = connections.find(c => c.id === requestId);
    if (conn) {
      conn.status = 'accepted';
      setStorage(STORAGE_KEYS.CONNECTIONS, connections);

      this.addNotification({
        studentId: conn.fromId,
        title: 'Connection Accepted! 🤝',
        message: `${conn.fromName} and you are now connected.`,
        link: `/profile`,
        type: 'connection'
      });
    }
  }

  public rejectConnectionRequest(requestId: string): void {
    const connections = getStorage<ConnectionRequest[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
    const conn = connections.find(c => c.id === requestId);
    if (conn) {
      conn.status = 'rejected';
      setStorage(STORAGE_KEYS.CONNECTIONS, connections);
    }
  }

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  public getNotificationsForUser(userId?: string): NotificationItem[] {
    const currentId = userId || this.getCurrentUser().id;
    const notifs = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs.filter(n => n.studentId === currentId);
  }

  public markNotificationRead(id: string): void {
    const notifs = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif = notifs.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const notifs = getStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false,
      timestamp: 'Just now'
    };
    notifs.unshift(newNotif);
    setStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // ----------------------------------------------------
  // Safety Reports & Moderation
  // ----------------------------------------------------
  public submitReport(reportData: Omit<ReportItem, 'id' | 'status' | 'timestamp'>): ReportItem {
    const reports = getStorage<ReportItem[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const newReport: ReportItem = {
      ...reportData,
      id: 'rep-' + Date.now(),
      status: 'pending',
      timestamp: new Date().toISOString().split('T')[0]
    };
    reports.unshift(newReport);
    setStorage(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  public getAllReports(): ReportItem[] {
    return getStorage<ReportItem[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  public resolveReport(reportId: string): void {
    const reports = this.getAllReports();
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = 'resolved';
      setStorage(STORAGE_KEYS.REPORTS, reports);
    }
  }

  // ----------------------------------------------------
  // Universal Search
  // ----------------------------------------------------
  public universalSearch(rawQuery: string): UniversalSearchResult {
    const query = rawQuery.toLowerCase().trim();
    if (!query) {
      return {
        students: [],
        projects: [],
        events: [],
        communities: [],
        studyGroups: [],
        discussions: []
      };
    }

    const students = this.getAllStudents().filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query) ||
      s.college.toLowerCase().includes(query) ||
      s.skills.some(sk => sk.name.toLowerCase().includes(query)) ||
      s.interests.some(i => i.toLowerCase().includes(query))
    );

    const projects = this.getAllProjects().filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.requiredSkills.some(sk => sk.toLowerCase().includes(query))
    );

    const events = this.getAllEvents().filter(e => 
      e.title.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query) ||
      e.organizerClub.toLowerCase().includes(query) ||
      e.tags.some(t => t.toLowerCase().includes(query))
    );

    const communities = this.getAllCommunities().filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.tags.some(t => t.toLowerCase().includes(query))
    );

    const studyGroups = this.getAllStudyGroups().filter(g => 
      g.subject.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query) ||
      g.nextSessionTopic.toLowerCase().includes(query)
    );

    const discussions = this.getCommunityDiscussions().filter(d => 
      d.title.toLowerCase().includes(query) ||
      d.content.toLowerCase().includes(query) ||
      d.tags.some(t => t.toLowerCase().includes(query))
    );

    return {
      students,
      projects,
      events,
      communities,
      studyGroups,
      discussions
    };
  }

  // ----------------------------------------------------
  // AI Service Toggle
  // ----------------------------------------------------
  public isAiServiceEnabled(): boolean {
    return getStorage<boolean>(STORAGE_KEYS.USE_AI_SERVICE, false);
  }

  public setAiServiceEnabled(enabled: boolean): void {
    setStorage(STORAGE_KEYS.USE_AI_SERVICE, enabled);
  }

  public resetToFactoryDefaults(): void {
    localStorage.clear();
    this.init();
  }
}

export const dataService = DataService.getInstance();
