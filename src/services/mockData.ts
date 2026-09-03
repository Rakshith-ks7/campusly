import { 
  StudentProfile, 
  Project, 
  Team, 
  KanbanTask, 
  TeamDiscussion, 
  ApplicationRequest,
  Community,
  CommunityDiscussion,
  CommunityResource,
  CampusEvent,
  CollegeClub,
  StudyGroup,
  StudyResource,
  ConnectionRequest,
  NotificationItem,
  ReportItem
} from '../types';

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@campus.edu',
    avatar: '/avatars/avatar-2.png',
    college: 'IIT Delhi',
    university: 'Indian Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    semester: '6th Semester',
    location: 'New Delhi, India',
    localityRadius: 'Same College',
    bio: 'AI/ML researcher passionate about computer vision and high-performance CUDA computing. 3x hackathon finalist, building autonomous robotics perception pipelines.',
    skills: [
      { name: 'Python', category: 'Programming', level: 'Expert', years: 3.5, verified: true },
      { name: 'PyTorch', category: 'AI / ML', level: 'Expert', years: 2.5, verified: true },
      { name: 'CUDA', category: 'AI / ML', level: 'Advanced', years: 1.5, verified: true },
      { name: 'Computer Vision', category: 'AI / ML', level: 'Advanced', years: 2.0, verified: true },
      { name: 'FastAPI', category: 'Web Development', level: 'Intermediate', years: 1.5, verified: false },
      { name: 'C++', category: 'Programming', level: 'Intermediate', years: 2.0, verified: true }
    ],
    interests: ['Autonomous Drones', 'Edge AI', 'Reinforcement Learning', 'Robotics'],
    experienceYears: 3.0,
    availability: '20+ hrs/wk',
    links: {
      github: 'https://github.com/rahul-ai',
      linkedin: 'https://linkedin.com/in/rahul-sharma-ai',
      portfolio: 'https://rahulsharma.dev'
    },
    reputation: {
      score: 4.9,
      reviewCount: 14,
      completedProjects: 8,
      hackathonWins: 3,
      verifiedSkillsCount: 5
    },
    lookingFor: ['Coding partner', 'Project partner', 'DSA partner'],
    joinedCommunityIds: ['comm-programming', 'comm-ai', 'comm-exams', 'comm-robotics'],
    registeredEventIds: ['event-react-workshop'],
    isAdmin: true
  },
  {
    id: 'student-ananya',
    name: 'Ananya Roy',
    email: 'ananya.roy@design.edu',
    avatar: '/avatars/avatar-1.png',
    college: 'National Institute of Design',
    university: 'NID Bangalore',
    department: 'Interaction & UI/UX Design',
    year: '4th Year',
    semester: '7th Semester',
    location: 'Bangalore, India',
    localityRadius: 'City',
    bio: 'Product designer obsessed with minimalist interfaces, micro-interactions, and accessible student tools. Bridges the gap between Figma design systems and React code.',
    skills: [
      { name: 'Figma', category: 'Design', level: 'Expert', years: 4.0, verified: true },
      { name: 'UI/UX', category: 'Design', level: 'Expert', years: 3.5, verified: true },
      { name: 'React', category: 'Web Development', level: 'Intermediate', years: 2.0, verified: true },
      { name: 'Tailwind CSS', category: 'Web Development', level: 'Advanced', years: 2.0, verified: true },
      { name: 'Wireframing', category: 'Design', level: 'Expert', years: 3.5, verified: true },
      { name: 'Design Systems', category: 'Design', level: 'Advanced', years: 2.5, verified: true }
    ],
    interests: ['Design Systems', 'FinTech UX', 'Accessibility', 'Motion Graphics'],
    experienceYears: 3.5,
    availability: '10-20 hrs/wk',
    links: {
      github: 'https://github.com/ananya-designs',
      linkedin: 'https://linkedin.com/in/ananya-roy-ux',
      portfolio: 'https://ananyaroy.design'
    },
    reputation: {
      score: 4.8,
      reviewCount: 19,
      completedProjects: 11,
      hackathonWins: 2,
      verifiedSkillsCount: 6
    },
    lookingFor: ['Creative collaborator', 'Project partner', 'Friends'],
    joinedCommunityIds: ['comm-creators', 'comm-programming'],
    creatorRole: 'Designer & Video Editor',
    creatorLookingFor: ['Photographer', 'Presenter', 'Writer']
  },
  {
    id: 'student-vikram',
    name: 'Vikram Patel',
    email: 'vikram.patel@bits.edu',
    avatar: '/avatars/avatar-10.png',
    college: 'BITS Pilani',
    university: 'Birla Institute of Technology and Science',
    department: 'Electronics & Communication (ECE)',
    year: '3rd Year',
    semester: '5th Semester',
    location: 'Pilani, India',
    localityRadius: 'Same College',
    bio: 'Hardware hacker and embedded systems fanatic. Building drone flight controllers, ESP32 mesh networks, and sensor integration systems.',
    skills: [
      { name: 'Embedded Systems', category: 'Hardware & IoT', level: 'Expert', years: 3.0, verified: true },
      { name: 'IoT', category: 'Hardware & IoT', level: 'Expert', years: 2.5, verified: true },
      { name: 'C++', category: 'Programming', level: 'Advanced', years: 3.0, verified: true },
      { name: 'ESP32', category: 'Hardware & IoT', level: 'Expert', years: 2.0, verified: true },
      { name: 'Arduino', category: 'Hardware & IoT', level: 'Expert', years: 4.0, verified: true },
      { name: 'Robotics', category: 'Hardware & IoT', level: 'Advanced', years: 2.0, verified: true }
    ],
    interests: ['Drone Autopilots', 'Smart Agriculture IoT', 'LoRaWAN Networks', 'Robotics'],
    experienceYears: 2.8,
    availability: '20+ hrs/wk',
    links: {
      github: 'https://github.com/vikram-iot',
      linkedin: 'https://linkedin.com/in/vikram-patel-ece',
      portfolio: 'https://vikramiot.tech'
    },
    reputation: {
      score: 4.9,
      reviewCount: 12,
      completedProjects: 7,
      hackathonWins: 4,
      verifiedSkillsCount: 5
    },
    lookingFor: ['Hardware teammate', 'Study partner', 'Friends'],
    joinedCommunityIds: ['comm-robotics', 'comm-programming', 'comm-friends']
  },
  {
    id: 'student-priya',
    name: 'Priya Nair',
    email: 'priya.nair@nitt.edu',
    avatar: '/avatars/avatar-4.png',
    college: 'NIT Trichy',
    university: 'National Institute of Technology',
    department: 'Information Technology',
    year: '4th Year',
    semester: '7th Semester',
    location: 'Trichy, India',
    localityRadius: 'City',
    bio: 'Full Stack engineer with hands-on experience in cloud architectures, Firebase real-time data sync, and high-concurrency Node.js microservices.',
    skills: [
      { name: 'React', category: 'Web Development', level: 'Expert', years: 3.5, verified: true },
      { name: 'TypeScript', category: 'Programming', level: 'Advanced', years: 2.5, verified: true },
      { name: 'Node.js', category: 'Web Development', level: 'Advanced', years: 3.0, verified: true },
      { name: 'Firebase', category: 'Cloud & DevOps', level: 'Expert', years: 2.5, verified: true },
      { name: 'MongoDB', category: 'Web Development', level: 'Advanced', years: 2.0, verified: true },
      { name: 'Next.js', category: 'Web Development', level: 'Intermediate', years: 1.5, verified: false }
    ],
    interests: ['Real-time Collaboration', 'Serverless APIs', 'Cloud Scale', 'Open Source'],
    experienceYears: 3.0,
    availability: '10-20 hrs/wk',
    links: {
      github: 'https://github.com/priyanair-dev',
      linkedin: 'https://linkedin.com/in/priya-nair-it',
      portfolio: 'https://priyanair.me'
    },
    reputation: {
      score: 4.85,
      reviewCount: 16,
      completedProjects: 10,
      hackathonWins: 2,
      verifiedSkillsCount: 5
    }
  },
  {
    id: 'student-arjun',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@iima.ac.in',
    avatar: '/avatars/avatar-14.png',
    college: 'IIM Ahmedabad',
    university: 'Indian Institute of Management',
    department: 'Tech Strategy & Entrepreneurship',
    year: 'Postgraduate',
    semester: '3rd Trimester',
    location: 'Ahmedabad, India',
    localityRadius: 'Remote',
    bio: 'Computer Science undergrad turned Business strategist. Winner of 5 national business plan pitches. Specialized in Go-To-Market, product-market fit, and team leadership.',
    skills: [
      { name: 'Product Management', category: 'Business & Product', level: 'Expert', years: 2.5, verified: true },
      { name: 'Pitching', category: 'Business & Product', level: 'Expert', years: 3.0, verified: true },
      { name: 'Business Strategy', category: 'Business & Product', level: 'Expert', years: 3.0, verified: true },
      { name: 'Market Research', category: 'Business & Product', level: 'Advanced', years: 2.0, verified: true },
      { name: 'Agile Scrum', category: 'Business & Product', level: 'Intermediate', years: 1.5, verified: false }
    ],
    interests: ['SaaS Growth', 'Pitch Competitions', 'Venture Capital', 'EdTech'],
    experienceYears: 2.5,
    availability: '10-20 hrs/wk',
    links: {
      linkedin: 'https://linkedin.com/in/arjun-mehta-strategy',
      portfolio: 'https://arjunmehta.co'
    },
    reputation: {
      score: 4.95,
      reviewCount: 22,
      completedProjects: 9,
      hackathonWins: 5,
      verifiedSkillsCount: 4
    }
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-rescue-drone',
    title: 'Autonomous Rescue Drone with Computer Vision',
    description: 'An AI-powered emergency drone system engineered to identify stranded people and survivors in disaster zones using onboard thermal camera feeds and edge inference.',
    category: 'Hackathon',
    creatorId: 'student-rahul',
    creatorName: 'Rahul Sharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    teamSize: 4,
    maxMembers: 4,
    deadline: 'In 12 Days (Smart India Hackathon 2026)',
    locationType: 'Hybrid',
    locationName: 'Delhi & Remote',
    requiredSkills: ['Python', 'PyTorch', 'Computer Vision', 'Embedded Systems', 'IoT', 'React', 'UI/UX'],
    roles: [
      {
        id: 'role-cv-lead',
        title: 'Computer Vision & Edge AI Lead',
        skills: ['Python', 'PyTorch', 'CUDA', 'Computer Vision'],
        assignedStudentId: 'student-rahul',
        assignedStudentName: 'Rahul Sharma',
        assignedAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        isFilled: true
      },
      {
        id: 'role-hardware',
        title: 'Flight Hardware & ESP32 Engineer',
        skills: ['Embedded Systems', 'IoT', 'C++', 'ESP32'],
        assignedStudentId: 'student-vikram',
        assignedStudentName: 'Vikram Patel',
        assignedAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        isFilled: true
      },
      {
        id: 'role-frontend',
        title: 'Ground Station Dashboard Developer',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
        isFilled: false
      },
      {
        id: 'role-uiux',
        title: 'Mission Control UI/UX Designer',
        skills: ['UI/UX', 'Figma', 'Wireframing'],
        isFilled: false
      }
    ],
    difficulty: 'Advanced',
    tags: ['Robotics', 'Emergency Response', 'Computer Vision', 'SIH 2026'],
    status: 'open',
    teamId: 'team-rescue-drone',
    createdAt: '2026-08-25'
  },
  {
    id: 'proj-waste-mgmt',
    title: 'Smart AI Waste Segregation & IoT Bin',
    description: 'Automated recycling bin using low-latency neural image classification and inductive sensors to sort dry, wet, and e-waste in real-time on campus.',
    category: 'College Project',
    creatorId: 'student-vikram',
    creatorName: 'Vikram Patel',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    teamSize: 3,
    maxMembers: 4,
    deadline: 'In 3 Weeks (Final Year Capstone)',
    locationType: 'Offline',
    locationName: 'Campus Lab, BITS Pilani',
    requiredSkills: ['Embedded Systems', 'IoT', 'Python', 'Machine Learning', 'React'],
    roles: [
      {
        id: 'role-bin-hw',
        title: 'Sensor & Mechanical Lead',
        skills: ['Embedded Systems', 'IoT', 'Arduino', 'C++'],
        assignedStudentId: 'student-vikram',
        assignedStudentName: 'Vikram Patel',
        assignedAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        isFilled: true
      },
      {
        id: 'role-bin-ai',
        title: 'Image Classification ML Engineer',
        skills: ['Python', 'Machine Learning', 'PyTorch'],
        isFilled: false
      },
      {
        id: 'role-bin-app',
        title: 'Campus Analytics Web App Lead',
        skills: ['React', 'Firebase', 'Tailwind CSS'],
        isFilled: false
      }
    ],
    difficulty: 'Intermediate',
    tags: ['EcoTech', 'Sustainability', 'IoT', 'Campus Green'],
    status: 'open',
    teamId: 'team-waste-mgmt',
    createdAt: '2026-08-28'
  },
  {
    id: 'proj-edupass',
    title: 'EduPass: Decentralized Verifiable Student Credentials',
    description: 'Tamper-proof verifiable credentials protocol for universities to issue instant transcripts, diplomas, and hackathon certificates with cryptographic validation.',
    category: 'Startup / MVP',
    creatorId: 'student-priya',
    creatorName: 'Priya Nair',
    creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    teamSize: 4,
    maxMembers: 5,
    deadline: 'In 1 Month (Global Web3 Student Build)',
    locationType: 'Online',
    locationName: 'Remote Worldwide',
    requiredSkills: ['React', 'Node.js', 'Firebase', 'UI/UX', 'Product Management', 'Pitching'],
    roles: [
      {
        id: 'role-edu-fullstack',
        title: 'Full Stack & Cloud Lead',
        skills: ['React', 'Node.js', 'Firebase', 'TypeScript'],
        assignedStudentId: 'student-priya',
        assignedStudentName: 'Priya Nair',
        assignedAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        isFilled: true
      },
      {
        id: 'role-edu-ux',
        title: 'Principal Product Designer',
        skills: ['UI/UX', 'Figma', 'Design Systems'],
        assignedStudentId: 'student-ananya',
        assignedStudentName: 'Ananya Roy',
        assignedAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
        isFilled: true
      },
      {
        id: 'role-edu-biz',
        title: 'Strategy & University Partnerships',
        skills: ['Product Management', 'Pitching', 'Business Strategy'],
        isFilled: false
      }
    ],
    difficulty: 'Intermediate',
    tags: ['Web3', 'EdTech', 'Credentialing', 'Identity'],
    status: 'open',
    teamId: 'team-edupass',
    createdAt: '2026-08-30'
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-rescue-drone',
    projectId: 'proj-rescue-drone',
    projectTitle: 'Autonomous Rescue Drone with Computer Vision',
    name: 'Team SkyGuard AI',
    description: 'High-performance interdisciplinary team combining edge AI computer vision with rugged flight hardware for emergency missions.',
    leaderId: 'student-rahul',
    members: [
      {
        studentId: 'student-rahul',
        studentName: 'Rahul Sharma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        role: 'Computer Vision & Edge AI Lead',
        joinedAt: '2026-08-25',
        isLeader: true
      },
      {
        studentId: 'student-vikram',
        studentName: 'Vikram Patel',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        role: 'Flight Hardware & ESP32 Engineer',
        joinedAt: '2026-08-26',
        isLeader: false
      }
    ],
    createdAt: '2026-08-25'
  }
];

