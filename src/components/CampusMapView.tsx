import React, { useMemo, useState } from 'react';
import { Compass, Footprints, MapPin } from 'lucide-react';
import { CAMPUS_BUILDINGS, CAMPUS_NEWS, STUDY_SPACES } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { CampusBuilding } from '../types/campus';

interface CampusMapViewProps {
  store: CampusStore;
}

type MapCategory = '전체' | CampusBuilding['category'];

export const CampusMapView: React.FC<CampusMapViewProps> = ({ store }) => {
  const { focusedBuildingId, setFocusedBuildingId, navigateTo } = store;

  const [category, setCategory] = useState<MapCategory>('전체');
  const selectedId = focusedBuildingId ?? CAMPUS_BUILDINGS[1].id;

  const selectedBuilding = useMemo(
    () => CAMPUS_BUILDINGS.find((b) => b.id === selectedId) ?? CAMPUS_BUILDINGS[0],
    [selectedId]
  );

  const relatedSpaces = useMemo(
    () => STUDY_SPACES.filter((s) => s.buildingId === selectedBuilding.id),
    [selectedBuilding.id]
  );

  const relatedNews = useMemo(
    () => CAMPUS_NEWS.filter((n) => n.buildingId === selectedBuilding.id),
    [selectedBuilding.id]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#15803D]">캠퍼스 · 공간 · 시설 안내</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">인터랙티브 캠퍼스 지도</h2>
          <p className="text-xs text-[#64748B] mt-1">
            건물을 클릭하면 정문 기준 도보 시간, 주요 편의시설, 건물 내 스터디 공간과 행사 정보를 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start lg:self-auto">
          {(['전체', '강의동', '도서관·스터디', '식당·푸드트럭', '편의·복지'] as MapCategory[]).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-white text-[#1E293B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Interactive Pastel SVG Campus Map */}
        <div className="xl:col-span-8 bg-white border border-[#E6EAF2] rounded-2xl p-4 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 800 480"
              role="img"
              aria-label="캠퍼스 건물 안내 지도"
              className="w-full min-w-[620px] h-auto rounded-xl bg-[#F4F8F5] border border-[#E2EBE4]"
            >
              {/* Soft Pastel Campus Lawn & Plaza */}
              <rect x="0" y="0" width="800" height="480" fill="#F4F9F5" />
              <ellipse cx="400" cy="240" rx="210" ry="115" fill="#E8F5EB" />
              <circle cx="400" cy="266" r="46" fill="#FAF5E4" stroke="#EADFB9" strokeWidth="1.5" />

              {/* Main Campus Walkways */}
              <path
                d="M 400 460 L 400 85 M 80 245 L 720 245 M 180 175 L 620 175 M 185 305 L 620 305"
                stroke="#FFFFFF"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d="M 400 460 L 400 85 M 80 245 L 720 245 M 180 175 L 620 175 M 185 305 L 620 305"
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Gate Marker & Compass */}
              <g transform="translate(362, 444)">
                <rect width="76" height="24" rx="8" fill="#FFFFFF" stroke="#CBD5E1" />
                <text x="38" y="16" textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569">
                  캠퍼스 정문
                </text>
              </g>
              <g transform="translate(738, 34)">
                <circle cx="16" cy="16" r="16" fill="#FFFFFF" stroke="#E2E8F0" />
                <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="#4F46E5">
                  N
                </text>
              </g>

              {/* Interactive Building Blocks */}
              {CAMPUS_BUILDINGS.map((bld) => {
                const matchesFilter = category === '전체' || bld.category === category;
                const isSelected = bld.id === selectedBuilding.id;

                return (
                  <g
                    key={bld.id}
                    onClick={() => setFocusedBuildingId(bld.id)}
                    className="cursor-pointer transition-opacity"
                    style={{ opacity: matchesFilter ? 1 : 0.3 }}
                  >
                    <rect
                      x={bld.x}
                      y={bld.y}
                      width={bld.width}
                      height={bld.height}
                      rx="14"
                      fill={bld.pastelHex}
                      stroke={isSelected ? '#4F46E5' : '#CBD5E1'}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <rect
                      x={bld.x + 8}
                      y={bld.y + 8}
                      width="28"
                      height="18"
                      rx="6"
                      fill="#FFFFFF"
                    />
                    <text
                      x={bld.x + 22}
                      y={bld.y + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#334155"
                    >
                      {bld.code}
                    </text>
                    <text
                      x={bld.x + bld.width / 2}
                      y={bld.y + bld.height / 2 + 12}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#1E293B"
                    >
                      {bld.name.length > 10 ? `${bld.name.slice(0, 10)}…` : bld.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Building Detail Panel */}
        <aside className="xl:col-span-4 bg-white border border-[#E6EAF2] rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[#64748B]">
                {selectedBuilding.code} · {selectedBuilding.category}
              </div>
              <h3 className="text-lg font-bold text-[#1E293B] mt-0.5">{selectedBuilding.name}</h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono-num font-semibold bg-[#EAFBF1] text-[#15803D] rounded-lg inline-flex items-center gap-1 shrink-0">
              <Footprints className="w-3.5 h-3.5" />
              도보 {selectedBuilding.walkingMinutesFromGate}분
            </span>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed">{selectedBuilding.description}</p>

          <div className="pt-3 border-t border-[#F1F5F9]">
            <div className="text-xs font-semibold text-[#1E293B] mb-2">주요 시설 안내</div>
            <div className="flex flex-wrap gap-1.5">
              {selectedBuilding.facilities.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] rounded-lg"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {relatedSpaces.length > 0 && (
            <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1E293B] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#15803D]" />
                  건물 내 스터디 공간
                </span>
                <button
                  type="button"
                  onClick={() => navigateTo('spaces')}
                  className="text-xs font-medium text-[#4F46E5] hover:underline"
                >
                  전체 보기
                </button>
              </div>
              {relatedSpaces.map((sp) => (
                <div key={sp.id} className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#E6EAF2]">
                  <div className="text-xs font-semibold text-[#1E293B]">{sp.name}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5 font-mono-num">
                    {sp.hours} · 혼잡도 {sp.crowdLevel}
                  </div>
                </div>
              ))}
            </div>
          )}

          {relatedNews.length > 0 && (
            <div className="pt-3 border-t border-[#F1F5F9] space-y-2">
              <div className="text-xs font-semibold text-[#C2410C] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                진행 중인 행사 · 푸드트럭
              </div>
              {relatedNews.map((nw) => (
                <div key={nw.id} className="p-2.5 rounded-xl bg-[#FFF2E8]/60 border border-[#FED7B8]">
                  <div className="text-xs font-semibold text-[#1E293B]">{nw.title}</div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">{nw.dateLabel}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
