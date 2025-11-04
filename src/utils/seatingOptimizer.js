/**
 * ============================================================================
 * INTELLIGENT SEATING OPTIMIZER
 * ============================================================================
 *
 * Uses Constraint Satisfaction Problem (CSP) principles with:
 * - Educational psychology theories
 * - Peer compatibility analysis
 * - Multi-objective optimization
 * - Genetic algorithm for solution search
 *
 * Based on research:
 * - Zone of Proximal Development (Vygotsky)
 * - Peer tutoring effectiveness
 * - Social-emotional learning (SEL)
 * - Classroom management best practices
 */

// ============================================================================
// STUDENT ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Calculate compatibility score between two students
 * @param {Object} student1 - First student
 * @param {Object} student2 - Second student
 * @returns {Object} Compatibility analysis
 */
export const calculateDeskPairCompatibility = (student1, student2) => {
  if (!student1 || !student2) return { score: 0, reasons: [] };

  const scores = {
    academic: 0,
    behavioral: 0,
    social: 0,
    learning: 0
  };
  const reasons = [];

  // 1. ACADEMIC COMPATIBILITY (Zone of Proximal Development)
  const level1 = (student1.strengthsCount || 0) - (student1.challengesCount || 0);
  const level2 = (student2.strengthsCount || 0) - (student2.challengesCount || 0);
  const levelGap = Math.abs(level1 - level2);

  if (levelGap >= 1 && levelGap <= 3) {
    // Optimal peer tutoring gap
    scores.academic = 100;
    const mentor = level1 > level2 ? student1.name : student2.name;
    const mentee = level1 > level2 ? student2.name : student1.name;
    reasons.push(`✅ זוג הדרכה אופטימלי: ${mentor} יכול לתמוך ב-${mentee}`);
  } else if (levelGap === 0) {
    // Similar levels - can collaborate well
    scores.academic = 80;
    reasons.push(`✅ רמה אקדמית דומה - שיתוף פעולה טוב`);
  } else if (levelGap > 4) {
    // Too big gap - not ideal
    scores.academic = 40;
    reasons.push(`⚠️ פער אקדמי גדול - עלול לגרום לתסכול`);
  } else {
    scores.academic = 60;
  }

  // 2. BEHAVIORAL COMPATIBILITY
  const focus1 = student1.scores?.focus?.percentage || 50;
  const focus2 = student2.scores?.focus?.percentage || 50;

  // At least one should have good focus
  if (focus1 > 70 || focus2 > 70) {
    scores.behavioral = 100;
    reasons.push(`✅ לפחות תלמיד אחד עם ריכוז טוב`);
  } else if (focus1 < 40 && focus2 < 40) {
    // Both have focus issues - bad pairing
    scores.behavioral = 20;
    reasons.push(`❌ שני התלמידים עם קשיי ריכוז - לא מומלץ`);
  } else {
    scores.behavioral = 70;
  }

  // 3. SOCIAL COMPATIBILITY
  const collab1 = student1.scores?.collaboration?.percentage || 50;
  const collab2 = student2.scores?.collaboration?.percentage || 50;

  // Prefer one social + one reserved
  if ((collab1 > 70 && collab2 < 50) || (collab2 > 70 && collab1 < 50)) {
    scores.social = 100;
    reasons.push(`✅ איזון חברתי טוב: מוחצן + שמרן`);
  } else if (collab1 < 30 && collab2 < 30) {
    // Both very introverted
    scores.social = 50;
    reasons.push(`⚠️ שני התלמידים מופנמים - עלול להיות שקט מדי`);
  } else {
    scores.social = 75;
  }

  // 4. MOTIVATION COMPATIBILITY
  const motiv1 = student1.scores?.motivation?.percentage || 50;
  const motiv2 = student2.scores?.motivation?.percentage || 50;

  // High motivation with low motivation = good influence
  if ((motiv1 > 70 && motiv2 < 50) || (motiv2 > 70 && motiv1 < 50)) {
    scores.learning = 100;
    reasons.push(`✅ תלמיד מוטיבציה גבוהה יכול להשפיע חיובית`);
  } else if (motiv1 < 30 && motiv2 < 30) {
    scores.learning = 40;
    reasons.push(`⚠️ שני התלמידים עם מוטיבציה נמוכה`);
  } else {
    scores.learning = 70;
  }

  // Calculate overall score (weighted average)
  const totalScore = (
    scores.academic * 0.35 +
    scores.behavioral * 0.30 +
    scores.social * 0.20 +
    scores.learning * 0.15
  );

  return {
    score: Math.round(totalScore),
    scores,
    reasons,
    recommendation: totalScore > 75 ? 'מומלץ מאוד' :
                    totalScore > 60 ? 'מתאים' :
                    totalScore > 40 ? 'בסדר' : 'לא מומלץ'
  };
};

