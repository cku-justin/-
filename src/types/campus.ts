export type DepartmentId = 'nursing' | 'cs' | 'business' | 'psychology';

export type GradeLevel = 1 | 2 | 3 | 4;

export type CategoryId = 'daily' | 'academic' | 'campus' | 'life';

export type ViewId =
  | 'home'
  | 'timetable'
  | 'meals'
  | 'academic'
  | 'planner'
  | 'nursing'
  | 'library'
  | 'map'
  | 'spaces'
  | 'notices'
  | 'news';

export type WidgetId =
  | 'today-classes'
  | 'today-meals'
  | 'attendance-summary'
  | 'exam-planner-summary'
  | 'nursing-summary'
  | 'notices-news-summary'
  | 'library-spaces-summary';

export type DayOfWeek = '월' | '화' | '수' | '목' | '금';
export type FullDayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export type LetterGrade = 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F';

export interface StudentProfile {
  name: string;
  department: DepartmentId;
  grade: GradeLevel;
  semester: string;
  targetGpa: number;
}

export interface CourseScheduleSlot {
  day: DayOfWeek;
  startHour: number; // e.g., 9, 10, 13
  duration: number;  // in hours, e.g., 2
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  professor: string;
  room: string;
  credits: number;
  category: '전공필수' | '전공선택' | '교양필수' | '교양선택';
  department: DepartmentId | 'common';
  recommendedGrade: GradeLevel;
  pastelTone: 'sky' | 'mint' | 'lavender' | 'peach' | 'indigo' | 'rose';
  slots: CourseScheduleSlot[];
  totalWeeks: number;
  currentWeek: number;
  attendedCount: number;
  lateCount: number;
  absentCount: number;
  maxAbsentAllowed: number; // e.g., 4
  midtermScore: number; // 0-100
  finalScore: number;   // 0-100
  assignmentScore: number; // 0-100
  expectedGrade: LetterGrade;
}

export interface StudyTask {
  id: string;
  title: string;
  courseName: string;
  day: FullDayOfWeek;
  durationMin: number;
  completed: boolean;
}

export interface ExamEvent {
  id: string;
  title: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  examType: '중간고사' | '기말고사' | '퀴즈' | '실기평가';
}

export interface NursingAssignment {
  id: string;
  grade: GradeLevel;
  subject: string;
  title: string;
  type: '케이스 스터디' | '레포트' | '핵심술기 평가' | '팀 프로젝트';
  dueDate: string; // YYYY-MM-DD
  status: '진행 전' | '작성 중' | '제출 완료';
}

export interface NursingSkillItem {
  id: string;
  grade: GradeLevel;
  category: string;
  name: string;
  difficulty: '기본' | '중급' | '심화';
  mastery: '미실습' | '연습중' | '통과';
}

export interface MealCorner {
  cornerName: string;
  mealType: '조식' | '중식' | '석식';
  mainDish: string;
  sideDishes: string[];
  price: number;
  calories: number;
  allergens: string;
}

export interface WeeklyMealDay {
  day: DayOfWeek;
  dateLabel: string;
  meals: MealCorner[];
}

export interface LibraryFacility {
  id: string;
  name: string;
  floor: string;
  weekdayHours: string;
  weekendHours: string;
  openHour: number;
  closeHour: number; // 24 for 24h
  totalSeats: number;
  occupiedSeats: number;
  note: string;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: '간호·보건' | 'IT·공학' | '경영·경제' | '인문·교양';
  callNumber: string;
  location: string;
  available: boolean;
  dueDate?: string;
}

export interface CampusBuilding {
  id: string;
  code: string;
  name: string;
  category: '강의동' | '도서관·스터디' | '식당·푸드트럭' | '편의·복지';
  description: string;
  walkingMinutesFromGate: number;
  facilities: string[];
  x: number; // SVG 0-800 coordinate
  y: number; // SVG 0-480 coordinate
  width: number;
  height: number;
  pastelHex: string;
}

export interface StudySpace {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  hours: string;
  crowdLevel: '여유' | '보통' | '혼잡';
  noiseLevel: '매우 조용함' | '적당한 백색소음' | '대화 가능';
  hasOutlets: boolean;
  allowsGroup: boolean;
  is24Hours: boolean;
  seats: number;
  description: string;
}

export interface OfficialNotice {
  id: string;
  category: '학사' | '장학' | '취업·진로' | '일반';
  title: string;
  department: string;
  date: string;
  views: number;
  pinned?: boolean;
  summary: string;
  content: string;
}

export interface CampusNewsItem {
  id: string;
  category: '동아리 행사' | '푸드트럭' | '캠퍼스 이벤트';
  title: string;
  dateLabel: string;
  location: string;
  buildingId?: string;
  organizer: string;
  description: string;
}

export interface FeatureCommand {
  id: string;
  title: string;
  subtitle: string;
  categoryId: CategoryId;
  categoryLabel: string;
  viewId: ViewId;
  subTab?: string;
  keywords: string[];
}

export interface NavItemConfig {
  id: ViewId;
  label: string;
  categoryId: CategoryId;
  shortLabel: string;
}

export interface ToastItem {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'warning';
}
