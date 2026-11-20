import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Plus, Search, Trash2 } from 'lucide-react';
import type { CampusStore } from '../hooks/useCampusStore';
import type { GradeLevel, NursingAssignment } from '../types/campus';

interface NursingViewProps {
  store: CampusStore;
}

const NURSING_SUBJECTS_BY_GRADE: Record<GradeLevel, string[]> = {
  1: ['간호학개론', '인체해부학', '의학용어', '기초인체생리학'],
  2: ['기본간호학', '병태생리학', '약리학', '건강사정'],
  3: ['성인간호학', '모성간호학', '아동간호학', '임상실습 I'],
  4: ['지역사회간호학', '간호관리학', '정신간호학', '국가고시 대비 종합'],
};

const STATUS_STYLES: Record<NursingAssignment['status'], string> = {
  '진행 전': 'bg-[#F1F5F9] text-[#475569]',
  '작성 중': 'bg-[#FEF3C7] text-[#B45309]',
  '제출 완료': 'bg-[#DCFCE7] text-[#15803D]',
};

const MASTERY_STYLES: Record<'미실습' | '연습중' | '통과', string> = {
  미실습: 'bg-[#F1F5F9] text-[#475569]',
  연습중: 'bg-[#FFF2E8] text-[#C2410C]',
  통과: 'bg-[#DCFCE7] text-[#15803D]',
};