/**
 * Calculate optimal row placement for a student
 * @param {Object} student - Student object
 * @param {number} totalRows - Total number of rows
 * @returns {number} Recommended row (0-indexed)
 */
export const calculateOptimalRow = (student, totalRows) => {
  const challenges = student.challengesCount || 0;
  const strengths = student.strengthsCount || 0;
  const focus = student.scores?.focus?.percentage || 50;

  // High challenges or low focus → front rows
  if (challenges > 4 || focus < 40) {
    return 0; // First row
  }

  // Very independent high performers → back rows
  if (strengths > 4 && challenges <= 2 && focus > 70) {
    return totalRows - 1; // Last row
  }

  // Moderate challenges → second row
  if (challenges > 2) {
    return 1;
  }

  // High performers but not fully independent → middle-back
  if (strengths > 3) {
    return Math.floor(totalRows * 0.6);
  }

  // Everyone else → middle rows
  return Math.floor(totalRows / 2);
};

// ============================================================================
// CONSTRAINT DEFINITIONS
// ============================================================================

/**
 * Define hard constraints (MUST be satisfied)
 */
export const hardConstraints = {
  /**
   * Each student must have exactly one seat
   */
  oneStudentPerSeat: (arrangement) => {
    const studentIds = new Set();
    for (const desk of arrangement) {
      if (desk.leftStudent) {
        if (studentIds.has(desk.leftStudent.studentCode)) return false;
        studentIds.add(desk.leftStudent.studentCode);
      }
      if (desk.rightStudent) {
        if (studentIds.has(desk.rightStudent.studentCode)) return false;
        studentIds.add(desk.rightStudent.studentCode);
      }
    }
    return true;
  },

  /**
   * High-challenge students must be in front rows
   */
  highChallengeInFront: (arrangement, totalRows) => {
    for (const desk of arrangement) {
      const students = [desk.leftStudent, desk.rightStudent].filter(s => s);
      for (const student of students) {
        const challenges = student.challengesCount || 0;
        if (challenges > 4 && desk.row > 1) {
          return false; // High challenge student not in front
        }
      }
    }
    return true;
  },

  /**
   * Students with severe focus issues must not share a desk
   */
  noDoubleFocusIssues: (arrangement) => {
    for (const desk of arrangement) {
      if (desk.leftStudent && desk.rightStudent) {
        const focus1 = desk.leftStudent.scores?.focus?.percentage || 50;
        const focus2 = desk.rightStudent.scores?.focus?.percentage || 50;

        // Both have severe focus issues
        if (focus1 < 30 && focus2 < 30) {
          return false;
        }
      }
    }
    return true;
  }
};

/**
 * Define soft constraints (SHOULD be satisfied, scored)
 */
