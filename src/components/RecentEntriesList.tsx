import React, { useState, useMemo } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { EvaluationRecord, RecordType } from '../types/emulation';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Calendar, 
  Clock, 
  Minus, 
  Plus, 
  Check, 
  X,
  MessageSquareWarning,
  ArrowUpDown
} from 'lucide-react';

interface RecentEntriesListProps {
  onOpenClassModal: (classId: string) => void;
}

export const RecentEntriesList: React.FC<RecentEntriesListProps> = ({ onOpenClassModal }) => {
  const {
    records,
    classes,
    selectedWeek,
    setSelectedWeek,
    config,
    addRecord,
    deleteRecord,
    deleteClass,
    appealRecord,
    resolveAppeal
  } = useEmulation();

  const [filterType, setFilterType] = useState<RecordType | 'all'>('all');
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appealModalRecord, setAppealModalRecord] = useState<EvaluationRecord | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<EvaluationRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [lastDeletedRecord, setLastDeletedRecord] = useState<EvaluationRecord | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [resolveModalData, setResolveModalData] = useState<{
    id: string;
    approved: boolean;
    title: string;
    note: string;
  } | null>(null);

  const [sortBy, setSortBy] = useState<'grade_class' | 'newest' | 'penalty'>('grade_class');

  const classMap = useMemo(() => new Map(classes.map(c => [c.id, c])), [classes]);

  // Filter & sort records (Mặc định: Sắp xếp theo khối và sau đó là sắp xếp theo lớp)
  const filteredRecords = useMemo(() => {
    const filtered = records.filter(r => {
      if (r.week !== selectedWeek) return false;
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterClassId !== 'all' && r.classId !== filterClassId) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const cls = classMap.get(r.classId);
        const matchClass = cls?.name.toLowerCase().includes(q);
        const matchStudent = r.studentName?.toLowerCase().includes(q);
        const matchRule = r.ruleTitle.toLowerCase().includes(q) || r.ruleCode.toLowerCase().includes(q);
        const matchReporter = r.reporter.toLowerCase().includes(q);
        const matchNote = r.note?.toLowerCase().includes(q);
        if (!matchClass && !matchStudent && !matchRule && !matchReporter && !matchNote) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'grade_class') {
        const clsA = classMap.get(a.classId);
        const clsB = classMap.get(b.classId);
        const gradeA = clsA?.grade ?? 99;
        const gradeB = clsB?.grade ?? 99;

        // 1. Sắp xếp theo khối (Khối 10 -> Khối 11 -> Khối 12)
        if (gradeA !== gradeB) {
          return gradeA - gradeB;
        }

        // 2. Sau đó sắp xếp theo tên lớp (ví dụ: 10A1 -> 10A2 -> 10A3...)
        const nameA = clsA?.name ?? '';
        const nameB = clsB?.name ?? '';
        const nameCompare = nameA.localeCompare(nameB, 'vi', { numeric: true, sensitivity: 'base' });
        if (nameCompare !== 0) {
          return nameCompare;
        }

        // 3. Trong cùng 1 lớp, sắp xếp theo ngày/thời gian mới nhất
        return b.date.localeCompare(a.date);
      } else if (sortBy === 'newest') {
        return b.date.localeCompare(a.date);
      } else if (sortBy === 'penalty') {
        return a.points - b.points;
      }
      return 0;
    });
  }, [records, selectedWeek, filterType, filterClassId, searchQuery, classMap, sortBy]);

  // Đếm số lượng biên bản theo từng khối trong danh sách đang lọc
  const gradeCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    filteredRecords.forEach(r => {
      const g = classMap.get(r.classId)?.grade;
      if (g) {
        counts[g] = (counts[g] || 0) + 1;
      }
    });
    return counts;
  }, [filteredRecords, classMap]);

  const handleOpenDeleteModal = (rec: EvaluationRecord) => {
    setDeleteConfirmRecord(rec);
  };

  const handleExecuteDelete = (rec: EvaluationRecord) => {
    const ruleTitle = rec.ruleTitle;
    const cls = classes.find(c => c.id === rec.classId)?.name;
    
    // Kích hoạt hiệu ứng xóa mượt mà (slide-out, fade-out, thu gọn ô)
    setDeletingIds(prev => new Set(prev).add(rec.id));
    setDeleteConfirmRecord(null);
    setConfirmDeleteId(null);

    // Chờ 350ms cho hiệu ứng diễn ra hoàn tất trước khi xóa khỏi state
    setTimeout(() => {
      deleteRecord(rec.id);
      setLastDeletedRecord(rec);
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
      setToastNotification(`Đã xóa thành công biên bản "${ruleTitle}" của lớp ${cls}`);
      setTimeout(() => setToastNotification(null), 5000);
    }, 350);
  };

  const handleExecuteDeleteClass = (classId: string, className: string) => {
    // Thu thập tất cả các biên bản của lớp này đang hiển thị để kích hoạt hiệu ứng xóa trượt mờ
    const classRecords = records.filter(r => r.classId === classId);
    
    setDeletingIds(prev => {
      const next = new Set(prev);
      classRecords.forEach(r => next.add(r.id));
      return next;
    });

    setDeleteConfirmRecord(null);
    setConfirmDeleteId(null);

    // Chờ 350ms cho hiệu ứng thu gọn ô hoàn tất
    setTimeout(() => {
      deleteClass(classId);
      setDeletingIds(prev => {
        const next = new Set(prev);
        classRecords.forEach(r => next.delete(r.id));
        return next;
      });
      setToastNotification(`Đã xóa thành công Lớp ${className} và toàn bộ dữ liệu thi đua của lớp.`);
      setTimeout(() => setToastNotification(null), 5000);
    }, 350);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmRecord) {
      handleExecuteDelete(deleteConfirmRecord);
    }
  };

  const handleUndoDelete = () => {
    if (lastDeletedRecord) {
      const { id, createdAt, status, ...rest } = lastDeletedRecord;
      addRecord(rest);
      setToastNotification(`Đã hoàn tác và khôi phục biên bản "${lastDeletedRecord.ruleTitle}".`);
      setLastDeletedRecord(null);
      setTimeout(() => setToastNotification(null), 3500);
    }
  };

  const handleOpenAppeal = (rec: EvaluationRecord) => {
    setAppealModalRecord(rec);
    setAppealReason(rec.appealNote || '');
  };

  const handleSubmitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealModalRecord) return;
    if (!appealReason.trim()) return;
    appealRecord(appealModalRecord.id, appealReason.trim());
    const ruleTitle = appealModalRecord.ruleTitle;
    setAppealModalRecord(null);
    setAppealReason('');
    setToastNotification(`Đã gửi khiếu nại biên bản "${ruleTitle}" tới Đoàn Trường.`);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleOpenResolveModal = (id: string, approved: boolean, title: string) => {
    setResolveModalData({
      id,
      approved,
      title,
      note: approved
        ? 'Đã xác minh nhầm lẫn / Chi đoàn đã khắc phục tốt, miễn trừ điểm.'
        : 'Không đủ căn cứ miễn trừ / Bằng chứng vi phạm rõ ràng, giữ nguyên điểm trừ.'
    });
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalData) return;
    resolveAppeal(resolveModalData.id, resolveModalData.approved, resolveModalData.note);
    const msg = resolveModalData.approved
      ? `Đã chấp nhận khiếu nại (miễn 0đ): "${resolveModalData.title}"`
      : `Đã từ chối khiếu nại (giữ điểm trừ): "${resolveModalData.title}"`;
    setResolveModalData(null);
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Lọc sổ:
          </span>

          {/* Type Filter */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Tất Cả ({records.filter(r => r.week === selectedWeek).length})
            </button>
            <button
              onClick={() => setFilterType('penalty')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterType === 'penalty' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Điểm Trừ ({records.filter(r => r.week === selectedWeek && r.type === 'penalty').length})
            </button>
            <button
              onClick={() => setFilterType('bonus')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                filterType === 'bonus' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Điểm Cộng ({records.filter(r => r.week === selectedWeek && r.type === 'bonus').length})
            </button>
          </div>

          {/* Class Filter */}
          <select
            value={filterClassId}
            onChange={e => setFilterClassId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-700"
          >
            <option value="all">Tất cả các lớp</option>
            <optgroup label="Khối 10">
              {classes
                .filter(c => c.grade === 10)
                .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Khối 11">
              {classes
                .filter(c => c.grade === 11)
                .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Khối 12">
              {classes
                .filter(c => c.grade === 12)
                .sort((a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true }))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    Lớp {c.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên học sinh, lớp, nội quy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {toastNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastNotification}</span>
            {lastDeletedRecord && (
              <button
                onClick={handleUndoDelete}
                className="ml-2 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer shadow-2xs"
              >
                Hoàn tác (Khôi phục)
              </button>
            )}
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer transition-all duration-150 active:scale-90"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Records Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Sổ Nhật Ký Chấm Nề Nếp Tuần {selectedWeek}
            </h3>
            <span className="text-xs text-slate-500">
              ({filteredRecords.length} biên bản)
            </span>
          </div>

          {/* Sắp xếp điều khiển */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              Sắp xếp:
            </span>
            <select
              id="select-sort-records"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none shadow-2xs cursor-pointer"
            >
              <option value="grade_class">Theo Khối rồi theo Lớp (Mặc định)</option>
              <option value="newest">Mới nhất theo ngày</option>
              <option value="penalty">Điểm trừ nhiều nhất</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium">Chưa có bản ghi nào phù hợp với bộ lọc</p>
            <p className="text-xs text-slate-400">
              Hãy bấm tab "Nhập Điểm Nề Nếp" để thêm biên bản vi phạm hoặc điểm cộng mới.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((rec, index) => {
              const cls = classes.find(c => c.id === rec.classId);
              const cat = CATEGORIES_CONFIG[rec.category];
              const isPenalty = rec.type === 'penalty';
              const isAppealed = rec.status === 'appealed';
              const isResolved = rec.status === 'resolved';

              const isDeleting = deletingIds.has(rec.id);

              // Kiểm tra xem có phải mục đầu tiên của một Khối khi sắp xếp theo Khối & Lớp
              const prevRecord = index > 0 ? filteredRecords[index - 1] : null;
              const prevGrade = prevRecord ? classMap.get(prevRecord.classId)?.grade : null;
              const currentGrade = cls?.grade;
              const isGradeHeaderNeeded = sortBy === 'grade_class' && currentGrade && (index === 0 || prevGrade !== currentGrade);

              return (
                <React.Fragment key={rec.id}>
                  {isGradeHeaderNeeded && (
                    <div className="bg-slate-100/90 backdrop-blur-xs border-y border-slate-200 px-4 py-2 flex items-center justify-between sticky top-0 z-10 select-none shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white font-black text-[11px] shadow-2xs">
                          {currentGrade}
                        </span>
                        <span className="font-black text-xs text-slate-800 tracking-wide uppercase">
                          KHỐI {currentGrade}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {gradeCounts[currentGrade] || 0} biên bản
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        Sắp xếp theo Khối {currentGrade} → Thứ tự Lớp (A1, A2...)
                      </span>
                    </div>
                  )}

                  <div
                    id={`entry-record-${rec.id}`}
                    className={`transition-all duration-300 ease-in-out flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDeleting
                        ? 'opacity-0 -translate-x-12 scale-95 max-h-0 !p-0 !my-0 !border-0 overflow-hidden bg-rose-100/90 pointer-events-none'
                        : isAppealed
                        ? 'p-4 bg-amber-50/40 hover:bg-slate-50/80 max-h-[600px] opacity-100 translate-x-0 scale-100'
                        : 'p-4 hover:bg-slate-50/80 max-h-[600px] opacity-100 translate-x-0 scale-100'
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Grade badge */}
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Khối {cls?.grade}
                        </span>

                        {/* Badge class */}
                        <button
                          onClick={() => onOpenClassModal(rec.classId)}
                          className="font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white hover:bg-blue-600 transition active:scale-95 duration-100 cursor-pointer shadow-2xs"
                        >
                          Lớp {cls?.name}
                        </button>

                      {/* Rule code & Category */}
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {rec.ruleCode}
                      </span>

                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${cat?.bgColor} ${cat?.textColor} ${cat?.borderColor}`}>
                        {cat?.label}
                      </span>

                      {/* Day & Period */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.dayOfWeek} ({rec.date}) • {rec.session === 'morning' ? 'Sáng' : 'Chiều'}
                        {rec.period !== undefined ? (
                          rec.period === 0
                            ? ' • 15 phút đầu giờ'
                            : rec.period === 6
                            ? ' • Ra chơi'
                            : rec.period === 7
                            ? ' • Chào cờ'
                            : ` • Tiết ${rec.period}`
                        ) : ''}
                      </span>

                      {/* Appeal Status */}
                      {isAppealed && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <MessageSquareWarning className="w-3 h-3" />
                          Đang khiếu nại
                        </span>
                      )}
                      {isResolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          Đã miễn điểm trừ
                        </span>
                      )}
                    </div>

                    {/* Rule Title & Student Name */}
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{rec.ruleTitle}</span>
                      {rec.studentName && (
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-500" />
                          {rec.studentName}
                        </span>
                      )}
                    </div>

                    {/* Note / Description */}
                    {rec.note && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        "{rec.note}"
                      </p>
                    )}

                    {/* Appeal note if exists */}
                    {rec.appealNote && (
                      <div className="text-xs text-amber-900 bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                        <strong>Ý kiến lớp/GVCN phản hồi:</strong> {rec.appealNote}
                        {rec.resolutionNote && (
                          <div className="mt-1 text-slate-700 font-medium">
                            ↳ <strong>Kết luận Đoàn Trường:</strong> {rec.resolutionNote}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reporter */}
                    <div className="text-[11px] text-slate-400">
                      Ghi nhận bởi: <span className="font-medium text-slate-600">{rec.reporter}</span>
                    </div>
                  </div>

                  {/* Right: Points & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-base font-black px-3 py-1 rounded-xl inline-block ${
                          isPenalty
                            ? isResolved
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {rec.points > 0 ? `+${rec.points}` : rec.points}đ
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                      {isAppealed ? (
                        <>
                          <button
                            onClick={() => handleOpenResolveModal(rec.id, true, rec.ruleTitle)}
                            title="Duyệt chấp nhận khiếu nại (miễn trừ điểm)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none hover:scale-105 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenResolveModal(rec.id, false, rec.ruleTitle)}
                            title="Từ chối khiếu nại (giữ nguyên điểm trừ)"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none hover:scale-105 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        isPenalty && !isResolved && (
                          <button
                            onClick={() => handleOpenAppeal(rec)}
                            title="Lớp phản hồi / Khiếu nại biên bản"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none hover:scale-105 cursor-pointer shadow-2xs hover:shadow-xs"
                          >
                            <MessageSquareWarning className="w-4 h-4" />
                          </button>
                        )
                      )}

                      <button
                        id={`btn-delete-record-${rec.id}`}
                        onClick={() => setDeleteConfirmRecord(rec)}
                        title={`Xóa biên bản hoặc xóa Lớp ${cls?.name || ''} (Cần xác nhận)`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none hover:scale-105 cursor-pointer shadow-2xs hover:shadow-xs group"
                      >
                        <Trash2 className="w-4 h-4 transition-transform duration-150 ease-out group-active:scale-90" />
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Xóa Biên Bản</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ xóa vĩnh viễn và tự động tính lại điểm.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Chi đoàn:</span>
                <span className="font-black text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  Lớp {classes.find(c => c.id === deleteConfirmRecord.classId)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Nội dung biên bản:</span>
                <span className="font-bold text-slate-900 text-right max-w-[220px] truncate">
                  {deleteConfirmRecord.ruleTitle}
                </span>
              </div>
              {deleteConfirmRecord.studentName && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600">Học sinh vi phạm:</span>
                  <span className="font-bold text-rose-700">{deleteConfirmRecord.studentName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Điểm điều chỉnh:</span>
                <span className={`font-black px-2 py-0.5 rounded ${
                  deleteConfirmRecord.type === 'penalty' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                }`}>
                  {deleteConfirmRecord.points > 0 ? `+${deleteConfirmRecord.points}` : deleteConfirmRecord.points}đ
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-1.5 border-t border-slate-200/80 text-[11px]">
                <span>Thời gian ghi nhận:</span>
                <span>{deleteConfirmRecord.date} ({deleteConfirmRecord.dayOfWeek})</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
              <span className="shrink-0 text-base">⚠️</span>
              <span>
                Sau khi xóa, điểm thi đua và thứ hạng tuần {deleteConfirmRecord.week} của lớp sẽ được tự động hoàn lại ngay lập tức.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer transition-all duration-150 ease-out flex items-center gap-1.5 active:scale-95 active:translate-y-0.5 transform select-none"
              >
                <Trash2 className="w-4 h-4" />
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Resolution Modal */}
      {resolveModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                {resolveModalData.approved ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <X className="w-5 h-5 text-rose-600" />
                )}
                {resolveModalData.approved ? 'Duyệt Chấp Nhận Khiếu Nại' : 'Từ Chối Khiếu Nại'}
              </h3>
              <button
                onClick={() => setResolveModalData(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-all duration-150 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {resolveModalData.approved
                ? `Chấp nhận giải trình cho biên bản "${resolveModalData.title}". Điểm trừ sẽ được hoàn lại (0đ) cho chi đoàn.`
                : `Không chấp nhận giải trình cho biên bản "${resolveModalData.title}". Giữ nguyên điểm trừ của chi đoàn.`}
            </p>

            <form onSubmit={handleConfirmResolve} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kết Luận / Ghi Chú Của Ban Thi Đua Đoàn Trường <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveModalData.note}
                  onChange={e => setResolveModalData({ ...resolveModalData, note: e.target.value })}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalData(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none flex items-center gap-1.5 ${
                    resolveModalData.approved
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {resolveModalData.approved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {resolveModalData.approved ? 'Xác Nhận Miễn Điểm' : 'Xác Nhận Giữ Điểm Trừ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Nếu đồng ý sẽ xóa lớp hoặc xóa biên bản */}
      {deleteConfirmRecord && (() => {
        const cls = classes.find(c => c.id === deleteConfirmRecord.classId);
        const clsName = cls ? cls.name : '';
        return (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Xác Nhận Xóa
                </h3>
                <button
                  onClick={() => setDeleteConfirmRecord(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2">
                  <div className="font-bold text-sm text-rose-900 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Bạn có chắc chắn muốn xóa không?
                  </div>
                  <div className="text-slate-700 space-y-1">
                    <div>
                      • Chi đoàn: <strong className="text-slate-900 font-bold">Lớp {clsName}</strong>
                    </div>
                    <div>
                      • Nội dung: <span className="font-semibold text-slate-900">{deleteConfirmRecord.ruleTitle}</span> ({deleteConfirmRecord.points > 0 ? `+${deleteConfirmRecord.points}` : `${deleteConfirmRecord.points}đ`})
                    </div>
                  </div>
                  <p className="text-slate-500 text-[11px] pt-1 leading-relaxed">
                    Nếu đồng ý, hệ thống sẽ thực hiện xóa với hiệu ứng thu gọn mượt mà. Vui lòng chọn hành động bạn muốn thực hiện:
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  id="btn-confirm-delete-class"
                  onClick={() => handleExecuteDeleteClass(deleteConfirmRecord.classId, clsName)}
                  className="w-full px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Đồng Ý Xóa Lớp {clsName} (Xóa Khỏi Hệ Thống)
                </button>

                <button
                  id="btn-confirm-delete-entry-only"
                  onClick={() => handleExecuteDelete(deleteConfirmRecord)}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all duration-150 ease-out active:scale-95 active:translate-y-0.5 transform select-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 text-slate-600" />
                  Chỉ Xóa Biên Bản Này Của Lớp {clsName}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmRecord(null)}
                  className="w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition cursor-pointer text-center"
                >
                  Hủy Bỏ (Không Xóa)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Appeal Dialog Modal */}
      {appealModalRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-amber-600" />
                Gửi Khiếu Nại / Giải Trình Nề Nếp
              </h3>
              <button
                onClick={() => setAppealModalRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div>
                <strong>Lớp:</strong> {classes.find(c => c.id === appealModalRecord.classId)?.name}
              </div>
              <div>
                <strong>Lỗi vi phạm:</strong> {appealModalRecord.ruleTitle} ({appealModalRecord.points}đ)
              </div>
              {appealModalRecord.studentName && (
                <div>
                  <strong>Học sinh:</strong> {appealModalRecord.studentName}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitAppeal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội Dung Giải Trình Của Lớp / GVCN <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nêu rõ lý do khiếu nại (VD: Em học sinh đã có giấy phép của phụ huynh nộp sau giờ học, hoặc sao đỏ ghi nhầm tên học sinh lớp khác...)"
                  value={appealReason}
                  onChange={e => setAppealReason(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAppealModalRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Gửi Khiếu Nại Tới Đoàn Trường
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
