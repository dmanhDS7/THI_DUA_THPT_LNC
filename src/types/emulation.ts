export type Grade = 10 | 11 | 12;

export type CategoryKey = 
  | 'chuyen_can'   // Chuyên cần & Giờ giấc
  | 'hoc_tap'      // Học tập & Giờ học
  | 'dong_phuc'    // Tác phong & Đồng phục
  | 've_sinh'      // Vệ sinh & Cơ sở vật chất
  | 'ky_luat'      // Đạo đức, Kỷ luật & ATGT
  | 'dieu_cam'     // Vi phạm điều cấm (Không xếp loại & Rank cuối)
  | 'khen_thuong';  // Khen thưởng & Điểm cộng

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export interface RuleDefinition {
  id: string;
  code: string;
  title: string;
  category: CategoryKey;
  type: 'penalty' | 'bonus';
  defaultPoints: number; // Điểm âm nếu penalty (ví dụ -2, -5), dương nếu bonus (ví dụ +5, +10)
  description?: string;
  targetScope: 'individual' | 'collective'; // Vi phạm cá nhân học sinh hay cả tập thể
}

export interface ClassInfo {
  id: string;
  name: string; // ví dụ "10A1", "11A2", "12A3"
  grade: Grade;
  homeroomTeacher: string; // GVCN
  monitor: string; // Lớp trưởng
  redStarLeader?: string; // Đội trưởng Sao Đỏ
  studentCount: number; // Sĩ số
  room: string; // Phòng học
}

export type RecordType = 'penalty' | 'bonus';

export type SessionType = 'morning' | 'afternoon';

export type ReporterRole = 'co_do' | 'giam_thi' | 'giao_vien' | 'doan_truong';

export type RecordStatus = 'confirmed' | 'appealed' | 'resolved' | 'cancelled';

export interface EvaluationRecord {
  id: string;
  type: RecordType;
  week: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Thứ Hai -> Thứ Bảy
  session: SessionType;
  period?: number; // Tiết 1-5
  classId: string;
  ruleId: string;
  ruleCode: string;
  ruleTitle: string;
  category: CategoryKey;
  points: number; // Điểm thay đổi (âm hoặc dương)
  studentName?: string; // Tên học sinh cụ thể nếu vi phạm cá nhân
  note?: string; // Diễn giải tình huống chi tiết
  reporter: string; // Người ghi nhận: Đội Cờ Đỏ 12A1, Thầy Nguyễn Văn A...
  reporterRole: ReporterRole;
  status: RecordStatus;
  appealNote?: string; // Ghi chú khiếu nại của lớp
  resolutionNote?: string; // Kết quả xử lý khiếu nại của Đoàn trường
  createdAt: string;
}

export interface DutyAssignment {
  id: string;
  week: number;
  patrolClassId: string; // Lớp đi chấm chéo
  targetClassId: string; // Lớp được chấm
  assignedMembers: string[]; // Tên sao đỏ phụ trách
  note?: string;
}

export interface SchoolConfig {
  schoolName: string;
  academicYear: string;
  semester: 1 | 2;
  basePointsPerWeek: number; // Mặc định 100 điểm ban đầu mỗi tuần
  totalWeeks: number;
  currentWeek: number;
  awardThresholds: {
    firstFlag: number; // Top mấy được cờ nhất
    secondFlag: number;
    thirdFlag: number;
  };
}

export type EmulationTier = 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu' | 'Không xếp loại';

export type AwardType = 'cờ_nhất' | 'cờ_nhì' | 'cờ_ba' | 'khuyến_khích' | 'không';

export interface ClassWeekScore {
  classId: string;
  className: string;
  grade: Grade;
  week: number;
  basePoints: number;
  totalPenalties: number; // Tổng điểm trừ (giá trị âm)
  totalBonuses: number;   // Tổng điểm cộng (giá trị dương)
  finalScore: number;     // basePoints + totalPenalties + totalBonuses
  violationCount: number;
  bonusCount: number;
  categoryPoints: Record<CategoryKey, number>;
  rankAll: number;        // Xếp hạng toàn trường
  rankGrade: number;      // Xếp hạng trong khối
  award: AwardType;
  tier: EmulationTier;
  rankChange: number;     // Tăng giảm so với tuần trước (+1, -2, 0)
  hasProhibitedViolation?: boolean; // Vi phạm điều cấm
  prohibitedViolationsCount?: number; // Số lượng lỗi điều cấm
  isDisqualified?: boolean;          // Không xếp loại thi đua
}

export type TabType = 
  | 'leaderboard'    // Bảng xếp hạng & tổng hợp điểm
  | 'entry'          // Nhập lỗi & Điểm cộng
  | 'records'        // Danh sách biên bản ghi nhận
  | 'class_detail'   // Hồ sơ thi đua từng lớp
  | 'rulebook'       // Barem thang điểm nề nếp
  | 'patrol'         // Lịch trực cờ đỏ & khiếu nại
  | 'settings';      // Cài đặt trường & dữ liệu
