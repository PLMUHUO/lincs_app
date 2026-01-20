import { useState, useEffect } from 'react';
import { CheckInPage } from '@/app/components/CheckInPage';
import { AnniversaryPage } from '@/app/components/AnniversaryPage';
import { ProfilePage } from '@/app/components/ProfilePage';
import { Calendar, Heart, User } from 'lucide-react';

const THEMES = [
  { 
    id: 'cute', 
    name: '可爱卡通', 
    icon: '🎀',
    gradient: 'from-pink-400 via-purple-400 to-blue-400',
    bgGradient: 'from-pink-50 via-purple-50 to-blue-50'
  },
  { 
    id: 'nature', 
    name: '清新自然', 
    icon: '🌿',
    gradient: 'from-green-400 via-emerald-400 to-teal-400',
    bgGradient: 'from-green-50 via-emerald-50 to-teal-50'
  },
  { 
    id: 'ocean', 
    name: '海洋蓝调', 
    icon: '🌊',
    gradient: 'from-blue-400 via-cyan-400 to-sky-400',
    bgGradient: 'from-blue-50 via-cyan-50 to-sky-50'
  },
  { 
    id: 'sunset', 
    name: '日落余晖', 
    icon: '🌅',
    gradient: 'from-orange-400 via-red-400 to-pink-400',
    bgGradient: 'from-orange-50 via-red-50 to-pink-50'
  },
  { 
    id: 'forest', 
    name: '森林童话', 
    icon: '🌲',
    gradient: 'from-lime-400 via-green-400 to-emerald-400',
    bgGradient: 'from-lime-50 via-green-50 to-emerald-50'
  },
  { 
    id: 'lavender', 
    name: '薰衣草梦', 
    icon: '💜',
    gradient: 'from-purple-400 via-violet-400 to-fuchsia-400',
    bgGradient: 'from-purple-50 via-violet-50 to-fuchsia-50'
  },
];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('cute');

  useEffect(() => {
    const stored = localStorage.getItem('userSettings');
    if (stored) {
      const settings = JSON.parse(stored);
      setTheme(settings.theme || 'cute');
    }
  }, []);

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const tabs = [
    { icon: Calendar, label: '打卡', component: <CheckInPage theme={theme} /> },
    { icon: Heart, label: '纪念日', component: <AnniversaryPage theme={theme} /> },
    { icon: User, label: '我的', component: <ProfilePage theme={theme} /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {tabs[activeTab].component}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t-2 border-gray-100 shadow-2xl rounded-t-3xl">
        <div className="flex items-center justify-around px-6 py-3">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all
                  ${isActive ? 'scale-110' : 'scale-100 opacity-60'}`}
              >
                <div className={`p-2 rounded-full transition-all
                  ${isActive 
                    ? `bg-gradient-to-r ${currentTheme.gradient} shadow-lg` 
                    : 'bg-gray-100'}`}
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`}
                  />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
