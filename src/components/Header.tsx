import React from 'react';
import { useEmulation } from '../context/EmulationContext';
import { 
  Trophy, 
  PlusCircle, 
  ClipboardList, 
  School, 
  BookMarked, 
  ShieldCheck, 
  Settings, 
  Printer, 
  FileSpreadsheet,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { exportWeeklyScoresToCsv } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface HeaderProps {
  onOpenPrintModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPrintModal }) => {
  const {
    config,
    selectedWeek,
    setSelectedWeek,
    activeTab,
    setActiveTab,
    currentWeekScores,
    records,
    classes
  } = useEmulation();

  const handleCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 }
    });
  };

  const handleExportCsv = () => {
    exportWeeklyScoresToCsv(
      currentWeekScores,
      selectedWeek,
      config.schoolName,
      config.academicYear
    );
  };

  // Quick stats
  const weekRecords = records.filter(r => r.week === selectedWeek && r.status !== 'cancelled');
  const violationsCount = weekRecords.filter(r => r.type === 'penalty').length;
  const bonusesCount = weekRecords.filter(r => r.type === 'bonus').length;
  const avgScore = currentWeekScores.length > 0 
    ? (currentWeekScores.reduce((acc, c) => acc + c.finalScore, 0) / currentWeekScores.length).toFixed(1)
    : '0';

  const topClass = currentWeekScores.find(s => s.rankAll === 1);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Đoàn TNCS Hồ Chí Minh • Ban Thi Đua Nề Nếp
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-blue-300 border border-slate-700">
                  HK{config.semester} • {config.academicYear}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {config.schoolName}
                <span className="text-xs font-normal text-slate-400 hidden md:inline">
                  — Hệ Thống Đánh Giá Thi Đua Nề Nếp Cấp 3
                </span>
              </h1>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800/90 rounded-lg px-2.5 py-1 border border-slate-700 text-xs">
              <span className="text-slate-400 mr-2 font-medium">Tuần đánh giá:</span>
              <select
                id="header-week-select"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent text-white font-bold cursor-pointer focus:outline-none focus:ring-0 text-sm"
              >
                {Array.from({ length: config.totalWeeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w} className="text-slate-900 bg-white">
                    Tuần {w} {w === config.currentWeek ? '(Hiện tại)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-print-a4"
              onClick={onOpenPrintModal}
              title="In biên bản thi đua chào cờ A4"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none border border-slate-700 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">In Báo Cáo A4</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={handleExportCsv}
              title="Xuất bảng điểm ra file Excel/CSV"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Đang chấm: <strong className="text-slate-900">Tuần {selectedWeek}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span>Tổng số lớp: <strong className="text-slate-900">{classes.length} lớp</strong> (Khối 10, 11, 12)</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">Điểm gốc: <strong className="text-slate-900">{config.basePointsPerWeek}đ / tuần</strong></span>
            <span className="text-slate-400 hidden md:inline">|</span>
            <span className="hidden md:inline text-rose-700 font-medium">Vi phạm tuần: <strong>{violationsCount}</strong> lượt</span>
            <span className="text-slate-400 hidden md:inline">|</span>
            <span className="hidden md:inline text-teal-700 font-medium">Điểm cộng tuần: <strong>{bonusesCount}</strong> lượt</span>
            <span className="text-slate-400 hidden lg:inline">|</span>
            <span className="hidden lg:inline">Điểm TB toàn trường: <strong>{avgScore}đ</strong></span>
          </div>

          {topClass && (
            <button
              onClick={handleCelebration}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-semibold transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer border border-amber-300 shadow-2xs"
              title="Nhấn để chúc mừng lớp dẫn đầu!"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dẫn đầu tuần {selectedWeek}: <strong>Lớp {topClass.className}</strong> ({topClass.finalScore}đ)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar" aria-label="Tabs">
          <button
            id="tab-btn-leaderboard"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className={`w-4 h-4 ${activeTab === 'leaderboard' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Bảng Xếp Hạng & Điểm</span>
          </button>

          <button
            id="tab-btn-entry"
            onClick={() => setActiveTab('entry')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'entry'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${activeTab === 'entry' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Nhập Điểm Nề Nếp</span>
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-600 text-white">
              Ghi lỗi / Thưởng
            </span>
          </button>

          <button
            id="tab-btn-records"
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'records'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className={`w-4 h-4 ${activeTab === 'records' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Sổ Biên Bản ({weekRecords.length})</span>
          </button>

          <button
            id="tab-btn-classes"
            onClick={() => setActiveTab('class_detail')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'class_detail'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <School className={`w-4 h-4 ${activeTab === 'class_detail' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Hồ Sơ Từng Lớp</span>
          </button>

          <button
            id="tab-btn-rulebook"
            onClick={() => setActiveTab('rulebook')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'rulebook'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookMarked className={`w-4 h-4 ${activeTab === 'rulebook' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Barem Điểm & Nội Quy</span>
          </button>

          <button
            id="tab-btn-patrol"
            onClick={() => setActiveTab('patrol')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'patrol'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'patrol' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Cờ Đỏ & Khiếu Nại</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Cài Đặt Trường</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