export const INITIAL_TASKS: KanbanTask[] = [
  {
    id: 'task-1',
    teamId: 'team-rescue-drone',
    title: 'Benchmark YOLOv8 edge model with TensorRT / CUDA',
    description: 'Optimize bounding box detection latency to sub-30ms on the onboard edge compute module.',
    status: 'IN_PROGRESS',
    assigneeId: 'student-rahul',
    assigneeName: 'Rahul Sharma',
    priority: 'High',
    dueDate: '2026-09-08',
    createdAt: '2026-08-27'
  },
  {
    id: 'task-2',
    teamId: 'team-rescue-drone',
    title: 'Solder ESP32 telemetry transmitter & calibrate compass',
    description: 'Wire the I2C magnetometer and verify packet integrity at 500m wireless range.',
    status: 'COMPLETED',
    assigneeId: 'student-vikram',
    assigneeName: 'Vikram Patel',
    priority: 'High',
    dueDate: '2026-09-02',
    createdAt: '2026-08-26'
  },
  {
    id: 'task-3',
    teamId: 'team-rescue-drone',
    title: 'Design ground station HUD wireframes in Figma',
    description: 'Create responsive tablet view showing live battery status, GPS map, and thermal camera feed overlay.',
    status: 'TODO',
    priority: 'Medium',
    dueDate: '2026-09-10',
    createdAt: '2026-08-29'
  },
  {
    id: 'task-4',
    teamId: 'team-rescue-drone',
    title: 'Implement WebSocket video streaming endpoint',
    description: 'Low-latency MJPEG or WebRTC stream forwarder from drone receiver to browser.',
    status: 'REVIEW',
    priority: 'High',
    dueDate: '2026-09-09',
    createdAt: '2026-08-28'
  }
];