export const softConstraints = {
  /**
   * Maximize desk pair compatibility
   */
  pairCompatibility: (arrangement) => {
    let totalScore = 0;
    let pairCount = 0;

    for (const desk of arrangement) {
      if (desk.leftStudent && desk.rightStudent) {
        const compat = calculateDeskPairCompatibility(
          desk.leftStudent,
          desk.rightStudent
        );
        totalScore += compat.score;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalScore / pairCount : 50;
  },

  /**
   * Distribute high performers evenly across rows
   */
  distributeHighPerformers: (arrangement, totalRows) => {
    const rowCounts = Array(totalRows).fill(0);

    for (const desk of arrangement) {
      const students = [desk.leftStudent, desk.rightStudent].filter(s => s);
      for (const student of students) {
        const strengths = student.strengthsCount || 0;
        if (strengths > 4) {
          rowCounts[desk.row]++;
        }
      }
    }

    // Calculate variance (lower is better - more even distribution)
    const mean = rowCounts.reduce((a, b) => a + b, 0) / rowCounts.length;
    const variance = rowCounts.reduce((sum, count) =>
      sum + Math.pow(count - mean, 2), 0
    ) / rowCounts.length;

    // Convert to score (0-100, lower variance = higher score)
    return Math.max(0, 100 - variance * 20);
  },

  /**
   * Balance behavioral challenges across the classroom
   */
  balanceBehavior: (arrangement, totalRows) => {
    const rowScores = Array(totalRows).fill(0);
    const rowCounts = Array(totalRows).fill(0);

    for (const desk of arrangement) {
      const students = [desk.leftStudent, desk.rightStudent].filter(s => s);
      for (const student of students) {
        const focus = student.scores?.focus?.percentage || 50;
        rowScores[desk.row] += focus;
        rowCounts[desk.row]++;
      }
    }

    // Calculate average focus per row
    const rowAverages = rowScores.map((score, i) =>
      rowCounts[i] > 0 ? score / rowCounts[i] : 50
    );

    // Calculate variance
    const mean = rowAverages.reduce((a, b) => a + b, 0) / rowAverages.length;
    const variance = rowAverages.reduce((sum, avg) =>
      sum + Math.pow(avg - mean, 2), 0
    ) / rowAverages.length;

    // Convert to score
    return Math.max(0, 100 - variance / 5);
  }
};

// ============================================================================
// CSP SOLVER - GENETIC ALGORITHM
// ============================================================================

/**
 * Generate initial random arrangement
 */
const generateRandomArrangement = (students, rows, desksPerRow) => {
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  const arrangement = [];
  let studentIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let desk = 0; desk < desksPerRow; desk++) {
      const leftStudent = shuffled[studentIndex++] || null;
      const rightStudent = shuffled[studentIndex++] || null;

      arrangement.push({
        id: `${row}-${desk}`,
        row,
        desk,
        leftStudent,
        rightStudent
      });
    }
  }

  return arrangement;
};

/**
 * Evaluate arrangement quality (fitness function)
 */
const evaluateArrangement = (arrangement, totalRows) => {
  let score = 0;
  const violations = [];

  // Check hard constraints (must pass)
  if (!hardConstraints.oneStudentPerSeat(arrangement)) {
    violations.push('Duplicate student placement');
    return { score: 0, violations };
  }

  if (!hardConstraints.highChallengeInFront(arrangement, totalRows)) {
    violations.push('High-challenge students not in front');
    score -= 50; // Heavy penalty
  }

  if (!hardConstraints.noDoubleFocusIssues(arrangement)) {
    violations.push('Two students with focus issues paired');
    score -= 30; // Moderate penalty
  }

  // Evaluate soft constraints (weighted scoring)
  score += softConstraints.pairCompatibility(arrangement) * 0.40; // 40% weight
  score += softConstraints.distributeHighPerformers(arrangement, totalRows) * 0.30; // 30% weight
  score += softConstraints.balanceBehavior(arrangement, totalRows) * 0.30; // 30% weight

  return { score: Math.max(0, score), violations };
};

/**
 * Mutate an arrangement (for genetic algorithm)
 */
