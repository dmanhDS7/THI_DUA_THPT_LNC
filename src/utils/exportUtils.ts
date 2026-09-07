import { ClassWeekScore } from '../types/emulation';

export const exportWeeklyScoresToCsv = (
  scores: ClassWeekScore[],
  week: number,
  schoolName: string,
  academicYear: string
) => {
  // Add UTF-8 BOM so Excel on Windows & Mac displays Vietnamese properly
  const BOM = '\uFEFF';
  
  let csvContent = BOM;
  csvContent += `"${schoolName.toUpperCase()}"\n`;
  csvContent += `"BẢNG TỔNG HỢP VÀ XẾP HẠNG THI ĐUA NỀ NẾP TUẦN ${week}"\n`;
  csvContent += `"Năm học: ${academicYear}"\n\n`;

  // Headers
  const headers = [
    'Hạng Toàn Trường',
    'Hạng Khối',
    'Lớp',
    'Khối',
    'Điểm Gốc',
    'Tổng Điểm Trừ',
    'Tổng Điểm Cộng',
    'Điểm Tổng Kết',
    'Số Lần Vi Phạm',
    'Khen Thưởng',
    'Xếp Loại',
    'Cờ Thi Đua'
  ];
  csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

  scores.forEach(s => {
    let awardLabel = 'Không';
    if (s.award === 'cờ_nhất') awardLabel = 'Cờ Nhất';
    else if (s.award === 'cờ_nhì') awardLabel = 'Cờ Nhì';
    else if (s.award === 'cờ_ba') awardLabel = 'Cờ Ba';
    else if (s.award === 'khuyến_khích') awardLabel = 'Khuyến Khích';

    const row = [
      s.rankAll,
      s.rankGrade,
      s.className,
      `Khối ${s.grade}`,
      s.basePoints,
      s.totalPenalties,
      s.totalBonuses,
      s.finalScore,
      s.violationCount,
      s.bonusCount,
      s.tier,
      awardLabel
    ];
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Thi_Dua_Tuan_${week}_${schoolName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCumulativeScoresToCsv = (
  items: {
    rank: number;
    className: string;
    grade: number;
    homeroomTeacher: string;
    totalScore: number;
    avgScore: number;
    totalPenalties: number;
    totalBonuses: number;
    totalViolations: number;
    firstFlags: number;
    secondFlags: number;
    thirdFlags: number;
  }[],
  schoolName: string,
  academicYear: string
) => {
  const BOM = '\uFEFF';
  let csvContent = BOM;
  csvContent += `"${schoolName.toUpperCase()}"\n`;
  csvContent += `"BẢNG TỔNG HỢP THI ĐUA NỀ NẾP LŨY KẾ CẢ HỌC KỲ"\n`;
  csvContent += `"Năm học: ${academicYear}"\n\n`;

  const headers = [
    'Hạng Chung',
    'Lớp',
    'Khối',
    'Giáo Viên Chủ Nhiệm',
    'Tổng Điểm Lũy Kế',
    'Điểm Trung Bình / Tuần',
    'Tổng Điểm Trừ',
    'Tổng Điểm Cộng',
    'Số Lỗi Vi Phạm',
    'Số Cờ Nhất',
    'Số Cờ Nhì',
    'Số Cờ Ba'
  ];
  csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

  items.forEach(i => {
    const row = [
      i.rank,
      i.className,
      `Khối ${i.grade}`,
      i.homeroomTeacher,
      i.totalScore,
      i.avgScore,
      i.totalPenalties,
      i.totalBonuses,
      i.totalViolations,
      i.firstFlags,
      i.secondFlags,
      i.thirdFlags
    ];
    csvContent += row.map(val => `"${val}"`).join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bang_Thi_Dua_Luy_Ke_${schoolName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