export const INITIAL_DISCUSSIONS: TeamDiscussion[] = [
  {
    id: 'msg-1',
    teamId: 'team-rescue-drone',
    senderId: 'student-rahul',
    senderName: 'Rahul Sharma',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    content: 'Welcome Vikram to Team SkyGuard! The edge camera mounts are ready. We need to finalize telemetry frequency.',
    timestamp: '2026-08-26 14:20'
  },
  {
    id: 'msg-2',
    teamId: 'team-rescue-drone',
    senderId: 'student-vikram',
    senderName: 'Vikram Patel',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    content: 'Awesome! I just tested the ESP32 transceiver on the 868MHz band. Minimal packet drop over 300m test. Ready for the camera handshake.',
    timestamp: '2026-08-26 15:45'
  }
];

export const INITIAL_APPLICATIONS: ApplicationRequest[] = [
  {
    id: 'app-1',
    projectId: 'proj-rescue-drone',
    projectTitle: 'Autonomous Rescue Drone with Computer Vision',
    roleId: 'role-uiux',
    roleTitle: 'Mission Control UI/UX Designer',
    applicantId: 'student-ananya',
    applicantName: 'Ananya Roy',
    applicantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    applicantCollege: 'NID Bangalore',
    applicantDepartment: 'Interaction & UI/UX Design',
    status: 'pending',
    message: 'Hey Rahul! I saw your drone project for SIH 2026. I have designed tactical ground control interfaces before and would love to build the HUD layout.',
    matchScore: 92,
    createdAt: '2026-08-31'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-programming',
    name: 'Programming Hub',
    slug: 'programming',
    description: 'Learn together. Code together. Build together. The central home for software builders, open source contributors, and competitive coders.',
    category: 'Programming',
    memberCount: 342,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80',
    tags: ['C++', 'Python', 'React', 'DSA', 'Open Source', 'Web Dev'],
    rules: [
      'Be welcoming to beginners asking questions',
      'Share working GitHub links and reproducible snippets',
      'Keep discussions respectful and collegiate'
    ],
    leadName: 'Rahul Sharma',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    createdAt: '2026-01-15',
    isJoined: true
  },
  {
    id: 'comm-ai',
    name: 'AI / Machine Learning Guild',
    slug: 'ai-ml',
    description: 'Students researching artificial intelligence, PyTorch neural models, computer vision, and building practical ML applications.',
    category: 'AI & Data',
    memberCount: 235,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&auto=format&fit=crop&q=80',
    tags: ['PyTorch', 'TensorFlow', 'LLMs', 'Computer Vision', 'CUDA', 'Data Science'],
    rules: [
      'Discuss papers, tutorials, and practical model deployments',
      'Collaborate on Kaggle and academic hackathons'
    ],
    leadName: 'Rahul Sharma',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    createdAt: '2026-01-20',
    isJoined: true
  },
  {
    id: 'comm-exams',
    name: 'Exam Preparation & Academic Hub',
    slug: 'exams',
    description: 'Study together, share handwritten notes, solve previous year question papers, and organize peer revision sessions.',
    category: 'Exam & Academic',
    memberCount: 418,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&auto=format&fit=crop&q=80',
    tags: ['DBMS', 'OS', 'Math', 'Notes', 'Question Papers', 'Revisions'],
    rules: [
      'Only share verified academic material and notes',
      'Help junior batches with subject guidance'
    ],
    leadName: 'Priya Sundaram',
    leadAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    createdAt: '2026-02-01',
    isJoined: true
  },
  {
    id: 'comm-creators',
    name: 'Content Creators & Media Hub',
    slug: 'creators',
    description: 'A collaborative guild for student photographers, videographers, reel editors, podcasters, designers, and writers.',
    category: 'Content & Media',
    memberCount: 184,
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
    tags: ['Photography', 'Video Editing', 'Premiere Pro', 'YouTube', 'Podcasting', 'Design'],
    rules: [
      'Give constructive critique on portfolio reels and photos',
      'Credit all team members on collaborative media'
    ],
    leadName: 'Ananya Roy',
    leadAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    createdAt: '2026-02-10',
    isJoined: false
  },
  {
    id: 'comm-robotics',
    name: 'Robotics & Hardware Makers',
    slug: 'robotics',
    description: 'Designing autonomous rovers, drones, IoT sensory arrays, PCB layouts, and embedded firmware on Arduino/ESP32/Raspberry Pi.',
    category: 'Robotics & Hardware',
    memberCount: 156,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80',
    tags: ['Arduino', 'ESP32', 'ROS', 'PCB Design', 'Drones', 'IoT'],
    rules: [
      'Safety first in campus hardware lab workspaces',
      'Share component schematics openly'
    ],
    leadName: 'Vikram Patel',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    createdAt: '2026-02-14',
    isJoined: true
  },
  {
    id: 'comm-friends',
    name: 'Campus Social & Hobbies Hub',
    slug: 'friends',
    description: 'Find friends on campus who share your hobbies — gaming sessions, film screenings, hiking, music jams, and weekend board games.',
    category: 'Social & Hobbies',
    memberCount: 310,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&auto=format&fit=crop&q=80',
    tags: ['Gaming', 'Music', 'Movies', 'Sports', 'Art', 'Reading', 'Fitness'],
    rules: [
      'Strictly respectful, friendly and welcoming social interactions',
      'No commercial solicitation or spamming'
    ],
    leadName: 'Arjun Das',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    createdAt: '2026-02-18',
    isJoined: false
  },
  {
    id: 'comm-ecell',
    name: 'Campus Founders & E-Cell',
    slug: 'entrepreneurship',
    description: 'Students building early tech startups, testing MVP product ideas, and preparing for collegiate seed funding competitions.',
    category: 'Entrepreneurship',
    memberCount: 198,
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=300&auto=format&fit=crop&q=80',
    tags: ['Startups', 'Pitching', 'Business Model', 'SaaS', 'Marketing'],
    rules: [
      'Share transparent startup learnings and validation tests',
      'Support peer beta tests respectfully'
    ],
    leadName: 'Kavya Nair',
    leadAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    createdAt: '2026-02-25',
    isJoined: false
  }
];

