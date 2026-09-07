import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { Grade } from '../types/emulation';
import { 
  Trophy, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Eye, 
  TrendingUp,
  Award,
  Medal
} from 'lucide-react';
import { exportCumulativeScoresToCsv } from '../utils/exportUtils';

interface CumulativeReportProps {
  onOpenClassModal: (classId: string) => void;
}

export const CumulativeReport: React.FC<CumulativeReportProps> = ({ onOpenClassModal }) => {
  const {
    getCumulativeScores,
    config,
    filterGrade,
    setFilterGrade
  } = useEmulation();

  const [searchQuery, setSearchQuery] = useState('');

  const cumulativeData = getCumulativeScores();

  const filteredData = cumulativeData.filter(item => {
    if (filterGrade !== 'all' && item.grade !== filterGrade) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.className.toLowerCase().includes(q);
      const matchTeacher = item.homeroomTeacher.toLowerCase().includes(q);
      if (!matchName && !matchTeacher) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportCumulativeScoresToCsv(
      cumulativeData,
      config.schoolName,
      config.academicYear
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            BẢNG TỔNG KẾT THI ĐUA HỌC KỲ {config.semester || 1}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp điểm số và thành tích của tất cả các tuần từ Tuần 1 đến Tuần {config.currentWeek}
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Xuất Báo Cáo Lũy Kế (CSV/Excel)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Khối lớp:
          </span>
          {(['all', 10, 11, 12] as const).map(g => (
            <button
              key={g}
              onClick={() => setFilterGrade(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterGrade === g
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Toàn Trường' : `Khối ${g}`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm lớp hoặc GVCN..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3 text-center w-16">Hạng</th>
                <th className="py-3 px-3">Lớp & Khối</th>
                <th className="py-3 px-3">Giáo Viên Chủ Nhiệm</th>
                <th className="py-3 px-3 text-center">Tổng Điểm Lũy Kế</th>
                <th className="py-3 px-3 text-center">Điểm TB / Tuần</th>
                <th className="py-3 px-3 text-center text-rose-700">Tổng Điểm Trừ</th>
                <th className="py-3 px-3 text-center text-teal-700">Tổng Điểm Cộng</th>
                <th className="py-3 px-3 text-center">Số Cờ Đã Đạt</th>
                <th className="py-3 px-3 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.classId} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                        item.rank === 1
                          ? 'bg-amber-400 text-amber-950 shadow-2xs'
                          : item.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : item.rank === 3
                          ? 'bg-orange-300 text-orange-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-900">
                    <button
                      onClick={() => onOpenClassModal(item.classId)}
                      className="hover:text-blue-600 transition cursor-pointer"
                    >
                      Lớp {item.className}
                    </button>
                    <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                      Khối {item.grade}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {item.homeroomTeacher}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-black text-sm text-slate-900">
                      {item.totalScore}đ
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      {item.avgScore}đ
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-rose-600">
                    {item.totalPenalties}đ
                    <div className="text-[10px] text-slate-400">({item.totalViolations} lỗi)</div>
                  </td>

                  <td className="py-3 px-3 text-center font-bold text-teal-600">
                    +{item.totalBonuses}đ
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
                      {item.firstFlags > 0 && (
                        <span className="text-amber-600">🏆 {item.firstFlags}</span>
                      )}
                      {item.secondFlags > 0 && (
                        <span className="text-slate-500">🥈 {item.secondFlags}</span>
                      )}
                      {item.thirdFlags > 0 && (
                        <span className="text-orange-600">🥉 {item.thirdFlags}</span>
                      )}
                      {item.firstFlags === 0 && item.secondFlags === 0 && item.thirdFlags === 0 && (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenClassModal(item.classId)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
