import { StudentProfile, MatchingWeights, CompatibilityResult, CompatibilityBreakdown } from '../types';

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skills: 40,
  interests: 15,
  availability: 15,
  experience: 10,
  projectInterests: 10,
  location: 5,
  education: 5
};

export function calculateStudentMatch(
  student: StudentProfile,
  requiredSkills: string[],
  projectInterests: string[] = [],
  locationTarget: string = 'Campus',
  weights: MatchingWeights = DEFAULT_WEIGHTS
): CompatibilityResult {
  // Normalize weight total
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 100;

  // 1. Skill Compatibility (Direct & substring matching + level weighting)
  const studentSkillNames = student.skills.map(s => s.name.toLowerCase());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  let skillPoints = 0;
  for (const req of requiredSkills) {
    const reqLower = req.toLowerCase();
    const foundSkill = student.skills.find(
      s => s.name.toLowerCase() === reqLower || s.name.toLowerCase().includes(reqLower) || reqLower.includes(s.name.toLowerCase())
    );

    if (foundSkill) {
      matchedSkills.push(req);
      // Level multiplier
      const levelMultiplier = 
        foundSkill.level === 'Expert' ? 1.0 :
        foundSkill.level === 'Advanced' ? 0.85 :
        foundSkill.level === 'Intermediate' ? 0.70 : 0.50;
      
      const verifiedBonus = foundSkill.verified ? 1.1 : 1.0;
      skillPoints += Math.min(1.0, levelMultiplier * verifiedBonus);
    } else {
      missingSkills.push(req);
    }
  }

  const rawSkillCoverage = requiredSkills.length > 0 ? (skillPoints / requiredSkills.length) * 100 : 85;
  const skillsScore = Math.min(100, Math.round(rawSkillCoverage));

  // 2. Interest Compatibility
  let interestMatches = 0;
  const studentInterests = student.interests.map(i => i.toLowerCase());
  for (const pInt of projectInterests) {
    if (studentInterests.some(si => si.includes(pInt.toLowerCase()) || pInt.toLowerCase().includes(si))) {
      interestMatches++;
    }
  }
  const interestsScore = projectInterests.length > 0 
    ? Math.round((interestMatches / projectInterests.length) * 100) 
    : 80;

  // 3. Availability Compatibility
  let availabilityScore = 80;
  if (student.availability === 'Full-time Hackathon' || student.availability === '20+ hrs/wk') {
    availabilityScore = 100;
  } else if (student.availability === '10-20 hrs/wk') {
    availabilityScore = 85;
  } else {
    availabilityScore = 65;
  }

  // 4. Experience Compatibility
  // Scaled against expected 3-year baseline
  const experienceScore = Math.min(100, Math.round((student.experienceYears / 3.0) * 100));

  // 5. Project Interests / Domain Alignment
  const projectInterestsScore = Math.min(100, Math.round((interestsScore * 0.7) + (skillsScore * 0.3)));

  // 6. Location & Locality Radius
  let locationScore = 75;
  if (student.localityRadius === 'Same College') {
    locationScore = 100;
  } else if (student.localityRadius === '5 km' || student.localityRadius === '10 km') {
    locationScore = 90;
  } else if (student.localityRadius === 'City') {
    locationScore = 80;
  } else {
    locationScore = 70;
  }

  // 7. Education / College Compatibility
  let educationScore = 85;
  if (student.year === '3rd Year' || student.year === '4th Year' || student.year === 'Postgraduate') {
    educationScore = 95;
  } else {
    educationScore = 80;
  }

  // Weighted aggregate formula
  const weightedSum = 
    (skillsScore * (weights.skills / totalWeight)) +
    (interestsScore * (weights.interests / totalWeight)) +
    (availabilityScore * (weights.availability / totalWeight)) +
    (experienceScore * (weights.experience / totalWeight)) +
    (projectInterestsScore * (weights.projectInterests / totalWeight)) +
    (locationScore * (weights.location / totalWeight)) +
    (educationScore * (weights.education / totalWeight));

  const overallMatch = Math.min(99, Math.max(35, Math.round(weightedSum)));

  const breakdown: CompatibilityBreakdown = {
    skillsScore,
    interestsScore,
    availabilityScore,
    experienceScore,
    locationScore,
    educationScore,
    matchedSkills,
    missingSkills
  };

  return {
    studentId: student.id,
    student,
    overallMatch,
    breakdown
  };
}

export function rankStudentsForProject(
  students: StudentProfile[],
  requiredSkills: string[],
  projectInterests: string[] = [],
  locationTarget: string = 'Campus',
  weights: MatchingWeights = DEFAULT_WEIGHTS
): CompatibilityResult[] {
  return students
    .map(student => calculateStudentMatch(student, requiredSkills, projectInterests, locationTarget, weights))
    .sort((a, b) => b.overallMatch - a.overallMatch);
}