export const INITIAL_COMMUNITY_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 'disc-1',
    communityId: 'comm-programming',
    authorId: 'student-rahul',
    authorName: 'Rahul Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    title: 'Who wants to practice LeetCode Graphs & DP together this weekend?',
    content: 'Looking for 2-3 people preparing for campus placements to do timed problems every Saturday 10 AM. We can discuss approaches on Google Meet.',
    category: 'Coding Buddies',
    tags: ['DSA', 'LeetCode', 'Interview Prep'],
    likes: 14,
    likedBy: ['student-rahul'],
    comments: [
      {
        id: 'comm-c1',
        authorId: 'student-priya',
        authorName: 'Priya Sundaram',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        content: 'Count me in! I am currently working on Dijkstra and topological sorting.',
        timestamp: '2 hours ago'
      }
    ],
    createdAt: '2026-09-02 11:30'
  },
  {
    id: 'disc-2',
    communityId: 'comm-exams',
    authorId: 'student-priya',
    authorName: 'Priya Sundaram',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    title: 'Uploaded handwritten notes for DBMS Unit 3 (Transactions & Concurrency)',
    content: 'Hey everyone, I just uploaded the summarized formula sheet and notes for ACID properties and 2PL locking protocols in the resources tab. Hope it helps with the mid-term!',
    category: 'Study Resources',
    tags: ['DBMS', 'Notes', 'Mid-Term'],
    likes: 28,
    likedBy: ['student-rahul', 'student-vikram'],
    comments: [
      {
        id: 'comm-c2',
        authorId: 'student-vikram',
        authorName: 'Vikram Patel',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        content: 'These diagrams on conflict serializability are lifesavers. Thank you Priya!',
        timestamp: '1 day ago'
      }
    ],
    createdAt: '2026-09-01 16:45'
  },
  {
    id: 'disc-3',
    communityId: 'comm-creators',
    authorId: 'student-ananya',
    authorName: 'Ananya Roy',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    title: 'Looking for a sound designer / audio editor for a 3-part campus podcast',
    content: 'We are interviewing alumni working in tech and design. Need someone to clean up audio, add intro/outro music in Audacity or Premiere. Equipment is provided.',
    category: 'Creator Collaboration',
    tags: ['Podcast', 'Audio Editing', 'Media'],
    likes: 9,
    likedBy: [],
    comments: [],
    createdAt: '2026-09-02 09:15'
  },
  {
    id: 'disc-4',
    communityId: 'comm-friends',
    authorId: 'student-vikram',
    authorName: 'Vikram Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    title: 'Anyone down for badminton or table tennis at the campus sports complex?',
    content: 'Usually play on Tuesdays and Thursdays around 6:00 PM. All skill levels welcome, just looking to get some exercise and meet new friends.',
    category: 'Sports & Hobbies',
    tags: ['Badminton', 'Sports', 'Fitness'],
    likes: 12,
    likedBy: [],
    comments: [],
    createdAt: '2026-09-02 18:20'
  }
];

