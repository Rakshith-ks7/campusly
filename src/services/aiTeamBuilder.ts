import { 
  StudentProfile, 
  AiTeamBuilderResult, 
  AiTeamRoleRecommendation,
  Project,
  Team
} from '../types';
import { dataService } from './dataService';
import { rankStudentsForProject } from './matchingAlgorithm';

interface RoleBlueprint {
  title: string;
  skills: string[];
  rationaleBase: string;
}

export async function generateTeamFromPrompt(
  prompt: string, 
  students: StudentProfile[]
): Promise<AiTeamBuilderResult> {
  const promptLower = prompt.toLowerCase();
  const useAiService = dataService.isAiServiceEnabled();

  // If external AI service is toggled, attempt calling FastAPI microservice
  if (useAiService) {
    try {
      const res = await fetch('http://localhost:8000/api/team-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          candidates: students.map(s => ({
            id: s.id,
            name: s.name,
            department: s.department,
            college: s.college,
            skills: s.skills.map(sk => sk.name),
            interests: s.interests,
            experienceYears: s.experienceYears,
            availability: s.availability,
            location: s.location
          })),
          targetTeamSize: 4
        })
      });

      if (res.ok) {
        const data = await res.json();
        return {
          projectConcept: data.projectConcept,
          detectedCategory: data.detectedCategory,
          extractedRoles: data.extractedRoles.map((r: any) => ({
            roleTitle: r.roleTitle,
            requiredSkills: r.requiredSkills,
            recommendedStudent: students.find(s => s.id === r.recommendedStudent?.id) || students[0],
            matchPercentage: r.matchPercentage,
            rationale: r.rationale
          })),
          averageTeamMatch: data.averageTeamMatch,
          deviceUsed: data.deviceUsed
        };
      }
    } catch (err) {
      console.warn('FastAPI microservice offline, seamlessly using client AI heuristic engine:', err);
    }
  }

  // Client-Side Heuristic AI Engine
  let category = 'Cross-Disciplinary Hackathon';
  let roles: RoleBlueprint[] = [];

  if (promptLower.includes('drone') || promptLower.includes('robot') || promptLower.includes('hardware') || promptLower.includes('sensor')) {
    category = 'Robotics & Hardware Systems';
    roles = [
      {
        title: 'Flight Hardware & Embedded Engineer',
        skills: ['Embedded Systems', 'IoT', 'C++', 'ESP32'],
        rationaleBase: 'Demonstrated mastery in microcontrollers, sensor arrays, and circuit hardware.'
      },
      {
        title: 'Edge AI & Computer Vision Lead',
        skills: ['Python', 'PyTorch', 'CUDA', 'Computer Vision'],
        rationaleBase: 'Specialized in real-time camera inference and deep learning models.'
      },
      {
        title: 'Telemetry & Ground Station UI Developer',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase'],
        rationaleBase: 'Experienced in real-time responsive web interfaces and telemetry dashboards.'
      },
      {
        title: 'Field Operations & Product Lead',
        skills: ['Product Management', 'Pitching', 'Business Strategy'],
        rationaleBase: 'Experienced in team orchestration, demo presentation, and competition pitch.'
      }
    ];
  } else if (promptLower.includes('waste') || promptLower.includes('recycle') || promptLower.includes('eco') || promptLower.includes('green')) {
    category = 'EcoTech & Smart Sustainability';
    roles = [
      {
        title: 'Waste Classification ML Engineer',
        skills: ['Python', 'Machine Learning', 'PyTorch', 'Computer Vision'],
        rationaleBase: 'High accuracy in image classification and model fine-tuning.'
      },
      {
        title: 'IoT Bin & Actuator Specialist',
        skills: ['Embedded Systems', 'IoT', 'Arduino', 'C++'],
        rationaleBase: 'Expertise in physical actuators, ultrasonic sensors, and automated bin lids.'
      },
      {
        title: 'Campus Eco-Dashboard Designer',
        skills: ['UI/UX', 'Figma', 'React', 'Tailwind CSS'],
        rationaleBase: 'Focus on student engagement, gamified recycling metrics, and intuitive UI.'
      },
      {
        title: 'Sustainability Partnerships Lead',
        skills: ['Product Management', 'Business Strategy', 'Pitching'],
        rationaleBase: 'Aligns university campus administration with student sustainability initiatives.'
      }
    ];
  } else if (promptLower.includes('health') || promptLower.includes('med') || promptLower.includes('patient') || promptLower.includes('doctor')) {
    category = 'Digital Health & MedTech';
    roles = [
      {
        title: 'AI Diagnostic Model Lead',
        skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning'],
        rationaleBase: 'Focus on medical image analysis and tabular health signal classification.'
      },
      {
        title: 'Patient Portal & Mobile UI/UX',
        skills: ['UI/UX', 'Figma', 'Design Systems', 'React'],
        rationaleBase: 'Creates accessible, HIPAA-friendly patient interfaces with calm aesthetics.'
      },
      {
        title: 'Cloud & Encrypted Data Architect',
        skills: ['Node.js', 'Firebase', 'TypeScript', 'MongoDB'],
        rationaleBase: 'Ensures real-time patient telemetry with secure cloud encryption.'
      },
      {
        title: 'Clinical Workflow & Pitch Lead',
        skills: ['Product Management', 'Business Strategy', 'Pitching'],
        rationaleBase: 'Validates diagnostic pipeline with clinical requirements and pitch decks.'
      }
    ];
  } else {
    // General Hackathon / SaaS
    category = 'Student Innovation & SaaS';
    roles = [
      {
        title: 'Full Stack Web Platform Lead',
        skills: ['React', 'TypeScript', 'Node.js', 'Firebase'],
        rationaleBase: 'Strong core web architecture skills with real-time state management.'
      },
      {
        title: 'AI / Algorithm Engineer',
        skills: ['Python', 'Machine Learning', 'FastAPI', 'PyTorch'],
        rationaleBase: 'Builds scalable machine learning endpoints and core data heuristics.'
      },
      {
        title: 'Product Experience & UI/UX Designer',
        skills: ['UI/UX', 'Figma', 'Tailwind CSS', 'Wireframing'],
        rationaleBase: 'Crafts pixel-perfect interfaces, onboarding funnels, and component libraries.'
      },
      {
        title: 'Go-To-Market & Pitch Specialist',
        skills: ['Product Management', 'Pitching', 'Business Strategy'],
        rationaleBase: 'Mastery in storytelling, pitch presentations, and market validation.'
      }
    ];
  }

  const assignedStudentIds = new Set<string>();
  const extractedRoles: AiTeamRoleRecommendation[] = [];
  let totalScore = 0;

  for (const blueprint of roles) {
    const availablePool = students.filter(s => !assignedStudentIds.has(s.id));
    const ranked = rankStudentsForProject(availablePool, blueprint.skills, [category]);
    
    const bestCandidateMatch = ranked[0] || rankStudentsForProject(students, blueprint.skills)[0];
    const candidate = bestCandidateMatch.student;
    assignedStudentIds.add(candidate.id);

    const matchPct = bestCandidateMatch.overallMatch;
    totalScore += matchPct;

    const matchedStr = bestCandidateMatch.breakdown.matchedSkills.length > 0 
      ? `Strong coverage in ${bestCandidateMatch.breakdown.matchedSkills.join(', ')}.`
      : 'Complementary discipline profile.';

    extractedRoles.push({
      roleTitle: blueprint.title,
      requiredSkills: blueprint.skills,
      recommendedStudent: candidate,
      matchPercentage: matchPct,
      rationale: `${blueprint.rationaleBase} ${matchedStr}`
    });
  }

  const averageTeamMatch = Math.round(totalScore / extractedRoles.length);

  return {
    projectConcept: prompt,
    detectedCategory: category,
    extractedRoles,
    averageTeamMatch,
    deviceUsed: useAiService ? 'FastAPI / PyTorch (NVIDIA CUDA)' : 'TeamFinder Intelligent Matching Engine (Client-Side)'
  };
}

