import { useCallback, useEffect, useState } from 'react';
import {
  COURSE_CATALOG,
  DEFAULT_NAV_ITEMS,
  DEFAULT_WIDGET_ORDER,
  DEPARTMENT_LABELS,
  getDefaultCourseIds,
  INITIAL_EXAMS,
  INITIAL_NURSING_ASSIGNMENTS,
  INITIAL_NURSING_SKILLS,
  INITIAL_PROFILE,
  INITIAL_STUDY_TASKS,
} from '../data/seedData';
import type {
  CourseItem,
  DepartmentId,
  ExamEvent,
  GradeLevel,
  LetterGrade,
  NursingAssignment,
  NursingSkillItem,
  StudentProfile,
  StudyTask,
  ToastItem,
  ViewId,
  WidgetId,
} from '../types/campus';
import { checkScheduleConflict, computeAttendanceMetrics, computeWeightedCourseScore, suggestLetterGrade } from '../utils/academicMath';

const STORAGE_KEY = 'campusmate_portal_state_v1';

interface PersistedState {
  profile: StudentProfile;
  enrolledCourses: CourseItem[];
  studyTasks: StudyTask[];
  exams: ExamEvent[];
  nursingAssignments: NursingAssignment[];
  nursingSkills: NursingSkillItem[];
  bookmarkedBookIds: string[];
  bookmarkedNoticeIds: string[];
  favoriteSpaceIds: string[];
  widgetOrder: WidgetId[];
  quickNavOrder: ViewId[];
}

function buildInitialCourses(dept: DepartmentId, grade: GradeLevel): CourseItem[] {
  const ids = getDefaultCourseIds(dept, grade);
  return COURSE_CATALOG.filter((c) => ids.includes(c.id)).map((c) => ({ ...c }));
}

function getDefaultPersistedState(): PersistedState {
  return {
    profile: INITIAL_PROFILE,
    enrolledCourses: buildInitialCourses(INITIAL_PROFILE.department, INITIAL_PROFILE.grade),
    studyTasks: INITIAL_STUDY_TASKS,
    exams: INITIAL_EXAMS,
    nursingAssignments: INITIAL_NURSING_ASSIGNMENTS,
    nursingSkills: INITIAL_NURSING_SKILLS,
    bookmarkedBookIds: ['bk-1'],
    bookmarkedNoticeIds: ['nt-1'],
    favoriteSpaceIds: ['sp-1', 'sp-3'],
    widgetOrder: DEFAULT_WIDGET_ORDER,
    quickNavOrder: DEFAULT_NAV_ITEMS.map((item) => item.id),
  };
}

function loadState(): PersistedState {
  const defaults = getDefaultPersistedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    // Validate widgetOrder and quickNavOrder to include any missing IDs safely
    const validWidgets = new Set<WidgetId>(DEFAULT_WIDGET_ORDER);
    const savedWidgets = Array.isArray(parsed.widgetOrder)
      ? parsed.widgetOrder.filter((id): id is WidgetId => validWidgets.has(id as WidgetId))
      : [];
    const mergedWidgets = [
      ...savedWidgets,
      ...DEFAULT_WIDGET_ORDER.filter((id) => !savedWidgets.includes(id)),
    ];

    const defaultNavIds = DEFAULT_NAV_ITEMS.map((n) => n.id);
    const validNavs = new Set<ViewId>(defaultNavIds);
    const savedNavs = Array.isArray(parsed.quickNavOrder)
      ? parsed.quickNavOrder.filter((id): id is ViewId => validNavs.has(id as ViewId))
      : [];
    const mergedNavs = [
      ...savedNavs,
      ...defaultNavIds.filter((id) => !savedNavs.includes(id)),
    ];

    return {
      profile: parsed.profile ?? defaults.profile,
      enrolledCourses: Array.isArray(parsed.enrolledCourses) ? parsed.enrolledCourses : defaults.enrolledCourses,
      studyTasks: Array.isArray(parsed.studyTasks) ? parsed.studyTasks : defaults.studyTasks,
      exams: Array.isArray(parsed.exams) ? parsed.exams : defaults.exams,
      nursingAssignments: Array.isArray(parsed.nursingAssignments) ? parsed.nursingAssignments : defaults.nursingAssignments,
      nursingSkills: Array.isArray(parsed.nursingSkills) ? parsed.nursingSkills : defaults.nursingSkills,
      bookmarkedBookIds: Array.isArray(parsed.bookmarkedBookIds) ? parsed.bookmarkedBookIds : defaults.bookmarkedBookIds,
      bookmarkedNoticeIds: Array.isArray(parsed.bookmarkedNoticeIds) ? parsed.bookmarkedNoticeIds : defaults.bookmarkedNoticeIds,
      favoriteSpaceIds: Array.isArray(parsed.favoriteSpaceIds) ? parsed.favoriteSpaceIds : defaults.favoriteSpaceIds,
      widgetOrder: mergedWidgets,
      quickNavOrder: mergedNavs,
    };
  } catch {
    return defaults;
  }
}

