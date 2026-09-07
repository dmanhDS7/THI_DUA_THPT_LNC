import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { Grade, AwardType, ClassWeekScore } from '../types/emulation';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Filter, 
  Eye, 
  PlusCircle, 
  Download, 
  Printer, 
  BarChart3, 
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { exportWeeklyScoresToCsv } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface WeeklyLeaderboardProps {
  onOpenClassModal: (classId: string) => void;
  onOpenPrintModal: () => void;
  onGoToEntry: (classId?: string) => void;
}

export const WeeklyLeaderboard: React.FC<WeeklyLeaderboardProps> = ({
  onOpenClassModal,
  onOpenPrintModal,
  onGoToEntry
}) => {
  const {
    currentWeekScores,
    selectedWeek,
    setSelectedWeek,
    config,
    classes,
    filterGrade,
    setFilterGrade
  } = useEmulation();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Filter scores by grade and search query
  const filteredScores = currentWeekScores.filter(s => {
    if (filterGrade !== 'all' && s.grade !== filterGrade) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cls = classes.find(c => c.id === s.classId);
      const matchName = s.className.toLowerCase().includes(q);
      const matchTeacher = cls?.homeroomTeacher.toLowerCase().includes(q);
      if (!matchName && !matchTeacher) return false;
    }
    return true;
  });

  // Top 3 classes for podium
  const topClasses = currentWeekScores.slice(0, 3);
  const rank1 = topClasses[0];
  const rank2 = topClasses[1];
  const rank3 = topClasses[2];

  const handleCelebrateRank1 = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.3 }
    });
  };

  const getAwardBadge = (award: AwardType) => {
    switch (award) {
      case 'cờ_nhất':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            Cờ Nhất
          </span>
        );
      case 'cờ_nhì':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Medal className="w-3.5 h-3.5 text-slate-500" />
            Cờ Nhì
          </span>
        );
      case 'cờ_ba':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
            <Award className="w-3.5 h-3.5 text-orange-600" />
            Cờ Ba
          </span>
        );
      case 'khuyến_khích':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Khuyến khích
          </span>
        );
      default:
        return <span className="text-slate-400 text-xs">—</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Xuất sắc':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Xuất sắc</span>;
      case 'Tốt':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Tốt</span>;
      case 'Khá':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Khá</span>;
      case 'Trung bình':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Trung bình</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Yếu</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Podium Top 3 Classes */}
      {filterGrade === 'all' && !searchQuery && currentWeekScores.length >= 3 && (
        <div className="bg-gradient-to-b from-slate-900/5 via-blue-500/5 to-transparent p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              VINH DANH CỜ THI ĐUA NỀ NẾP TUẦN {selectedWeek}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Top 3 Chi Đoàn Xuất Sắc Nhất Toàn Trường
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Được trao tặng Cờ Thi Đua tại Lễ Chào Cờ đầu tuần của trường THPT
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto items-end pt-4">
            {/* Rank 2 (Cờ Nhì) */}
            {rank2 && (
              <div 
                onClick={() => onOpenClassModal(rank2.classId)}
                className="bg-white rounded-xl p-3 sm:p-4 border-2 border-slate-200 shadow-sm text-center cursor-pointer hover:border-slate-400 hover:shadow-md transition relative group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-700 mx-auto flex items-center justify-center font-bold text-base sm:text-lg mb-2 shadow-inner">
                  2
                </div>
                <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[11px] font-bold border border-slate-200 mb-1">
                  Cờ Nhì
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
                  {rank2.className}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  {classes.find(c => c.id === rank2.classId)?.homeroomTeacher}
                </p>
                <div className="mt-2 text-base sm:text-xl font-extrabold text-slate-800">
                  {rank2.finalScore} <span className="text-xs font-normal text-slate-500">điểm</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  +{rank2.totalBonuses}đ / {rank2.totalPenalties}đ
                </div>
              </div>
            )}

            {/* Rank 1 (Cờ Nhất - Highest & Spotlighted) */}
            {rank1 && (
              <div 
                onClick={() => {
                  handleCelebrateRank1();
                  onOpenClassModal(rank1.classId);
                }}
                className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-4 sm:p-6 border-2 border-amber-400 shadow-md text-center cursor-pointer hover:border-amber-500 hover:shadow-lg transition relative -top-3 transform group"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-bounce">
                    <Trophy className="w-3 h-3 text-yellow-200" />
                    QUÁN QUÂN
                  </span>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-200 text-amber-950 mx-auto flex items-center justify-center font-extrabold text-xl sm:text-2xl mb-2 shadow-md">
                  1
                </div>
                <div className="inline-block px-2.5 py-0.5 bg-amber-400 text-amber-950 rounded text-xs font-extrabold shadow-2xs mb-1">
                  Cờ Nhất Tuần
                </div>
                <h3 className="font-extrabold text-lg sm:text-2xl text-slate-900 group-hover:text-blue-600 transition">
                  {rank1.className}
                </h3>
                <p className="text-xs text-slate-600 font-medium truncate">
                  {classes.find(c => c.id === rank1.classId)?.homeroomTeacher}
                </p>
                <div className="mt-2 text-xl sm:text-3xl font-black text-amber-900">
                  {rank1.finalScore} <span className="text-xs sm:text-sm font-semibold text-slate-600">điểm</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold mt-1">
                  Đạt loại {rank1.tier}
                </div>
              </div>
            )}

            {/* Rank 3 (Cờ Ba) */}
            {rank3 && (
              <div 
                onClick={() => onOpenClassModal(rank3.classId)}
                className="bg-white rounded-xl p-3 sm:p-4 border-2 border-orange-200 shadow-sm text-center cursor-pointer hover:border-orange-400 hover:shadow-md transition relative group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 border-2 border-orange-300 text-orange-800 mx-auto flex items-center justify-center font-bold text-base sm:text-lg mb-2 shadow-inner">
                  3
                </div>
                <div className="inline-block px-2 py-0.5 bg-orange-100 text-orange-900 rounded text-[11px] font-bold border border-orange-200 mb-1">
                  Cờ Ba
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition">
                  {rank3.className}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                  {classes.find(c => c.id === rank3.classId)?.homeroomTeacher}
                </p>
                <div className="mt-2 text-base sm:text-xl font-extrabold text-slate-800">
                  {rank3.finalScore} <span className="text-xs font-normal text-slate-500">điểm</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                  +{rank3.totalBonuses}đ / {rank3.totalPenalties}đ
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Bar: Filters, Grade Toggles & View Mode */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Grade filters */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Khối lớp:
          </span>
          {(['all', 10, 11, 12] as const).map(g => (
            <button
              key={g}
              id={`filter-grade-${g}`}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterGrade === g
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất Cả Khối' : `Khối ${g}`}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm lớp (10A1...) hoặc tên GVCN..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng tổng hợp"
              className={`p-1.5 transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              title="Xem biểu đồ so sánh điểm"
              className={`p-1.5 transition cursor-pointer ${
                viewMode === 'chart' ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                Bảng Tổng Hợp Điểm Thi Đua Tuần {selectedWeek}
                <span className="text-xs font-normal text-slate-500">
                  (Hiển thị {filteredScores.length} / {currentWeekScores.length} lớp)
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Điểm xuất sắc (≥98đ)
              </span>
              <span className="inline-flex items-center gap-1 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Trung bình (&lt;80đ)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-3 text-center w-16">Hạng</th>
                  <th className="py-3 px-3">Lớp & Khối</th>
                  <th className="py-3 px-3">Giáo Viên Chủ Nhiệm</th>
                  <th className="py-3 px-2 text-center w-18">Điểm Gốc</th>
                  <th className="py-3 px-2 text-center w-22 text-rose-700">Điểm Trừ</th>
                  <th className="py-3 px-2 text-center w-22 text-teal-700">Điểm Cộng</th>
                  <th className="py-3 px-3 text-center w-24">Tổng Điểm</th>
                  <th className="py-3 px-3 text-center w-24">Xếp Loại</th>
                  <th className="py-3 px-3 text-center w-28">Cờ Thi Đua</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScores.map((score) => {
                  const cls = classes.find(c => c.id === score.classId);
                  const isTop1 = score.rankAll === 1;
                  const isTop3 = score.rankAll <= 3;

                  return (
                    <tr
                      key={score.classId}
                      className={`hover:bg-slate-50/80 transition ${
                        isTop1 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Rank with change badge */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              score.rankAll === 1
                                ? 'bg-amber-400 text-amber-950 shadow-2xs'
                                : score.rankAll === 2
                                ? 'bg-slate-300 text-slate-800'
                                : score.rankAll === 3
                                ? 'bg-orange-300 text-orange-950'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {score.rankAll}
                          </span>

                          {/* Rank Change Indicator */}
                          {score.rankChange !== 0 ? (
                            <span
                              className={`flex items-center text-[10px] font-bold mt-0.5 ${
                                score.rankChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                              title={
                                score.rankChange > 0
                                  ? `Tăng ${score.rankChange} bậc so với tuần trước`
                                  : `Giảm ${Math.abs(score.rankChange)} bậc so với tuần trước`
                              }
                            >
                              {score.rankChange > 0 ? (
                                <>
                                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                                  +{score.rankChange}
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                                  {score.rankChange}
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center mt-0.5" title="Hạng không đổi">
                              <Minus className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Class Name & Details */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenClassModal(score.classId)}
                            className="font-bold text-sm text-slate-900 hover:text-blue-600 transition cursor-pointer text-left"
                          >
                            {score.className}
                          </button>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Khối {score.grade}
                          </span>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            (Hạng {score.rankGrade} khối)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Sĩ số: {cls?.studentCount || 40} HS • {cls?.room}
                        </div>
                      </td>

                      {/* Homeroom Teacher */}
                      <td className="py-3 px-3 text-slate-700">
                        <div className="font-medium text-xs text-slate-800">
                          {cls?.homeroomTeacher}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          LT: {cls?.monitor}
                        </div>
                      </td>

                      {/* Base Points */}
                      <td className="py-3 px-2 text-center font-medium text-slate-600">
                        {score.basePoints}
                      </td>

                      {/* Total Penalties */}
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold ${score.totalPenalties < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {score.totalPenalties}
                        </span>
                        {score.violationCount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            ({score.violationCount} lỗi)
                          </div>
                        )}
                      </td>

                      {/* Total Bonuses */}
                      <td className="py-3 px-2 text-center">
                        <span className={`font-bold ${score.totalBonuses > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                          +{score.totalBonuses}
                        </span>
                        {score.bonusCount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            ({score.bonusCount} khen)
                          </div>
                        )}
                      </td>

                      {/* Final Score */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-sm font-black ${
                            score.finalScore >= 98
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : score.finalScore >= 90
                              ? 'bg-teal-50 text-teal-900 border border-teal-200'
                              : score.finalScore >= 80
                              ? 'bg-blue-50 text-blue-900 border border-blue-200'
                              : 'bg-rose-50 text-rose-900 border border-rose-200'
                          }`}
                        >
                          {score.finalScore}
                        </span>
                      </td>

                      {/* Emulation Tier */}
                      <td className="py-3 px-3 text-center">
                        {getTierBadge(score.tier)}
                      </td>

                      {/* Award Flag */}
                      <td className="py-3 px-3 text-center">
                        {getAwardBadge(score.award)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onGoToEntry(score.classId)}
                            title="Ghi nhận vi phạm / khen thưởng cho lớp này"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenClassModal(score.classId)}
                            title="Xem chi tiết lý lịch thi đua"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Chart Mode */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Biểu Đồ So Sánh Điểm Thi Đua Giữa Các Lớp (Tuần {selectedWeek})
            </h3>
            <span className="text-xs text-slate-500">Thang điểm chuẩn: 0 - 110đ</span>
          </div>

          <div className="space-y-3 pt-2">
            {filteredScores.map(score => {
              const maxScore = 110;
              const percent = Math.min(100, Math.max(0, (score.finalScore / maxScore) * 100));

              return (
                <div key={score.classId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-6 text-slate-500">#{score.rankAll}</span>
                      <button
                        onClick={() => onOpenClassModal(score.classId)}
                        className="font-bold text-slate-900 hover:text-blue-600"
                      >
                        Lớp {score.className}
                      </button>
                      <span className="text-slate-400">({classes.find(c => c.id === score.classId)?.homeroomTeacher})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 font-medium">{score.totalPenalties}đ</span>
                      <span className="text-teal-600 font-medium">+{score.totalBonuses}đ</span>
                      <strong className="text-sm font-extrabold text-slate-900 w-12 text-right">
                        {score.finalScore}đ
                      </strong>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        score.finalScore >= 98
                          ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                          : score.finalScore >= 90
                          ? 'bg-teal-500'
                          : score.finalScore >= 80
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
