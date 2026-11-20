import React, { useMemo, useState } from 'react';
import { Heart, MapPin, Plug, Users } from 'lucide-react';
import { STUDY_SPACES } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';

interface StudySpacesViewProps {
  store: CampusStore;
}

export const StudySpacesView: React.FC<StudySpacesViewProps> = ({ store }) => {
  const { state, toggleSpaceFavorite, navigateTo } = store;

  const [onlyOutlets, setOnlyOutlets] = useState(false);
  const [onlyGroup, setOnlyGroup] = useState(false);
  const [only24h, setOnly24h] = useState(false);
  const [onlyQuiet, setOnlyQuiet] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredSpaces = useMemo(() => {
    return STUDY_SPACES.filter((sp) => {
      if (onlyOutlets && !sp.hasOutlets) return false;
      if (onlyGroup && !sp.allowsGroup) return false;
      if (only24h && !sp.is24Hours) return false;
      if (onlyQuiet && sp.noiseLevel !== '매우 조용함') return false;
      if (onlyFavorites && !state.favoriteSpaceIds.includes(sp.id)) return false;
      return true;
    });
  }, [onlyOutlets, onlyGroup, only24h, onlyQuiet, onlyFavorites, state.favoriteSpaceIds]);

  const CROWD_STYLES: Record<'여유' | '보통' | '혼잡', string> = {
    여유: 'bg-[#DCFCE7] text-[#15803D]',
    보통: 'bg-[#FEF3C7] text-[#B45309]',
    혼잡: 'bg-[#FFE4E6] text-[#BE123C]',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#15803D]">캠퍼스 · 공간 · 공강 활용</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">교내 스터디 공간 찾기</h2>
          <p className="text-xs text-[#64748B] mt-1">
            혼자 집중할 수 있는 열람실부터 팀플·간호 케이스 회의가 가능한 라운지까지 조건별로 찾아보세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: '콘센트 완비', active: onlyOutlets, toggle: () => setOnlyOutlets((v) => !v) },
            { label: '조용한 분위기', active: onlyQuiet, toggle: () => setOnlyQuiet((v) => !v) },
            { label: '팀플·대화 가능', active: onlyGroup, toggle: () => setOnlyGroup((v) => !v) },
            { label: '24시간 개방', active: only24h, toggle: () => setOnly24h((v) => !v) },
            {
              label: `즐겨찾기 (${state.favoriteSpaceIds.length})`,
              active: onlyFavorites,
              toggle: () => setOnlyFavorites((v) => !v),
            },
          ].map((flt) => (
            <button
              key={flt.label}
              type="button"
              onClick={flt.toggle}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors whitespace-nowrap ${
                flt.active
                  ? 'bg-[#EAFBF1] text-[#15803D] border-[#BBF0D1]'
                  : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC]'
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSpaces.length === 0 ? (
        <div className="bg-white border border-[#E6EAF2] rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm font-medium text-[#1E293B]">선택한 조건을 모두 만족하는 스터디 공간이 없습니다.</p>
          <button
            type="button"
            onClick={() => {
              setOnlyOutlets(false);
              setOnlyGroup(false);
              setOnly24h(false);
              setOnlyQuiet(false);
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 text-xs font-semibold text-[#15803D] bg-[#EAFBF1] border border-[#BBF0D1] rounded-xl"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSpaces.map((sp) => {
            const isFav = state.favoriteSpaceIds.includes(sp.id);
            return (
              <article
                key={sp.id}
                className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-[#64748B]">{sp.buildingName}</div>
                      <h3 className="text-base font-bold text-[#1E293B] mt-0.5">{sp.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${CROWD_STYLES[sp.crowdLevel]}`}>
                        혼잡도 {sp.crowdLevel}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSpaceFavorite(sp.id)}
                        aria-label={`${sp.name} 즐겨찾기`}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isFav
                            ? 'bg-[#FFF0F3] border-[#FECDD6] text-[#BE123C]'
                            : 'bg-white border-[#E2E8F0] text-[#94A3B8] hover:text-[#1E293B]'
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-[#475569]">{sp.description}</p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] pt-1">
                    <span className="font-mono-num">운영 {sp.hours}</span>
                    <span>·</span>
                    <span>{sp.noiseLevel}</span>
                    <span>·</span>
                    <span className="font-mono-num">{sp.seats}석</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-[#475569]">
                    {sp.hasOutlets && (
                      <span className="inline-flex items-center gap-1">
                        <Plug className="w-3.5 h-3.5 text-[#15803D]" />
                        콘센트
                      </span>
                    )}
                    {sp.allowsGroup && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#4F46E5]" />
                        그룹 가능
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('map', undefined, sp.buildingId)}
                    className="inline-flex items-center gap-1 font-medium text-[#15803D] hover:underline whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    지도에서 위치 보기
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
