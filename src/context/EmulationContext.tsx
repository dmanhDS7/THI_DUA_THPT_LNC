import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  AwardType,
  CategoryKey,
  ClassInfo,
  ClassWeekScore,
  EmulationTier,
  EvaluationRecord,
  Grade,
  RecordStatus,
  RuleDefinition,
  SchoolConfig,
  TabType
} from '../types/emulation';
import {
  INITIAL_CLASSES,
  INITIAL_CONFIG,
  INITIAL_RECORDS,
  INITIAL_RULES
} from '../data/initialData';

interface EmulationContextType {
  classes: ClassInfo[];
  rules: RuleDefinition[];
  records: EvaluationRecord[];
  config: SchoolConfig;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  filterGrade: Grade | 'all';
  setFilterGrade: (grade: Grade | 'all') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;

  // Computed data
  currentWeekScores: ClassWeekScore[];
  getWeekScores: (week: number) => ClassWeekScore[];
  getCumulativeScores: () => {
    classId: string;
    className: string;
    grade: Grade;
    homeroomTeacher: string;
    totalScore: number;
    avgScore: number;
    totalPenalties: number;
    totalBonuses: number;
    totalViolations: number;
    firstFlags: number;
    secondFlags: number;
    thirdFlags: number;
    rank: number;
  }[];
  getClassHistory: (classId: string) => {
    scoresByWeek: { week: number; score: number; rank: number }[];
    records: EvaluationRecord[];
    penaltiesByCategory: Record<CategoryKey, number>;
    mostCommonViolations: { ruleTitle: string; count: number; totalPoints: number }[];
    flagsWon: { week: number; award: AwardType }[];
  };

  // Actions
  addRecord: (record: Omit<EvaluationRecord, 'id' | 'createdAt' | 'status'>) => void;
  updateRecord: (id: string, updates: Partial<EvaluationRecord>) => void;
  deleteRecord: (id: string) => void;
  appealRecord: (id: string, reason: string) => void;
  resolveAppeal: (id: string, approve: boolean, note: string) => void;

  addClass: (cls: Omit<ClassInfo, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassInfo>) => void;
  deleteClass: (id: string) => void;

  addRule: (rule: Omit<RuleDefinition, 'id'>) => void;
  updateRule: (id: string, updates: Partial<RuleDefinition>) => void;
  deleteRule: (id: string) => void;

