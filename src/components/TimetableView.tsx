import React, { useMemo, useState } from 'react';
import { AlertCircle, Check, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { COURSE_CATALOG, DEPARTMENT_LABELS } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { DayOfWeek, DepartmentId, GradeLevel } from '../types/campus';
import { checkScheduleConflict, PASTEL_TONE_CLASSES } from '../utils/academicMath';

interface TimetableViewProps {
  store: CampusStore;
}

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

export const TimetableView: React.FC<TimetableViewProps> = ({ store }) => {
  const { state, addCourseToTimetable, removeCourseFromTimetable, updateDepartmentAndGrade } = store;

  const [deptFilter, setDeptFilter] = useState<DepartmentId | 'all' | 'common'>(state.profile.department);
  const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>(state.profile.grade);
  const [query, setQuery] = useState('');

  const totalCredits = useMemo(
    () => state.enrolledCourses.reduce((sum, c) => sum + c.credits, 0),
    [state.enrolledCourses]
  );

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COURSE_CATALOG.filter((c) => {
      if (deptFilter !== 'all' && c.department !== deptFilter) return false;
      if (gradeFilter !== 'all' && c.recommendedGrade !== gradeFilter) return false;
      if (q) {
        return (
          c.title.toLowerCase().includes(q) ||
          c.professor.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [deptFilter, gradeFilter, query]);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#0369A1]">매일 확인 · 학과 및 학년별 시간표</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
            {DEPARTMENT_LABELS[state.profile.department]} {state.profile.grade}학년 시간표
          </h2>
          <p className="text-xs text-[#64748B] mt-1 font-mono-num">
            수강 {state.enrolledCourses.length}과목 · 총 {totalCredits}학점
          </p>
        </div>

        <button
          type="button"
          onClick={() => updateDepartmentAndGrade(state.profile.department, state.profile.grade, true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#0369A1] bg-[#EBF6FF] hover:bg-[#DBEAFE] border border-[#BAE0FD] rounded-xl transition-colors whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          표준 추천 시간표 불러오기
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Weekly Grid */}
        <div className="xl:col-span-7 bg-white border border-[#E6EAF2] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Day Header */}
              <div className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))] border-b border-[#E6EAF2] bg-[#FAFBFD]">
                <div className="py-3 text-center text-xs font-medium text-[#64748B]">교시</div>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className={`py-3 text-center text-xs font-semibold border-l border-[#E6EAF2] ${
                      day === '목' ? 'text-[#4F46E5] bg-[#EEF2FF]/50' : 'text-[#1E293B]'
                    }`}
                  >
                    {day}요일
                  </div>
                ))}
              </div>

              {/* Hour Rows */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))] border-b border-[#F1F5F9] last:border-b-0 h-16"
                  >
                    <div className="px-2 py-2 text-right text-xs font-mono-num text-[#64748B] bg-[#FAFBFD] border-r border-[#E6EAF2]">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    {DAYS.map((day) => {
                      const startingCourses = state.enrolledCourses.filter((c) =>
                        c.slots.some((s) => s.day === day && s.startHour === hour)
                      );
                      return (
                        <div key={`${day}-${hour}`} className="relative border-l border-[#F1F5F9] p-1">
                          {startingCourses.map((course) => {
                            const slot = course.slots.find((s) => s.day === day && s.startHour === hour)!;
                            const tone = PASTEL_TONE_CLASSES[course.pastelTone];
                            const heightPx = slot.duration * 64 - 8;
                            return (
                              <div
                                key={`${course.id}-${day}-${hour}`}
                                style={{ height: `${heightPx}px` }}
                                className={`absolute inset-x-1 top-1 z-10 rounded-xl border p-2 flex flex-col justify-between overflow-hidden ${tone.bg} ${tone.border}`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className={`text-xs font-bold leading-tight line-clamp-2 ${tone.text}`}>
                                    {course.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeCourseFromTimetable(course.id)}
                                    aria-label={`${course.title} 제거`}
                                    className="p-0.5 rounded text-[#64748B] hover:text-[#BE123C] hover:bg-white/70 shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-[11px] text-[#475569] truncate">
                                  {course.room}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Course Catalog & Conflict Checker */}
        <div className="xl:col-span-5 bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">강의 카탈로그 · 시간표 추가</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              학과·학년별 개설 강의를 검색해 담을 수 있으며 시간 중복 시 자동 안내됩니다.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="강의명, 교수명, 학수번호 검색..."
                className="w-full h-9 pl-9 pr-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value as DepartmentId | 'all' | 'common')}
                aria-label="학과 필터"
                className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] outline-none"
              >
                <option value="all">전체 학과</option>
                <option value="nursing">간호학과</option>
                <option value="cs">컴퓨터공학과</option>
                <option value="business">경영학과</option>
                <option value="psychology">심리학과</option>
                <option value="common">공통 교양</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) =>
                  setGradeFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GradeLevel))
                }
                aria-label="학년 필터"
                className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] outline-none"
              >
                <option value="all">전체 학년</option>
                <option value={1}>1학년 추천</option>
                <option value={2}>2학년 추천</option>
                <option value={3}>3학년 추천</option>
                <option value={4}>4학년 추천</option>
              </select>
            </div>
          </div>

          {/* Catalog List */}
          <div className="divide-y divide-[#F1F5F9] max-h-[460px] overflow-y-auto pr-1">
            {filteredCatalog.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">
                조건에 맞는 강의가 없습니다. 필터를 조정해 보세요.
              </div>
            ) : (
              filteredCatalog.map((course) => {
                const isEnrolled = state.enrolledCourses.some((e) => e.id === course.id);
                const conflict = isEnrolled
                  ? { hasConflict: false }
                  : checkScheduleConflict(course, state.enrolledCourses);

                return (
                  <div key={course.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-[#64748B] font-mono-num">
                        {course.code} · {course.category} · {course.credits}학점
                      </div>
                      <div className="text-sm font-semibold text-[#1E293B] mt-0.5 truncate">
                        {course.title}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {course.professor} · {course.room}
                      </div>
                      <div className="text-xs text-[#475569] mt-0.5 font-mono-num">
                        {course.slots
                          .map((s) => `${s.day} ${s.startHour}:00–${s.startHour + s.duration}:00`)
                          .join(' / ')}
                      </div>
                      {conflict.hasConflict && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#BE123C]">
                          <AlertCircle className="w-3 h-3" />
                          <span>시간 충돌: {conflict.conflictWith}</span>
                        </div>
                      )}
                    </div>

                    {isEnrolled ? (
                      <button
                        type="button"
                        onClick={() => removeCourseFromTimetable(course.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#15803D] bg-[#EAFBF1] border border-[#BBF0D1] rounded-xl inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        <Check className="w-3.5 h-3.5" />
                        담김
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addCourseToTimetable(course)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-xl inline-flex items-center gap-1 shrink-0 whitespace-nowrap border transition-colors ${
                          conflict.hasConflict
                            ? 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]'
                            : 'text-[#4338CA] bg-[#EEF2FF] hover:bg-[#E0E7FF] border-[#C7D2FE]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        담기
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
