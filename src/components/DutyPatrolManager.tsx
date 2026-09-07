import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { INITIAL_DUTY_SCHEDULE } from '../data/initialData';
import { 
  ShieldCheck, 
  Users, 
  MessageSquareWarning, 
  Check, 
  X, 
  Clock, 
  RefreshCw, 
  Plus, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export const DutyPatrolManager: React.FC = () => {
  const {
    classes,
    records,
    selectedWeek,
    resolveAppeal
  } = useEmulation();

  const [dutySchedule, setDutySchedule] = useState(() => {
    const saved = localStorage.getItem('thpt_duty_schedule');
    return saved ? JSON.parse(saved) : INITIAL_DUTY_SCHEDULE;
  });

  const [newPatrolClass, setNewPatrolClass] = useState(classes[0]?.id || '12a1');
  const [newTargetClass, setNewTargetClass] = useState(classes[1]?.id || '10a1');
  const [newMembers, setNewMembers] = useState('');
  const [newDutyNote, setNewDutyNote] = useState('');
  const [isAddDutyOpen, setIsAddDutyOpen] = useState(false);

  // Active appeals
  const appealedRecords = records.filter(r => r.status === 'appealed');
  const resolvedRecords = records.filter(r => r.status === 'resolved' && r.week === selectedWeek);

  const handleSaveDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `duty-${Date.now()}`,
      week: selectedWeek,
      patrolClassId: newPatrolClass,
      targetClassId: newTargetClass,
      assignedMembers: newMembers.split(',').map(m => m.trim()).filter(Boolean),
      note: newDutyNote.trim() || 'Trực và kiểm tra nề nếp buổi sáng'
    };
    const updated = [newEntry, ...dutySchedule];
    setDutySchedule(updated);
    localStorage.setItem('thpt_duty_schedule', JSON.stringify(updated));
    setIsAddDutyOpen(false);
    setNewMembers('');
    setNewDutyNote('');
  };

  const handleApprove = (id: string) => {
    const note = prompt('Nhập kết luận chấp nhận giải trình của lớp:', 'Lớp đã giải trình hợp lý và có xác nhận của GVCN / Đoàn trường');
    if (note !== null) {
      resolveAppeal(id, true, note);
    }
  };

  const handleReject = (id: string) => {
    const note = prompt('Nhập lý do bác bỏ khiếu nại:', 'Lỗi vi phạm rõ ràng có chữ ký xác nhận của học sinh');
    if (note !== null) {
      resolveAppeal(id, false, note);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Đội Cờ Đỏ Trực Tuần & Giải Quyết Khiếu Nại Nề Nếp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân công chấm chéo giữa các chi đoàn và tiếp nhận xử lý khiếu nại biên bản thi đua
          </p>
        </div>

        <button
          onClick={() => setIsAddDutyOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Phân Công Chấm Chéo Mới
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Lịch Phân Công Trực Chéo Cờ Đỏ */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Lịch Phân Công Chấm Chéo Cờ Đỏ (Tuần {selectedWeek})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Chống tiêu cực / Bao che
            </span>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {dutySchedule.map((duty: any) => {
              const patrolCls = classes.find(c => c.id === duty.patrolClassId);
              const targetCls = classes.find(c => c.id === duty.targetClassId);

              return (
                <div key={duty.id} className="p-3 hover:bg-slate-50 rounded-lg transition space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        Lớp {patrolCls?.name}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">chấm chéo</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        Lớp {targetCls?.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Tuần {duty.week}</span>
                  </div>

                  {duty.assignedMembers?.length > 0 && (
                    <div className="text-xs text-slate-700">
                      <strong>Cờ đỏ phụ trách:</strong> {duty.assignedMembers.join(', ')}
                    </div>
                  )}

                  {duty.note && (
                    <div className="text-[11px] text-slate-500 italic">
                      Nhiệm vụ: {duty.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Khiếu Nại & Phúc Khảo Điểm */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Khiếu Nại & Phúc Khảo Điểm Nề Nếp ({appealedRecords.length})
              </h3>
            </div>
            <span className="text-xs text-amber-700 font-semibold">
              Đoàn Trường Phê Duyệt
            </span>
          </div>

          <div className="p-4 space-y-3">
            {appealedRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Check className="w-8 h-8 mx-auto text-emerald-500 stroke-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Không có khiếu nại nào đang chờ giải quyết
                </p>
                <p className="text-[11px] text-slate-400">
                  Các chi đoàn đều đồng thuận với kết quả chấm điểm tuần này.
                </p>
              </div>
            ) : (
              appealedRecords.map(rec => {
                const cls = classes.find(c => c.id === rec.classId);
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          Lớp {cls?.name}
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          {rec.ruleTitle} ({rec.points}đ)
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Tuần {rec.week} • {rec.date}
                      </span>
                    </div>

                    {rec.studentName && (
                      <div className="text-xs text-slate-700">
                        <strong>Học sinh liên quan:</strong> {rec.studentName}
                      </div>
                    )}

                    <div className="text-xs bg-white p-2.5 rounded-lg border border-amber-200 text-amber-950 font-medium">
                      <strong>Lý do lớp khiếu nại:</strong> "{rec.appealNote}"
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleReject(rec.id)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition"
                      >
                        Bác Bỏ (Giữ Điểm Trừ)
                      </button>
                      <button
                        onClick={() => handleApprove(rec.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-2xs"
                      >
                        Chấp Nhận (Xóa Trừ Điểm)
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Resolved History */}
            {resolvedRecords.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 mb-2">
                  Đã Xử Lý Khiếu Nại Trong Tuần ({resolvedRecords.length})
                </h4>
                <div className="space-y-1.5">
                  {resolvedRecords.map(r => (
                    <div key={r.id} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong>{classes.find(c => c.id === r.classId)?.name}:</strong> {r.ruleTitle}
                        <span className="text-emerald-600 font-bold ml-1.5">✓ Đã miễn trừ</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{r.resolutionNote}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Add Duty */}
      {isAddDutyOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Phân Công Cờ Đỏ Chấm Chéo</h3>
              <button onClick={() => setIsAddDutyOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuty} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp Đi Chấm (Cờ Đỏ)</label>
                  <select
                    value={newPatrolClass}
                    onChange={e => setNewPatrolClass(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp Được Chấm</label>
                  <select
                    value={newTargetClass}
                    onChange={e => setNewTargetClass(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Lớp {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thành Viên Cờ Đỏ Phụ Trách</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A, Lê Thị B..."
                  value={newMembers}
                  onChange={e => setNewMembers(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi Chú Trực</label>
                <input
                  type="text"
                  placeholder="VD: Kiểm tra đầu giờ và sau giờ ra chơi..."
                  value={newDutyNote}
                  onChange={e => setNewDutyNote(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDutyOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
