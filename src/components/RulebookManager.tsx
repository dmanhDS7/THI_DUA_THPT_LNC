import React, { useState } from 'react';
import { useEmulation } from '../context/EmulationContext';
import { CategoryKey, RecordType, RuleDefinition } from '../types/emulation';
import { CATEGORIES_CONFIG } from '../data/initialData';
import { 
  BookMarked, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const RulebookManager: React.FC = () => {
  const { rules, addRule, updateRule, deleteRule } = useEmulation();

  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleDefinition | null>(null);

  // New rule state
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryKey>('chuyen_can');
  const [newType, setNewType] = useState<RecordType>('penalty');
  const [newPoints, setNewPoints] = useState<number>(-2);
  const [newScope, setNewScope] = useState<'individual' | 'collective'>('individual');
  const [newDesc, setNewDesc] = useState('');

  // Filter rules
  const filteredRules = rules.filter(r => {
    if (activeCategory !== 'all' && r.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setNewCode(`NQ${rules.length + 1}`);
    setNewTitle('');
    setNewCategory('chuyen_can');
    setNewType('penalty');
    setNewPoints(-2);
    setNewScope('individual');
    setNewDesc('');
    setIsAddModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Vui lòng nhập tên nội quy');
      return;
    }

    addRule({
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      category: newCategory,
      type: newType,
      defaultPoints: newPoints,
      targetScope: newScope,
      description: newDesc.trim() || undefined
    });

    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (rule: RuleDefinition) => {
    setEditingRule({ ...rule });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    updateRule(editingRule.id, editingRule);
    setEditingRule(null);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa quy định "${title}" khỏi barem điểm?`)) {
      deleteRule(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600" />
            Barem Thang Điểm & Quy Chế Thi Đua Nề Nếp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy định số điểm trừ cho các hành vi vi phạm và điểm cộng biểu dương khen thưởng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm Nội Quy Mới
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({rules.length})
          </button>
          {Object.values(CATEGORIES_CONFIG).map(cat => {
            const count = rules.filter(r => r.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã hoặc tên nội quy..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredRules.map(rule => {
          const cat = CATEGORIES_CONFIG[rule.category];
          const isPenalty = rule.type === 'penalty';

          return (
            <div
              key={rule.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex items-start justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {rule.code}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${cat?.bgColor} ${cat?.textColor} ${cat?.borderColor}`}>
                    {cat?.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {rule.targetScope === 'individual' ? 'Cá nhân HS' : 'Tập thể lớp'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{rule.title}</h3>
                {rule.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{rule.description}</p>
                )}
              </div>

              <div className="text-right shrink-0 space-y-2">
                <span
                  className={`inline-block px-3 py-1 rounded-xl text-sm font-black ${
                    isPenalty
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                >
                  {rule.defaultPoints > 0 ? `+${rule.defaultPoints}` : rule.defaultPoints}đ
                </span>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    title="Chỉnh sửa nội quy"
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id, rule.title)}
                    title="Xóa nội quy"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Rule */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Nội Quy Barem Mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Quy Định</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại Barem</label>
                  <select
                    value={newType}
                    onChange={e => {
                      const t = e.target.value as RecordType;
                      setNewType(t);
                      setNewPoints(t === 'penalty' ? -2 : 5);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="penalty">Điểm trừ (Vi phạm)</option>
                    <option value="bonus">Điểm cộng (Khen thưởng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Nội Quy / Hành Vi</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Sử dụng thiết bị điện tử khi chưa cho phép..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh Mục</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as CategoryKey)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {Object.values(CATEGORIES_CONFIG).map(cat => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm Chuẩn</label>
                  <input
                    type="number"
                    required
                    value={newPoints}
                    onChange={e => setNewPoints(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phạm Vi Áp Dụng</label>
                <select
                  value={newScope}
                  onChange={e => setNewScope(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="individual">Cá nhân học sinh</option>
                  <option value="collective">Cả tập thể lớp</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả Chi Tiết (Không bắt buộc)</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Lưu Nội Quy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Rule */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh Sửa Barem Nội Quy</h3>
              <button onClick={() => setEditingRule(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Quy Định</label>
                <input
                  type="text"
                  required
                  value={editingRule.code}
                  onChange={e => setEditingRule({ ...editingRule, code: e.target.value.toUpperCase() })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Nội Quy</label>
                <input
                  type="text"
                  required
                  value={editingRule.title}
                  onChange={e => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm Quy Định</label>
                  <input
                    type="number"
                    required
                    value={editingRule.defaultPoints}
                    onChange={e => setEditingRule({ ...editingRule, defaultPoints: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phạm Vi</label>
                  <select
                    value={editingRule.targetScope}
                    onChange={e => setEditingRule({ ...editingRule, targetScope: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="individual">Cá nhân học sinh</option>
                    <option value="collective">Cả tập thể lớp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô Tả</label>
                <textarea
                  rows={2}
                  value={editingRule.description || ''}
                  onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Cập Nhật Nội Quy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