export const NursingView: React.FC<NursingViewProps> = ({ store }) => {
  const {
    state,
    subTab,
    addNursingAssignment,
    cycleNursingAssignmentStatus,
    deleteNursingAssignment,
    cycleNursingSkillMastery,
  } = store;

  const [tab, setTab] = useState<'assignments' | 'skills'>(
    subTab === 'skills' ? 'skills' : 'assignments'
  );
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(state.profile.grade);
  const [subjectFilter, setSubjectFilter] = useState<string>('전체');

  const [newSubject, setNewSubject] = useState(NURSING_SUBJECTS_BY_GRADE[selectedGrade][0]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<NursingAssignment['type']>('레포트');
  const [newDueDate, setNewDueDate] = useState('2026-11-30');

  const [skillGradeFilter, setSkillGradeFilter] = useState<GradeLevel | 'all'>('all');
  const [skillQuery, setSkillQuery] = useState('');

  useEffect(() => {
    if (subTab === 'skills' || subTab === 'assignments') {
      setTab(subTab);
    }
  }, [subTab]);

  useEffect(() => {
    setSubjectFilter('전체');
    setNewSubject(NURSING_SUBJECTS_BY_GRADE[selectedGrade][0]);
  }, [selectedGrade]);

  const gradeSubjects = NURSING_SUBJECTS_BY_GRADE[selectedGrade];

  const filteredAssignments = useMemo(() => {
    return state.nursingAssignments.filter((item) => {
      if (item.grade !== selectedGrade) return false;
      if (subjectFilter !== '전체' && item.subject !== subjectFilter) return false;
      return true;
    });
  }, [state.nursingAssignments, selectedGrade, subjectFilter]);

  const filteredSkills = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    return state.nursingSkills.filter((sk) => {
      if (skillGradeFilter !== 'all' && sk.grade !== skillGradeFilter) return false;
      if (q && !sk.name.toLowerCase().includes(q) && !sk.category.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [state.nursingSkills, skillGradeFilter, skillQuery]);

  const masteredCount = state.nursingSkills.filter((s) => s.mastery === '통과').length;
  const masteryPct = Math.round((masteredCount / Math.max(1, state.nursingSkills.length)) * 100);

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addNursingAssignment({
      grade: selectedGrade,
      subject: newSubject,
      title: newTitle.trim(),
      type: newType,
      dueDate: newDueDate,
    });
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#BE123C]">학습 · 성적 관리 · 간호학 트랙</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
            간호학과 학년별 과제 · 핵심기본간호술 체크리스트
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            학년별 전공 과제 과목을 체계적으로 관리하고 실습 핵심술기 숙련도를 단계별로 기록하세요.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setTab('assignments')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'assignments'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            학년별 과제 관리
          </button>
          <button
            type="button"
            onClick={() => setTab('skills')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              tab === 'skills'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            핵심술기 체크리스트
          </button>
        </div>
      </div>

      {tab === 'assignments' ? (
        <div className="space-y-5">
          {/* Grade & Subject Filter Bar */}
          <div className="bg-white border border-[#E6EAF2] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start">
              {([1, 2, 3, 4] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    selectedGrade === g
                      ? 'bg-[#FFF0F3] text-[#BE123C]'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  {g}학년
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['전체', ...gradeSubjects].map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSubjectFilter(subj)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
                    subjectFilter === subj
                      ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* Add Assignment Form */}
          <form
            onSubmit={handleAddAssignment}
            className="bg-white border border-[#E6EAF2] rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
          >
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              aria-label="과제 과목 선택"
              className="md:col-span-3 h-9 px-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none"
            >
              {gradeSubjects.map((subj) => (
                <option key={subj} value={subj}>
                  {selectedGrade}학년 · {subj}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="새 과제 항목 입력 (예: 케이스 스터디 간호과정 2개 작성)"
              className="md:col-span-4 h-9 px-3 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as NursingAssignment['type'])}
              aria-label="과제 유형"
              className="md:col-span-2 h-9 px-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none"
            >
              <option value="레포트">레포트</option>
              <option value="케이스 스터디">케이스 스터디</option>
              <option value="핵심술기 평가">핵심술기 평가</option>
              <option value="팀 프로젝트">팀 프로젝트</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              aria-label="마감일"
              className="md:col-span-2 h-9 px-2.5 text-xs font-mono-num bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none"
            />
            <button
              type="submit"
              className="md:col-span-1 h-9 px-3 text-xs font-semibold text-white bg-[#FB7185] hover:bg-[#E11D48] rounded-xl inline-flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              추가
            </button>
          </form>

          {/* Assignment List */}
          <div className="bg-white border border-[#E6EAF2] rounded-2xl divide-y divide-[#F1F5F9]">
            {filteredAssignments.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">
                선택한 조건의 과제가 없습니다. 상단 입력창에서 새 과제를 등록해 보세요.
              </div>
            ) : (
              filteredAssignments.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-[#64748B]">
                      {item.grade}학년 · {item.subject} · {item.type} ·{' '}
                      <span className="font-mono-num">마감 {item.dueDate}</span>
                    </div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${
                        item.status === '제출 완료' ? 'line-through text-[#94A3B8]' : 'text-[#1E293B]'
                      }`}
                    >
                      {item.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => cycleNursingAssignmentStatus(item.id)}
                      title="클릭하여 진행 상태 변경"
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${STATUS_STYLES[item.status]}`}
                    >
                      {item.status}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNursingAssignment(item.id)}
                      aria-label={`${item.title} 삭제`}
                      className="p-1.5 text-[#94A3B8] hover:text-[#BE123C]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Core Nursing Skills Checklist */
        <div className="space-y-5">
          <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E293B]">
                <ClipboardCheck className="w-4 h-4 text-[#FB7185]" />
                <span>핵심기본간호술 전체 숙련도</span>
              </div>
              <span className="text-sm font-bold font-mono-num text-[#BE123C]">
                {masteredCount} / {state.nursingSkills.length} 통과 ({masteryPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#FFF0F3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FB7185] rounded-full transition-all"
                style={{ width: `${masteryPct}%` }}
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start">
                {(['all', 1, 2, 3, 4] as const).map((g) => (
                  <button
                    key={String(g)}
                    type="button"
                    onClick={() => setSkillGradeFilter(g)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      skillGradeFilter === g
                        ? 'bg-white text-[#1E293B] shadow-xs'
                        : 'text-[#64748B] hover:text-[#1E293B]'
                    }`}
                  >
                    {g === 'all' ? '전체 학년' : `${g}학년`}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={skillQuery}
                  onChange={(e) => setSkillQuery(e.target.value)}
                  placeholder="술기명 또는 영역 검색..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6EAF2] rounded-2xl divide-y divide-[#F1F5F9]">
            {filteredSkills.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">
                검색 조건에 맞는 핵심술기 항목이 없습니다.
              </div>
            ) : (
              filteredSkills.map((sk) => (
                <div key={sk.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-[#64748B]">
                      {sk.grade}학년 권장 · {sk.category} · 난이도 {sk.difficulty}
                    </div>
                    <div className="text-sm font-semibold text-[#1E293B] mt-0.5">{sk.name}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleNursingSkillMastery(sk.id)}
                    title="클릭하여 실습 상태 전환 (미실습 → 연습중 → 통과)"
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${MASTERY_STYLES[sk.mastery]}`}
                  >
                    {sk.mastery}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
