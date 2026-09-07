import React, { useState, useEffect } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { CategoryKey, RecordType, ReporterRole, RuleDefinition } from '../types/emulation';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  FileText, 
  Shield, 
  Search,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface QuickEntryFormProps {
  initialClassId?: string;
  onSuccess?: () => void;
}

export const QuickEntryForm: React.FC<QuickEntryFormProps> = ({
  initialClassId,
  onSuccess
}) => {
  const {
    classes,
    rules,
    config,
    selectedWeek,
    addRecord,
    setActiveTab
  } = useEmulation();

  // Form state
  const [recordType, setRecordType] = useState<RecordType>('penalty');
  const [week, setWeek] = useState<number>(selectedWeek);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Thứ Hai');
  const [session, setSession] = useState<'morning' | 'afternoon'>('morning');
  const [period, setPeriod] = useState<number>(0);
  const [classId, setClassId] = useState<string>(initialClassId || (classes[0]?.id ?? '10a1'));
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('chuyen_can');
  const [ruleSearch, setRuleSearch] = useState('');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [customPoints, setCustomPoints] = useState<number>(-2);
  const [targetScope, setTargetScope] = useState<'individual' | 'collective'>('individual');
  const [studentName, setStudentName] = useState('');
  const [note, setNote] = useState('');
  const [reporter, setReporter] = useState('Đội Cờ Đỏ 12A1');
  const [reporterRole, setReporterRole] = useState<ReporterRole>('co_do');
  const [keepClassAfterSubmit, setKeepClassAfterSubmit] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync day of week based on date
  useEffect(() => {
    try {
      const d = new Date(date);
      const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday...
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      setDayOfWeek(days[dayIndex] || 'Thứ Hai');
    } catch (e) {
      // fallback
    }
  }, [date]);

  // Adjust available rules according to selected record type and category
  useEffect(() => {
    if (recordType === 'bonus') {
      setSelectedCategory('khen_thuong');
    } else if (selectedCategory === 'khen_thuong') {
      setSelectedCategory('chuyen_can');
    }
  }, [recordType]);

  // Filter rules
  const availableRules = rules.filter(r => {
    if (r.type !== recordType) return false;
    if (recordType === 'penalty' && r.category !== selectedCategory) return false;
    if (ruleSearch.trim() !== '') {
      const q = ruleSearch.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Whenever selected rule changes, update custom points
  const handleSelectRule = (rule: RuleDefinition) => {
    setSelectedRuleId(rule.id);
    setCustomPoints(rule.defaultPoints);
    setTargetScope(rule.targetScope);
  };

  // Pre-select first rule when availableRules updates
  useEffect(() => {
    if (availableRules.length > 0 && !availableRules.some(r => r.id === selectedRuleId)) {
      handleSelectRule(availableRules[0]);
    }
  }, [selectedCategory, recordType, ruleSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentRule = rules.find(r => r.id === selectedRuleId);
    if (!currentRule) {
      alert('Vui lòng chọn một nội quy nề nếp hoặc khen thưởng');
      return;
    }

    if (targetScope === 'individual' && !studentName.trim()) {
      alert('Vui lòng nhập họ và tên học sinh vi phạm hoặc chọn phạm vi là Cả tập thể lớp');
      return;
    }

    const targetClass = classes.find(c => c.id === classId);

    addRecord({
      type: recordType,
      week,
      date,
      dayOfWeek,
      session,
      period,
      classId,
      ruleId: currentRule.id,
      ruleCode: currentRule.code,
      ruleTitle: currentRule.title,
      category: currentRule.category,
      points: customPoints,
      studentName: targetScope === 'individual' ? studentName.trim() : undefined,
      note: note.trim() || undefined,
      reporter: reporter.trim(),
      reporterRole
    });

    const actionText = recordType === 'penalty' 
      ? `Đã trừ ${Math.abs(customPoints)} điểm lớp ${targetClass?.name}` 
      : `Đã cộng +${customPoints} điểm cho lớp ${targetClass?.name}`;
    
    setToastMessage(`${actionText} thành công!`);
    setTimeout(() => setToastMessage(null), 3500);

    // Reset fields
    setStudentName('');
    setNote('');
    if (!keepClassAfterSubmit) {
      // Don't change class
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setActiveTab('records')}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-md font-semibold cursor-pointer"
          >
            Xem sổ biên bản →
          </button>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header with Type Toggle */}
        <div className="bg-slate-50/80 p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Phiếu Chấm Điểm & Ghi Nhận Nề Nếp Học Đường
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng theo quy chế thi đua nề nếp THPT năm học {config.academicYear}
            </p>
          </div>

          {/* Type Toggle: Vi phạm vs Khen thưởng */}
          <div className="inline-flex rounded-xl bg-slate-200/80 p-1">
            <button
              type="button"
              id="entry-mode-penalty"
              onClick={() => {
                setRecordType('penalty');
                setCustomPoints(-2);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                recordType === 'penalty'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-4 h-4" />
              Ghi Nhận Lỗi (Điểm Trừ)
            </button>

            <button
              type="button"
              id="entry-mode-bonus"
              onClick={() => {
                setRecordType('bonus');
                setCustomPoints(5);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                recordType === 'bonus'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Khen Thưởng (Điểm Cộng)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Section 1: Thời gian & Lớp vi phạm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Week */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tuần Đánh Giá <span className="text-rose-500">*</span>
              </label>
              <select
                value={week}
                onChange={e => setWeek(Number(e.target.value))}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                {Array.from({ length: config.totalWeeks }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>
                    Tuần {w} {w === config.currentWeek ? '(Hiện tại)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày Ghi Nhận <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Session & Period */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Buổi / Tiết Học
              </label>
              <div className="flex gap-2">
                <select
                  value={session}
                  onChange={e => setSession(e.target.value as any)}
                  className="w-1/2 text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="morning">Sáng</option>
                  <option value="afternoon">Chiều</option>
                </select>
                <select
                  value={period}
                  onChange={e => setPeriod(Number(e.target.value))}
                  className="w-1/2 text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={0}>15 phút đầu giờ</option>
                  <option value={1}>Tiết 1</option>
                  <option value={2}>Tiết 2</option>
                  <option value={3}>Tiết 3</option>
                  <option value={4}>Tiết 4</option>
                  <option value={5}>Tiết 5</option>
                  <option value={6}>Giờ Ra Chơi</option>
                  <option value={7}>Chào Cờ Đầu Tuần / Hoạt Động Chung</option>
                </select>
              </div>
            </div>

            {/* Target Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lớp Bị Chấm Điểm <span className="text-rose-500">*</span>
              </label>
              <select
                id="entry-select-class"
                value={classId}
                onChange={e => setClassId(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 text-slate-900 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              >
                <optgroup label="Khối 10">
                  {classes.filter(c => c.grade === 10).map(c => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} ({c.homeroomTeacher})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Khối 11">
                  {classes.filter(c => c.grade === 11).map(c => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} ({c.homeroomTeacher})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Khối 12">
                  {classes.filter(c => c.grade === 12).map(c => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} ({c.homeroomTeacher})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Section 2: Danh Mục & Chọn Barem Lỗi/Khen Thưởng */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {recordType === 'penalty' ? '1. Chọn Danh Mục Nề Nếp Vi Phạm' : '1. Danh Mục Khen Thưởng'}
              </label>
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm nội quy (áo dài, đi muộn...)"
                  value={ruleSearch}
                  onChange={e => setRuleSearch(e.target.value)}
                  className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category tabs for penalties */}
            {recordType === 'penalty' && (
              <div className="flex flex-wrap gap-1.5">
                {(['chuyen_can', 'hoc_tap', 'dong_phuc', 've_sinh', 'ky_luat'] as CategoryKey[]).map(catKey => {
                  const cat = CATEGORIES_CONFIG[catKey];
                  const isSelected = selectedCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedCategory(catKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {availableRules.map(r => {
                const isSelected = selectedRuleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleSelectRule(r)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                      isSelected
                        ? recordType === 'penalty'
                          ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-500'
                          : 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {r.code}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {r.title}
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {r.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
                          recordType === 'penalty'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {r.defaultPoints > 0 ? `+${r.defaultPoints}` : r.defaultPoints}đ
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Điểm số, Đối tượng & Diễn giải */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Points Modifier */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Điểm {recordType === 'penalty' ? 'Trừ' : 'Cộng'} (Cho phép điều chỉnh)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customPoints}
                  onChange={e => setCustomPoints(Number(e.target.value))}
                  className={`w-full text-base font-extrabold p-2 rounded-lg border focus:outline-none ${
                    recordType === 'penalty'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-teal-50 text-teal-800 border-teal-300'
                  }`}
                  step={1}
                  required
                />
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">điểm</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Có thể sửa tăng nặng hoặc giảm nhẹ theo tình tiết
              </p>
            </div>

            {/* Scope & Student Name */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đối Tượng Vi Phạm / Được Khen Thưởng
              </label>
              <div className="flex gap-3 mb-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'individual'}
                    onChange={() => setTargetScope('individual')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Cá nhân học sinh
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="targetScope"
                    checked={targetScope === 'collective'}
                    onChange={() => setTargetScope('collective')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Cả tập thể lớp
                </label>
              </div>

              {targetScope === 'individual' ? (
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nhập họ và tên học sinh (VD: Nguyễn Hoàng An)..."
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    required={targetScope === 'individual'}
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                  Áp dụng chung cho toàn thể chi đoàn (VD: Vệ sinh lớp, tập trung chào cờ, tiết tốt...)
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Diễn giải chi tiết & Người lập biên bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Diễn Giải Tình Huống / Ghi Chú Cụ Thể
              </label>
              <textarea
                rows={2}
                placeholder="VD: Đi học muộn 10 phút lúc 7h10; hoặc Giờ Văn cô Mai đạt giờ học tốt..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Reporter info */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Người Ghi Nhận / Chấm Điểm
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={reporter}
                  onChange={e => setReporter(e.target.value)}
                  placeholder="Tên Sao Đỏ / Giám thị"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <select
                  value={reporterRole}
                  onChange={e => setReporterRole(e.target.value as ReporterRole)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="co_do">Đội Cờ Đỏ / Sao Đỏ</option>
                  <option value="giam_thi">Thầy Cô Giám Thị</option>
                  <option value="giao_vien">Giáo Viên Bộ Môn / GVCN</option>
                  <option value="doan_truong">Đoàn Trường</option>
                </select>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keepClass"
                  checked={keepClassAfterSubmit}
                  onChange={e => setKeepClassAfterSubmit(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="keepClass" className="text-xs text-slate-600 cursor-pointer">
                  Giữ lại lớp hiện tại để tiếp tục chấm mục khác
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="submit"
              id="btn-submit-record"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition cursor-pointer ${
                recordType === 'penalty'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {recordType === 'penalty'
                  ? `Lưu Biên Bản Điểm Trừ (${customPoints}đ)`
                  : `Lưu Biên Bản Khen Thưởng (+${customPoints}đ)`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
