import { useState, useEffect, useMemo } from 'react';
import { Heart, Plus, Trash2, Calendar, Edit } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { getLunar } from 'chinese-lunar-calendar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

interface Anniversary {
  id: string;
  name: string;
  date: string;
  type: 'solar' | 'lunar';
  icon: string;
  repeat: boolean;
}

const ANNIVERSARY_ICONS = ['💖', '🎂', '🎉', '💍', '🎓', '🏆', '🌟', '🎈', '🌹', '💝'];

interface AnniversaryPageProps {
  theme: string;
}

export function AnniversaryPage({ theme }: AnniversaryPageProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  // 将newDate拆分为年、月、日三个状态
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newMonth, setNewMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [newDay, setNewDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [dateType, setDateType] = useState<'solar' | 'lunar'>('solar');
  const [selectedIcon, setSelectedIcon] = useState(ANNIVERSARY_ICONS[0]);
  const [newRepeat, setNewRepeat] = useState(true);
  // 编辑功能状态管理
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string>('');

  // 检查并更新重复的纪念日
  const checkAndUpdateAnniversaries = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updatedAnniversaries = anniversaries.map(anniversary => {
      // 如果不重复，直接返回原纪念日
      if (!anniversary.repeat) {
        return anniversary;
      }
      
      // 解析纪念日日期
      const [year, month, day] = anniversary.date.split('-').map(Number);
      const anniversaryDate = new Date(year, month - 1, day);
      anniversaryDate.setHours(0, 0, 0, 0);
      
      // 如果纪念日已过去，更新为下一年的时间
      if (anniversaryDate < today) {
        const nextYear = year + 1;
        return {
          ...anniversary,
          date: `${nextYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        };
      }
      
      return anniversary;
    });
    
    // 如果有纪念日被更新，保存到localStorage并更新状态
    if (JSON.stringify(updatedAnniversaries) !== JSON.stringify(anniversaries)) {
      saveAnniversaries(updatedAnniversaries);
    }
  };
  
  useEffect(() => {
    const stored = localStorage.getItem('anniversaries');
    if (stored) {
      setAnniversaries(JSON.parse(stored));
    }
  }, []);
  
  // 当纪念日列表变化时，检查并更新重复的纪念日
  useEffect(() => {
    if (anniversaries.length > 0) {
      checkAndUpdateAnniversaries();
    }
  }, [anniversaries]);
  
  // 每天检查一次，更新重复的纪念日
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndUpdateAnniversaries();
    }, 24 * 60 * 60 * 1000); // 24小时
    
    return () => clearInterval(interval);
  }, [anniversaries]);

  const saveAnniversaries = (data: Anniversary[]) => {
    setAnniversaries(data);
    localStorage.setItem('anniversaries', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!newName || !newYear || !newMonth || !newDay) return;

    // 构建日期字符串 YYYY-MM-DD 格式
    const dateStr = `${newYear}-${newMonth}-${newDay}`;

    const anniversary: Anniversary = {
      id: Date.now().toString(),
      name: newName,
      date: dateStr,
      type: dateType,
      icon: selectedIcon,
      repeat: newRepeat,
    };

    saveAnniversaries([...anniversaries, anniversary]);
  };

  const handleDelete = (id: string) => {
    saveAnniversaries(anniversaries.filter(a => a.id !== id));
  };

  // 将农历数字转换为传统中文格式
  const formatLunarDate = (year: number, month: number, day: number) => {
    // 农历月份名称
    const lunarMonths = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
    // 农历日期名称
    const lunarDays = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                       '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                       '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    
    return `${lunarMonths[month]}${lunarDays[day]}`;
  };
  
  // 农历转公历日期的近似计算（基于已知的2026年农历十月初九的结果）
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

  // 使用useMemo缓存生成的年份选项，避免每次渲染都重新生成
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 100;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    return years;
  }, []);

  // 使用useMemo缓存生成的月份选项，避免每次渲染都重新生成
  const monthOptions = useMemo(() => {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push(month.toString().padStart(2, '0'));
    }
    return months;
  }, []);

  // 使用useMemo缓存生成的日期选项，当newYear或newMonth变化时才重新生成
  const dayOptions = useMemo(() => {
    const year = parseInt(newYear);
    const month = parseInt(newMonth);
    // 计算当月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day.toString().padStart(2, '0'));
    }
    return days;
  }, [newYear, newMonth]);

  // 计算每个纪念日的天数差，用于排序
  const getDaysDifference = (dateStr: string, dateType: 'solar' | 'lunar'): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let anniversaryMonth: number;
    let anniversaryDay: number;
    
    if (dateType === 'lunar') {
      try {
        // 解析存储的农历日期 (格式: YYYY-MM-DD)
        const [lunarYear, lunarMonth, lunarDay] = dateStr.split('-').map(Number);
        
        // 将农历日期转换为公历日期
        const solarDate = lunarToSolar(lunarYear, lunarMonth, lunarDay);
        
        // 获取农历对应的公历月日
        anniversaryMonth = solarDate.getMonth();
        anniversaryDay = solarDate.getDate();
      } catch (error) {
        console.error('农历日期计算错误:', error);
        const storedDate = new Date(dateStr);
        anniversaryMonth = storedDate.getMonth();
        anniversaryDay = storedDate.getDate();
      }
    } else {
      // 公历日期的处理逻辑
      const storedDate = new Date(dateStr);
      anniversaryMonth = storedDate.getMonth();
      anniversaryDay = storedDate.getDate();
    }

    // 计算今年的目标日期
    const targetThisYear = new Date(today.getFullYear(), anniversaryMonth, anniversaryDay);
    
    // 计算目标日期与今天的天数差
    return differenceInDays(targetThisYear, today);
  };

  // 排序后的纪念日列表：离最近的排上面，已过去的排最后
  const sortedAnniversaries = useMemo(() => {
    return [...anniversaries].sort((a, b) => {
      const daysA = getDaysDifference(a.date, a.type);
      const daysB = getDaysDifference(b.date, b.type);
      
      // 排序规则：
      // 1. 今天的纪念日排在最前面
      // 2. 未来的纪念日按天数差升序排列（离今天越近越靠前）
      // 3. 过去的纪念日按天数差降序排列（离今天越近越靠前）
      if (daysA === 0) return -1;
      if (daysB === 0) return 1;
      
      if (daysA > 0 && daysB > 0) {
        // 两个都是未来日期，按天数差升序
        return daysA - daysB;
      } else if (daysA > 0 && daysB <= 0) {
        // A是未来，B是过去或今天，A排在前面
        return -1;
      } else if (daysA <= 0 && daysB > 0) {
        // A是过去或今天，B是未来，B排在前面
        return 1;
      } else {
        // 两个都是过去日期，按天数差降序（离今天越近越靠前）
        return daysB - daysA;
      }
    });
  }, [anniversaries]);

  const formatDate = (dateStr: string, dateType: 'solar' | 'lunar') => {
    if (dateType === 'lunar') {
      // 解析农历日期 (格式: YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-').map(Number);
      return formatLunarDate(year, month, day);
    } else {
      // 公历日期使用date-fns格式化
      return format(new Date(dateStr), 'yyyy年 M月 d日', { locale: zhCN });
    }
  };

  const getDaysInfo = (dateStr: string, dateType: 'solar' | 'lunar') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let anniversaryMonth: number;
    let anniversaryDay: number;
    
    if (dateType === 'lunar') {
      try {
        // 解析存储的农历日期 (格式: YYYY-MM-DD)
        const [lunarYear, lunarMonth, lunarDay] = dateStr.split('-').map(Number);
        
        // 将农历日期转换为公历日期
        const solarDate = lunarToSolar(lunarYear, lunarMonth, lunarDay);
        
        // 获取农历对应的公历月日
        anniversaryMonth = solarDate.getMonth();
        anniversaryDay = solarDate.getDate();
      } catch (error) {
        console.error('农历日期计算错误:', error);
        const storedDate = new Date(dateStr);
        anniversaryMonth = storedDate.getMonth();
        anniversaryDay = storedDate.getDate();
      }
    } else {
      // 公历日期的处理逻辑
      const storedDate = new Date(dateStr);
      anniversaryMonth = storedDate.getMonth();
      anniversaryDay = storedDate.getDate();
    }

    // 计算今年的目标日期
    const targetThisYear = new Date(today.getFullYear(), anniversaryMonth, anniversaryDay);
    
    // 计算目标日期与今天的天数差
    const daysToThisYear = differenceInDays(targetThisYear, today);
    
    if (daysToThisYear > 0) {
      // 未来时间 - 显示倒数天数
      return { text: `还有 ${daysToThisYear} 天`, color: 'from-blue-400 to-purple-400' };
    } else if (daysToThisYear === 0) {
      // 今天
      return { text: '就是今天！', color: 'from-pink-400 to-red-400' };
    } else {
      // 过去时间 - 显示已过去的天数
      const daysPassed = Math.abs(daysToThisYear);
      return { text: `已过去 ${daysPassed} 天`, color: 'from-gray-400 to-gray-500' };
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-rose-400 to-red-400 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-7 h-7" />
          纪念日提醒
        </h1>
        <p className="text-sm text-white/80 mt-1">记录每一个重要时刻</p>
      </div>

      {/* Anniversaries List */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {anniversaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 mb-2">还没有添加纪念日</p>
              <p className="text-sm text-gray-400">点击下方按钮添加第一个纪念日吧！</p>
            </div>
          ) : (
            sortedAnniversaries.map(anniversary => {
              const daysInfo = getDaysInfo(anniversary.date, anniversary.type);
              return (
                <div
                  key={anniversary.id}
                  className="bg-white rounded-2xl p-4 shadow-md border-2 border-pink-200 hover:shadow-lg transition-all"
                >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 flex items-center justify-center text-3xl shadow-md flex-shrink-0">
                    {anniversary.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1 truncate">
                      {anniversary.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(anniversary.date, anniversary.type)}</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" 
                        style={{ backgroundColor: anniversary.type === 'lunar' ? '#FFB6C140' : '#98D8C840' }}>
                        {anniversary.type === 'lunar' ? '农历' : '公历'}
                      </span>
                    </div>
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${daysInfo.color} text-white font-semibold shadow-md`}>
                      {daysInfo.text}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // 设置编辑模式
                      setIsEditMode(true);
                      setEditingId(anniversary.id);
                      
                      // 填充表单字段
                      setNewName(anniversary.name);
                      const [year, month, day] = anniversary.date.split('-');
                      setNewYear(year);
                      setNewMonth(month);
                      setNewDay(day);
                      setDateType(anniversary.type);
                      setSelectedIcon(anniversary.icon);
                      setNewRepeat(anniversary.repeat);
                      
                      // 打开对话框
                      setIsDialogOpen(true);
                    }}
                    className="flex-shrink-0 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-full mr-2"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(anniversary.id)}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Button */}
      <div className="p-4">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg h-14 text-lg font-semibold"
        >
          <Plus className="w-6 h-6 mr-2" />
          添加纪念日
        </Button>
      </div>

      {/* Add Anniversary Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-br from-pink-50 to-rose-50 border-4 border-pink-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              {isEditMode ? '✏️ 编辑纪念日' : '💖 添加纪念日'}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {isEditMode ? '修改纪念日的详细信息' : '添加一个新的纪念日'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                选择图标
              </label>
              <div className="grid grid-cols-5 gap-2">
                {ANNIVERSARY_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`text-3xl p-3 rounded-2xl transition-all hover:scale-110
                      ${selectedIcon === icon
                        ? 'bg-gradient-to-br from-pink-200 to-rose-200 shadow-lg scale-110 ring-2 ring-pink-400'
                        : 'bg-white/60 hover:bg-white/80'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                纪念日名称
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：我们的相识纪念日"
                className="rounded-2xl border-2 border-pink-200 focus:border-pink-400 bg-white/60"
              />
            </div>

            {/* Date Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                日期类型
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateType('solar')}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${dateType === 'solar' ? 'bg-gradient-to-r from-teal-400 to-green-400 text-white shadow-md' : 'bg-white/60 hover:bg-white/80 border-2 border-gray-200'}`}
                >
                  📅 公历
                </button>
                <button
                  onClick={() => setDateType('lunar')}
                  className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${dateType === 'lunar' ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md' : 'bg-white/60 hover:bg-white/80 border-2 border-gray-200'}`}
                >
                  🌙 农历
                </button>
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {dateType === 'solar' ? '公历日期' : '农历日期'}
              </label>
              <div className="flex gap-3">
                {/* 年份选择 */}
                <select
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className={`flex-1 rounded-2xl border-2 focus:border-pink-400 bg-white/60 ${dateType === 'lunar' ? 'border-pink-400 shadow-md' : 'border-pink-200'} px-3 py-2 text-gray-800 appearance-none bg-right bg-contain bg-no-repeat`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center' }}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}年
                    </option>
                  ))}
                </select>
                
                {/* 月份选择 - 根据日期类型显示不同格式 */}
                <select
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                  className={`flex-1 rounded-2xl border-2 focus:border-pink-400 bg-white/60 ${dateType === 'lunar' ? 'border-pink-400 shadow-md' : 'border-pink-200'} px-3 py-2 text-gray-800 appearance-none bg-right bg-contain bg-no-repeat`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center' }}
                >
                  {monthOptions.map(month => {
                    const monthNum = parseInt(month);
                    const monthDisplay = dateType === 'lunar' ? 
                      ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'][monthNum] : 
                      `${monthNum}月`;
                    return (
                      <option key={month} value={month}>
                        {monthDisplay}
                      </option>
                    );
                  })}
                </select>
                
                {/* 日期选择 - 根据日期类型显示不同格式 */}
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className={`flex-1 rounded-2xl border-2 focus:border-pink-400 bg-white/60 ${dateType === 'lunar' ? 'border-pink-400 shadow-md' : 'border-pink-200'} px-3 py-2 text-gray-800 appearance-none bg-right bg-contain bg-no-repeat`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239CA3AF\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center' }}
                >
                  {dayOptions.map(day => {
                    const dayNum = parseInt(day);
                    const dayDisplay = dateType === 'lunar' ? 
                      ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                       '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                       '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'][dayNum] : 
                      `${dayNum}日`;
                    return (
                      <option key={day} value={day}>
                        {dayDisplay}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Repeat Selection */}
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  重复设置
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewRepeat(true)}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${newRepeat ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md' : 'bg-white/60 hover:bg-white/80 border-2 border-gray-200'}`}
                  >
                    🔄 重复
                  </button>
                  <button
                    onClick={() => setNewRepeat(false)}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${!newRepeat ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md' : 'bg-white/60 hover:bg-white/80 border-2 border-gray-200'}`}
                  >
                    ⏹️ 不重复
                  </button>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  // 重置表单和状态
                  setNewName('');
                  const now = new Date();
                  setNewYear(now.getFullYear().toString());
                  setNewMonth((now.getMonth() + 1).toString().padStart(2, '0'));
                  setNewDay(now.getDate().toString().padStart(2, '0'));
                  setDateType('solar');
                  setSelectedIcon(ANNIVERSARY_ICONS[0]);
                  setNewRepeat(true);
                  setIsEditMode(false);
                  setEditingId('');
                  setIsDialogOpen(false);
                }}
                className="flex-1 rounded-full border-2 border-gray-300 hover:bg-gray-100"
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  // 调用handleAdd或handleEdit
                  if (isEditMode) {
                    // 编辑模式
                    const updatedAnniversaries = anniversaries.map(anniversary => {
                      if (anniversary.id === editingId) {
                        const dateStr = `${newYear}-${newMonth}-${newDay}`;
                        return {
                          ...anniversary,
                          name: newName,
                          date: dateStr,
                          type: dateType,
                          icon: selectedIcon,
                          repeat: newRepeat
                        };
                      }
                      return anniversary;
                    });
                    
                    saveAnniversaries(updatedAnniversaries);
                  } else {
                    // 添加模式
                    handleAdd();
                  }
                  
                  // 重置表单和状态
                  setNewName('');
                  const now = new Date();
                  setNewYear(now.getFullYear().toString());
                  setNewMonth((now.getMonth() + 1).toString().padStart(2, '0'));
                  setNewDay(now.getDate().toString().padStart(2, '0'));
                  setDateType('solar');
                  setSelectedIcon(ANNIVERSARY_ICONS[0]);
                  setNewRepeat(true);
                  setIsEditMode(false);
                  setEditingId('');
                  setIsDialogOpen(false);
                }}
                disabled={!newName || !newYear || !newMonth || !newDay}
                className="flex-1 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg disabled:opacity-50"
              >
                {isEditMode ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}