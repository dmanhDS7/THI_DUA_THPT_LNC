import React, { useState } from 'react';
import { EmulationProvider, useEmulation } from './context/EmulationContext';
import { Header } from './components/Header';
import { WeeklyLeaderboard } from './components/WeeklyLeaderboard';
import { QuickEntryForm } from './components/QuickEntryForm';
import { RecentEntriesList } from './components/RecentEntriesList';
import { ClassDetailModal } from './components/ClassDetailModal';
import { RulebookManager } from './components/RulebookManager';
import { DutyPatrolManager } from './components/DutyPatrolManager';
import { SchoolSettings } from './components/SchoolSettings';
import { CumulativeReport } from './components/CumulativeReport';
import { PrintWeeklyReport } from './components/PrintWeeklyReport';
import { School, Trophy, Layers, Sparkles } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedClassId,
    setSelectedClassId,
    classes,
    config
  } = useEmulation();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [leaderboardSubTab, setLeaderboardSubTab] = useState<'weekly' | 'cumulative'>('weekly');
  const [entryPreselectedClassId, setEntryPreselectedClassId] = useState<string | undefined>(undefined);

  const handleOpenClassModal = (classId: string) => {
    setSelectedClassId(classId);
  };

  const handleGoToEntry = (classId?: string) => {
    setEntryPreselectedClassId(classId);
    setActiveTab('entry');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 text-slate-900">
      {/* Global Header */}
      <Header onOpenPrintModal={() => setIsPrintModalOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Tab 1: Leaderboard & Summary */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* View Switcher: Tuần này vs Lũy kế cả kỳ */}
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
              <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
                <button
                  id="subtab-weekly"
                  onClick={() => setLeaderboardSubTab('weekly')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
                    leaderboardSubTab === 'weekly'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Bảng Xếp Hạng Tuần Này
                </button>
                <button
                  id="subtab-cumulative"
                  onClick={() => setLeaderboardSubTab('cumulative')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
                    leaderboardSubTab === 'cumulative'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Bảng Tổng Kết Thi Đua Học Kỳ {config.semester || 1}
                </button>
              </div>
            </div>

            {leaderboardSubTab === 'weekly' ? (
              <WeeklyLeaderboard
                onOpenClassModal={handleOpenClassModal}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
                onGoToEntry={handleGoToEntry}
              />
            ) : (
              <CumulativeReport onOpenClassModal={handleOpenClassModal} />
            )}
          </div>
        )}

        {/* Tab 2: Entry Form */}
        {activeTab === 'entry' && (
          <QuickEntryForm
            initialClassId={entryPreselectedClassId}
            onSuccess={() => {}}
          />
        )}

        {/* Tab 3: Records Journal */}
        {activeTab === 'records' && (
          <RecentEntriesList onOpenClassModal={handleOpenClassModal} />
        )}

        {/* Tab 4: Class Details */}
        {activeTab === 'class_detail' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-blue-600" />
                Hồ Sơ Chi Tiết Nề Nếp Các Chi Đoàn
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn một lớp bên dưới để tra cứu lý lịch thi đua, tiến trình điểm và lỗi vi phạm
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...classes]
                .sort((a, b) => {
                  if (a.grade !== b.grade) return a.grade - b.grade;
                  return a.name.localeCompare(b.name, 'vi', { numeric: true });
                })
                .map(c => (
                <div
                  key={c.id}
                  onClick={() => handleOpenClassModal(c.id)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-lg text-slate-900 group-hover:text-blue-600 transition">
                      Lớp {c.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Khối {c.grade}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>GVCN: <strong>{c.homeroomTeacher}</strong></div>
                    <div className="text-[11px] text-slate-500">LT: {c.monitor} • {c.studentCount} HS</div>
                    <div className="text-[11px] text-slate-400">{c.room}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                    <span>Xem lý lịch nề nếp →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Barem Rulebook */}
        {activeTab === 'rulebook' && <RulebookManager />}

        {/* Tab 6: Patrol & Appeals */}
        {activeTab === 'patrol' && <DutyPatrolManager />}

        {/* Tab 7: School Settings */}
        {activeTab === 'settings' && <SchoolSettings />}
      </main>

      {/* Class Detail Modal (When triggered from anywhere) */}
      {selectedClassId && (
        <ClassDetailModal
          classId={selectedClassId}
          onClose={() => setSelectedClassId(null)}
          onGoToEntry={handleGoToEntry}
        />
      )}

      {/* Print Weekly Report Modal */}
      {isPrintModalOpen && (
        <PrintWeeklyReport onClose={() => setIsPrintModalOpen(false)} />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Đoàn Trường THPT</span>
            <span>•</span>
            <span>Hệ Thống Đánh Giá Thi Đua Nề Nếp & Kỷ Luật Học Sinh Cấp 3</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Tự động đồng bộ, lưu trữ dữ liệu an toàn & hỗ trợ in ấn biên bản chào cờ A4
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <EmulationProvider>
      <MainAppContent />
    </EmulationProvider>
  );
}