export function useCampusStore() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [activeView, setActiveView] = useState<ViewId>('home');
  const [subTab, setSubTab] = useState<string | undefined>(undefined);
  const [focusedBuildingId, setFocusedBuildingId] = useState<string | undefined>(undefined);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in restricted sandboxes
    }
  }, [state]);

  const pushToast = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const navigateTo = useCallback((view: ViewId, nextSubTab?: string, buildingId?: string) => {
    setActiveView(view);
    setSubTab(nextSubTab);
    if (buildingId) setFocusedBuildingId(buildingId);
  }, []);

  const updateDepartmentAndGrade = useCallback(
    (department: DepartmentId, grade: GradeLevel, loadRecommendedTimetable = true) => {
      setState((prev) => ({
        ...prev,
        profile: { ...prev.profile, department, grade },
        enrolledCourses: loadRecommendedTimetable
          ? buildInitialCourses(department, grade)
          : prev.enrolledCourses,
      }));
      pushToast(
        `${DEPARTMENT_LABELS[department]} ${grade}학년 기준으로 설정되었습니다.`,
        'success'
      );
    },
    [pushToast]
  );

  const updateTargetGpa = useCallback((targetGpa: number) => {
    const clamped = Math.min(4.5, Math.max(1.0, Number(targetGpa.toFixed(2))));
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, targetGpa: clamped },
    }));
  }, []);

  const addCourseToTimetable = useCallback(
    (course: CourseItem) => {
      let added = false;
      setState((prev) => {
        const conflict = checkScheduleConflict(course, prev.enrolledCourses);
        if (conflict.hasConflict) {
          pushToast(`시간표 충돌: ${conflict.conflictWith} 과목과 시간이 겹칩니다.`, 'warning');
          return prev;
        }
        added = true;
        return {
          ...prev,
          enrolledCourses: [...prev.enrolledCourses, { ...course }],
        };
      });
      if (added) {
        pushToast(`"${course.title}" 강의가 내 시간표에 추가되었습니다.`, 'success');
      }
    },
    [pushToast]
  );

  const removeCourseFromTimetable = useCallback(
    (courseId: string) => {
      setState((prev) => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.filter((c) => c.id !== courseId),
      }));
      pushToast('강의가 시간표에서 제거되었습니다.', 'info');
    },
    [pushToast]
  );

  const updateCourseAttendance = useCallback(
    (courseId: string, field: 'attendedCount' | 'lateCount' | 'absentCount', delta: 1 | -1) => {
      setState((prev) => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.map((c) => {
          if (c.id !== courseId) return c;
          const nextVal = Math.max(0, c[field] + delta);
          const updated: CourseItem = { ...c, [field]: nextVal };
          const metrics = computeAttendanceMetrics(updated);
          if (delta > 0 && metrics.status === 'F 위험 경고') {
            pushToast(`출석 경고: "${c.title}" 결석 허용 횟수를 초과했거나 0회 남았습니다.`, 'warning');
          }
          return updated;
        }),
      }));
    },
    [pushToast]
  );

  const updateCourseWeek = useCallback((courseId: string, currentWeek: number) => {
    setState((prev) => ({
      ...prev,
      enrolledCourses: prev.enrolledCourses.map((c) =>
        c.id === courseId ? { ...c, currentWeek: Math.min(c.totalWeeks, Math.max(1, currentWeek)) } : c
      ),
    }));
  }, []);

  const updateCourseScoresAndGrade = useCallback(
    (
      courseId: string,
      patch: Partial<Pick<CourseItem, 'midtermScore' | 'finalScore' | 'assignmentScore' | 'expectedGrade'>>,
      autoSuggest = false
    ) => {
      setState((prev) => ({
        ...prev,
        enrolledCourses: prev.enrolledCourses.map((c) => {
          if (c.id !== courseId) return c;
          const updated = { ...c, ...patch };
          if (autoSuggest) {
            const metrics = computeAttendanceMetrics(updated);
            const weighted = computeWeightedCourseScore(updated);
            updated.expectedGrade = suggestLetterGrade(weighted, metrics.isOverLimit);
          }
          return updated;
        }),
      }));
    },
    []
  );

  // Study Tasks
  const addStudyTask = useCallback(
    (task: Omit<StudyTask, 'id' | 'completed'>) => {
      const newTask: StudyTask = {
        ...task,
        id: `task-${Date.now()}`,
        completed: false,
      };
      setState((prev) => ({ ...prev, studyTasks: [newTask, ...prev.studyTasks] }));
      pushToast('학습 계획이 추가되었습니다.', 'success');
    },
    [pushToast]
  );

  const toggleStudyTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      studyTasks: prev.studyTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  }, []);

  const deleteStudyTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      studyTasks: prev.studyTasks.filter((t) => t.id !== taskId),
    }));
  }, []);

  // Exam Events
  const addExamEvent = useCallback(
    (exam: Omit<ExamEvent, 'id'>) => {
      const newExam: ExamEvent = { ...exam, id: `exam-${Date.now()}` };
      setState((prev) => ({ ...prev, exams: [...prev.exams, newExam] }));
      pushToast('시험 D-Day가 등록되었습니다.', 'success');
    },
    [pushToast]
  );

  const deleteExamEvent = useCallback((examId: string) => {
    setState((prev) => ({ ...prev, exams: prev.exams.filter((e) => e.id !== examId) }));
  }, []);

  // Nursing Assignments & Skills
  const addNursingAssignment = useCallback(
    (assignment: Omit<NursingAssignment, 'id' | 'status'>) => {
      const next: NursingAssignment = {
        ...assignment,
        id: `na-${Date.now()}`,
        status: '진행 전',
      };
      setState((prev) => ({
        ...prev,
        nursingAssignments: [next, ...prev.nursingAssignments],
      }));
      pushToast('간호학과 과제 항목이 추가되었습니다.', 'success');
    },
    [pushToast]
  );

  const cycleNursingAssignmentStatus = useCallback((id: string) => {
    const order: NursingAssignment['status'][] = ['진행 전', '작성 중', '제출 완료'];
    setState((prev) => ({
      ...prev,
      nursingAssignments: prev.nursingAssignments.map((item) => {
        if (item.id !== id) return item;
        const idx = order.indexOf(item.status);
        return { ...item, status: order[(idx + 1) % order.length] };
      }),
    }));
  }, []);

  const deleteNursingAssignment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nursingAssignments: prev.nursingAssignments.filter((item) => item.id !== id),
    }));
  }, []);

  const cycleNursingSkillMastery = useCallback((id: string) => {
    const order: NursingSkillItem['mastery'][] = ['미실습', '연습중', '통과'];
    setState((prev) => ({
      ...prev,
      nursingSkills: prev.nursingSkills.map((sk) => {
        if (sk.id !== id) return sk;
        const idx = order.indexOf(sk.mastery);
        return { ...sk, mastery: order[(idx + 1) % order.length] };
      }),
    }));
  }, []);

  // Bookmarks
  const toggleBookBookmark = useCallback((bookId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedBookIds.includes(bookId);
      return {
        ...prev,
        bookmarkedBookIds: exists
          ? prev.bookmarkedBookIds.filter((id) => id !== bookId)
          : [...prev.bookmarkedBookIds, bookId],
      };
    });
  }, []);

  const toggleNoticeBookmark = useCallback((noticeId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedNoticeIds.includes(noticeId);
      return {
        ...prev,
        bookmarkedNoticeIds: exists
          ? prev.bookmarkedNoticeIds.filter((id) => id !== noticeId)
          : [...prev.bookmarkedNoticeIds, noticeId],
      };
    });
  }, []);

  const toggleSpaceFavorite = useCallback((spaceId: string) => {
    setState((prev) => {
      const exists = prev.favoriteSpaceIds.includes(spaceId);
      return {
        ...prev,
        favoriteSpaceIds: exists
          ? prev.favoriteSpaceIds.filter((id) => id !== spaceId)
          : [...prev.favoriteSpaceIds, spaceId],
      };
    });
  }, []);

  // Drag & Drop Reorder Actions
  const reorderWidgets = useCallback((draggedId: WidgetId, targetId: WidgetId) => {
    if (draggedId === targetId) return;
    setState((prev) => {
      const next = [...prev.widgetOrder];
      const fromIndex = next.indexOf(draggedId);
      const toIndex = next.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggedId);
      return { ...prev, widgetOrder: next };
    });
  }, []);

  const moveWidgetByOffset = useCallback((widgetId: WidgetId, offset: -1 | 1) => {
    setState((prev) => {
      const next = [...prev.widgetOrder];
      const idx = next.indexOf(widgetId);
      const targetIdx = idx + offset;
      if (idx === -1 || targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return { ...prev, widgetOrder: next };
    });
  }, []);

  const reorderQuickNav = useCallback((draggedId: ViewId, targetId: ViewId) => {
    if (draggedId === targetId) return;
    setState((prev) => {
      const next = [...prev.quickNavOrder];
      const fromIndex = next.indexOf(draggedId);
      const toIndex = next.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggedId);
      return { ...prev, quickNavOrder: next };
    });
  }, []);

  const resetLayoutOrder = useCallback(() => {
    setState((prev) => ({
      ...prev,
      widgetOrder: DEFAULT_WIDGET_ORDER,
      quickNavOrder: DEFAULT_NAV_ITEMS.map((n) => n.id),
    }));
    pushToast('화면 위젯과 메뉴 배치가 기본 순서로 복원되었습니다.', 'info');
  }, [pushToast]);

  const resetAllData = useCallback(() => {
    const fresh = getDefaultPersistedState();
    setState(fresh);
    pushToast('초기 샘플 데이터로 복원되었습니다.', 'info');
  }, [pushToast]);

  return {
    state,
    activeView,
    subTab,
    focusedBuildingId,
    setFocusedBuildingId,
    toasts,
    pushToast,
    navigateTo,
    updateDepartmentAndGrade,
    updateTargetGpa,
    addCourseToTimetable,
    removeCourseFromTimetable,
    updateCourseAttendance,
    updateCourseWeek,
    updateCourseScoresAndGrade,
    addStudyTask,
    toggleStudyTask,
    deleteStudyTask,
    addExamEvent,
    deleteExamEvent,
    addNursingAssignment,
    cycleNursingAssignmentStatus,
    deleteNursingAssignment,
    cycleNursingSkillMastery,
    toggleBookBookmark,
    toggleNoticeBookmark,
    toggleSpaceFavorite,
    reorderWidgets,
    moveWidgetByOffset,
    reorderQuickNav,
    resetLayoutOrder,
    resetAllData,
  };
}

export type CampusStore = ReturnType<typeof useCampusStore>;
