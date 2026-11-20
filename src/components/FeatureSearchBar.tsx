import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Search, X } from 'lucide-react';
import { CATEGORY_META, FEATURE_COMMANDS } from '../data/seedData';
import type { CategoryId, FeatureCommand, ViewId } from '../types/campus';

interface FeatureSearchBarProps {
  onSelectCommand: (viewId: ViewId, subTab?: string) => void;
  onResetLayout: () => void;
}

const CATEGORY_ORDER: CategoryId[] = ['daily', 'academic', 'campus', 'life'];

export const FeatureSearchBar: React.FC<FeatureSearchBarProps> = ({
  onSelectCommand,
  onResetLayout,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FEATURE_COMMANDS;
    return FEATURE_COMMANDS.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.categoryLabel.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

  const groupedCommands = useMemo(() => {
    return CATEGORY_ORDER.map((catId) => ({
      categoryId: catId,
      label: CATEGORY_META[catId].label,
      items: filteredCommands.filter((c) => c.categoryId === catId),
    })).filter((g) => g.items.length > 0);
  }, [filteredCommands]);

  const flatCommands = useMemo(
    () => groupedCommands.flatMap((g) => g.items),
    [groupedCommands]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleChoose = (cmd: FeatureCommand) => {
    onSelectCommand(cmd.viewId, cmd.subTab);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) setIsOpen(true);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (flatCommands.length > 0 ? (prev + 1) % flatCommands.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        flatCommands.length > 0 ? (prev - 1 + flatCommands.length) % flatCommands.length : 0
      );
    } else if (e.key === 'Enter' && flatCommands[activeIndex]) {
      e.preventDefault();
      handleChoose(flatCommands[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="기능 검색 (학식, 결석, 간호술기, 도서, 푸드트럭...)"
          aria-label="기능 검색"
          className="w-full h-10 pl-10 pr-16 text-sm bg-[#F8FAFC] hover:bg-white focus:bg-white text-[#1E293B] placeholder:text-[#94A3B8] border border-[#E2E8F0] focus:border-[#7C93FA] rounded-xl outline-none transition-colors"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="검색어 지우기"
            className="absolute right-2.5 p-1 text-[#64748B] hover:text-[#1E293B] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono-num text-[#64748B] bg-white border border-[#E2E8F0] rounded-md absolute right-2.5 pointer-events-none">
            ⌘K
          </kbd>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg shadow-slate-200/60 overflow-hidden z-50 max-h-[420px] flex flex-col">
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>카테고리별 기능 바로가기</span>
            <button
              type="button"
              onClick={() => {
                onResetLayout();
                setIsOpen(false);
              }}
              className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              화면 배치 초기화
            </button>
          </div>

          <div className="overflow-y-auto p-2 space-y-3">
            {groupedCommands.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-sm font-medium text-[#1E293B]">일치하는 기능이 없습니다</p>
                <p className="text-xs text-[#64748B] mt-1">
                  학식, 시간표, 출석, 학점, 간호술기, 도서관, 지도, 공지 등으로 검색해 보세요.
                </p>
              </div>
            ) : (
              groupedCommands.map((group) => {
                const meta = CATEGORY_META[group.categoryId];
                return (
                  <div key={group.categoryId}>
                    <div className="px-2.5 py-1 flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                      <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} aria-hidden="true" />
                      <span>{group.label}</span>
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {group.items.map((cmd) => {
                        const globalIdx = flatCommands.findIndex((c) => c.id === cmd.id);
                        const isHighlighted = globalIdx === activeIndex;
                        return (
                          <button
                            key={cmd.id}
                            type="button"
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            onClick={() => handleChoose(cmd)}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                              isHighlighted ? 'bg-[#EEF2FF] text-[#1E293B]' : 'hover:bg-[#F8FAFC] text-[#1E293B]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{cmd.title}</div>
                              <div className="text-xs text-[#64748B] truncate">{cmd.subtitle}</div>
                            </div>
                            <ArrowRight
                              className={`w-4 h-4 shrink-0 ${
                                isHighlighted ? 'text-[#5B7CFA]' : 'text-[#CBD5E1]'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