export function assembleTeamFromAiResult(
  result: AiTeamBuilderResult,
  customTitle?: string
): { project: Project; team: Team } {
  const currentUser = dataService.getCurrentUser();
  const projectTitle = customTitle || result.projectConcept.slice(0, 60);

  const roleSlots = result.extractedRoles.map((r, idx) => ({
    id: `role-${Date.now()}-${idx}`,
    title: r.roleTitle,
    skills: r.requiredSkills,
    assignedStudentId: r.recommendedStudent.id,
    assignedStudentName: r.recommendedStudent.name,
    assignedAvatar: r.recommendedStudent.avatar,
    isFilled: true
  }));

  const project = dataService.createProject({
    title: projectTitle,
    description: `Formed via TeamFinder AI Team Builder from prompt: "${result.projectConcept}". Category: ${result.detectedCategory}.`,
    category: result.detectedCategory.includes('Robotics') ? 'Robotics' :
              result.detectedCategory.includes('Eco') ? 'College Project' : 'Hackathon',
    creatorId: currentUser.id,
    creatorName: currentUser.name,
    creatorAvatar: currentUser.avatar,
    teamSize: roleSlots.length,
    maxMembers: roleSlots.length,
    deadline: 'In 3 Weeks (Team Sprint)',
    locationType: 'Hybrid',
    locationName: `${currentUser.college} & Remote`,
    requiredSkills: Array.from(new Set(result.extractedRoles.flatMap(r => r.requiredSkills))),
    roles: roleSlots,
    difficulty: 'Intermediate',
    tags: [result.detectedCategory, 'AI Formed', 'Cross-Disciplinary'],
    status: 'in_progress'
  });

  const teamMembers = result.extractedRoles.map((r, idx) => ({
    studentId: r.recommendedStudent.id,
    studentName: r.recommendedStudent.name,
    avatar: r.recommendedStudent.avatar,
    role: r.roleTitle,
    joinedAt: new Date().toISOString().split('T')[0],
    isLeader: idx === 0
  }));

  const team = dataService.createTeam({
    projectId: project.id,
    projectTitle: project.title,
    name: `Team ${project.title.split(' ')[0]} Alpha`,
    description: `Assembled team for ${project.title}`,
    leaderId: teamMembers[0].studentId,
    members: teamMembers
  });

  // Link team to project
  project.teamId = team.id;
  dataService.updateProject(project);

  // Initialize first Kanban tasks
  dataService.createTask({
    teamId: team.id,
    title: 'Hold initial team kickoff and architecture sync',
    description: 'Review project concept, assign GitHub repository permissions, and set milestone deadlines.',
    status: 'TODO',
    assigneeId: teamMembers[0].studentId,
    assigneeName: teamMembers[0].studentName,
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  });

  dataService.createTask({
    teamId: team.id,
    title: 'Setup repository and design system tokens',
    description: 'Initialize code repository and Figma design wireframes.',
    status: 'TODO',
    assigneeId: teamMembers[1]?.studentId || teamMembers[0].studentId,
    assigneeName: teamMembers[1]?.studentName || teamMembers[0].studentName,
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  });

  return { project, team };
}