  updateConfig: (updates: Partial<SchoolConfig>) => void;
  resetToDefaults: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const EmulationContext = createContext<EmulationContextType | undefined>(undefined);

const STORAGE_KEY_CLASSES = 'thpt_emulation_classes_v1';
const STORAGE_KEY_RULES = 'thpt_emulation_rules_v1';
const STORAGE_KEY_RECORDS = 'thpt_emulation_records_v1';
const STORAGE_KEY_CONFIG = 'thpt_emulation_config_v1';

export const EmulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [rules, setRules] = useState<RuleDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RULES);
    if (!saved) return INITIAL_RULES;
    try {
      const parsed: RuleDefinition[] = JSON.parse(saved);
      const hasDieuCam = parsed.some(r => r.category === 'dieu_cam');
      if (!hasDieuCam) {
        const dcRules = INITIAL_RULES.filter(r => r.category === 'dieu_cam');
        return [...parsed, ...dcRules];
      }
      return parsed;
    } catch {
      return INITIAL_RULES;
    }
  });

  const [records, setRecords] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_RECORDS;
  });

  const [config, setConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [selectedWeek, setSelectedWeek] = useState<number>(() => config.currentWeek || 4);
  const [filterGrade, setFilterGrade] = useState<Grade | 'all'>('all');
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  // Calculate scores for any given week
  const getWeekScores = (week: number): ClassWeekScore[] => {
    const prevWeekScoresMap = new Map<string, number>();
    if (week > 1) {
      // Calculate previous week ranks for comparison
      const prevScores = calculateRawWeekScores(week - 1);
      prevScores.forEach((item, idx) => {
        prevWeekScoresMap.set(item.classId, idx + 1);
      });
    }

    const currentScores = calculateRawWeekScores(week);

    // Group by grade to calculate rank within grade
    const gradeScoresMap = new Map<Grade, typeof currentScores>();
    currentScores.forEach(item => {
      const list = gradeScoresMap.get(item.grade) || [];
      list.push(item);
      gradeScoresMap.set(item.grade, list);
    });

    return currentScores.map((item, index) => {
      const rankAll = index + 1;
      const prevRank = prevWeekScoresMap.get(item.classId);
      const rankChange = prevRank ? prevRank - rankAll : 0; // Positive means rank improved (e.g., was 3 now 1 -> +2)

      const gradeList = gradeScoresMap.get(item.grade) || [];
      const rankGrade = gradeList.findIndex(g => g.classId === item.classId) + 1;

      // Assign flag awards and emulation tier
      let award: AwardType = 'không';
      let tier: EmulationTier = 'Trung bình';

      if (item.hasProhibitedViolation) {
        // Vi phạm điều cấm: Cắt thi đua, không xếp loại, không xét cờ
        award = 'không';
        tier = 'Không xếp loại';
      } else {
        if (rankAll === 1) award = 'cờ_nhất';
        else if (rankAll === 2) award = 'cờ_nhì';
        else if (rankAll === 3) award = 'cờ_ba';
        else if (rankAll <= 5) award = 'khuyến_khích';

        if (item.finalScore >= 98) tier = 'Xuất sắc';
        else if (item.finalScore >= 90) tier = 'Tốt';
        else if (item.finalScore >= 80) tier = 'Khá';
        else if (item.finalScore >= 65) tier = 'Trung bình';
        else tier = 'Yếu';
      }

      return {
        ...item,
        rankAll,
        rankGrade,
        award,
        tier,
        rankChange,
        hasProhibitedViolation: item.hasProhibitedViolation,
        prohibitedViolationsCount: item.prohibitedViolationsCount,
        isDisqualified: item.hasProhibitedViolation
      };
    });
  };

  const calculateRawWeekScores = (week: number) => {
    return classes.map(cls => {
      const activeRecords = records.filter(
        r => r.classId === cls.id && r.week === week && r.status !== 'cancelled'
      );

      let totalPenalties = 0;
      let totalBonuses = 0;
      let violationCount = 0;
      let bonusCount = 0;
      let hasProhibitedViolation = false;
      let prohibitedViolationsCount = 0;

      const categoryPoints: Record<CategoryKey, number> = {
        chuyen_can: 0,
        hoc_tap: 0,
        dong_phuc: 0,
        ve_sinh: 0,
        ky_luat: 0,
        dieu_cam: 0,
        khen_thuong: 0
      };

      activeRecords.forEach(rec => {
        const isDieuCam = rec.category === 'dieu_cam' || (rec.ruleCode && rec.ruleCode.startsWith('DC'));
        if (rec.type === 'penalty') {
          totalPenalties += rec.points; // points are negative
          violationCount += 1;
          if (isDieuCam) {
            hasProhibitedViolation = true;
            prohibitedViolationsCount += 1;
          }
        } else {
          totalBonuses += rec.points; // points are positive
          bonusCount += 1;
        }

        categoryPoints[rec.category] = (categoryPoints[rec.category] || 0) + rec.points;
      });

      const basePoints = config.basePointsPerWeek || 100;
      const finalScore = Math.max(0, basePoints + totalPenalties + totalBonuses);

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        week,
        basePoints,
        totalPenalties,
        totalBonuses,
        finalScore,
        violationCount,
        bonusCount,
        categoryPoints,
        hasProhibitedViolation,
        prohibitedViolationsCount,
        isDisqualified: hasProhibitedViolation
      };
    }).sort((a, b) => {
      // Classes with prohibited violations are placed at the bottom (Rank cuối so với các mục khác)
      if (a.hasProhibitedViolation && !b.hasProhibitedViolation) return 1;
      if (!a.hasProhibitedViolation && b.hasProhibitedViolation) return -1;

      // Sort by finalScore DESC; if equal, sort by violationCount ASC; then totalBonuses DESC
      if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
      if (a.violationCount !== b.violationCount) return a.violationCount - b.violationCount;
      return b.totalBonuses - a.totalBonuses;
    });
  };

  const currentWeekScores = useMemo(() => {
    return getWeekScores(selectedWeek);
  }, [classes, records, config, selectedWeek]);

  // Cumulative Semester Scores
  const getCumulativeScores = () => {
    const list = classes.map(cls => {
      let totalScore = 0;
      let totalPenalties = 0;
      let totalBonuses = 0;
      let totalViolations = 0;
      let firstFlags = 0;
      let secondFlags = 0;
      let thirdFlags = 0;

      const weeksCount = Math.max(1, config.currentWeek);

      for (let w = 1; w <= weeksCount; w++) {
        const weekScores = getWeekScores(w);
        const clsWeek = weekScores.find(s => s.classId === cls.id);
        if (clsWeek) {
          totalScore += clsWeek.finalScore;
          totalPenalties += clsWeek.totalPenalties;
          totalBonuses += clsWeek.totalBonuses;
          totalViolations += clsWeek.violationCount;
          if (clsWeek.award === 'cờ_nhất') firstFlags++;
          if (clsWeek.award === 'cờ_nhì') secondFlags++;
          if (clsWeek.award === 'cờ_ba') thirdFlags++;
        }
      }

      const avgScore = Number((totalScore / weeksCount).toFixed(1));

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        homeroomTeacher: cls.homeroomTeacher,
        totalScore,
        avgScore,
        totalPenalties,
        totalBonuses,
        totalViolations,
        firstFlags,
        secondFlags,
        thirdFlags,
        rank: 0
      };
    });

    list.sort((a, b) => b.totalScore - a.totalScore);
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  };

  // Specific class historical profile
  const getClassHistory = (classId: string) => {
    const clsRecords = records.filter(r => r.classId === classId && r.status !== 'cancelled');
    const scoresByWeek: { week: number; score: number; rank: number }[] = [];
    const flagsWon: { week: number; award: AwardType }[] = [];

    for (let w = 1; w <= config.currentWeek; w++) {
      const scores = getWeekScores(w);
      const found = scores.find(s => s.classId === classId);
      if (found) {
        scoresByWeek.push({ week: w, score: found.finalScore, rank: found.rankAll });
        if (found.award !== 'không') {
          flagsWon.push({ week: w, award: found.award });
        }
      }
    }

    const penaltiesByCategory: Record<CategoryKey, number> = {
      chuyen_can: 0,
      hoc_tap: 0,
      dong_phuc: 0,
      ve_sinh: 0,
      ky_luat: 0,
      khen_thuong: 0
    };

    const violationRuleMap = new Map<string, { ruleTitle: string; count: number; totalPoints: number }>();

    clsRecords.forEach(r => {
      penaltiesByCategory[r.category] = (penaltiesByCategory[r.category] || 0) + Math.abs(r.points);

      if (r.type === 'penalty') {
        const prev = violationRuleMap.get(r.ruleTitle) || { ruleTitle: r.ruleTitle, count: 0, totalPoints: 0 };
        violationRuleMap.set(r.ruleTitle, {
          ruleTitle: r.ruleTitle,
          count: prev.count + 1,
          totalPoints: prev.totalPoints + r.points
        });
      }
    });

    const mostCommonViolations = Array.from(violationRuleMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      scoresByWeek,
      records: clsRecords,
      penaltiesByCategory,
      mostCommonViolations,
      flagsWon
    };
  };

  // Actions
  const addRecord = (newRec: Omit<EvaluationRecord, 'id' | 'createdAt' | 'status'>) => {
    const record: EvaluationRecord = {
      ...newRec,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };
    setRecords(prev => [record, ...prev]);
  };

  const updateRecord = (id: string, updates: Partial<EvaluationRecord>) => {
    setRecords(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const appealRecord = (id: string, reason: string) => {
    setRecords(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'appealed' as RecordStatus,
              appealNote: reason
            }
          : r
      )
    );
  };

  const resolveAppeal = (id: string, approve: boolean, note: string) => {
    setRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        return {
          ...r,
          status: approve ? ('resolved' as RecordStatus) : ('confirmed' as RecordStatus),
          points: approve ? 0 : r.points, // If approved, waive the penalty (0 points)
          resolutionNote: note
        };
      })
    );
  };

  const addClass = (newCls: Omit<ClassInfo, 'id'>) => {
    const id = newCls.name.toLowerCase().replace(/\s+/g, '');
    setClasses(prev => [...prev, { ...newCls, id }]);
  };

  const updateClass = (id: string, updates: Partial<ClassInfo>) => {
    setClasses(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    setRecords(prev => prev.filter(r => r.classId !== id));
  };

  const addRule = (rule: Omit<RuleDefinition, 'id'>) => {
    const id = `rule-${rule.code.toLowerCase()}-${Date.now()}`;
    setRules(prev => [...prev, { ...rule, id }]);
  };

  const updateRule = (id: string, updates: Partial<RuleDefinition>) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const updateConfig = (updates: Partial<SchoolConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu của trường THPT? Tất cả dữ liệu tùy chỉnh sẽ được thiết lập lại.')) {
      setClasses(INITIAL_CLASSES);
      setRules(INITIAL_RULES);
      setRecords(INITIAL_RECORDS);
      setConfig(INITIAL_CONFIG);
      setSelectedWeek(INITIAL_CONFIG.currentWeek);
      localStorage.removeItem(STORAGE_KEY_CLASSES);
      localStorage.removeItem(STORAGE_KEY_RULES);
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  };

  const exportDataJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      classes,
      rules,
      records
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.classes && parsed.rules && parsed.records && parsed.config) {
        setClasses(parsed.classes);
        setRules(parsed.rules);
        setRecords(parsed.records);
        setConfig(parsed.config);
        setSelectedWeek(parsed.config.currentWeek || 1);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <EmulationContext.Provider
      value={{
        classes,
        rules,
        records,
        config,
        selectedWeek,
        setSelectedWeek,
        filterGrade,
        setFilterGrade,
        activeTab,
        setActiveTab,
        selectedClassId,
        setSelectedClassId,
        currentWeekScores,
        getWeekScores,
        getCumulativeScores,
        getClassHistory,
        addRecord,
        updateRecord,
        deleteRecord,
        appealRecord,
        resolveAppeal,
        addClass,
        updateClass,
        deleteClass,
        addRule,
        updateRule,
        deleteRule,
        updateConfig,
        resetToDefaults,
        exportDataJson,
        importDataJson
      }}
    >
      {children}
    </EmulationContext.Provider>
  );
};

export const useEmulation = () => {
  const context = useContext(EmulationContext);
  if (!context) {
    throw new Error('useEmulation must be used within an EmulationProvider');
  }
  return context;
};
