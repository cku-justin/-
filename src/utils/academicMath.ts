import type { CourseItem, LetterGrade } from '../types/campus';

export const GRADE_POINTS: Record<LetterGrade, number> = {
  'A+': 4.5,
  'A0': 4.0,
  'B+': 3.5,
  'B0': 3.0,
  'C+': 2.5,
  'C0': 2.0,
  'D+': 1.5,
  'D0': 1.0,
  'F': 0.0,
};

export const LETTER_GRADES: LetterGrade[] = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F'];

export function computeAttendanceMetrics(course: CourseItem) {
  const convertedAbsent = course.absentCount + Math.floor(course.lateCount / 3);
  const remainingAllowed = course.maxAbsentAllowed - convertedAbsent;
  const progressPercent = Math.min(100, Math.round((course.currentWeek / course.totalWeeks) * 100));

  let status: '정상' | '출석 주의' | 'F 위험 경고' = '정상';
  if (remainingAllowed <= 0) {
    status = 'F 위험 경고';
  } else if (remainingAllowed === 1) {
    status = '출석 주의';
  }

  return {
    convertedAbsent,
    remainingAllowed: Math.max(0, remainingAllowed),
    isOverLimit: remainingAllowed < 0,
    progressPercent,
    status,
  };
}

export function computeWeightedCourseScore(course: CourseItem): number {
  const { convertedAbsent } = computeAttendanceMetrics(course);
  const attendanceScore = Math.max(0, 100 - convertedAbsent * 10);
  // 35% midterm, 35% final, 20% assignment, 10% attendance
  return Math.round(
    course.midtermScore * 0.35 +
      course.finalScore * 0.35 +
      course.assignmentScore * 0.2 +
      attendanceScore * 0.1
  );
}

export function suggestLetterGrade(score: number, isOverAbsent: boolean): LetterGrade {
  if (isOverAbsent) return 'F';
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A0';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B0';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C0';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D0';
  return 'F';
}

export function calculateGpa(courses: CourseItem[]): { gpa: number; totalCredits: number } {
  if (courses.length === 0) return { gpa: 0, totalCredits: 0 };
  let totalPoints = 0;
  let totalCredits = 0;
  for (const c of courses) {
    totalCredits += c.credits;
    totalPoints += GRADE_POINTS[c.expectedGrade] * c.credits;
  }
  return {
    gpa: totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0,
    totalCredits,
  };
}

export function computeDDay(dateStr: string): { label: string; daysLeft: number; isUrgent: boolean } {
  const today = new Date();
  const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  const diffDays = Math.round((target.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'D-DAY', daysLeft: 0, isUrgent: true };
  if (diffDays < 0) return { label: `D+${Math.abs(diffDays)}`, daysLeft: diffDays, isUrgent: false };
  return {
    label: `D-${diffDays}`,
    daysLeft: diffDays,
    isUrgent: diffDays <= 7,
  };
}

export function checkScheduleConflict(
  candidate: CourseItem,
  enrolled: CourseItem[]
): { hasConflict: boolean; conflictWith?: string } {
  for (const existing of enrolled) {
    if (existing.id === candidate.id) {
      return { hasConflict: true, conflictWith: existing.title };
    }
    for (const cSlot of candidate.slots) {
      for (const eSlot of existing.slots) {
        if (cSlot.day !== eSlot.day) continue;
        const cEnd = cSlot.startHour + cSlot.duration;
        const eEnd = eSlot.startHour + eSlot.duration;
        if (cSlot.startHour < eEnd && eSlot.startHour < cEnd) {
          return { hasConflict: true, conflictWith: `${existing.title} (${eSlot.day} ${eSlot.startHour}:00)` };
        }
      }
    }
  }
  return { hasConflict: false };
}

export const PASTEL_TONE_CLASSES: Record<
  CourseItem['pastelTone'],
  { bg: string; border: string; text: string; bar: string }
> = {
  sky: {
    bg: 'bg-[#EBF6FF]',
    border: 'border-[#BAE0FD]',
    text: 'text-[#0369A1]',
    bar: 'bg-[#60A5FA]',
  },
  mint: {
    bg: 'bg-[#EAFBF1]',
    border: 'border-[#BBF0D1]',
    text: 'text-[#15803D]',
    bar: 'bg-[#4ADE80]',
  },
  lavender: {
    bg: 'bg-[#F4EEFF]',
    border: 'border-[#DDD0FE]',
    text: 'text-[#6D28D9]',
    bar: 'bg-[#A78BFA]',
  },
  peach: {
    bg: 'bg-[#FFF2E8]',
    border: 'border-[#FED7B8]',
    text: 'text-[#C2410C]',
    bar: 'bg-[#FB923C]',
  },
  indigo: {
    bg: 'bg-[#EEF2FF]',
    border: 'border-[#C7D2FE]',
    text: 'text-[#4338CA]',
    bar: 'bg-[#6366F1]',
  },
  rose: {
    bg: 'bg-[#FFF0F3]',
    border: 'border-[#FECDD6]',
    text: 'text-[#BE123C]',
    bar: 'bg-[#FB7185]',
  },
};
