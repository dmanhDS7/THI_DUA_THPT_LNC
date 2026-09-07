import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { 
  X, 
  School, 
  User, 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Clock, 
  ShieldAlert,
  Sparkles,
  Calendar,
  Trash2
} from 'lucide-react';

interface ClassDetailModalProps {
  classId: string;
  onClose: () => void;
  onGoToEntry: (classId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classId,
  onClose,
  onGoToEntry
}) => {
  const { classes, getClassHistory, currentWeekScores, selectedWeek, deleteRecord, deleteClass } = useEmulation();
  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'trend'>('overview');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isConfirmDeleteClass, setIsConfirmDeleteClass] = useState(false);

  const handleDeleteRecord = (recId: string) => {
    setDeletingIds(prev => new Set(prev).add(recId));
    setConfirmDeleteId(null);
    setTimeout(() => {
      deleteRecord(recId);
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(recId);
        return next;
      });
    }, 350);
  };

  const targetClass = classes.find(c => c.id === classId);
  if (!targetClass) return null;

  const history = getClassHistory(classId);
  const currentScore = currentWeekScores.find(s => s.classId === classId);

  // Flags count
  const firstFlags = history.flagsWon.filter(f => f.award === 'cờ_nhất').length;
  const secondFlags = history.flagsWon.filter(f => f.award === 'cờ_nhì').length;
  const thirdFlags = history.flagsWon.filter(f => f.award === 'cờ_ba').length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-xs">
              {targetClass.name}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Hồ Sơ Nề Nếp Chi Đoàn
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-blue-300 border border-slate-700">
                  Khối {targetClass.grade}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Lớp {targetClass.name} • {targetClass.room}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onGoToEntry(targetClass.id);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Ghi Lỗi / Thưởng
            </button>
            <button
              onClick={() => setIsConfirmDeleteClass(true)}
              title={`Xóa Lớp ${targetClass.name}`}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Info Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Giáo viên chủ nhiệm</span>
            <span className="font-bold text-slate-800">{targetClass.homeroomTeacher}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Lớp trưởng & Sĩ số</span>
            <span className="font-bold text-slate-800">{targetClass.monitor} ({targetClass.studentCount} HS)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Điểm Tuần {selectedWeek}</span>
            <span className="font-extrabold text-sm text-slate-900">
              {currentScore?.finalScore || 100}đ <span className="text-slate-500 text-xs font-normal">(Hạng #{currentScore?.rankAll})</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Bộ Cờ Đã Đạt</span>
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-amber-600 flex items-center gap-0.5">🏆 {firstFlags} Nhất</span>
              <span className="text-slate-500 flex items-center gap-0.5">🥈 {secondFlags} Nhì</span>
              <span className="text-orange-600 flex items-center gap-0.5">🥉 {thirdFlags} Ba</span>
            </div>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="border-b border-slate-200 px-5 bg-white shrink-0">
          <div className="flex space-x-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tổng Quan & Lỗi Phổ Biến
            </button>
            <button
              onClick={() => setActiveTab('violations')}
              className={`py-3 border-b-2 transition cursor-pointer ${
                activeTab === 'violations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Toàn Bộ Lịch Sử Biên Bản ({history.records.length})
            </button>
            <button
              onClick={() => setActiveTab('trend')}
              className={`py-3 border-b-2 transition cursor-pointer ${
                activeTab === 'trend'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Biểu Đồ Xu Hướng Các Tuần
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Recurring Violations */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Các Lỗi Vi Phạm Phổ Biến Nhất Cần Lưu Ý
                </h4>
                {history.mostCommonViolations.length === 0 ? (
                  <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lớp thực hiện rất tốt nề nếp, chưa ghi nhận lỗi vi phạm đáng kể!</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {history.mostCommonViolations.map((v, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800">{v.ruleTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            Đã mắc phải: <strong className="text-rose-600">{v.count} lần</strong>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-rose-700 bg-rose-100 px-2 py-1 rounded">
                          {v.totalPoints}đ
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Points Deductions by Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700">
                  Phân Bổ Điểm Trừ Theo 5 Tiêu Chí Nề Nếp
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['chuyen_can', 'hoc_tap', 'dong_phuc', 've_sinh', 'ky_luat'] as const).map(catKey => {
                    const cat = CATEGORIES_CONFIG[catKey];
                    const pts = history.penaltiesByCategory[catKey] || 0;
                    return (
                      <div
                        key={catKey}
                        className={`p-3 rounded-xl border text-center ${cat.bgColor} ${cat.borderColor}`}
                      >
                        <div className={`text-[11px] font-bold ${cat.textColor}`}>
                          {cat.label.split('&')[0]}
                        </div>
                        <div className="text-lg font-black text-slate-900 mt-1">
                          {pts > 0 ? `-${pts}` : '0'} <span className="text-xs font-normal text-slate-500">đ</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flags Honors List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Cờ Thi Đua Đã Đạt Được
                </h4>
                {history.flagsWon.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chi đoàn chưa đạt cờ thi đua trong các tuần vừa qua.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {history.flagsWon.map((f, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${
                          f.award === 'cờ_nhất'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : f.award === 'cờ_nhì'
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : 'bg-orange-100 text-orange-900 border-orange-300'
                        }`}
                      >
                        <span>Tuần {f.week}:</span>
                        <span>
                          {f.award === 'cờ_nhất' ? '🏆 Cờ Nhất' : f.award === 'cờ_nhì' ? '🥈 Cờ Nhì' : '🥉 Cờ Ba'}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'violations' && (
            <div className="space-y-2">
              {history.records.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có biên bản nào được ghi nhận cho lớp này.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.records.map(rec => {
                    const isPenalty = rec.type === 'penalty';
                    const isDeleting = deletingIds.has(rec.id);
                    return (
                      <div
                        key={rec.id}
                        className={`transition-all duration-300 ease-in-out py-2.5 flex items-center justify-between text-xs gap-3 ${
                          isDeleting
                            ? 'opacity-0 -translate-x-10 scale-95 max-h-0 !py-0 !my-0 !border-0 overflow-hidden bg-rose-100/90 pointer-events-none'
                            : 'max-h-[300px] opacity-100 translate-x-0 scale-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800">Tuần {rec.week}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">
                              {rec.date} ({rec.dayOfWeek})
                              {rec.period !== undefined ? (
                                rec.period === 0
                                  ? ' • 15p đầu giờ'
                                  : rec.period === 6
                                  ? ' • Ra chơi'
                                  : rec.period === 7
                                  ? ' • Chào cờ'
                                  : ` • Tiết ${rec.period}`
                              ) : ''}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1 rounded bg-slate-100">
                              {rec.ruleCode}
                            </span>
                            <span className="font-semibold text-slate-900">{rec.ruleTitle}</span>
                          </div>
                          {rec.studentName && (
                            <div className="text-rose-700 font-medium mt-0.5">
                              Học sinh vi phạm: {rec.studentName}
                            </div>
                          )}
                          {rec.note && <div className="text-slate-500 italic mt-0.5">"{rec.note}"</div>}
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded ${
                              isPenalty ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                            }`}
                          >
                            {rec.points > 0 ? `+${rec.points}` : rec.points}đ
                          </span>
                          <button
                            onClick={() => handleDeleteRecord(rec.id)}
                            title="Xóa biên bản này"
                            className="p-1.5 rounded-md transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 select-none transform hover:scale-105 cursor-pointer text-slate-400 hover:text-rose-600 hover:bg-rose-50 group shadow-2xs hover:shadow-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 transition-transform duration-150 group-active:scale-90" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trend' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700">
                Tiến Trình Điểm Thi Đua & Thứ Hạng Qua Các Tuần
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {history.scoresByWeek.map(w => (
                  <div key={w.week} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-500">Tuần {w.week}</div>
                    <div className="text-xl font-extrabold text-slate-900 my-1">{w.score}đ</div>
                    <div className="text-xs font-semibold text-blue-600">
                      Hạng #{w.rank}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsConfirmDeleteClass(true)}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Xóa Lớp {targetClass.name}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Đóng Hồ Sơ
          </button>
        </div>
      </div>

      {/* Confirm Delete Class Modal */}
      {isConfirmDeleteClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base border-b border-slate-100 pb-3">
              <Trash2 className="w-5 h-5" />
              Xác Nhận Xóa Lớp {targetClass.name}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-slate-900">Lớp {targetClass.name}</strong> không? Nếu đồng ý sẽ xóa lớp này và toàn bộ dữ liệu thi đua của lớp khỏi hệ thống.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteClass(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteClass(targetClass.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                Đồng Ý Xóa Lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
