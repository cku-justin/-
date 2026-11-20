import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  GripVertical,
  MapPin,
  Megaphone,
  RotateCcw,
  Utensils,
} from 'lucide-react';
import {
  CAMPUS_NEWS,
  CATEGORY_META,
  LIBRARY_FACILITIES,
  OFFICIAL_NOTICES,
  STUDY_SPACES,
  WEEKLY_MEALS,
  WIDGET_METADATA,
} from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { DayOfWeek, WidgetId } from '../types/campus';
import {
  calculateGpa,
  computeAttendanceMetrics,
  computeDDay,
  PASTEL_TONE_CLASSES,
} from '../utils/academicMath';

interface HomeBriefingProps {
  store: CampusStore;
}

const WEEKDAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];

export const HomeBriefing: React.FC<HomeBriefingProps> = ({ store }) => {
  const {
    state,
    navigateTo,
    updateCourseAttendance,
    toggleStudyTask,
    reorderWidgets,
    moveWidgetByOffset,
    resetLayoutOrder,
  } = store;

  // Default preview day is 목요일 (matches metadata current date 2026-11-19 Thu)
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('목');
  const [layoutEditMode, setLayoutEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);
  const [dragOverWidget, setDragOverWidget] = useState<WidgetId | null>(null);

  const todayClasses = state.enrolledCourses
    .filter((c) => c.slots.some((s) => s.day === selectedDay))
    .map((c) => ({
      course: c,
      slot: c.slots.find((s) => s.day === selectedDay)!,
    }))
    .sort((a, b) => a.slot.startHour - b.slot.startHour);

  const todayMeals = WEEKLY_MEALS.find((m) => m.day === selectedDay)?.meals ?? [];

  const attendanceAlerts = state.enrolledCourses
    .map((c) => ({ course: c, metrics: computeAttendanceMetrics(c) }))
    .filter((item) => item.metrics.status !== '정상');

  const { gpa } = calculateGpa(state.enrolledCourses);

  const upcomingExams = [...state.exams]
    .map((e) => ({ exam: e, dday: computeDDay(e.date) }))
    .sort((a, b) => a.dday.daysLeft - b.dday.daysLeft)
    .slice(0, 3);

  const pendingTasks = state.studyTasks.filter((t) => !t.completed).slice(0, 4);

  const gradeAssignments = state.nursingAssignments.filter(
    (a) => a.grade === state.profile.grade
  );
  const activeNursingAssignments = gradeAssignments.filter((a) => a.status !== '제출 완료').slice(0, 3);
  const masteredSkillsCount = state.nursingSkills.filter((s) => s.mastery === '통과').length;

  const renderWidgetBody = (widgetId: WidgetId) => {
    switch (widgetId) {
      case 'today-classes':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E6EAF2]">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      selectedDay === d
                        ? 'bg-white text-[#1E293B] shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[#64748B] font-mono-num">
                {todayClasses.length}개 강의
              </span>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#64748B]">
                {selectedDay}요일은 공강일입니다. 스터디 공간이나 도서관을 활용해 보세요.
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {todayClasses.map(({ course, slot }) => {
                  const tone = PASTEL_TONE_CLASSES[course.pastelTone];
                  return (
                    <div
                      key={`${course.id}-${slot.startHour}`}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono-num font-medium shrink-0 ${tone.bg} ${tone.border} ${tone.text}`}
                        >
                          {String(slot.startHour).padStart(2, '0')}:00–
                          {String(slot.startHour + slot.duration).padStart(2, '0')}:00
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1E293B] truncate">
                            {course.title}
                          </div>
                          <div className="text-xs text-[#64748B] truncate">
                            {course.room} · {course.professor}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#64748B] shrink-0 font-mono-num">
                        {course.credits}학점
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'today-meals':
        return (
          <div className="divide-y divide-[#F1F5F9]">
            {todayMeals.slice(0, 3).map((meal, idx) => (
              <div key={`${meal.cornerName}-${idx}`} className="py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[#64748B]">
                    {meal.mealType} · {meal.cornerName}
                  </div>
                  <div className="text-sm font-semibold text-[#1E293B] mt-0.5 truncate">
                    {meal.mainDish}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5 truncate">
                    {meal.sideDishes.join(', ')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold font-mono-num text-[#1E293B]">
                    {meal.price.toLocaleString()}원
                  </div>
                  <div className="text-xs font-mono-num text-[#64748B]">{meal.calories} kcal</div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'attendance-summary':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#64748B] pb-2 border-b border-[#F1F5F9]">
              <span>
                현재 예상 평점 <strong className="text-[#1E293B] font-mono-num">{gpa.toFixed(2)}</strong> /{' '}
                목표 <strong className="text-[#4F46E5] font-mono-num">{state.profile.targetGpa.toFixed(2)}</strong>
              </span>
              <span
                className={`font-medium ${
                  attendanceAlerts.length > 0 ? 'text-[#B45309]' : 'text-[#15803D]'
                }`}
              >
                {attendanceAlerts.length > 0
                  ? `출석 주의 ${attendanceAlerts.length}과목`
                  : '전 과목 출석 양호'}
              </span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {state.enrolledCourses.slice(0, 3).map((course) => {
                const metrics = computeAttendanceMetrics(course);
                return (
                  <div key={course.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1E293B] truncate">
                          {course.title}
                        </span>
                        {metrics.status !== '정상' && (
                          <span
                            className={`text-[11px] font-medium whitespace-nowrap ${
                              metrics.status === 'F 위험 경고' ? 'text-[#BE123C]' : 'text-[#B45309]'
                            }`}
                          >
                            · {metrics.status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5 font-mono-num">
                        진행 {course.currentWeek}/{course.totalWeeks}주 · 결석환산 {metrics.convertedAbsent}회 ·
                        잔여 {metrics.remainingAllowed}회
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCourseAttendance(course.id, 'attendedCount', 1)}
                      className="px-2.5 py-1 text-xs font-medium text-[#15803D] bg-[#EAFBF1] hover:bg-[#DCFCE7] border border-[#BBF0D1] rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      + 출석
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'exam-planner-summary':
        return (
          <div className="space-y-3">
            {upcomingExams.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-2 border-b border-[#F1F5F9]">
                {upcomingExams.map(({ exam, dday }) => (
                  <div
                    key={exam.id}
                    className="px-3 py-2 rounded-xl bg-[#FAF8FF] border border-[#EAE2FE]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-bold font-mono-num ${
                          dday.isUrgent ? 'text-[#BE123C]' : 'text-[#6D28D9]'
                        }`}
                      >
                        {dday.label}
                      </span>
                      <span className="text-[11px] text-[#64748B]">{exam.examType}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#1E293B] mt-1 truncate">
                      {exam.courseName}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-[#64748B] py-3 text-center">
                  남은 학습 할 일을 모두 완료했습니다.
                </p>
              ) : (
                pendingTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleStudyTask(task.id)}
                    className="w-full text-left py-1.5 px-2 rounded-lg hover:bg-[#F8FAFC] flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-4 h-4 rounded border border-[#CBD5E1] flex items-center justify-center shrink-0">
                        {task.completed && <Check className="w-3 h-3 text-[#4F46E5]" />}
                      </span>
                      <span className="text-sm text-[#1E293B] truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-[#64748B] font-mono-num shrink-0">
                      {task.day} · {task.durationMin}분
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 'nursing-summary':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F1F5F9]">
              <span className="text-[#64748B]">
                핵심기본간호술 통과율{' '}
                <strong className="text-[#1E293B] font-mono-num">
                  {masteredSkillsCount}/{state.nursingSkills.length}개
                </strong>
              </span>
              <span className="text-[#BE123C] font-medium">
                {state.profile.grade}학년 미완료 과제 {activeNursingAssignments.length}건
              </span>
            </div>

            <div className="w-full h-2 bg-[#FFF0F3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FB7185] rounded-full transition-all"
                style={{
                  width: `${Math.round(
                    (masteredSkillsCount / Math.max(1, state.nursingSkills.length)) * 100
                  )}%`,
                }}
              />
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {(activeNursingAssignments.length > 0
                ? activeNursingAssignments
                : state.nursingAssignments.slice(0, 2)
              ).map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#1E293B] truncate">{item.title}</div>
                    <div className="text-xs text-[#64748B]">
                      {item.grade}학년 · {item.subject} · {item.type}
                    </div>
                  </div>
                  <span className="text-xs font-mono-num text-[#64748B] shrink-0">
                    ~{item.dueDate.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notices-news-summary':
        return (
          <div className="divide-y divide-[#F1F5F9]">
            {OFFICIAL_NOTICES.slice(0, 2).map((notice) => (
              <div key={notice.id} className="py-2">
                <div className="text-xs text-[#64748B]">
                  공지 · {notice.category} · {notice.date}
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('notices')}
                  className="text-sm font-medium text-[#1E293B] hover:text-[#4F46E5] text-left truncate block w-full mt-0.5"
                >
                  {notice.title}
                </button>
              </div>
            ))}
            {CAMPUS_NEWS.slice(0, 1).map((news) => (
              <div key={news.id} className="py-2">
                <div className="text-xs text-[#C2410C]">
                  교내 소식 · {news.category} · {news.location}
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('news')}
                  className="text-sm font-medium text-[#1E293B] hover:text-[#4F46E5] text-left truncate block w-full mt-0.5"
                >
                  {news.title}
                </button>
              </div>
            ))}
          </div>
        );

      case 'library-spaces-summary':
        return (
          <div className="space-y-3">
            <div className="divide-y divide-[#F1F5F9]">
              {LIBRARY_FACILITIES.slice(0, 2).map((fac) => {
                const remain = fac.totalSeats - fac.occupiedSeats;
                return (
                  <div key={fac.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#1E293B] truncate">{fac.name}</div>
                      <div className="text-xs text-[#64748B] font-mono-num">
                        {fac.weekdayHours} · {fac.floor}
                      </div>
                    </div>
                    <span className="text-xs font-mono-num font-medium text-[#15803D] shrink-0">
                      잔여 {remain}석
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
              <span>추천 스터디 공간: {STUDY_SPACES[0].name}</span>
              <button
                type="button"
                onClick={() => navigateTo('spaces')}
                className="text-[#4F46E5] font-medium hover:underline whitespace-nowrap"
              >
                공간 탐색
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Priorities Hero Summary Strip */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#64748B]">
            2026년 11월 19일 목요일 · {state.profile.semester}
          </div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-1 tracking-tight">
            {state.profile.name}님의 오늘 캠퍼스 브리핑
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 xl:gap-4">
          <button
            type="button"
            onClick={() => navigateTo('timetable')}
            className="text-left px-3.5 py-2.5 rounded-xl bg-[#EBF6FF]/70 hover:bg-[#EBF6FF] transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-[#0369A1]">
              <CalendarDays className="w-3.5 h-3.5" />
              오늘 강의
            </div>
            <div className="text-lg font-bold font-mono-num text-[#1E293B] mt-0.5">
              {todayClasses.length}과목
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('academic', 'attendance')}
            className={`text-left px-3.5 py-2.5 rounded-xl transition-colors ${
              attendanceAlerts.length > 0
                ? 'bg-[#FFF2E8]/80 hover:bg-[#FFF2E8]'
                : 'bg-[#EAFBF1]/70 hover:bg-[#EAFBF1]'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-xs ${
                attendanceAlerts.length > 0 ? 'text-[#C2410C]' : 'text-[#15803D]'
              }`}
            >
              {attendanceAlerts.length > 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              출석 주의
            </div>
            <div className="text-lg font-bold font-mono-num text-[#1E293B] mt-0.5">
              {attendanceAlerts.length}과목
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('planner')}
            className="text-left px-3.5 py-2.5 rounded-xl bg-[#F4EEFF]/70 hover:bg-[#F4EEFF] transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-[#6D28D9]">
              <Clock className="w-3.5 h-3.5" />
              가장 가까운 시험
            </div>
            <div className="text-lg font-bold font-mono-num text-[#1E293B] mt-0.5">
              {upcomingExams[0]?.dday.label ?? '일정 없음'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('meals')}
            className="text-left px-3.5 py-2.5 rounded-xl bg-[#FFF0F3]/70 hover:bg-[#FFF0F3] transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-[#BE123C]">
              <Utensils className="w-3.5 h-3.5" />
              오늘 중식
            </div>
            <div className="text-sm font-semibold text-[#1E293B] mt-1 truncate">
              {todayMeals.find((m) => m.mealType === '중식')?.mainDish ?? '식단 확인'}
            </div>
          </button>
        </div>
      </div>

      {/* Drag-and-Drop Customization Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <GripVertical className="w-4 h-4 text-[#94A3B8]" />
          <span>
            각 카드 상단 손잡이(<strong className="text-[#475569]">⋮⋮</strong>)를 드래그해 내가 자주 보는 순서대로 위젯 위치를 바꿀 수 있습니다.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLayoutEditMode((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
              layoutEditMode
                ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
                : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {layoutEditMode ? '배치 편집 완료' : '위치 버튼으로 이동'}
          </button>
          <button
            type="button"
            onClick={resetLayoutOrder}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#1E293B] bg-white border border-[#E2E8F0] rounded-xl transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            기본 순서
          </button>
        </div>
      </div>

      {/* Draggable Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {state.widgetOrder.map((widgetId, index) => {
          const meta = WIDGET_METADATA[widgetId];
          const catMeta = CATEGORY_META[meta.categoryId];
          const isBeingDragged = draggedWidget === widgetId;
          const isDropTarget = dragOverWidget === widgetId && draggedWidget !== widgetId;

          return (
            <section
              key={widgetId}
              draggable
              onDragStart={(e) => {
                setDraggedWidget(widgetId);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', widgetId);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverWidget !== widgetId) setDragOverWidget(widgetId);
              }}
              onDragLeave={() => {
                if (dragOverWidget === widgetId) setDragOverWidget(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = (e.dataTransfer.getData('text/plain') as WidgetId) || draggedWidget;
                if (dropped && dropped !== widgetId) {
                  reorderWidgets(dropped, widgetId);
                }
                setDraggedWidget(null);
                setDragOverWidget(null);
              }}
              onDragEnd={() => {
                setDraggedWidget(null);
                setDragOverWidget(null);
              }}
              className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col ${
                isDropTarget
                  ? 'border-[#5B7CFA] ring-2 ring-[#EEF2FF] border-dashed'
                  : 'border-[#E6EAF2]'
              } ${isBeingDragged ? 'opacity-50 scale-[0.99]' : ''}`}
            >
              {/* Pastel Widget Header with Drag Handle */}
              <div
                className={`px-5 py-3.5 border-b border-[#E6EAF2] flex items-center justify-between gap-3 ${meta.pastelHeaderBg}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="p-1 -ml-1 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-white/70 cursor-grab active:cursor-grabbing shrink-0"
                    title="드래그하여 위젯 위치 변경"
                  >
                    <GripVertical className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-[#64748B]">{catMeta.label}</div>
                    <h3 className="text-sm font-bold text-[#1E293B] truncate">{meta.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {layoutEditMode && (
                    <div className="flex items-center gap-1 mr-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveWidgetByOffset(widgetId, -1)}
                        aria-label={`${meta.title} 앞으로 이동`}
                        className="p-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[#475569] hover:text-[#1E293B] disabled:opacity-35"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === state.widgetOrder.length - 1}
                        onClick={() => moveWidgetByOffset(widgetId, 1)}
                        aria-label={`${meta.title} 뒤로 이동`}
                        className="p-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[#475569] hover:text-[#1E293B] disabled:opacity-35"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateTo(meta.targetView)}
                    className="px-2.5 py-1 text-xs font-medium text-[#475569] hover:text-[#1E293B] bg-white/80 hover:bg-white border border-[#E2E8F0]/80 rounded-lg transition-colors whitespace-nowrap"
                  >
                    자세히
                  </button>
                </div>
              </div>

              {/* Widget Content */}
              <div className="p-5 flex-1">{renderWidgetBody(widgetId)}</div>
            </section>
          );
        })}
      </div>

      {/* Subtle Campus Map & Notice Footer Shortcut */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-[#475569]">
          <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>강의실 건물 위치나 주변 스터디 카페, 푸드트럭 광장이 궁금하다면 캠퍼스 지도를 바로 확인해 보세요.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateTo('map')}
            className="px-3 py-1.5 text-xs font-medium text-[#15803D] bg-[#EAFBF1] hover:bg-[#DCFCE7] border border-[#BBF0D1] rounded-xl transition-colors whitespace-nowrap"
          >
            캠퍼스 지도 열기
          </button>
          <button
            type="button"
            onClick={() => navigateTo('notices')}
            className="px-3 py-1.5 text-xs font-medium text-[#475569] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors whitespace-nowrap inline-flex items-center gap-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            공식 공지 보기
          </button>
        </div>
      </div>
    </div>
  );
};
