import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, BookOpen, Clock, Search } from 'lucide-react';
import { BOOK_CATALOG, LIBRARY_FACILITIES } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { BookItem } from '../types/campus';

interface LibraryViewProps {
  store: CampusStore;
}

type BookCategory = '전체' | BookItem['category'];

export const LibraryView: React.FC<LibraryViewProps> = ({ store }) => {
  const { state, subTab, toggleBookBookmark } = store;

  const [tab, setTab] = useState<'all' | 'hours' | 'books'>(
    subTab === 'books' ? 'books' : subTab === 'hours' ? 'hours' : 'all'
  );
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BookCategory>('전체');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  useEffect(() => {
    if (subTab === 'books' || subTab === 'hours') {
      setTab(subTab);
    }
  }, [subTab]);

  const currentHour = new Date().getHours();

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BOOK_CATALOG.filter((book) => {
      if (category !== '전체' && book.category !== category) return false;
      if (onlyBookmarked && !state.bookmarkedBookIds.includes(book.id)) return false;
      if (q) {
        return (
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          book.callNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, category, onlyBookmarked, state.bookmarkedBookIds]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#15803D]">캠퍼스 · 공간 · 중앙도서관</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">도서관 오픈 시간 · 통합 도서 검색</h2>
          <p className="text-xs text-[#64748B] mt-1">
            실별 개방 시간 및 잔여 좌석을 확인하고, 전공·교양 도서의 서가 위치와 대출 가능 여부를 검색합니다.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start md:self-auto">
          {(
            [
              { id: 'all', label: '전체 보기' },
              { id: 'hours', label: '운영시간' },
              { id: 'books', label: '도서 검색' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                tab === item.id ? 'bg-white text-[#1E293B] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opening Hours Section */}
      {(tab === 'all' || tab === 'hours') && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-[#15803D]" />
            층별 · 실별 운영 시간 및 좌석 현황
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIBRARY_FACILITIES.map((fac) => {
              const isOpen =
                fac.openHour === 0 && fac.closeHour === 24
                  ? true
                  : currentHour >= fac.openHour && currentHour < fac.closeHour;
              const occupancyPct = Math.round((fac.occupiedSeats / fac.totalSeats) * 100);
              const remaining = fac.totalSeats - fac.occupiedSeats;

              return (
                <div
                  key={fac.id}
                  className="bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#64748B]">{fac.floor}</div>
                      <h4 className="text-base font-bold text-[#1E293B] mt-0.5">{fac.name}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
                        isOpen ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#F1F5F9] text-[#475569]'
                      }`}
                    >
                      {isOpen ? '이용 가능' : '운영 종료'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono-num text-[#475569] bg-[#F8FAFC] p-3 rounded-xl">
                    <div>평일: {fac.weekdayHours}</div>
                    <div>주말: {fac.weekendHours}</div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
                      <span>좌석 이용률</span>
                      <span className="font-mono-num">
                        잔여 <strong className="text-[#1E293B]">{remaining}</strong> / {fac.totalSeats}석 ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#EAFBF1] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ADE80] rounded-full"
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B]">{fac.note}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Book Search Section */}
      {(tab === 'all' || tab === 'books') && (
        <section className="bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#1E293B] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#4F46E5]" />
              도서 소장 검색
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="도서명, 저자, 청구기호 검색..."
                  className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#7C93FA]"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyBookmarked((prev) => !prev)}
                className={`h-9 px-3 text-xs font-medium rounded-xl border inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  onlyBookmarked
                    ? 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]'
                    : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                관심 도서 ({state.bookmarkedBookIds.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['전체', '간호·보건', 'IT·공학', '경영·경제', '인문·교양'] as BookCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
                    category === cat
                      ? 'bg-[#EAFBF1] text-[#15803D] border-[#BBF0D1]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:text-[#1E293B]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {filteredBooks.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">
                검색 조건에 해당하는 소장 도서가 없습니다.
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isBookmarked = state.bookmarkedBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs text-[#64748B]">
                        {book.category} · {book.publisher} ({book.year}) ·{' '}
                        <span className="font-mono-num text-[#475569]">{book.callNumber}</span>
                      </div>
                      <div className="text-sm font-bold text-[#1E293B] mt-0.5">{book.title}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {book.author} · {book.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
                          book.available
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FFF2E8] text-[#C2410C]'
                        }`}
                      >
                        {book.available ? '대출 가능' : book.dueDate ?? '대출 중'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleBookBookmark(book.id)}
                        aria-label={`${book.title} 관심 도서 저장`}
                        className={`p-2 rounded-xl border transition-colors ${
                          isBookmarked
                            ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                            : 'bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B]'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
};
