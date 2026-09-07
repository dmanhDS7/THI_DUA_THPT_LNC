import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { ClassInfo, Grade } from '../types/emulation';
import { 
  Settings, 
  School, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  Users,
  ShieldAlert
} from 'lucide-react';

export const SchoolSettings: React.FC = () => {
  const {
    config,
    updateConfig,
    classes,
    addClass,
    updateClass,
    deleteClass,
    resetToDefaults,
    exportDataJson,
    importDataJson
  } = useEmulation();

  // School config state
  const [schoolName, setSchoolName] = useState(config.schoolName);
  const [academicYear, setAcademicYear] = useState(config.academicYear);
  const [semester, setSemester] = useState(config.semester);
  const [basePoints, setBasePoints] = useState(config.basePointsPerWeek);
  const [currentWeek, setCurrentWeek] = useState(config.currentWeek);
  const [isSavedConfig, setIsSavedConfig] = useState(false);

  // Class modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);

  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState<Grade>(10);
  const [newTeacher, setNewTeacher] = useState('');
  const [newMonitor, setNewMonitor] = useState('');
  const [newCount, setNewCount] = useState(42);
  const [newRoom, setNewRoom] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      semester: Number(semester) as 1 | 2,
      basePointsPerWeek: Number(basePoints),
      currentWeek: Number(currentWeek)
    });
    setIsSavedConfig(true);
    setTimeout(() => setIsSavedConfig(false), 2500);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newTeacher.trim()) {
      alert('Vui lòng nhập tên lớp và tên giáo viên chủ nhiệm');
      return;
    }

    addClass({
      name: newClassName.trim().toUpperCase(),
      grade: newGrade,
      homeroomTeacher: newTeacher.trim(),
      monitor: newMonitor.trim() || 'Chưa cập nhật',
      studentCount: Number(newCount),
      room: newRoom.trim() || 'Phòng học'
    });

    setIsAddClassOpen(false);
    setNewClassName('');
    setNewTeacher('');
    setNewMonitor('');
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    updateClass(editingClass.id, editingClass);
    setEditingClass(null);
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp ${name}? Toàn bộ dữ liệu thi đua của lớp sẽ bị xóa.`)) {
      deleteClass(id);
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SaoLuu_ThiDua_THPT_${config.academicYear.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      const ok = importDataJson(text);
      if (ok) {
        alert('Phục hồi dữ liệu từ file sao lưu thành công!');
      } else {
        alert('File sao lưu không hợp lệ. Vui lòng kiểm tra lại định dạng JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Cài Đặt Hệ Thống & Quản Lý Danh Sách Lớp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tùy biến tên trường, barem thang điểm gốc, danh mục các chi đoàn lớp và sao lưu dữ liệu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Cấu hình trường & Thang điểm gốc */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="w-4 h-4 text-blue-600" />
            Thông Tin Nhà Trường & Quy Chế
          </h3>

          <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Trường THPT</label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm Học</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học Kỳ</label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value) as 1 | 2)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value={1}>Học kỳ 1</option>
                  <option value={2}>Học kỳ 2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Điểm Gốc Mỗi Tuần</label>
                <input
                  type="number"
                  required
                  value={basePoints}
                  onChange={e => setBasePoints(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Mặc định 100đ hoặc 500đ</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tuần Hiện Tại</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={35}
                  value={currentWeek}
                  onChange={e => setCurrentWeek(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {isSavedConfig ? 'Đã Lưu Thay Đổi!' : 'Lưu Cấu Hình'}
              </button>
            </div>
          </form>

          {/* Backup & Restore Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-700">Sao Lưu & Phục Hồi Dữ Liệu</h4>
            <div className="space-y-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Tải Về File Sao Lưu (JSON)
              </button>

              <label className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Khôi Phục Từ File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={resetToDefaults}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Khôi Phục Dữ Liệu Mẫu THPT Chuẩn
              </button>
            </div>
          </div>
        </div>

        {/* Col 2 & 3: Danh Sách Các Lớp Học */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Danh Sách Chi Đoàn Các Lớp ({classes.length} lớp)
              </h3>
              <p className="text-xs text-slate-500">
                Gồm đầy đủ 3 khối: Khối 10, Khối 11, Khối 12
              </p>
            </div>

            <button
              onClick={() => setIsAddClassOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm Lớp Mới
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {classes.map(cls => (
              <div key={cls.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Lớp {cls.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      Khối {cls.grade}
                    </span>
                    <span className="text-slate-400">({cls.room})</span>
                  </div>
                  <div className="text-slate-600">
                    GVCN: <strong>{cls.homeroomTeacher}</strong> • Lớp trưởng: {cls.monitor} • Sĩ số: {cls.studentCount} HS
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingClass({ ...cls })}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Sửa thông tin lớp"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                    title="Xóa lớp"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Add Class */}
      {isAddClassOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Lớp Mới</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Lớp (VD: 10A5)</label>
                  <input
                    type="text"
                    required
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối</label>
                  <select
                    value={newGrade}
                    onChange={e => setNewGrade(Number(e.target.value) as Grade)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo Viên Chủ Nhiệm (GVCN)</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cô Vũ Thị Hà"
                  value={newTeacher}
                  onChange={e => setNewTeacher(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp Trưởng</label>
                  <input
                    type="text"
                    placeholder="VD: Lê Quang Huy"
                    value={newMonitor}
                    onChange={e => setNewMonitor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sĩ Số Học Sinh</label>
                  <input
                    type="number"
                    value={newCount}
                    onChange={e => setNewCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng Học</label>
                <input
                  type="text"
                  placeholder="VD: Phòng 204 - Nhà B"
                  value={newRoom}
                  onChange={e => setNewRoom(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Thêm Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Class */}
      {editingClass && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Sửa Thông Tin Lớp {editingClass.name}</h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo Viên Chủ Nhiệm (GVCN)</label>
                <input
                  type="text"
                  required
                  value={editingClass.homeroomTeacher}
                  onChange={e => setEditingClass({ ...editingClass, homeroomTeacher: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp Trưởng</label>
                  <input
                    type="text"
                    value={editingClass.monitor}
                    onChange={e => setEditingClass({ ...editingClass, monitor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sĩ Số</label>
                  <input
                    type="number"
                    value={editingClass.studentCount}
                    onChange={e => setEditingClass({ ...editingClass, studentCount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng Học</label>
                <input
                  type="text"
                  value={editingClass.room}
                  onChange={e => setEditingClass({ ...editingClass, room: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Cập Nhật Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
