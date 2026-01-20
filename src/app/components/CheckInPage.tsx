import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, startOfYear, endOfYear, addYears, subYears, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { getLunar } from 'chinese-lunar-calendar';
import { CheckInDialog } from '@/app/components/CheckInDialog';
import { Button } from '@/app/components/ui/button';

interface CheckIn {
  id: string;
  date: string;
  time: string;
  mood: string;
  note: string;
  type: string;
}

// 纪念日接口定义
interface Anniversary {
  id: string;
  name: string;
  date: string;
  type: 'solar' | 'lunar';
  icon: string;
  repeat: boolean;
}

interface CheckInPageProps {
  theme: string;
}

const MOOD_ICONS = ['😊', '😄', '🥰', '😎', '🤗', '😌', '🤩', '😇'];
const CHECK_IN_TYPES = [
  { id: 'study', name: '学习', icon: '📚', color: '#FFB6C1' },
  { id: 'exercise', name: '运动', icon: '💪', color: '#98D8C8' },
  { id: 'reading', name: '阅读', icon: '📖', color: '#F7DC6F' },
  { id: 'meditation', name: '冥想', icon: '🧘', color: '#BB8FCE' },
];

export function CheckInPage({ theme }: CheckInPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // 纪念日状态
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('checkIns');
    if (stored) {
      setCheckIns(JSON.parse(stored));
    }
  }, []);

  // 加载纪念日数据
  useEffect(() => {
    const stored = localStorage.getItem('anniversaries');
    if (stored) {
      setAnniversaries(JSON.parse(stored));
    }
  }, []);

  const saveCheckIn = (checkIn: CheckIn) => {
    const updated = [...checkIns, checkIn];
    setCheckIns(updated);
    localStorage.setItem('checkIns', JSON.stringify(updated));
  };

  const deleteCheckIn = (id: string) => {
    const updated = checkIns.filter(checkIn => checkIn.id !== id);
    setCheckIns(updated);
    localStorage.setItem('checkIns', JSON.stringify(updated));
  };

  const getCheckInsForDate = (date: Date) => {
    return checkIns.filter(c => isSameDay(new Date(c.date), date));
  };

  const getTypeStreak = (type: string) => {
    const typeCheckIns = checkIns.filter(c => c.type === type).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const checkIn of typeCheckIns) {
      const checkInDate = new Date(checkIn.date);
      checkInDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // 农历转公历日期的近似计算
  const lunarToSolar = (lunarYear: number, lunarMonth: number, lunarDay: number): Date => {
    // 已知：2026年农历十月初九对应的公历是2026年11月18日
    // 这个简单的实现假设每个农历月对应30天的公历日
    // 更精确的实现需要完整的农历日历算法或查表
    const baseYear = 2026;
    const baseMonth = 11;
    const baseDay = 18;
    const baseLunarMonth = 10;
    const baseLunarDay = 9;
    
    // 计算与基准日期的差值
    const yearDiff = lunarYear - baseYear;
    const monthDiff = lunarMonth - baseLunarMonth;
    const dayDiff = lunarDay - baseLunarDay;
    
    // 计算目标日期
    const targetDate = new Date(baseYear + yearDiff, baseMonth - 1, baseDay + monthDiff * 30 + dayDiff);
    
    return targetDate;
  };

  // 检查日期是否有纪念日
  const getAnniversariesForDate = (date: Date): Anniversary[] => {
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);
    
    return anniversaries.filter(anniversary => {
      const [year, month, day] = anniversary.date.split('-').map(Number);
      
      if (anniversary.type === 'solar') {
        // 公历日期比较
        const anniversaryDate = new Date(date.getFullYear(), month - 1, day);
        anniversaryDate.setHours(0, 0, 0, 0);
        return isSameDay(anniversaryDate, today);
      } else {
        // 农历日期比较
        try {
          // 将公历日期转换为农历日期
          const lunarResult = getLunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
          return lunarResult.lunarMonth === month && 
                 lunarResult.lunarDate === day;
        } catch (error) {
          console.error('农历日期计算错误:', error);
          return false;
        }
      }
    });
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    const weeks = [];
    let week = [];

    for (let i = 0; i < startDay; i++) {
      week.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    days.forEach((day, idx) => {
      const dayCheckIns = getCheckInsForDate(day);
      const hasCheckIn = dayCheckIns.length > 0;
      const dayAnniversaries = getAnniversariesForDate(day);
      const hasAnniversary = dayAnniversaries.length > 0;

      week.push(
        <div
                  key={idx}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all relative
                    ${isSameDay(day, new Date()) ? 'bg-gradient-to-br from-pink-300 to-purple-300 shadow-lg scale-105' : ''}
                    ${isSameDay(day, selectedDate) && !isSameDay(day, new Date()) ? 'bg-gradient-to-br from-blue-300 to-teal-300 shadow-lg scale-105' : ''}
                    ${!isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? 'bg-white/60 hover:bg-white/80' : ''}
                    ${hasCheckIn ? 'ring-2 ring-yellow-400' : ''}
                    ${hasAnniversary ? 'ring-2 ring-pink-400' : ''}`}
                  onClick={() => {
                    setSelectedDate(day);
                  }}
                >
          <span className={`text-sm ${(isSameDay(day, new Date()) || isSameDay(day, selectedDate)) ? 'text-white font-bold' : 'text-gray-700'}`}>
            {format(day, 'd')}
          </span>
          {hasCheckIn && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs">✨</span>
            </div>
          )}
          {hasAnniversary && (
            <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full flex items-center justify-center shadow-md">
              <span className="text-xs">💖</span>
            </div>
          )}
        </div>
      );

      if (week.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
            {week}
          </div>
        );
        week = [];
      }
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(<div key={`empty-end-${week.length}`} className="aspect-square" />);
      }
      weeks.push(
        <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
          {week}
        </div>
      );
    }

    return weeks;
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(yearStart, i);
      const monthCheckIns = checkIns.filter(c => {
        const checkInDate = new Date(c.date);
        return checkInDate.getMonth() === i && checkInDate.getFullYear() === currentDate.getFullYear();
      });

      months.push(
        <div
          key={i}
          className="bg-white/60 rounded-2xl p-4 cursor-pointer hover:bg-white/80 transition-all"
          onClick={() => {
            setCurrentDate(monthDate);
            setViewMode('month');
          }}
        >
          <div className="font-medium text-gray-700 mb-2">{format(monthDate, 'MMM', { locale: zhCN })}</div>
          <div className="text-2xl font-bold text-pink-500">{monthCheckIns.length}</div>
          <div className="text-xs text-gray-500">打卡次数</div>
        </div>
      );
    }

    return <div className="grid grid-cols-3 gap-3">{months}</div>;
  };

  const selectedDateCheckIns = getCheckInsForDate(selectedDate);
  const selectedDateAnniversaries = getAnniversariesForDate(selectedDate);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7" />
            每日打卡
          </h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('month')}
              className="rounded-full text-white hover:bg-white/20"
            >
              月
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'year' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('year')}
              className="rounded-full text-white hover:bg-white/20"
            >
              年
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subYears(currentDate, 1))}
            className="rounded-full text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-xl font-semibold">
            {viewMode === 'month' 
              ? format(currentDate, 'yyyy年 M月', { locale: zhCN })
              : format(currentDate, 'yyyy年', { locale: zhCN })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addYears(currentDate, 1))}
            className="rounded-full text-white hover:bg-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'month' && (
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            {renderMonthView()}
          </div>
        )}

        {viewMode === 'year' && renderYearView()}

        {/* Selected Date's Anniversaries */}
        {selectedDateAnniversaries.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span>💖</span>
              {format(selectedDate, 'yyyy年 M月 d日', { locale: zhCN })} 纪念日
            </h3>
            {selectedDateAnniversaries.map(anniversary => (
              <div
                key={anniversary.id}
                className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-4 border-2 border-pink-300 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                    {anniversary.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-base mb-1 truncate">
                      {anniversary.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{anniversary.type === 'lunar' ? '农历' : '公历'}</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-pink-200 text-pink-700">
                        {anniversary.repeat ? '每年重复' : '仅一次'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Date's Check-ins */}
        {selectedDateCheckIns.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <span>🎯</span>
              {format(selectedDate, 'yyyy年 M月 d日', { locale: zhCN })} 打卡记录
            </h3>
            {selectedDateCheckIns.map(checkIn => {
              const type = CHECK_IN_TYPES.find(t => t.id === checkIn.type);
              const streak = getTypeStreak(checkIn.type);
              
              return (
                <div
                  key={checkIn.id}
                  className="bg-white rounded-2xl p-4 shadow-md border-2 border-pink-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-2xl shadow-md">
                      {checkIn.mood}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{type?.icon}</span>
                          <span className="font-semibold text-gray-700">{type?.name}</span>
                          <span className="text-xs text-gray-500">{checkIn.time}</span>
                        </div>
                        <button
                          onClick={() => deleteCheckIn(checkIn.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{checkIn.note}</p>
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" 
                        style={{ backgroundColor: type?.color + '40', color: type?.color }}>
                        <span>🔥</span>
                        已坚持 {streak} 天
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Check-in Button */}
      <button
        onClick={() => {
          setIsDialogOpen(true);
        }}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-transform z-50"
        style={{
          animation: 'bounce 2s infinite',
        }}
      >
        ✨
      </button>

      <CheckInDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedDate={selectedDate}
        onSave={saveCheckIn}
        moodIcons={MOOD_ICONS}
        checkInTypes={CHECK_IN_TYPES}
        checkIns={checkIns}
      />

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}