export const INITIAL_COMMUNITY_RESOURCES: CommunityResource[] = [
  {
    id: 'res-1',
    communityId: 'comm-exams',
    title: 'DBMS Complete Lecture Notes & SQL Queries Handbook',
    description: 'Comprehensive 48-page PDF covering ER models, Relational Algebra, Normalization (1NF to BCNF) and SQL sample queries.',
    url: '#',
    fileType: 'pdf',
    uploadedById: 'student-priya',
    uploadedByName: 'Priya Sundaram',
    createdAt: '2026-08-28',
    downloadsCount: 142
  },
  {
    id: 'res-2',
    communityId: 'comm-exams',
    title: 'Operating Systems Previous 5 Years Solved Semester Papers',
    description: 'Compilation of university examination papers from 2021-2025 with step-by-step solutions for CPU scheduling & Paging.',
    url: '#',
    fileType: 'notes',
    uploadedById: 'student-rahul',
    uploadedByName: 'Rahul Sharma',
    createdAt: '2026-08-25',
    downloadsCount: 198
  },
  {
    id: 'res-3',
    communityId: 'comm-programming',
    title: 'Fullstack React 19 + TypeScript Starter Blueprint',
    description: 'Clean repository starter boilerplate with Vite, Tailwind CSS, Lucide icons, and pre-configured ESLint rules.',
    url: 'https://github.com/campus-builders/react-starter',
    fileType: 'repo',
    uploadedById: 'student-rahul',
    uploadedByName: 'Rahul Sharma',
    createdAt: '2026-08-20',
    downloadsCount: 89
  },
  {
    id: 'res-4',
    communityId: 'comm-creators',
    title: 'Campus Brand Kit & Figma Color Palette Preset',
    description: 'Official collegiate vectors, badge logos, color styles, and social media template grids for student societies.',
    url: '#',
    fileType: 'link',
    uploadedById: 'student-ananya',
    uploadedByName: 'Ananya Roy',
    createdAt: '2026-08-15',
    downloadsCount: 76
  }
];

