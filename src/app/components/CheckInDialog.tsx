import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { X } from 'lucide-react';

interface CheckIn {
  id: string;
  date: string;
  time: string;
  mood: string;
  note: string;
  type: string;
}

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onSave: (checkIn: any) => void;
  moodIcons: string[];
  checkInTypes: Array<{ id: string; name: string; icon: string; color: string }>;
  checkIns: CheckIn[];
}

export function CheckInDialog({ 
  open, 
  onOpenChange, 
  selectedDate, 
  onSave, 
  moodIcons,
  checkInTypes,
  checkIns
}: CheckInDialogProps) {
  const [selectedMood, setSelectedMood] = useState(moodIcons[0]);
  const [selectedType, setSelectedType] = useState(checkInTypes[0].id);
  const [note, setNote] = useState('');

  // 当对话框打开且选择日期变化时，加载该日期的打卡记录
  useEffect(() => {
    if (open) {
      // 查找所选日期的最新打卡记录
      const dateCheckIns = checkIns.filter(checkIn => 
        isSameDay(new Date(checkIn.date), selectedDate)
      );
      
      if (dateCheckIns.length > 0) {
        // 按时间排序，获取最新的打卡记录
        const latestCheckIn = dateCheckIns.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        // 加载最新记录的信息
        setNote(latestCheckIn.note);
        setSelectedMood(latestCheckIn.mood);
        setSelectedType(latestCheckIn.type);
      } else {
        // 如果没有记录，则清空状态
        setNote('');
        setSelectedMood(moodIcons[0]);
        setSelectedType(checkInTypes[0].id);
      }
    }
  }, [open, selectedDate, moodIcons, checkInTypes, checkIns]);

  const handleSave = () => {
    const checkIn = {
      id: Date.now().toString(),
      date: selectedDate.toISOString(),
      time: format(new Date(), 'HH:mm'),
      mood: selectedMood,
      note,
      type: selectedType,
    };
    onSave(checkIn);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gradient-to-br from-pink-50 to-purple-50 border-4 border-pink-200 rounded-3xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            ✨ 每日打卡 ✨
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            记录你的打卡心情和内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date and Time */}
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {format(selectedDate, 'yyyy年 M月 d日 EEEE', { locale: zhCN })}
            </div>
            <div className="text-3xl font-bold text-pink-500 mt-1">
              {format(new Date(), 'HH:mm')}
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <span className="mr-1">😊</span>
              选择心情
            </label>
            <div className="grid grid-cols-4 gap-2">
              {moodIcons.map(mood => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`text-4xl p-3 rounded-2xl transition-all hover:scale-110
                    ${selectedMood === mood 
                      ? 'bg-gradient-to-br from-yellow-200 to-pink-200 shadow-lg scale-110 ring-2 ring-pink-400' 
                      : 'bg-white/60 hover:bg-white/80'}`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <span className="mr-1">📝</span>
              打卡类型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {checkInTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-2xl transition-all hover:scale-105 flex items-center gap-2 justify-center font-medium
                    ${selectedType === type.id
                      ? 'shadow-lg scale-105 ring-2 ring-offset-2'
                      : 'bg-white/60 hover:bg-white/80'}`}
                  style={{
                    backgroundColor: selectedType === type.id ? type.color : undefined,
                    color: selectedType === type.id ? 'white' : '#374151',
                    ringColor: type.color,
                  }}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <span className="mr-1">💭</span>
              打卡备注
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录今天的心情和收获..."
              className="min-h-24 resize-none rounded-2xl border-2 border-pink-200 focus:border-pink-400 bg-white/60"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full border-2 border-gray-300 hover:bg-gray-100"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg"
            >
              完成打卡 ✨
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}