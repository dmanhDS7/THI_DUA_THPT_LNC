import React from 'react';
import { useEmulation } from '../context/EmulationContext';
import { Printer, X } from 'lucide-react';

interface PrintWeeklyReportProps {
  onClose: () => void;
}

export const PrintWeeklyReport: React.FC<PrintWeeklyReportProps> = ({ onClose }) => {
  const { currentWeekScores, selectedWeek, config, records } = useEmulation();

  const handlePrint = () => {
    window.print();
  };

  const weekRecords = records.filter(r => r.week === selectedWeek && r.status !== 'cancelled');
  const violations = weekRecords.filter(r => r.type === 'penalty');
  const bonuses = weekRecords.filter(r => r.type === 'bonus');

  // Top classes for flags
  const flagFirst = currentWeekScores.filter(s => s.award === 'cờ_nhất');
  const flagSecond = currentWeekScores.filter(s => s.award === 'cờ_nhì');
  const flagThird = currentWeekScores.filter(s => s.award === 'cờ_ba');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Controls Bar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">
              Xem Trước Bản In A4 — Báo Cáo Chào Cờ Đầu Tuần
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              In Báo Cáo (hoặc Lưu PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* A4 Document Paper Body */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white text-black font-sans space-y-6 text-sm flex-1">
          {/* Official Letterhead */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black">
            <div className="text-center font-serif text-xs">
              <div className="font-bold uppercase tracking-wider">Đoàn TNCS Hồ Chí Minh</div>
              <div className="font-bold uppercase tracking-wider">{config.schoolName}</div>
              <div className="font-semibold text-slate-700">BAN THI ĐUA NỀ NẾP</div>
              <div className="text-[11px] text-slate-600 italic">Số: .../BC-TĐNN</div>
            </div>

            <div className="text-center font-serif text-xs">
              <div className="font-bold uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
              <div className="font-bold underline underline-offset-4">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] italic mt-2">
                ..., ngày ... tháng ... năm {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="font-bold text-lg sm:text-xl uppercase tracking-wide">
              Báo Cáo Tổng Kết & Xếp Hạng Thi Đua Nề Nếp Tuần {selectedWeek}
            </h1>
            <p className="text-xs italic">
              Học kỳ {config.semester} — Năm học {config.academicYear}
            </p>
          </div>

          {/* Section 1: General Assessment */}
          <div className="space-y-1.5 text-xs">
            <h2 className="font-bold uppercase tracking-wide">I. Đánh Giá Chung Tình Hình Nề Nếp Trong Tuần:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Ưu điểm:</strong> Đa số các chi đoàn duy trì tốt nề nếp chuyên cần, trang phục chỉnh tề, tác phong nghiêm túc trong giờ học. Ghi nhận {bonuses.length} lượt biểu dương tiết học tốt và hành động đẹp.
              </li>
              <li>
                <strong>Tồn tại cần khắc phục:</strong> Còn {violations.length} trường hợp vi phạm nề nếp (chủ yếu là đi học muộn, chưa sơ vin, sử dụng điện thoại chưa đúng quy định). Đề nghị các GVCN và ban cán sự lớp đôn đốc nhắc nhở.
              </li>
            </ul>
          </div>

          {/* Section 2: Flag Awards */}
          <div className="space-y-1.5 text-xs">
            <h2 className="font-bold uppercase tracking-wide">II. Tuyên Dương Trao Cờ Thi Đua Tuần {selectedWeek}:</h2>
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-300 rounded text-center">
              <div>
                <span className="block font-bold text-red-700 uppercase text-[11px]">Cờ Nhất Tuần</span>
                <span className="font-extrabold text-sm">
                  {flagFirst.map(s => `Lớp ${s.className}`).join(', ') || 'Chưa xếp'}
                </span>
              </div>
              <div>
                <span className="block font-bold text-slate-700 uppercase text-[11px]">Cờ Nhì Tuần</span>
                <span className="font-extrabold text-sm">
                  {flagSecond.map(s => `Lớp ${s.className}`).join(', ') || 'Chưa xếp'}
                </span>
              </div>
              <div>
                <span className="block font-bold text-orange-800 uppercase text-[11px]">Cờ Ba Tuần</span>
                <span className="font-extrabold text-sm">
                  {flagThird.map(s => `Lớp ${s.className}`).join(', ') || 'Chưa xếp'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Full Table */}
          <div className="space-y-1.5 text-xs">
            <h2 className="font-bold uppercase tracking-wide">III. Bảng Điểm Chi Tiết Các Lớp:</h2>
            <table className="w-full border-collapse border border-black text-center text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-black">
                  <th className="border border-black p-1.5 w-12">Hạng</th>
                  <th className="border border-black p-1.5">Lớp</th>
                  <th className="border border-black p-1.5">Khối</th>
                  <th className="border border-black p-1.5">Điểm Gốc</th>
                  <th className="border border-black p-1.5">Điểm Trừ</th>
                  <th className="border border-black p-1.5">Điểm Cộng</th>
                  <th className="border border-black p-1.5">Tổng Điểm</th>
                  <th className="border border-black p-1.5">Xếp Loại</th>
                  <th className="border border-black p-1.5">Danh Hiệu Cờ</th>
                </tr>
              </thead>
              <tbody>
                {currentWeekScores.map(s => (
                  <tr key={s.classId} className="border-b border-black">
                    <td className="border border-black p-1 font-bold">{s.rankAll}</td>
                    <td className="border border-black p-1 font-bold text-left px-2">Lớp {s.className}</td>
                    <td className="border border-black p-1">Khối {s.grade}</td>
                    <td className="border border-black p-1">{s.basePoints}</td>
                    <td className="border border-black p-1 font-semibold">{s.totalPenalties}</td>
                    <td className="border border-black p-1 font-semibold">+{s.totalBonuses}</td>
                    <td className="border border-black p-1 font-bold">{s.finalScore}</td>
                    <td className="border border-black p-1">{s.tier}</td>
                    <td className="border border-black p-1 font-semibold">
                      {s.award === 'cờ_nhất' ? 'Cờ Nhất' : s.award === 'cờ_nhì' ? 'Cờ Nhì' : s.award === 'cờ_ba' ? 'Cờ Ba' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
            <div>
              <div className="font-bold uppercase">Trưởng Ban Thi Đua</div>
              <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
            </div>
            <div>
              <div className="font-bold uppercase">Bí Thư Đoàn Trường</div>
              <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
            </div>
            <div>
              <div className="font-bold uppercase">Hiệu Trưởng Phê Duyệt</div>
              <div className="text-[11px] italic text-slate-500">(Ký tên và đóng dấu)</div>
              <div className="h-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
