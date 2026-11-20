import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Compass,
  GraduationCap,
  GripVertical,
  Home,
  LayoutGrid,
  MapPin,
  Megaphone,
  RotateCcw,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react';
import { CATEGORY_META, DEFAULT_NAV_ITEMS, DEPARTMENT_LABELS } from '../data/seedData';
import type { CategoryId, NavItemConfig, StudentProfile, ViewId } from '../types/campus';

interface SidebarProps {
  activeView: ViewId;
  quickNavOrder: ViewId[];
  profile: StudentProfile;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectView: (view: ViewId) => void;
  onReorderNav: (draggedId: ViewId, targetId: ViewId) => void;
  onResetLayout: () => void;
  onResetAllData: () => void;
}

const VIEW_ICONS: Record<ViewId, React.ComponentType<{ className?: string }>> = {
  home: Home,
  timetable: CalendarDays,
  meals: Utensils,
  academic: GraduationCap,
  planner: CheckSquare,
  nursing: BookOpen,
  library: BookOpen,
  map: MapPin,
  spaces: Compass,
  notices: Megaphone,
  news: Sparkles,
};

const CATEGORY_ORDER: CategoryId[] = ['daily', 'academic', 'campus', 'life'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  quickNavOrder,
  profile,
  isOpenMobile,
  onCloseMobile,
  onSelectView,
  onReorderNav,
  onResetLayout,
  onResetAllData,
}) => {
  const [editNavOrder, setEditNavOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<ViewId | null>(null);
  const [dragOverId, setDragOverId] = useState<ViewId | null>(null);

  const orderedNavItems = quickNavOrder
    .map((id) => DEFAULT_NAV_ITEMS.find((item) => item.id === id))
    .filter((item): item is NavItemConfig => Boolean(item));

  const handleMoveStep = (itemId: ViewId, categoryItems: NavItemConfig[], direction: -1 | 1) => {
    const idx = categoryItems.findIndex((i) => i.id === itemId);
    const targetIdx = idx + direction;
    if (idx === -1 || targetIdx < 0 || targetIdx >= categoryItems.length) return;
    onReorderNav(itemId, categoryItems[targetIdx].id);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E6EAF2]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#E6EAF2] shrink-0">
        <button
          type="button"
          onClick={() => {
            onSelectView('home');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-xl bg-[#EEF2FF] border border-[#D8E1FE] flex items-center justify-center text-[#4F46E5]">
            <LayoutGrid className="w-4 h-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-[#1E293B]">캠퍼스메이트</span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="메뉴 닫기"
          className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Order Toggle */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-[#64748B]">카테고리 메뉴</span>
        <button
          type="button"
          onClick={() => setEditNavOrder((prev) => !prev)}
          className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            editNavOrder
              ? 'bg-[#EEF2FF] text-[#4338CA]'
              : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]'
          }`}
        >
          {editNavOrder ? '순서 편집 완료' : '순서 편집'}
        </button>
      </div>

      {/* Grouped Category Navigation */}
      <nav aria-label="주 메뉴" className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {CATEGORY_ORDER.map((catId) => {
          const meta = CATEGORY_META[catId];
          const items = orderedNavItems.filter((item) => item.categoryId === catId);

          return (
            <div key={catId}>
              <div className="px-2.5 mb-1.5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} aria-hidden="true" />
                <span className="text-xs font-semibold text-[#475569]">{meta.label}</span>
              </div>

              <div className="space-y-0.5">
                {items.map((item, idx) => {
                  const Icon = VIEW_ICONS[item.id];
                  const isActive = activeView === item.id;
                  const isDropTarget = dragOverId === item.id && draggedId !== item.id;

                  return (
                    <div
                      key={item.id}
                      draggable={editNavOrder}
                      onDragStart={(e) => {
                        if (!editNavOrder) return;
                        setDraggedId(item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        if (!editNavOrder) return;
                        e.preventDefault();
                        setDragOverId(item.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverId === item.id) setDragOverId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedId && draggedId !== item.id) {
                          onReorderNav(draggedId, item.id);
                        }
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={`group flex items-center gap-1 rounded-xl transition-all ${
                        isDropTarget ? 'ring-2 ring-[#7C93FA] bg-[#EEF2FF]/60' : ''
                      } ${draggedId === item.id ? 'opacity-50' : ''}`}
                    >
                      {editNavOrder && (
                        <span
                          className="pl-1.5 text-[#94A3B8] cursor-grab active:cursor-grabbing"
                          title="드래그하여 순서 변경"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectView(item.id);
                          onCloseMobile();
                        }}
                        className={`flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors text-left min-w-0 ${
                          isActive
                            ? `${meta.badgeBg} ${meta.badgeText}`
                            : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>

                      {editNavOrder && (
                        <div className="flex items-center pr-1 gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveStep(item.id, items, -1)}
                            aria-label={`${item.label} 위로 이동`}
                            className="p-1 text-[#64748B] hover:text-[#1E293B] disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleMoveStep(item.id, items, 1)}
                            aria-label={`${item.label} 아래로 이동`}
                            className="p-1 text-[#64748B] hover:text-[#1E293B] disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Profile & Clean Utility Actions */}
      <div className="p-4 border-t border-[#E6EAF2] bg-[#FAFBFD] space-y-3 shrink-0">
        <div className="text-xs text-[#475569]">
          <div className="font-semibold text-[#1E293B]">
            {profile.name} · {DEPARTMENT_LABELS[profile.department]} {profile.grade}학년
          </div>
          <div className="text-[#64748B] mt-0.5">{profile.semester} · 자동 저장됨</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetLayout}
            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            배치 초기화
          </button>
          <button
            type="button"
            onClick={onResetAllData}
            className="px-2.5 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-white rounded-lg transition-colors whitespace-nowrap"
          >
            샘플 복원
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Rail */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">{navContent}</aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{navContent}</div>
        </div>
      )}
    </>
  );
};
