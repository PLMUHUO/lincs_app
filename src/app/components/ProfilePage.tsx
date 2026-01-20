import { useState, useEffect } from 'react';
import { User, Palette, Camera } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

interface UserSettings {
  nickname: string;
  avatar: string;
}

interface ProfilePageProps {
  theme: string;
}

// 随机头像表情列表
const RANDOM_AVATARS = ['😊', '🥰', '😎', '🤗', '🌟', '🎨', '🎭', '🦄', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'];

export function ProfilePage({ theme }: ProfilePageProps) {
  const [settings, setSettings] = useState<UserSettings>({
    nickname: '打卡达人',
    avatar: '',
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings(parsed);
    } else {
      // 首次使用时随机生成头像
      const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
      const defaultSettings: UserSettings = {
        nickname: '打卡达人',
        avatar: randomAvatar
      };
      setSettings(defaultSettings);
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    }
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handleNicknameChange = (nickname: string) => {
    const newSettings = { ...settings, nickname };
    saveSettings(newSettings);
    setIsEditingNickname(false);
  };

  // 头像上传功能
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSettings = { ...settings, avatar: event.target?.result as string };
        saveSettings(newSettings);
      };
      reader.readAsDataURL(file);
    }
  };

  // 随机更换头像功能
  const handleRandomAvatar = () => {
    const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
    const newSettings = { ...settings, avatar: randomAvatar };
    saveSettings(newSettings);
  };

  // 成就系统逻辑
  const getAchievements = () => {
    // 获取用户数据
    const checkIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    const anniversaries = JSON.parse(localStorage.getItem('anniversaries') || '[]');
    
    // 计算统计数据
    const totalCheckIns = checkIns.length;
    const totalAnniversaries = anniversaries.length;
    
    // 获取连续打卡天数
    const calculateStreak = () => {
      if (checkIns.length === 0) return 0;
      
      const sortedCheckIns = [...checkIns].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      let streak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sortedCheckIns.length - 1; i++) {
        const currentDate = new Date(sortedCheckIns[i].date);
        currentDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(sortedCheckIns[i + 1].date);
        nextDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };
    
    const streak = calculateStreak();
    
    // 定义成就列表
    const achievements = [
      {
        id: 'first_check_in',
        name: '首次打卡',
        description: '完成第一次打卡',
        icon: '✨',
        target: 1,
        progress: Math.min(totalCheckIns, 1),
        unit: '次打卡',
        unlocked: totalCheckIns >= 1
      },
      {
        id: 'five_check_ins',
        name: '坚持一周',
        description: '连续打卡5天',
        icon: '🌟',
        target: 5,
        progress: Math.min(streak, 5),
        unit: '天连续打卡',
        unlocked: streak >= 5
      },
      {
        id: 'ten_check_ins',
        name: '打卡达人',
        description: '累计打卡10次',
        icon: '🏆',
        target: 10,
        progress: Math.min(totalCheckIns, 10),
        unit: '次打卡',
        unlocked: totalCheckIns >= 10
      },
      {
        id: 'one_month',
        name: '月度达人',
        description: '连续打卡30天',
        icon: '🔥',
        target: 30,
        progress: Math.min(streak, 30),
        unit: '天连续打卡',
        unlocked: streak >= 30
      },
      {
        id: 'first_anniversary',
        name: '第一次纪念',
        description: '添加第一个纪念日',
        icon: '❤️',
        target: 1,
        progress: Math.min(totalAnniversaries, 1),
        unit: '个纪念日',
        unlocked: totalAnniversaries >= 1
      },
      {
        id: 'five_anniversaries',
        name: '纪念收藏家',
        description: '添加5个纪念日',
        icon: '🎁',
        target: 5,
        progress: Math.min(totalAnniversaries, 5),
        unit: '个纪念日',
        unlocked: totalAnniversaries >= 5
      },
      {
        id: 'hundred_check_ins',
        name: '百日达人',
        description: '累计打卡100次',
        icon: '💎',
        target: 100,
        progress: Math.min(totalCheckIns, 100),
        unit: '次打卡',
        unlocked: totalCheckIns >= 100
      },
      {
        id: 'year_streak',
        name: '年度达人',
        description: '连续打卡365天',
        icon: '🎉',
        target: 365,
        progress: Math.min(streak, 365),
        unit: '天连续打卡',
        unlocked: streak >= 365
      }
    ];
    
    return achievements;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white p-6 rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7" />
          个人中心
        </h1>
        <p className="text-sm text-white/80 mt-1">个性化你的打卡体验</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-pink-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>👤</span>
            个人信息
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-5xl shadow-lg">
                {settings.avatar && settings.avatar.startsWith('data:') ? (
                  <img 
                    src={settings.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  settings.avatar
                )}
              </div>
              <button
                onClick={handleRandomAvatar}
                className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                title="随机更换头像"
              >
                🔄
              </button>
            </div>
            
            <div className="flex gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-pink-400 to-purple-400 shadow-md cursor-pointer hover:from-pink-500 hover:to-purple-500 transition-all">
                <Camera className="w-4 h-4" />
                上传头像
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRandomAvatar}
                className="px-4 py-2 rounded-xl font-medium border-2 border-pink-200 hover:bg-pink-50 transition-all"
              >
                随机头像
              </button>
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              昵称
            </label>
            {isEditingNickname ? (
              <div className="flex gap-2">
                <Input
                  defaultValue={settings.nickname}
                  onBlur={(e) => handleNicknameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNicknameChange(e.currentTarget.value);
                    }
                  }}
                  className="rounded-2xl border-2 border-pink-200 focus:border-pink-400"
                  autoFocus
                />
              </div>
            ) : (
              <div
                onClick={() => setIsEditingNickname(true)}
                className="p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{settings.nickname}</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-pink-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>🏆</span>
            我的成就
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {JSON.parse(localStorage.getItem('checkIns') || '[]').length}
              </div>
              <div className="text-xs text-gray-500 mt-1">总打卡</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {JSON.parse(localStorage.getItem('anniversaries') || '[]').length}
              </div>
              <div className="text-xs text-gray-500 mt-1">纪念日</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {getAchievements().filter(a => a.unlocked).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">已解锁勋章</div>
            </div>
          </div>

          {/* Achievements List */}
          <div className="space-y-3">
            {getAchievements().map(achievement => (
              <div 
                key={achievement.id} 
                className={`p-3 rounded-xl border-2 transition-all ${achievement.unlocked ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-300 to-orange-300' : 'bg-gray-200'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-700">{achievement.name}</div>
                      <span className={`text-xs font-medium ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                        {achievement.unlocked ? '已解锁' : '未解锁'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.target} {achievement.unit}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