export const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: 'event-react-workshop',
    title: 'Hands-on React & Modern Frontend Workshop',
    description: 'Learn the fundamentals of component-driven architecture, state hooks, props, and build a working campus mini-app from scratch.',
    category: 'Workshops',
    date: '15 September 2026',
    time: '2:00 PM – 4:30 PM',
    location: 'Computer Center Lab 3, North Block',
    organizerClub: 'Google Developer Student Club',
    organizerName: 'Priya Sundaram',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    seatsTotal: 60,
    seatsFilled: 48,
    registrationDeadline: '13 September 2026',
    tags: ['React', 'JavaScript', 'Web Development', 'Hands-on'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
    isRegistered: true,
    registeredStudentIds: ['student-rahul'],
    skillsGained: ['React', 'State Management', 'Vite', 'Component Design']
  },
  {
    id: 'event-sih-bootcamp',
    title: 'Smart India Hackathon 2026 Prep & Pitch Bootcamp',
    description: 'Form cross-disciplinary teams, brainstorm problem statements from ministries, and review prototype pitches with faculty mentors.',
    category: 'Competitions',
    date: '20 September 2026',
    time: '10:00 AM – 3:00 PM',
    location: 'Main Auditorium, Innovation Wing',
    organizerClub: 'E-Cell & Hackathon Guild',
    organizerName: 'Rahul Sharma',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    seatsTotal: 120,
    seatsFilled: 94,
    registrationDeadline: '18 September 2026',
    tags: ['Hackathon', 'SIH 2026', 'Team Formation', 'Pitching'],
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
    isRegistered: false,
    registeredStudentIds: [],
    skillsGained: ['Rapid Prototyping', 'Pitch Deck Creation', 'Team Architecture']
  },
  {
    id: 'event-photo-walk',
    title: 'Golden Hour Street & Architecture Photography Walk',
    description: 'Join fellow photographers to explore campus lighting, framing rules, and portrait shots. Bring your DSLR, mirrorless, or phone camera.',
    category: 'Photography',
    date: '22 September 2026',
    time: '4:30 PM – 6:30 PM',
    location: 'Campus Amphitheater Steps',
    organizerClub: 'Media & Creative Guild',
    organizerName: 'Ananya Roy',
    organizerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    seatsTotal: 30,
    seatsFilled: 19,
    registrationDeadline: '21 September 2026',
    tags: ['Photography', 'Lightroom', 'Street Photography', 'Creativity'],
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    isRegistered: false,
    registeredStudentIds: [],
    skillsGained: ['Manual Camera Exposure', 'Composition', 'Color Correction']
  },
  {
    id: 'event-dbms-session',
    title: 'DBMS End-Term Revision & Problem Solving Session',
    description: 'Group study session solving difficult questions on B+ Trees, 2-Phase Locking, and Relational Calculus with senior student toppers.',
    category: 'Academic',
    date: '24 September 2026',
    time: '5:00 PM – 7:00 PM',
    location: 'Central Library Discussion Room A',
    organizerClub: 'Academic Peer Mentorship',
    organizerName: 'Priya Sundaram',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    seatsTotal: 35,
    seatsFilled: 28,
    registrationDeadline: '23 September 2026',
    tags: ['DBMS', 'Exam Prep', 'Problem Solving'],
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    isRegistered: false,
    registeredStudentIds: [],
    skillsGained: ['Query Optimization', 'Normalization Proofs']
  },
  {
    id: 'event-ai-agents',
    title: 'Building Autonomous AI Agents with Python & LLMs',
    description: 'Live seminar and coding demo demonstrating tool-calling agents, vector similarity embeddings, and multi-agent coordination.',
    category: 'AI',
    date: '28 September 2026',
    time: '3:00 PM – 5:30 PM',
    location: 'Seminar Hall 2, Tech Park',
    organizerClub: 'AI / Machine Learning Guild',
    organizerName: 'Rahul Sharma',
    organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    seatsTotal: 75,
    seatsFilled: 62,
    registrationDeadline: '26 September 2026',
    tags: ['AI Agents', 'Python', 'Embeddings', 'LangChain'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    isRegistered: false,
    registeredStudentIds: [],
    skillsGained: ['Vector Databases', 'Prompt Architecture', 'Agentic Workflows']
  }
];

