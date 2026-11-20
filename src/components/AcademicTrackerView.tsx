import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calculator, CheckCircle2, Minus, Plus, ShieldAlert } from 'lucide-react';
import type { CampusStore } from '../hooks/useCampusStore';
import type { LetterGrade } from '../types/campus';
import {
  calculateGpa,
  computeAttendanceMetrics,
  computeWeightedCourseScore,
  GRADE_POINTS,
  LETTER_GRADES,
} from '../utils/academicMath';

interface AcademicTrackerViewProps {
  store: CampusStore;
}

export const AcademicTrackerView: React.FC<AcademicTrackerViewProps> = ({ store }) => {
  const {
    state,
    subTab,
    updateCourseAttendance,
    updateCourseWeek,
    updateCourseScoresAndGrade,
    updateTargetGpa,
    navigateTo,
  } = store;

  const [tab, setTab] = useState<'attendance' | 'gpa'>(
    subTab === 'gpa' ? 'gpa' : 'attendance'
  );

  useEffect(() => {
    if (subTab === 'gpa' || subTab === 'attendance') {
      setTab(subTab);
    }
  }, [subTab]);

  const { gpa, totalCredits } = calculateGpa(state.enrolledCourses);
  const gpaGap = Number((gpa - state.profile.targetGpa).toFixed(2));

  const alertCourses = state.enrolledCourses
    .map((c) => ({ course: c, metrics: computeAttendanceMetrics(c) }))
    .filter((item) => item.metrics.status !== '정상');

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6D28D9]">학습 · 성적 관리</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
            출석 경고 · 수업 진행도 · 목표 학점 시뮬레이터
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            지각 3회는 결석 1회로 환산되며, 허용 결석 횟수 초과 시 성적과 무관하게 F 처리됩니다.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTab('attendance')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'attendance'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            출석 · 수업 진행도
          </button>
          <button
            type="button"
            onClick={() => setTab('gpa')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'gpa'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            목표 학점 · 성적 시뮬레이터
          </button>
        </div>
      </div>

      {/* Attendance Warning Banner */}
      {alertCourses.length > 0 && (
        <div className="bg-[#FFF5F5] border border-[#FECDD6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#BE123C] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-[#9F1239]">
                출석 경고 알림 ({alertCourses.length}개 과목)
              </div>
              <p className="text-xs text-[#BE123C] mt-0.5">
                {alertCourses
                  .map(
                    ({ course, metrics }) =>
                      `${course.title}(${metrics.status} · 남은 허용 결석 ${metrics.remainingAllowed}회)`
                  )
                  .join(' / ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {state.enrolledCourses.length === 0 ? (
        <div className="bg-white border border-[#E6EAF2] rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-[#1E293B]">현재 시간표에 담긴 강의가 없습니다.</p>
          <button
            type="button"
            onClick={() => navigateTo('timetable')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#5B7CFA] hover:bg-[#4F46E5] rounded-xl transition-colors"
          >
            시간표에서 강의 담기
          </button>
        </div>
      ) : tab === 'attendance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {state.enrolledCourses.map((course) => {
            const metrics = computeAttendanceMetrics(course);
            const statusStyle =
              metrics.status === 'F 위험 경고'
                ? 'bg-[#FFE4E6] text-[#BE123C]'
                : metrics.status === '출석 주의'
                ? 'bg-[#FEF3C7] text-[#B45309]'
                : 'bg-[#DCFCE7] text-[#15803D]';

            return (
              <section
                key={course.id}
                className="bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#64748B] font-mono-num">
                      {course.code} · {course.credits}학점 · {course.professor}
                    </div>
                    <h3 className="text-base font-bold text-[#1E293B] mt-0.5 truncate">
                      {course.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shrink-0 ${statusStyle}`}
                  >
                    {metrics.status === '정상' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {metrics.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-[#475569] mb-1.5">
                    <span>수업 진행도</span>
                    <div className="flex items-center gap-2 font-mono-num">
                      <button
                        type="button"
                        onClick={() => updateCourseWeek(course.id, course.currentWeek - 1)}
                        aria-label="진행 주차 감소"
                        className="p-0.5 rounded border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span>
                        {course.currentWeek} / {course.totalWeeks}주 ({metrics.progressPercent}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCourseWeek(course.id, course.currentWeek + 1)}
                        aria-label="진행 주차 증가"
                        className="p-0.5 rounded border border-[#E2E8F0] hover:bg-[#F8FAFC]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7C93FA] rounded-full transition-all"
                      style={{ width: `${metrics.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Attendance Counters */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#F1F5F9]">
                  {(
                    [
                      { key: 'attendedCount', label: '출석', bg: 'bg-[#EAFBF1]', text: 'text-[#15803D]' },
                      { key: 'lateCount', label: '지각', bg: 'bg-[#FFFBEB]', text: 'text-[#B45309]' },
                      { key: 'absentCount', label: '결석', bg: 'bg-[#FFF0F3]', text: 'text-[#BE123C]' },
                    ] as const
                  ).map((item) => (
                    <div key={item.key} className={`rounded-xl p-2.5 ${item.bg}`}>
                      <div className={`text-xs font-medium ${item.text}`}>{item.label}</div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-base font-bold font-mono-num text-[#1E293B]">
                          {course[item.key]}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateCourseAttendance(course.id, item.key, -1)}
                            aria-label={`${course.title} ${item.label} 감소`}
                            className="w-6 h-6 rounded-md bg-white/80 hover:bg-white text-[#475569] flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCourseAttendance(course.id, item.key, 1)}
                            aria-label={`${course.title} ${item.label} 증가`}
                            className="w-6 h-6 rounded-md bg-white/80 hover:bg-white text-[#1E293B] font-semibold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#64748B] flex items-center justify-between font-mono-num pt-1">
                  <span>환산 결석: {metrics.convertedAbsent}회 / 한도 {course.maxAbsentAllowed}회</span>
                  <span className={metrics.remainingAllowed <= 1 ? 'text-[#BE123C] font-semibold' : ''}>
                    남은 결석 허용: {metrics.remainingAllowed}회
                  </span>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Target GPA Calculator & Simulator */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5">
              <div className="text-xs text-[#64748B]">현재 예상 평점 (4.5 만점)</div>
              <div className="text-3xl font-bold font-mono-num text-[#4F46E5] mt-1">
                {gpa.toFixed(2)}
              </div>
              <div className="text-xs text-[#64748B] mt-1 font-mono-num">
                총 {totalCredits}학점 수강 기준
              </div>
            </div>

            <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5">
              <label htmlFor="target-gpa-input" className="text-xs text-[#64748B] block">
                목표 평점 설정
              </label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="target-gpa-input"
                  type="number"
                  min={1.0}
                  max={4.5}
                  step={0.05}
                  value={state.profile.targetGpa}
                  onChange={(e) => updateTargetGpa(Number(e.target.value))}
                  className="w-24 px-3 py-1.5 text-xl font-bold font-mono-num text-[#1E293B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
                />
                <span className="text-sm text-[#64748B] font-mono-num">/ 4.50</span>
              </div>
            </div>

            <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5">
              <div className="text-xs text-[#64748B]">목표 달성 분석</div>
              <div
                className={`text-2xl font-bold font-mono-num mt-1 ${
                  gpaGap >= 0 ? 'text-[#15803D]' : 'text-[#C2410C]'
                }`}
              >
                {gpaGap >= 0 ? `+${gpaGap.toFixed(2)} 목표 달성` : `${gpaGap.toFixed(2)} 부족`}
              </div>
              <div className="text-xs text-[#64748B] mt-1">
                아래 과목별 점수와 예상 등급을 조절해 보세요.
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6EAF2] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#E6EAF2] bg-[#FAFBFD] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                <Calculator className="w-4 h-4 text-[#5B7CFA]" />
                과목별 성적 시뮬레이션
              </div>
              <span className="text-xs text-[#64748B]">중간 35% · 기말 35% · 과제 20% · 출석 10%</span>
            </div>

            <div className="divide-y divide-[#F1F5F9]">
              {state.enrolledCourses.map((course) => {
                const weighted = computeWeightedCourseScore(course);
                return (
                  <div
                    key={course.id}
                    className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    <div className="lg:col-span-4 min-w-0">
                      <div className="text-xs text-[#64748B] font-mono-num">
                        {course.credits}학점 · 환산 {weighted}점
                      </div>
                      <div className="text-sm font-bold text-[#1E293B] truncate mt-0.5">
                        {course.title}
                      </div>
                    </div>

                    <div className="lg:col-span-5 grid grid-cols-3 gap-2">
                      {(
                        [
                          { field: 'midtermScore', label: '중간' },
                          { field: 'finalScore', label: '기말' },
                          { field: 'assignmentScore', label: '과제' },
                        ] as const
                      ).map((item) => (
                        <label key={item.field} className="block">
                          <span className="text-[11px] text-[#64748B] block mb-1">{item.label}</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={course[item.field]}
                            onChange={(e) =>
                              updateCourseScoresAndGrade(
                                course.id,
                                { [item.field]: Math.min(100, Math.max(0, Number(e.target.value))) },
                                true
                              )
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono-num bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg outline-none focus:border-[#7C93FA]"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="lg:col-span-3 flex items-center justify-end gap-3">
                      <select
                        value={course.expectedGrade}
                        onChange={(e) =>
                          updateCourseScoresAndGrade(course.id, {
                            expectedGrade: e.target.value as LetterGrade,
                          })
                        }
                        aria-label={`${course.title} 예상 등급`}
                        className="px-3 py-1.5 text-sm font-bold font-mono-num bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] rounded-xl outline-none"
                      >
                        {LETTER_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
