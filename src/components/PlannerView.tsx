import React, { useMemo, useState } from 'react';
import { Calendar, Check, Plus, Trash2 } from 'lucide-react';
import type { CampusStore } from '../hooks/useCampusStore';
import type { ExamEvent, FullDayOfWeek } from '../types/campus';
import { computeDDay } from '../utils/academicMath';

interface PlannerViewProps {
  store: CampusStore;
}

const FULL_DAYS: ('전체' | FullDayOfWeek)[] = ['전체', '월', '화', '수', '목', '금', '토', '일'];

export const PlannerView: React.FC<PlannerViewProps> = ({ store }) => {
  const { state, addStudyTask, toggleStudyTask, deleteStudyTask, addExamEvent, deleteExamEvent } =
    store;

  const [selectedDay, setSelectedDay] = useState<'전체' | FullDayOfWeek>('전체');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCourse, setTaskCourse] = useState(state.enrolledCourses[0]?.title ?? '전공 공부');
  const [taskDay, setTaskDay] = useState<FullDayOfWeek>('목');
  const [taskMinutes, setTaskMinutes] = useState(45);

  const [examTitle, setExamTitle] = useState('');
  const [examCourse, setExamCourse] = useState(state.enrolledCourses[0]?.title ?? '전공 과목');
  const [examDate, setExamDate] = useState('2026-12-10');
  const [examType, setExamType] = useState<ExamEvent['examType']>('기말고사');

  const sortedExams = useMemo(() => {
    return [...state.exams]
      .map((exam) => ({ exam, dday: computeDDay(exam.date) }))
      .sort((a, b) => a.dday.daysLeft - b.dday.daysLeft);
  }, [state.exams]);

  const filteredTasks = useMemo(() => {
    if (selectedDay === '전체') return state.studyTasks;
    return state.studyTasks.filter((t) => t.day === selectedDay);
  }, [state.studyTasks, selectedDay]);

  const completedCount = state.studyTasks.filter((t) => t.completed).length;
  const completionPct =
    state.studyTasks.length > 0
      ? Math.round((completedCount / state.studyTasks.length) * 100)
      : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addStudyTask({
      title: taskTitle.trim(),
      courseName: taskCourse.trim() || '자율 학습',
      day: taskDay,
      durationMin: Math.max(10, Number(taskMinutes) || 30),
    });
    setTaskTitle('');
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDate) return;
    addExamEvent({
      title: examTitle.trim(),
      courseName: examCourse.trim() || '전공 과목',
      date: examDate,
      examType,
    });
    setExamTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#6D28D9]">학습 · 성적 관리</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">시험 디데이 · 주간 학습 플래너</h2>
          <p className="text-xs text-[#64748B] mt-1 font-mono-num">
            이번 주 학습 달성률 {completionPct}% ({completedCount}/{state.studyTasks.length}건 완료)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Exam D-Day */}
        <section className="xl:col-span-5 bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7C3AED]" />
              시험 D-Day 카운트다운
            </h3>
            <span className="text-xs text-[#64748B] font-mono-num">{sortedExams.length}건</span>
          </div>

          <form onSubmit={handleAddExam} className="space-y-2.5 p-3.5 rounded-xl bg-[#FAF8FF] border border-[#EAE2FE]">
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="시험명 (예: 해부학 기말고사)"
              className="w-full h-9 px-3 text-sm bg-white border border-[#E2E8F0] rounded-lg outline-none focus:border-[#7C93FA]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={examCourse}
                onChange={(e) => setExamCourse(e.target.value)}
                placeholder="과목명"
                className="h-9 px-3 text-xs bg-white border border-[#E2E8F0] rounded-lg outline-none"
              />
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamEvent['examType'])}
                aria-label="시험 구분"
                className="h-9 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg outline-none"
              >
                <option value="중간고사">중간고사</option>
                <option value="기말고사">기말고사</option>
                <option value="퀴즈">퀴즈</option>
                <option value="실기평가">실기평가</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                aria-label="시험 날짜"
                className="flex-1 h-9 px-3 text-xs font-mono-num bg-white border border-[#E2E8F0] rounded-lg outline-none"
              />
              <button
                type="submit"
                className="h-9 px-3.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                D-Day 추가
              </button>
            </div>
          </form>

          <div className="divide-y divide-[#F1F5F9]">
            {sortedExams.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B]">등록된 시험 일정이 없습니다.</div>
            ) : (
              sortedExams.map(({ exam, dday }) => (
                <div key={exam.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#64748B]">
                      {exam.courseName} · {exam.examType} ·{' '}
                      <span className="font-mono-num">{exam.date}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#1E293B] truncate mt-0.5">
                      {exam.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-num ${
                        dday.isUrgent
                          ? 'bg-[#FFE4E6] text-[#BE123C]'
                          : 'bg-[#F4EEFF] text-[#6D28D9]'
                      }`}
                    >
                      {dday.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExamEvent(exam.id)}
                      aria-label={`${exam.title} 삭제`}
                      className="p-1 text-[#94A3B8] hover:text-[#BE123C]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right: Weekly Study Planner */}
        <section className="xl:col-span-7 bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#1E293B]">주간 학습 플래너</h3>
            <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-x-auto max-w-full">
              {FULL_DAYS.map((d) => (
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
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E6EAF2]">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="오늘/이번 주 공부할 내용 입력..."
              className="sm:col-span-5 h-9 px-3 text-sm bg-white border border-[#E2E8F0] rounded-lg outline-none focus:border-[#7C93FA]"
            />
            <input
              type="text"
              value={taskCourse}
              onChange={(e) => setTaskCourse(e.target.value)}
              placeholder="과목"
              className="sm:col-span-3 h-9 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg outline-none"
            />
            <select
              value={taskDay}
              onChange={(e) => setTaskDay(e.target.value as FullDayOfWeek)}
              aria-label="요일 선택"
              className="sm:col-span-2 h-9 px-2 text-xs bg-white border border-[#E2E8F0] rounded-lg outline-none"
            >
              {(['월', '화', '수', '목', '금', '토', '일'] as FullDayOfWeek[]).map((d) => (
                <option key={d} value={d}>
                  {d}요일
                </option>
              ))}
            </select>
            <div className="sm:col-span-2 flex gap-1.5">
              <input
                type="number"
                min={10}
                max={300}
                step={5}
                value={taskMinutes}
                onChange={(e) => setTaskMinutes(Number(e.target.value))}
                aria-label="예상 시간(분)"
                className="w-14 h-9 px-2 text-xs font-mono-num bg-white border border-[#E2E8F0] rounded-lg outline-none"
              />
              <button
                type="submit"
                aria-label="학습 할 일 추가"
                className="flex-1 h-9 px-2.5 text-xs font-semibold text-white bg-[#5B7CFA] hover:bg-[#4F46E5] rounded-lg inline-flex items-center justify-center whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="divide-y divide-[#F1F5F9]">
            {filteredTasks.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">
                해당 요일에 등록된 학습 계획이 없습니다. 위 입력창에서 새 계획을 추가해 보세요.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStudyTask(task.id)}
                    className="flex items-start gap-3 text-left min-w-0 flex-1"
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                          : 'bg-white border-[#CBD5E1]'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          task.completed ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5 font-mono-num">
                        {task.day}요일 · {task.courseName} · {task.durationMin}분
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteStudyTask(task.id)}
                    aria-label={`${task.title} 삭제`}
                    className="p-1.5 text-[#94A3B8] hover:text-[#BE123C] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
