import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, Truck, Users } from 'lucide-react';
import { CAMPUS_NEWS } from '../data/seedData';
import type { CampusStore } from '../hooks/useCampusStore';
import type { CampusNewsItem } from '../types/campus';

interface CampusNewsViewProps {
  store: CampusStore;
}

type NewsCategory = '전체' | CampusNewsItem['category'];

const NEWS_STYLES: Record<CampusNewsItem['category'], string> = {
  푸드트럭: 'bg-[#FEF9C3] text-[#854D0E]',
  '동아리 행사': 'bg-[#F4EEFF] text-[#6D28D9]',
  '캠퍼스 이벤트': 'bg-[#EAFBF1] text-[#15803D]',
};

export const CampusNewsView: React.FC<CampusNewsViewProps> = ({ store }) => {
  const { navigateTo } = store;
  const [category, setCategory] = useState<NewsCategory>('전체');

  const filteredNews = useMemo(() => {
    if (category === '전체') return CAMPUS_NEWS;
    return CAMPUS_NEWS.filter((n) => n.category === category);
  }, [category]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#C2410C]">학교 소식 · 생활 · 캠퍼스 라이프</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">동아리 행사 · 푸드트럭 · 교내 소식</h2>
          <p className="text-xs text-[#64748B] mt-1">
            민주광장 푸드트럭 일정, 버스킹, 동아리 모집 및 신입생 환영 소식을 빠르게 확인하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start md:self-auto">
          {(['전체', '동아리 행사', '푸드트럭', '캠퍼스 이벤트'] as NewsCategory[]).map((cat) => (
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
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredNews.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg inline-flex items-center gap-1 ${NEWS_STYLES[item.category]}`}>
                  {item.category === '푸드트럭' ? (
                    <Truck className="w-3.5 h-3.5" />
                  ) : (
                    <Users className="w-3.5 h-3.5" />
                  )}
                  {item.category}
                </span>
                <span className="text-xs text-[#64748B]">{item.organizer}</span>
              </div>

              <h3 className="text-base font-bold text-[#1E293B]">{item.title}</h3>
              <p className="text-sm text-[#475569] leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1 font-mono-num">
                <Calendar className="w-3.5 h-3.5" />
                {item.dateLabel}
              </span>

              {item.buildingId ? (
                <button
                  type="button"
                  onClick={() => navigateTo('map', undefined, item.buildingId)}
                  className="inline-flex items-center gap-1 font-medium text-[#C2410C] hover:underline whitespace-nowrap"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {item.location} 지도 보기
                </button>
              ) : (
                <span>{item.location}</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