export const INITIAL_CLUBS: CollegeClub[] = [
  {
    id: 'club-gdsc',
    name: 'Google Developer Student Club',
    category: 'Software & Cloud',
    description: 'University chapter connecting passionate developers building mobile, web, AI, and cloud solutions for real community problems.',
    leadName: 'Priya Sundaram',
    leadAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    memberCount: 280,
    logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200&auto=format&fit=crop&q=80',
    upcomingEventIds: ['event-react-workshop'],
    announcements: [
      {
        id: 'ann-1',
        title: 'Registrations Open for Annual Webathon 2026',
        content: '36-hour hackathon open for all branches. Cash prizes and internship interview vouchers for top 3 teams.',
        date: '2026-09-01'
      }
    ]
  },
  {
    id: 'club-robotics',
    name: 'Robotics & Automation Society (RAS)',
    category: 'Hardware & Embedded',
    description: 'Student research society working on autonomous drones, robot vision systems, robotic arms, and IoT campus automation.',
    leadName: 'Vikram Patel',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    memberCount: 145,
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200&auto=format&fit=crop&q=80',
    upcomingEventIds: [],
    announcements: [
      {
        id: 'ann-2',
        title: 'Component Lab Kits Distributed',
        content: 'ESP32 development kits and drone motors are available for checkout in Room 108.',
        date: '2026-08-29'
      }
    ]
  },
  {
    id: 'club-media',
    name: 'Media & Creative Guild',
    category: 'Visual & Media',
    description: 'The creative voice of the campus. Managing official video production, podcasts, event photography, graphic branding, and college magazines.',
    leadName: 'Ananya Roy',
    leadAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    memberCount: 120,
    logo: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=200&auto=format&fit=crop&q=80',
    upcomingEventIds: ['event-photo-walk'],
    announcements: [
      {
        id: 'ann-3',
        title: 'Recruiting Student Reel Creators and Podcast Editors',
        content: 'Apply via Creator Hub to join the official campus media coverage crew.',
        date: '2026-09-02'
      }
    ]
  },
  {
    id: 'club-ecell',
    name: 'E-Cell (Entrepreneurship Cell)',
    category: 'Startups & Business',
    description: 'Fostering student entrepreneurship through pitch competitions, seed grants, venture mentorship, and founder networking sessions.',
    leadName: 'Kavya Nair',
    leadAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    memberCount: 190,
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    upcomingEventIds: ['event-sih-bootcamp'],
    announcements: [
      {
        id: 'ann-4',
        title: 'Campus Seed Grant Applications Open',
        content: 'Up to $1,500 grant funding available for prototype validation.',
        date: '2026-08-25'
      }
    ]
  }
];

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'sg-dsa-sem3',
    subject: 'Data Structures & Algorithms',
    semester: 'Semester 3',
    description: 'Daily practice group solving LeetCode Mediums and reviewing time complexity for mid-semester exams.',
    memberCount: 18,
    members: ['student-rahul', 'student-priya'],
    nextSessionDate: 'Saturday, 10:00 AM',
    nextSessionTopic: 'Binary Search Trees & AVL Rotations',
    creatorName: 'Rahul Sharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  },
  {
    id: 'sg-dbms-sem4',
    subject: 'Database Management Systems',
    semester: 'Semester 4',
    description: 'Collaborative study squad preparing for semester papers. Solving schema normalization and SQL joins.',
    memberCount: 14,
    members: ['student-priya', 'student-vikram'],
    nextSessionDate: 'Sunday, 4:00 PM',
    nextSessionTopic: 'B+ Tree indexing and SQL Nested Queries',
    creatorName: 'Priya Sundaram',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
  },
  {
    id: 'sg-math-sem3',
    subject: 'Engineering Mathematics III',
    semester: 'Semester 3',
    description: 'Working through Fourier Transforms, Complex Variables, and Probability distributions.',
    memberCount: 22,
    members: ['student-vikram'],
    nextSessionDate: 'Monday, 6:00 PM',
    nextSessionTopic: 'Laplace Transforms and Convolution Theorem',
    creatorName: 'Vikram Patel',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
  }
];

