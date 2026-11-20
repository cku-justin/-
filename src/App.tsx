import React, { useState } from 'react';
import { GripVertical, Menu } from 'lucide-react';
import { AcademicTrackerView } from './components/AcademicTrackerView';
import { CampusMapView } from './components/CampusMapView';
import { CampusNewsView } from './components/CampusNewsView';
import { FeatureSearchBar } from './components/FeatureSearchBar';
import { HomeBriefing } from './components/HomeBriefing';
import { LibraryView } from './components/LibraryView';
import { MealView } from './components/MealView';
import { NoticesView } from './components/NoticesView';
import { NursingView } from './components/NursingView';
import { PlannerView } from './components/PlannerView';
import { Sidebar } from './components/Sidebar';
import { StudySpacesView } from './components/StudySpacesView';
import { TimetableView } from './components/TimetableView';
import { CATEGORY_META, DEFAULT_NAV_ITEMS } from './data/seedData';
import { useCampusStore } from './hooks/useCampusStore';
import type { DepartmentId, GradeLevel, NavItemConfig, ViewId } from './types/campus';

export default function App() {
  const store = useCampusStore();
  const {
    state,
    activeView,
    toasts,
    navigateTo,
    updateDepartmentAndGrade,
    reorderQuickNav,
    resetLayoutOrder,
    resetAllData,
  } = store;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [draggedQuickId, setDraggedQuickId] = useState<ViewId | null>(null);
  const [dragOverQuickId, setDragOverQuickId] = useState<ViewId | null>(null);

  const orderedQuickItems = state.quickNavOrder
    .map((id) => DEFAULT_NAV_ITEMS.find((item) => item.id === id))
    .filter((item): item is NavItemConfig => Boolean(item));

  const currentNavMeta =
    DEFAULT_NAV_ITEMS.find((item) => item.id === activeView) ?? DEFAULT_NAV_ITEMS[0];
  const currentCatMeta = CATEGORY_META[currentNavMeta.categoryId];

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeBriefing store={store} />;
      case 'timetable':
        return <TimetableView store={store} />;
      case 'meals':
        return <MealView />;
      case 'academic':
        return <AcademicTrackerView store={store} />;
      case 'planner':
        return <PlannerView store={store} />;
      case 'nursing':
        return <NursingView store={store} />;
      case 'library':
        return <LibraryView store={store} />;
      case 'map':
        return <CampusMapView store={store} />;
      case 'spaces':
        return <StudySpacesView store={store} />;
      case 'notices':
        return <NoticesView store={store} />;
      case 'news':
        return <CampusNewsView store={store} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8FC] text-[#1E293B]">
      {/* Category Sidebar */}
      <Sidebar
        activeView={activeView}
        quickNavOrder={state.quickNavOrder}
        profile={state.profile}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSelectView={(view) => navigateTo(view)}
        onReorderNav={reorderQuickNav}
        onResetLayout={resetLayoutOrder}
        onResetAllData={resetAllData}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Context Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E6EAF2]">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile Trigger + Context Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="카테고리 메뉴 열기"
                className="lg:hidden p-2 -ml-2 rounded-xl text-[#475569] hover:bg-[#F8FAFC]"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm whitespace-nowrap">
                <span className="text-[#64748B]">{currentCatMeta.label}</span>
                <span className="text-[#CBD5E1]" aria-hidden="true">
                  /
                </span>
                <span className="font-bold text-[#1E293B]">{currentNavMeta.label}</span>
              </div>
            </div>

            {/* Center: Smart Global Feature Search Input */}
            <div className="flex-1 flex justify-center max-w-md">
              <FeatureSearchBar
                onSelectCommand={(viewId, subTab) => navigateTo(viewId, subTab)}
                onResetLayout={resetLayoutOrder}
              />
            </div>

            {/* Right: Department & Grade Profile Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={state.profile.department}
                onChange={(e) =>
                  updateDepartmentAndGrade(
                    e.target.value as DepartmentId,
                    state.profile.grade,
                    true
                  )
                }
                aria-label="학과 선택"
                className="h-9 px-2.5 text-xs font-semibold bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] rounded-xl outline-none cursor-pointer"
              >
                <option value="nursing">간호학과</option>
                <option value="cs">컴퓨터공학과</option>
                <option value="business">경영학과</option>
                <option value="psychology">심리학과</option>
              </select>

              <select
                value={state.profile.grade}
                onChange={(e) =>
                  updateDepartmentAndGrade(
                    state.profile.department,
                    Number(e.target.value) as GradeLevel,
                    true
                  )
                }
                aria-label="학년 선택"
                className="h-9 px-2 text-xs font-semibold bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] rounded-xl outline-none cursor-pointer"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
                <option value={4}>4학년</option>
              </select>
            </div>
          </div>

          {/* Draggable Quick Selection Bar (선택바) */}
          <div className="px-4 sm:px-6 py-2 bg-[#FAFBFD] border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-[#94A3B8] shrink-0 whitespace-nowrap pr-1">
              빠른 선택 (드래그 정렬)
            </span>
            {orderedQuickItems.map((item) => {
              const catMeta = CATEGORY_META[item.categoryId];
              const isActive = activeView === item.id;
              const isDropTarget = dragOverQuickId === item.id && draggedQuickId !== item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    setDraggedQuickId(item.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', item.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverQuickId !== item.id) setDragOverQuickId(item.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverQuickId === item.id) setDragOverQuickId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dropped = (e.dataTransfer.getData('text/plain') as ViewId) || draggedQuickId;
                    if (dropped && dropped !== item.id) {
                      reorderQuickNav(dropped, item.id);
                    }
                    setDraggedQuickId(null);
                    setDragOverQuickId(null);
                  }}
                  onDragEnd={() => {
                    setDraggedQuickId(null);
                    setDragOverQuickId(null);
                  }}
                  onClick={() => navigateTo(item.id)}
                  title={`${item.label} (드래그하여 선택바 순서 변경)`}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? `${catMeta.badgeBg} ${catMeta.badgeText} border-transparent`
                      : 'bg-white text-[#475569] border-[#E6EAF2] hover:text-[#1E293B]'
                  } ${isDropTarget ? 'ring-2 ring-[#5B7CFA] border-dashed' : ''} ${
                    draggedQuickId === item.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-[#CBD5E1] group-hover:text-[#64748B] cursor-grab" />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        >
          {toasts.map((toast) => {
            const toneStyles =
              toast.tone === 'warning'
                ? 'bg-[#FFF5F5] border-[#FECDD6] text-[#9F1239]'
                : toast.tone === 'success'
                ? 'bg-[#EAFBF1] border-[#BBF0D1] text-[#14532D]'
                : 'bg-white border-[#E2E8F0] text-[#1E293B]';
            return (
              <div
                key={toast.id}
                className={`px-4 py-3 rounded-2xl border shadow-md text-xs font-semibold pointer-events-auto ${toneStyles}`}
              >
                {toast.message}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