const mutateArrangement = (arrangement) => {
  if (!arrangement || arrangement.length === 0) return arrangement;

  const mutated = JSON.parse(JSON.stringify(arrangement));

  // Random mutation strategies
  const strategy = Math.floor(Math.random() * 3);

  if (strategy === 0) {
    // Swap two random students
    const desk1 = mutated[Math.floor(Math.random() * mutated.length)];
    const desk2 = mutated[Math.floor(Math.random() * mutated.length)];

    if (desk1 && desk2 && desk1.leftStudent && desk2.leftStudent) {
      [desk1.leftStudent, desk2.leftStudent] = [desk2.leftStudent, desk1.leftStudent];
    }
  } else if (strategy === 1) {
    // Swap desk partners
    const desk = mutated[Math.floor(Math.random() * mutated.length)];
    if (desk && desk.leftStudent && desk.rightStudent) {
      [desk.leftStudent, desk.rightStudent] = [desk.rightStudent, desk.leftStudent];
    }
  } else {
    // Move student to different row
    const fromDesk = mutated[Math.floor(Math.random() * mutated.length)];
    const toDesk = mutated[Math.floor(Math.random() * mutated.length)];

    if (fromDesk && toDesk && fromDesk.leftStudent && !toDesk.rightStudent) {
      toDesk.rightStudent = fromDesk.leftStudent;
      fromDesk.leftStudent = null;
    }
  }

  return mutated;
};

/**
 * Main CSP solver using genetic algorithm
 * @param {Array} students - Array of student objects
 * @param {Object} shape - Desk arrangement shape
 * @param {Object} options - Solver options
 * @returns {Object} Optimal arrangement with metadata
 */
export const solveSeatingCSP = (students, shape, options = {}) => {
  try {
    // Validate inputs
    if (!students || students.length === 0) {
      console.warn('⚠️ No students provided to CSP solver');
      return { arrangement: [], score: 0, violations: ['No students'], metadata: {} };
    }

    if (!shape || !shape.rows || !shape.cols) {
      console.warn('⚠️ Invalid shape configuration');
      return { arrangement: [], score: 0, violations: ['Invalid shape'], metadata: {} };
    }

    const {
      populationSize = 50,
      generations = 100,
      mutationRate = 0.2,
      eliteSize = 5
    } = options;


    // Generate initial population
    let population = [];
    for (let i = 0; i < populationSize; i++) {
      population.push(generateRandomArrangement(students, shape.rows, shape.cols));
    }

    let bestSolution = null;
    let bestScore = 0;
    let generation = 0;

    // Evolve population
    for (generation = 0; generation < generations; generation++) {
      // Evaluate all arrangements
      const evaluated = population.map(arr => ({
        arrangement: arr,
        ...evaluateArrangement(arr, shape.rows)
      }));

      // Sort by fitness score
      evaluated.sort((a, b) => b.score - a.score);

      // Track best solution
      if (evaluated[0].score > bestScore) {
        bestScore = evaluated[0].score;
        bestSolution = evaluated[0];
      }

      // Create next generation
      const nextGen = [];

      // Keep elite solutions
      for (let i = 0; i < eliteSize; i++) {
        nextGen.push(evaluated[i].arrangement);
      }

      // Generate offspring through mutation
      while (nextGen.length < populationSize) {
        const parent = evaluated[Math.floor(Math.random() * Math.min(20, evaluated.length))];

        if (Math.random() < mutationRate) {
          nextGen.push(mutateArrangement(parent.arrangement));
        } else {
          nextGen.push(parent.arrangement);
        }
      }

      population = nextGen;

      // Early stopping if we found a great solution
      if (bestScore > 95) {
        break;
      }
    }


    // Add compatibility metadata to desks
    const enhancedArrangement = bestSolution.arrangement.map(desk => {
      let compatibility = null;
      if (desk.leftStudent && desk.rightStudent) {
        compatibility = calculateDeskPairCompatibility(desk.leftStudent, desk.rightStudent);
      }

      return {
        ...desk,
        compatibility
      };
    });

    return {
      arrangement: enhancedArrangement,
      score: bestScore,
      violations: bestSolution.violations,
      metadata: {
        generations: generation + 1,
        populationSize,
        finalScore: bestScore
      }
    };
  } catch (error) {
    console.error('❌ CSP Solver error:', error);
    return {
      arrangement: [],
      score: 0,
      violations: [`Error: ${error.message}`],
      metadata: { error: error.message }
    };
  }
};