export const INITIAL_STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'sr-1',
    subject: 'DBMS',
    title: 'DBMS Formula Sheet & Schema Normalization Cheatsheet',
    fileType: 'Formula Sheet',
    semester: 'Semester 4',
    authorName: 'Priya Sundaram',
    authorCollege: 'IIT Delhi',
    downloads: 184,
    dateAdded: '2026-08-20'
  },
  {
    id: 'sr-2',
    subject: 'Operating Systems',
    title: 'OS Process Synchronization & Deadlock Solved Numerical Bank',
    fileType: 'Notes PDF',
    semester: 'Semester 4',
    authorName: 'Rahul Sharma',
    authorCollege: 'IIT Delhi',
    downloads: 210,
    dateAdded: '2026-08-22'
  },
  {
    id: 'sr-3',
    subject: 'Data Structures',
    title: 'DSA Previous 3 Years Solved Lab Examination Code Snippets',
    fileType: 'Lab Manual',
    semester: 'Semester 3',
    authorName: 'Rahul Sharma',
    authorCollege: 'IIT Delhi',
    downloads: 245,
    dateAdded: '2026-08-15'
  },
  {
    id: 'sr-4',
    subject: 'Computer Networks',
    title: 'CN Subnetting and OSI vs TCP/IP Layer Questions Pack',
    fileType: 'Question Paper',
    semester: 'Semester 5',
    authorName: 'Vikram Patel',
    authorCollege: 'IIT Delhi',
    downloads: 120,
    dateAdded: '2026-08-10'
  }
];

export const INITIAL_CONNECTIONS: ConnectionRequest[] = [
  {
    id: 'conn-1',
    fromId: 'student-priya',
    fromName: 'Priya Sundaram',
    fromAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    fromDepartment: 'Software Engineering',
    fromCollege: 'IIT Delhi',
    toId: 'student-rahul',
    status: 'accepted',
    note: 'Hey Rahul, let us connect! I saw your work on the rescue drone project.',
    createdAt: '2026-08-25'
  },
  {
    id: 'conn-2',
    fromId: 'student-vikram',
    fromName: 'Vikram Patel',
    fromAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    fromDepartment: 'Electrical & Electronics',
    fromCollege: 'IIT Delhi',
    toId: 'student-rahul',
    status: 'accepted',
    note: 'Great teaming up for the hackathon!',
    createdAt: '2026-08-26'
  },
  {
    id: 'conn-3',
    fromId: 'student-ananya',
    fromName: 'Ananya Roy',
    fromAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    fromDepartment: 'UI/UX Design',
    fromCollege: 'NID Bangalore',
    toId: 'student-rahul',
    status: 'pending',
    note: 'Would love to connect and share design feedback on campus projects!',
    createdAt: '2026-09-02'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    studentId: 'student-rahul',
    title: 'Connection Accepted',
    message: 'Priya Sundaram accepted your connection request.',
    link: '/students',
    read: false,
    type: 'connection',
    timestamp: '2 hours ago'
  },
  {
    id: 'notif-2',
    studentId: 'student-rahul',
    title: 'Workshop Confirmed',
    message: 'You are registered for "Hands-on React & Modern Frontend Workshop" on 15 Sept.',
    link: '/events',
    read: false,
    type: 'event',
    timestamp: '1 day ago'
  },
  {
    id: 'notif-3',
    studentId: 'student-rahul',
    title: 'New Study Session Scheduled',
    message: 'DSA Beginners group scheduled a revision session for Saturday 10:00 AM.',
    link: '/discover/exams',
    read: true,
    type: 'community',
    timestamp: '2 days ago'
  }
];

export const INITIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-1',
    reporterId: 'student-priya',
    reporterName: 'Priya Sundaram',
    targetType: 'discussion',
    targetId: 'disc-spam',
    targetTitle: 'Promotional crypto link in programming hub',
    reason: 'Spam / Commercial advertising',
    details: 'User posted an off-topic commercial link.',
    status: 'resolved',
    timestamp: '2026-08-20'
  }
];

