import React, { useMemo, useState } from 'react';
import { Bookmark, Pin, Search, X } from 'lucide-react';
import { OFFICIAL_NOTICES } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { OfficialNotice } from '../types/campus';

interface NoticesViewProps {
  store: CampusStore;
}

type NoticeCategory = '전체' | OfficialNotice['category'];

export const NoticesView: React.FC<NoticesViewProps> = ({ store }) => {
  const { state, toggleNoticeBookmark } = store;

  const [category, setCategory] = useState<NoticeCategory>('전체');
  const [query, setQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<OfficialNotice | null>(null);

  const filteredNotices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_NOTICES.filter((n) => {
      if (category !== '전체' && n.category !== category) return false;
      if (onlyBookmarked && !state.bookmarkedNoticeIds.includes(n.id)) return false;
      if (q) {
        return (
          n.title.toLowerCase().includes(q) ||
          n.department.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, query, onlyBookmarked, state.bookmarkedNoticeIds]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#C2410C]">학교 소식 · 생활 · 공식 포털 연동</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">학교 공식 홈페이지 공지사항</h2>
          <p className="text-xs text-[#64748B] mt-1">
            학사 일정, 국가·교내 장학금, 취업 특강 등 놓치면 안 되는 공지를 모아 확인하고 스크랩하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="공지 제목, 부서 검색..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyBookmarked((v) => !v)}
            className={`h-9 px-3 text-xs font-medium rounded-xl border inline-flex items-center gap-1.5 whitespace-nowrap ${
              onlyBookmarked
                ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
                : 'bg-white text-[#475569] border-[#E2E8F0]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            스크랩 ({state.bookmarkedNoticeIds.length})
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-1">
        {(['전체', '학사', '장학', '취업·진로', '일반'] as NoticeCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
              category === cat
                ? 'bg-[#FFF2E8] text-[#C2410C] border-[#FED7B8]'
                : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#E6EAF2] rounded-2xl divide-y divide-[#F1F5F9]">
        {filteredNotices.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#64748B]">
            조건에 일치하는 공지사항이 없습니다.
          </div>
        ) : (
          filteredNotices.map((notice) => {
            const isBookmarked = state.bookmarkedNoticeIds.includes(notice.id);
            return (
              <div
                key={notice.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBFD] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setSelectedNotice(notice)}
                  className="text-left min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2 text-xs text-[#64748B]">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-0.5 text-[#BE123C] font-semibold">
                        <Pin className="w-3 h-3" />
                        주요
                      </span>
                    )}
                    <span className="font-medium text-[#C2410C]">{notice.category}</span>
                    <span>·</span>
                    <span>{notice.department}</span>
                    <span>·</span>
                    <span className="font-mono-num">{notice.date}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1E293B] mt-1">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-1">{notice.summary}</p>
                </button>

                <button
                  type="button"
                  onClick={() => toggleNoticeBookmark(notice.id)}
                  aria-label={`${notice.title} 스크랩`}
                  className={`p-2 rounded-xl border self-start sm:self-center shrink-0 transition-colors ${
                    isBookmarked
                      ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                      : 'bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B]'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white border border-[#E6EAF2] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-[#64748B]">
                  {selectedNotice.category} · {selectedNotice.department} ·{' '}
                  <span className="font-mono-num">{selectedNotice.date}</span>
                </div>
                <h3 className="text-lg font-bold text-[#1E293B] mt-1">{selectedNotice.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                aria-label="공지 닫기"
                className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#F1F5F9] text-sm text-[#334155] leading-relaxed">
              {selectedNotice.content}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#64748B] font-mono-num">
                조회수 {selectedNotice.views.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5B7CFA] hover:bg-[#4F46E5] rounded-xl"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
