import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { WEEKLY_MEALS } from '../data/seedData';
import type { DayOfWeek } from '../types/campus';

type MealFilter = '전체' | '조식' | '중식' | '석식';

const MEAL_TYPE_STYLES: Record<'조식' | '중식' | '석식', string> = {
  조식: 'bg-[#EBF6FF] text-[#0369A1]',
  중식: 'bg-[#FFF2E8] text-[#C2410C]',
  석식: 'bg-[#F4EEFF] text-[#6D28D9]',
};

export const MealView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('목');
  const [mealFilter, setMealFilter] = useState<MealFilter>('전체');

  const dayObj = WEEKLY_MEALS.find((d) => d.day === selectedDay) ?? WEEKLY_MEALS[0];
  const filteredMeals =
    mealFilter === '전체'
      ? dayObj.meals
      : dayObj.meals.filter((m) => m.mealType === mealFilter);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-[#C2410C]">매일 확인 · 학생회관 1층 식단표</div>
          <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">학식 1주일치 메뉴</h2>
          <p className="text-xs text-[#64748B] mt-1">
            조식 08:00–09:30 · 중식 11:30–14:00 · 석식 17:00–18:40
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day Segmented Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            {WEEKLY_MEALS.map((d) => (
              <button
                key={d.day}
                type="button"
                onClick={() => setSelectedDay(d.day)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedDay === d.day
                    ? 'bg-white text-[#1E293B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {d.day}
                {d.day === '목' ? ' · 오늘' : ''}
              </button>
            ))}
          </div>

          {/* Meal Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
            {(['전체', '조식', '중식', '석식'] as MealFilter[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealFilter(type)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  mealFilter === type
                    ? 'bg-[#FFF2E8] text-[#C2410C]'
                    : 'text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Title */}
      <div className="text-sm font-semibold text-[#475569] px-1">{dayObj.dateLabel} 식단</div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMeals.map((meal, idx) => (
          <article
            key={`${meal.cornerName}-${idx}`}
            className="bg-white border border-[#E6EAF2] rounded-2xl p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#64748B]">
                  <span className={`px-2 py-0.5 rounded-md font-semibold ${MEAL_TYPE_STYLES[meal.mealType]}`}>
                    {meal.mealType}
                  </span>
                  <span>{meal.cornerName}</span>
                </div>
                <span className="text-sm font-bold font-mono-num text-[#1E293B]">
                  {meal.price.toLocaleString()}원
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#1E293B] mt-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[#FB923C] shrink-0" />
                <span>{meal.mainDish}</span>
              </h3>

              <div className="mt-3 pt-3 border-t border-[#F1F5F9] text-sm text-[#475569]">
                반찬 구성: {meal.sideDishes.join(' · ')}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F1F5F9]">
              <span>알레르기 유발: {meal.allergens}</span>
              <span className="font-mono-num">{meal.calories} kcal</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
