import { useState, useEffect } from "react";
import {
  Brain,
  Users,
  Search,
  Download,
  BarChart3,
  PieChart,
  Target,
  Award,
  CheckCircle,
  ChevronRight,
  Moon,
  Sun,
  Sparkles,
  Palette,
  Settings,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  BookOpen,
  Star,
  UserCheck,
  UserX,
  Calendar,
  Timer,
  Percent,
  Home,
  User,
  Bell,
  X,
  Grid3x3,
} from "lucide-react";
import AdminPanel from "../AdminPanel";
import EnhancedStudentDetail from "../EnhancedStudentDetail";
import * as API from "../../services/googleAppsScriptAPI";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";

// Use environment variable or config file for API URL
// UPDATED 2025-10-10 - V5 WITH CORS HEADERS FIXED!
const API_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbzC4POVwOO9Bz4khS5vYefY3zp3ruK79Qh5tL4c5Ha0_2Pd3lP_0DMU5KVULdI4ILFT/exec";

// ============================================================================
// API FUNCTIONS
// ============================================================================

// Fetch all students from backend
const fetchStudents = async () => {
  try {
    console.log("Fetching students from:", `${API_URL}?action=getAllStudents`);
    const response = await fetch(`${API_URL}?action=getAllStudents`);
    const data = await response.json();
    console.log("Students data received:", data);

    // 🔍 DEBUG: Check needsAnalysis field in raw API response
    console.log('🔍 DEBUG - API Response Analysis:', {
      totalFromAPI: data.students?.length || 0,
      sampleStudents: data.students?.slice(0, 5).map(s => ({
        code: s.studentCode,
        needsAnalysis: s.needsAnalysis,
        strengthsCount: s.strengthsCount,
        hasAnalysisData: s.strengthsCount > 0
      })),
      analyzedInAPI: data.students?.filter(s => !s.needsAnalysis).length || 0,
      unanalyzedInAPI: data.students?.filter(s => s.needsAnalysis).length || 0
    });

    // Remove duplicates based on studentCode
    const uniqueStudentsMap = new Map();

    (data.students || []).forEach((student) => {
      // Only add if we haven't seen this studentCode before, or if this one has more data
      const existingStudent = uniqueStudentsMap.get(student.studentCode);

      if (
        !existingStudent ||
        (student.strengthsCount > 0 && existingStudent.strengthsCount === 0) ||
        (student.keyNotes && !existingStudent.keyNotes)
      ) {
        uniqueStudentsMap.set(student.studentCode, {
          ...student,
          name:
            typeof student.name === "number"
              ? `Student ${student.studentCode}`
              : student.name || `Student ${student.studentCode}`,
          // Add avatar number for display (consistent per student)
          avatar: (parseInt(student.studentCode) % 4) + 1,
        });
      }
    });

    // Convert map back to array
    const students = Array.from(uniqueStudentsMap.values());

    console.log(
      `Fetched ${data.students?.length || 0} students, ${students.length} unique students after deduplication`,
    );

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
};

// Fetch stats from backend
const fetchStats = async () => {
  try {
    console.log("Fetching stats from:", `${API_URL}?action=getStats`);
    const response = await fetch(`${API_URL}?action=getStats`);
    const data = await response.json();
    console.log("Stats received:", data);
    return data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
};

// Analyze a single student
const analyzeStudent = async (studentCode) => {
  try {
    // Using GET request since Google Apps Script has CORS issues with POST
    const response = await fetch(
      `${API_URL}?action=analyzeOneStudent&studentCode=${studentCode}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error analyzing student:", error);
    return { success: false, error: error.message };
  }
};

// Run smart analysis for multiple students
const runSmartAnalysis = async () => {
  try {
    // Using GET request since Google Apps Script has CORS issues with POST
    const response = await fetch(`${API_URL}?action=standardBatch`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error running smart analysis:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// COLOR THEMES
// ============================================================================

const COLOR_THEMES = {
  // ========== PROFESSIONAL THEMES (Muted & Subtle) ==========
  corporate: {
    name: "תאגידי",
    background: "from-slate-800 via-gray-800 to-zinc-800",
    blob1: "bg-slate-600",
    blob2: "bg-gray-600",
    blob3: "bg-zinc-600",
    primary: "from-slate-500 to-gray-600",
    secondary: "from-gray-500 to-zinc-500",
    accent: "from-zinc-500 to-slate-500",
    stat1: "from-slate-500 to-gray-500",
    stat2: "from-gray-500 to-zinc-500",
    stat3: "from-zinc-500 to-slate-500",
    stat4: "from-slate-600 to-gray-600",
    icon: "🏢",
    type: "dark",
  },
  professional: {
    name: "מקצועי",
    background: "from-blue-800 via-slate-800 to-gray-800",
    blob1: "bg-blue-600",
    blob2: "bg-slate-600",
    blob3: "bg-gray-600",
    primary: "from-blue-600 to-slate-600",
    secondary: "from-slate-600 to-gray-600",
    accent: "from-gray-600 to-blue-600",
    stat1: "from-blue-600 to-slate-600",
    stat2: "from-slate-600 to-gray-600",
    stat3: "from-gray-600 to-zinc-600",
    stat4: "from-zinc-600 to-blue-600",
    icon: "💼",
    type: "dark",
  },
  minimal: {
    name: "מינימליסטי",
    background: "from-neutral-800 via-stone-800 to-gray-800",
    blob1: "bg-neutral-600",
    blob2: "bg-stone-600",
    blob3: "bg-gray-600",
    primary: "from-neutral-500 to-stone-600",
    secondary: "from-stone-500 to-gray-600",
    accent: "from-gray-500 to-neutral-500",
    stat1: "from-neutral-600 to-stone-600",
    stat2: "from-stone-600 to-gray-600",
    stat3: "from-gray-600 to-zinc-600",
    stat4: "from-zinc-600 to-neutral-600",
    icon: "⚪",
    type: "dark",
  },
  earth: {
    name: "אדמה",
    background: "from-amber-900 via-stone-900 to-neutral-900",
    blob1: "bg-amber-700",
    blob2: "bg-stone-700",
    blob3: "bg-neutral-700",
    primary: "from-amber-700 to-stone-700",
    secondary: "from-stone-700 to-neutral-700",
    accent: "from-neutral-700 to-amber-700",
    stat1: "from-amber-700 to-yellow-700",
    stat2: "from-stone-700 to-amber-700",
    stat3: "from-neutral-700 to-stone-700",
    stat4: "from-yellow-700 to-neutral-700",
    icon: "🌍",
    type: "dark",
  },
  navy: {
    name: "כחול כהה",
    background: "from-blue-900 via-slate-900 to-gray-900",
    blob1: "bg-blue-700",
    blob2: "bg-slate-700",
    blob3: "bg-gray-700",
    primary: "from-blue-700 to-slate-700",
    secondary: "from-slate-700 to-gray-700",
    accent: "from-gray-700 to-blue-700",
    stat1: "from-blue-700 to-indigo-700",
    stat2: "from-slate-700 to-blue-700",
    stat3: "from-gray-700 to-slate-700",
    stat4: "from-indigo-700 to-gray-700",
    icon: "⚓",
    type: "dark",
  },
  sage: {
    name: "מרווה",
    background: "from-green-900 via-slate-900 to-gray-900",
    blob1: "bg-green-700",
    blob2: "bg-slate-700",
    blob3: "bg-gray-700",
    primary: "from-green-700 to-slate-700",
    secondary: "from-slate-700 to-gray-700",
    accent: "from-gray-700 to-green-700",
    stat1: "from-green-700 to-emerald-700",
    stat2: "from-slate-700 to-green-700",
    stat3: "from-gray-700 to-slate-700",
    stat4: "from-emerald-700 to-gray-700",
    icon: "🌿",
    type: "dark",
  },
  rose: {
    name: "ורד עדין",
    background: "from-rose-900 via-slate-900 to-gray-900",
    blob1: "bg-rose-700",
    blob2: "bg-slate-700",
    blob3: "bg-gray-700",
    primary: "from-rose-700 to-slate-700",
    secondary: "from-slate-700 to-gray-700",
    accent: "from-gray-700 to-rose-700",
    stat1: "from-rose-700 to-pink-700",
    stat2: "from-slate-700 to-rose-700",
    stat3: "from-gray-700 to-slate-700",
    stat4: "from-pink-700 to-gray-700",
    icon: "🌹",
    type: "dark",
  },
  midnight: {
    name: "חצות",
    background: "from-indigo-950 via-slate-950 to-gray-950",
    blob1: "bg-indigo-800",
    blob2: "bg-slate-800",
    blob3: "bg-gray-800",
    primary: "from-indigo-700 to-slate-700",
    secondary: "from-slate-700 to-gray-700",
    accent: "from-gray-700 to-indigo-700",
    stat1: "from-indigo-700 to-blue-700",
    stat2: "from-slate-700 to-indigo-700",
    stat3: "from-gray-700 to-slate-700",
    stat4: "from-blue-700 to-gray-700",
    icon: "🌙",
    type: "dark",
  },
  ocean: {
    name: "אוקיינוס",
    background: "from-cyan-950 via-teal-950 to-blue-950",
    blob1: "bg-cyan-800",
    blob2: "bg-teal-800",
    blob3: "bg-blue-800",
    primary: "from-cyan-600 to-teal-700",
    secondary: "from-teal-600 to-blue-700",
    accent: "from-blue-600 to-cyan-700",
    stat1: "from-cyan-600 to-teal-600",
    stat2: "from-teal-600 to-blue-600",
    stat3: "from-blue-600 to-indigo-600",
    stat4: "from-indigo-600 to-cyan-600",
    icon: "🌊",
    type: "dark",
  },
  forest: {
    name: "יער",
    background: "from-green-950 via-emerald-950 to-teal-950",
    blob1: "bg-green-800",
    blob2: "bg-emerald-800",
    blob3: "bg-teal-800",
    primary: "from-green-600 to-emerald-700",
    secondary: "from-emerald-600 to-teal-700",
    accent: "from-teal-600 to-green-700",
    stat1: "from-green-600 to-emerald-600",
    stat2: "from-emerald-600 to-teal-600",
    stat3: "from-teal-600 to-cyan-600",
    stat4: "from-cyan-600 to-green-600",
    icon: "🌲",
    type: "dark",
  },
  volcanic: {
    name: "געשי",
    background: "from-red-950 via-orange-950 to-amber-950",
    blob1: "bg-red-800",
    blob2: "bg-orange-800",
    blob3: "bg-amber-800",
    primary: "from-red-600 to-orange-700",
    secondary: "from-orange-600 to-amber-700",
    accent: "from-amber-600 to-red-700",
    stat1: "from-red-600 to-orange-600",
    stat2: "from-orange-600 to-amber-600",
    stat3: "from-amber-600 to-yellow-600",
    stat4: "from-yellow-600 to-red-600",
    icon: "🌋",
    type: "dark",
  },
  space: {
    name: "חלל",
    background: "from-black via-gray-950 to-violet-950",
    blob1: "bg-purple-900",
    blob2: "bg-violet-900",
    blob3: "bg-indigo-900",
    primary: "from-purple-600 to-violet-700",
    secondary: "from-violet-600 to-indigo-700",
    accent: "from-indigo-600 to-purple-700",
    stat1: "from-purple-600 to-violet-600",
    stat2: "from-violet-600 to-indigo-600",
    stat3: "from-indigo-600 to-blue-600",
    stat4: "from-blue-600 to-purple-600",
    icon: "🚀",
    type: "dark",
  },

  // ========== LIGHT/WHITE THEMES (Clean & Simple) ==========
  clean: {
    name: "נקי לבן",
    background: "from-gray-50 via-white to-gray-100",
    blob1: "bg-blue-200",
    blob2: "bg-purple-200",
    blob3: "bg-pink-200",
    primary: "from-blue-500 to-blue-600",
    secondary: "from-purple-500 to-purple-600",
    accent: "from-pink-500 to-pink-600",
    stat1: "from-blue-500 to-blue-600",
    stat2: "from-purple-500 to-purple-600",
    stat3: "from-pink-500 to-pink-600",
    stat4: "from-indigo-500 to-indigo-600",
    icon: "⚪",
    type: "light",
  },
  lightBlue: {
    name: "כחול בהיר",
    background: "from-blue-50 via-cyan-50 to-teal-50",
    blob1: "bg-blue-300",
    blob2: "bg-cyan-300",
    blob3: "bg-teal-300",
    primary: "from-blue-600 to-cyan-600",
    secondary: "from-cyan-600 to-teal-600",
    accent: "from-teal-600 to-blue-600",
    stat1: "from-blue-600 to-cyan-600",
    stat2: "from-cyan-600 to-teal-600",
    stat3: "from-teal-600 to-blue-600",
    stat4: "from-indigo-600 to-blue-600",
    icon: "💙",
    type: "light",
  },
  pastel: {
    name: "פסטל",
    background: "from-pink-50 via-purple-50 to-blue-50",
    blob1: "bg-pink-200",
    blob2: "bg-purple-200",
    blob3: "bg-blue-200",
    primary: "from-pink-400 to-purple-500",
    secondary: "from-purple-400 to-blue-500",
    accent: "from-blue-400 to-pink-500",
    stat1: "from-pink-400 to-rose-500",
    stat2: "from-purple-400 to-pink-500",
    stat3: "from-blue-400 to-purple-500",
    stat4: "from-indigo-400 to-blue-500",
    icon: "🎨",
    type: "light",
  },
  mint: {
    name: "מנטה",
    background: "from-emerald-50 via-teal-50 to-cyan-50",
    blob1: "bg-emerald-200",
    blob2: "bg-teal-200",
    blob3: "bg-cyan-200",
    primary: "from-emerald-600 to-teal-600",
    secondary: "from-teal-600 to-cyan-600",
    accent: "from-cyan-600 to-emerald-600",
    stat1: "from-emerald-600 to-teal-600",
    stat2: "from-teal-600 to-cyan-600",
    stat3: "from-cyan-600 to-blue-600",
    stat4: "from-green-600 to-emerald-600",
    icon: "🌿",
    type: "light",
  },
  peach: {
    name: "אפרסק",
    background: "from-orange-50 via-amber-50 to-yellow-50",
    blob1: "bg-orange-200",
    blob2: "bg-amber-200",
    blob3: "bg-yellow-200",
    primary: "from-orange-500 to-amber-600",
    secondary: "from-amber-500 to-yellow-600",
    accent: "from-yellow-500 to-orange-600",
    stat1: "from-orange-500 to-amber-500",
    stat2: "from-amber-500 to-yellow-500",
    stat3: "from-yellow-500 to-orange-500",
    stat4: "from-red-500 to-orange-500",
    icon: "🍑",
    type: "light",
  },
  lavender: {
    name: "לבנדר",
    background: "from-purple-50 via-violet-50 to-indigo-50",
    blob1: "bg-purple-200",
    blob2: "bg-violet-200",
    blob3: "bg-indigo-200",
    primary: "from-purple-500 to-violet-600",
    secondary: "from-violet-500 to-indigo-600",
    accent: "from-indigo-500 to-purple-600",
    stat1: "from-purple-500 to-violet-500",
    stat2: "from-violet-500 to-indigo-500",
    stat3: "from-indigo-500 to-purple-500",
    stat4: "from-blue-500 to-violet-500",
    icon: "💜",
    type: "light",
  },
  sky: {
    name: "שמיים",
    background: "from-sky-50 via-blue-50 to-indigo-50",
    blob1: "bg-sky-200",
    blob2: "bg-blue-200",
    blob3: "bg-indigo-200",
    primary: "from-sky-500 to-blue-600",
    secondary: "from-blue-500 to-indigo-600",
    accent: "from-indigo-500 to-sky-600",
    stat1: "from-sky-500 to-blue-500",
    stat2: "from-blue-500 to-indigo-500",
    stat3: "from-indigo-500 to-sky-500",
    stat4: "from-cyan-500 to-blue-500",
    icon: "☁️",
    type: "light",
  },
  coral: {
    name: "אלמוג",
    background: "from-red-50 via-pink-50 to-rose-50",
    blob1: "bg-red-200",
    blob2: "bg-pink-200",
    blob3: "bg-rose-200",
    primary: "from-red-400 to-pink-500",
    secondary: "from-pink-400 to-rose-500",
    accent: "from-rose-400 to-red-500",
    stat1: "from-red-400 to-pink-400",
    stat2: "from-pink-400 to-rose-400",
    stat3: "from-rose-400 to-red-400",
    stat4: "from-orange-400 to-red-400",
    icon: "🪸",
    type: "light",
  },
  sand: {
    name: "חול",
    background: "from-stone-50 via-amber-50 to-yellow-50",
    blob1: "bg-stone-200",
    blob2: "bg-amber-200",
    blob3: "bg-yellow-200",
    primary: "from-stone-500 to-amber-600",
    secondary: "from-amber-500 to-yellow-600",
    accent: "from-yellow-500 to-stone-600",
    stat1: "from-stone-500 to-amber-500",
    stat2: "from-amber-500 to-yellow-500",
    stat3: "from-yellow-500 to-orange-500",
    stat4: "from-orange-500 to-stone-500",
    icon: "🏖️",
    type: "light",
  },
};

// ============================================================================
// MAIN FUTURISTIC DASHBOARD WITH COLOR THEMES
// ============================================================================

const FuturisticTeacherDashboard = () => {
  // State Management
  const [activeView, setActiveView] = useState("overview");
  const [colorTheme, setColorTheme] = useState("clean");
  // Set darkMode based on initial theme type
  const [darkMode, setDarkMode] = useState(
    COLOR_THEMES["clean"].type !== "light",
  );
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [themeTabActive, setThemeTabActive] = useState("light"); // "light" or "dark"
  const [students, setStudents] = useState([]);
  const [analysisReport, setAnalysisReport] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 156,
    analyzedThisWeek: 23,
    averageStrengths: 4.2,
    upToDate: 133,
    learningStyles: {
      "למידה חזותית": 45,
      "למידה שמיעתית": 38,
      "למידה קינסתטית": 42,
      "למידה חברתית": 31,
    },
    classSizes: {
      י1: 28,
      י2: 32,
      י3: 30,
      י4: 34,
      י5: 32,
    },
  });
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grouped"

  const theme = COLOR_THEMES[colorTheme];

  // Admin password - you can change this to any code you want
  const ADMIN_CODE = "1234";

  // Handler for admin access
  const handleAdminClick = () => {
    setShowPasswordDialog(true);
    setPasswordError(false);
    setAdminPassword("");
  };

  const handlePasswordSubmit = () => {
    if (adminPassword === ADMIN_CODE) {
      setShowPasswordDialog(false);
      setShowAdminPanel(true);
      setAdminPassword("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setAdminPassword("");
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordDialog(false);
    setAdminPassword("");
    setPasswordError(false);
  };

  // Handler for running smart analysis
  const handleSmartAnalysis = async () => {
    setLoading(true);
    try {
      const result = await runSmartAnalysis();
      if (result.success) {
        alert(`ניתוח הושלם בהצלחה! ${result.analyzed || 0} תלמידים נותחו.`);
        // Reload data after analysis
        const [studentsData, statsData] = await Promise.all([
          fetchStudents(),
          fetchStats(),
        ]);
        setStudents(studentsData);

        // Always use the actual deduplicated student count
        setStats({
          totalStudents: studentsData.length, // Use actual deduplicated count
          analyzedThisWeek:
            studentsData.filter((s) => s.needsAnalysis).length || 0,
          averageStrengths: parseFloat(statsData?.averageStrengths) || 0,
          upToDate: studentsData.filter((s) => !s.needsAnalysis).length || 0,
          learningStyles: statsData?.byLearningStyle || {},
          classSizes: statsData?.byClass || {},
        });

        setAnalysisReport({
          summary: {
            total: studentsData.length, // Use actual deduplicated count
            needAnalysis:
              studentsData.filter((s) => s.needsAnalysis).length || 0,
            upToDate: studentsData.filter((s) => !s.needsAnalysis).length || 0,
          },
        });
      } else {
        alert(`שגיאה בניתוח: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`שגיאה: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real data from backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch students and stats in parallel
        const [studentsData, statsData] = await Promise.all([
          fetchStudents(),
          fetchStats(),
        ]);

        setStudents(studentsData);

        // Always use the actual deduplicated student count, not backend stats
        setStats({
          totalStudents: studentsData.length, // Use actual deduplicated count
          analyzedThisWeek:
            studentsData.filter((s) => s.needsAnalysis).length || 0,
          averageStrengths: parseFloat(statsData?.averageStrengths) || 0,
          upToDate: studentsData.filter((s) => !s.needsAnalysis).length || 0,
          learningStyles: statsData?.byLearningStyle || {},
          classSizes: statsData?.byClass || {},
        });

        // Also set analysis report for compatibility
        setAnalysisReport({
          summary: {
            total: studentsData.length, // Use actual deduplicated count
            needAnalysis:
              studentsData.filter((s) => s.needsAnalysis).length || 0,
            upToDate: studentsData.filter((s) => !s.needsAnalysis).length || 0,
          },
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const classes = ["י1", "י2", "י3", "י4", "י5"];

  return (
    <div
      className={`min-h-screen transition-all duration-500 bg-gradient-to-br ${theme.background}`}
      dir="rtl"
    >
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 ${theme.blob1} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob`}
        ></div>
        <div
          className={`absolute top-0 right-1/4 w-96 h-96 ${theme.blob2} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute bottom-0 left-1/3 w-96 h-96 ${theme.blob3} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000`}
        ></div>
      </div>

      {/* Glass Navigation Bar - Extra tall to prevent overflow */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl"
        style={{ minHeight: "120px" }}
      >
        <div className="w-full h-full px-8 lg:px-12 xl:px-16 2xl:px-20 py-10">
          <div className="flex items-center justify-between gap-8">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${theme.primary} rounded-2xl blur-lg opacity-75 animate-pulse`}
                ></div>
                <div
                  className={`relative w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-2xl flex items-center justify-center shadow-xl`}
                >
                  <Brain className="text-white" size={28} />
                </div>
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
                >
                  ISHEBOT
                </h1>
                <p
                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  New Era for Teachers
                </p>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 rounded-2xl p-1.5 border border-white/10">
              {[
                { id: "overview", icon: Home, label: "סקירה" },
                { id: "students", icon: Users, label: "תלמידים" },
                { id: "analytics", icon: BarChart3, label: "לוח בקרה" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    activeView === item.id
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg`
                      : darkMode
                        ? "text-gray-300 hover:bg-white/10"
                        : "text-gray-700 hover:bg-white/30"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Admin Panel Button */}
              <button onClick={handleAdminClick} className="relative group">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div
                  className={`relative px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg`}
                >
                  <Settings size={17} />
                  <span className="text-sm">מנהל</span>
                </div>
              </button>

              {/* Color Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className={`p-2 rounded-xl backdrop-blur-md ${
                    darkMode
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-white/30 hover:bg-white/50"
                  } transition-all duration-300`}
                  title="בחר ערכת צבעים"
                >
                  <Palette
                    size={18}
                    className={darkMode ? "text-white" : "text-gray-700"}
                  />
                </button>

                {showThemeSelector && (
                  <div
                    className={`absolute left-0 mt-2 ${
                      darkMode ? "bg-gray-900" : "bg-white"
                    } border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } rounded-2xl shadow-2xl w-96 max-h-[600px] overflow-hidden flex flex-col`}
                  >
                    {/* Header with tabs */}
                    <div className="p-4 pb-0">
                      <h3
                        className={`font-semibold mb-3 flex items-center gap-2 ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <Palette size={18} />
                        ערכות צבעים
                      </h3>
                      {/* Tab buttons */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setThemeTabActive("light")}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            themeTabActive === "light"
                              ? darkMode
                                ? "bg-blue-600/20 text-blue-400 border border-blue-600/40"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                              : darkMode
                                ? "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          <Sun size={16} />
                          <span>ערכות בהירות</span>
                        </button>
                        <button
                          onClick={() => setThemeTabActive("dark")}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            themeTabActive === "dark"
                              ? darkMode
                                ? "bg-blue-600/20 text-blue-400 border border-blue-600/40"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                              : darkMode
                                ? "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                                : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          <Moon size={16} />
                          <span>ערכות כהות</span>
                        </button>
                      </div>
                    </div>
                    {/* Theme grid */}
                    <div className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 max-h-[450px] custom-scrollbar">
                        {Object.entries(COLOR_THEMES)
                          .filter(([_, t]) =>
                            themeTabActive === "light"
                              ? t.type === "light"
                              : t.type === "dark",
                          )
                          .map(([key, t]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setColorTheme(key);
                                // Automatically set darkMode based on theme type
                                setDarkMode(t.type !== "light");
                                setShowThemeSelector(false);
                              }}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                colorTheme === key
                                  ? darkMode
                                    ? "border-blue-500 bg-blue-500/20"
                                    : "border-blue-500 bg-blue-50"
                                  : darkMode
                                    ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <div
                                className={`h-8 bg-gradient-to-r ${t.primary} rounded-lg mb-2`}
                              ></div>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${
                                    darkMode ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {t.name}
                                </span>
                                <span className="text-2xl">{t.icon}</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button
                className={`p-2 rounded-xl backdrop-blur-md ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-white/30 hover:bg-white/50"
                } transition-all duration-300 relative`}
              >
                <Bell
                  size={18}
                  className={darkMode ? "text-white" : "text-gray-700"}
                />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Dark Mode Toggle - Hidden as themes now control this automatically */}
              {/* <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl backdrop-blur-md ${
                  darkMode
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-white/30 hover:bg-white/50"
                } transition-all duration-300`}
              >
                {darkMode ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-gray-700" />
                )}
              </button> */}

              {/* Profile */}
              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-white/20">
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    מורה דוגמה
                  </p>
                  <p
                    className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    מחנך י1
                  </p>
                </div>
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${theme.accent} rounded-full blur opacity-75`}
                  ></div>
                  <div
                    className={`relative w-9 h-9 bg-gradient-to-br ${theme.accent} rounded-full flex items-center justify-center shadow-xl`}
                  >
                    <User size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Proper spacing from extra tall navbar */}
      <main className="px-8 pb-8 relative z-10" style={{ paddingTop: "150px" }}>
        {activeView === "overview" && (
          <FuturisticOverview
            stats={stats}
            analysisReport={analysisReport}
            darkMode={darkMode}
            theme={theme}
            onSmartAnalysis={handleSmartAnalysis}
          />
        )}

        {activeView === "students" && (
          <FuturisticStudents
            students={students}
            classes={classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            darkMode={darkMode}
            theme={theme}
            onStudentClick={setSelectedStudent}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}

        {activeView === "analytics" && (
          <AnalyticsDashboard
            students={students}
            darkMode={darkMode}
            theme={theme}
          />
        )}
      </main>

      {/* Enhanced Student Detail Modal */}
      {selectedStudent && (
        <EnhancedStudentDetail
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          darkMode={darkMode}
          theme={theme}
        />
      )}

      {/* Loading */}
      {loading && <FuturisticLoader darkMode={darkMode} theme={theme} />}

      {/* Password Dialog for Admin Access */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`backdrop-blur-xl ${
              darkMode ? "bg-gray-900/95" : "bg-white"
            } rounded-3xl p-8 border ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } shadow-2xl w-96`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                כניסת מנהל
              </h2>
              <button
                onClick={handlePasswordCancel}
                className={`p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              >
                <X
                  size={20}
                  className={darkMode ? "text-gray-400" : "text-gray-600"}
                />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Enter Admin Code
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handlePasswordSubmit()
                  }
                  placeholder="••••"
                  className={`w-full px-4 py-2 rounded-xl border ${
                    passwordError
                      ? "border-red-500"
                      : darkMode
                        ? "border-gray-600 bg-gray-800 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">
                    קוד שגוי. אנא נסה שוב.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  אישור
                </button>
                <button
                  onClick={handlePasswordCancel}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          darkMode={darkMode}
          theme={theme}
          onClose={() => setShowAdminPanel(false)}
          onSmartAnalysis={handleSmartAnalysis}
          onDataUpdate={async () => {
            // Refresh data after admin operations
            const [studentsData, statsData] = await Promise.all([
              API.getAllStudents(),
              API.getStats(),
            ]);

            if (studentsData.success) {
              setStudents(studentsData.students);
            }

            if (studentsData.success) {
              const students = studentsData.students || [];
              setStats({
                totalStudents: students.length, // Use actual deduplicated count
                analyzedThisWeek:
                  students.filter((s) => s.needsAnalysis).length || 0,
                averageStrengths:
                  parseFloat(statsData.stats?.averageStrengths) || 0,
                upToDate: students.filter((s) => !s.needsAnalysis).length || 0,
                learningStyles: statsData.stats?.byLearningStyle || {},
                classSizes: statsData.stats?.byClass || {},
              });
            }
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// FUTURISTIC OVERVIEW
// ============================================================================

const FuturisticOverview = ({
  stats,
  analysisReport,
  darkMode,
  theme,
  onSmartAnalysis,
}) => {
  const [activeSection, setActiveSection] = useState('general');

  // Calculate additional statistics
  const completionRate =
    stats?.totalStudents > 0
      ? Math.round(
          (analysisReport?.summary?.upToDate / stats?.totalStudents) * 100,
        )
      : 0;

  const analysisNeeded = analysisReport?.summary?.needAnalysis || 0;
  const avgChallenges = 2.3; // Mock data - you can calculate from real data
  const improvementRate = 73; // Mock data
  const engagementScore = 85; // Mock data

  // Sidebar sections configuration
  const sections = [
    {
      id: 'general',
      name: 'סטטיסטיקות כלליות',
      icon: BarChart3,
      description: 'מספרים מרכזיים'
    },
    {
      id: 'performance',
      name: 'מדדי ביצועים',
      icon: Activity,
      description: 'אחוזים ומעקב'
    },
    {
      id: 'analysis',
      name: 'ניתוח מתקדם',
      icon: Target,
      description: 'תובנות מפורטות'
    },
    {
      id: 'charts',
      name: 'גרפים',
      icon: PieChart,
      description: 'ויזואליזציות'
    }
  ];

  const statCards = [
    {
      title: "סה״כ תלמידים",
      value: stats?.totalStudents || 0,
      icon: Users,
      gradient: theme.stat1,
      trend: "+5%",
      trendUp: true,
      description: "מספר התלמידים הכולל במערכת",
      details: [
        `${Object.keys(stats?.classSizes || {}).length} כיתות פעילות`,
        `ממוצע של ${Math.round((stats?.totalStudents || 0) / Object.keys(stats?.classSizes || {}).length)} תלמידים לכיתה`,
        "כולל תלמידים מנותחים ולא מנותחים",
      ],
    },
    {
      title: "ממתינים לניתוח",
      value: analysisReport?.summary?.needAnalysis || 0,
      icon: AlertCircle,
      gradient: theme.stat2,
      trend: "-12%",
      trendUp: false,
      description: "תלמידים שטרם נותחו",
      details: [
        "תלמידים שממתינים לניתוח ISHEBOT",
        "לחץ על AI חכם לניתוח אוטומטי",
        "הניתוח מתבצע אוטומטית במילוי הטופס",
      ],
    },
    {
      title: "ממוצע חוזקות",
      value: stats?.averageStrengths || 0,
      icon: Award,
      gradient: theme.stat3,
      trend: "+8%",
      trendUp: true,
      description: "ממוצע החוזקות לתלמיד",
      details: [
        "מבוסס על ניתוח AI",
        `מתוך ${stats?.totalStudents || 0} תלמידים`,
        "כולל חוזקות אקדמיות ואישיות",
      ],
    },
    {
      title: "מעודכנים",
      value: analysisReport?.summary?.upToDate || 0,
      icon: CheckCircle,
      gradient: theme.stat4,
      trend: "+15%",
      trendUp: true,
      description: "תלמידים עם ניתוח עדכני",
      details: [
        "ניתוח הושלם בחודש האחרון",
        `${Math.round(((analysisReport?.summary?.upToDate || 0) / (stats?.totalStudents || 1)) * 100)}% מסך התלמידים`,
        "מוכנים להמלצות למידה",
      ],
    },
  ];

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className={`w-72 flex-shrink-0 sticky top-0 h-screen`}>
        <div className={`backdrop-blur-xl ${
          darkMode ? 'bg-gray-900/95' : 'bg-white/95'
        } rounded-3xl p-6 border ${
          darkMode ? 'border-gray-700' : 'border-white/20'
        } shadow-2xl border-r-4 ${
          darkMode ? 'border-r-purple-500/50' : 'border-r-blue-500/50'
        }`}>
          {/* Sidebar Header */}
          <div className={`mb-6 pb-6 border-b-2 ${
            darkMode ? 'border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20' : 'border-blue-500/30 bg-gradient-to-r from-blue-50/50 to-cyan-50/50'
          } -m-6 p-6 rounded-t-3xl`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center shadow-lg ring-2 ${
                darkMode ? 'ring-purple-500/50' : 'ring-blue-500/50'
              }`}>
                <Home className="text-white" size={22} />
              </div>
              <div>
                <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  סקירה כללית
                </h2>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  בחר קטגוריה
                </p>
              </div>
            </div>
          </div>

          {/* Section Buttons */}
          <div className="space-y-2">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg ring-2 ${
                          darkMode ? 'ring-purple-400/50' : 'ring-blue-400/50'
                        } scale-[1.02]`
                      : darkMode
                        ? 'text-gray-300 hover:bg-white/10 border border-transparent hover:border-purple-500/30'
                        : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-blue-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-white/20'
                      : darkMode
                        ? 'bg-white/5'
                        : 'bg-gray-100'
                  }`}>
                    <SectionIcon size={20} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-semibold text-sm">{section.name}</p>
                    <p className={`text-xs ${isActive ? 'text-white/80' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className={`mt-6 pt-6 border-t-2 ${
            darkMode ? 'border-purple-500/30' : 'border-blue-500/30'
          }`}>
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30' : 'bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200'
            }`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                סה"כ תלמידים
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* General Statistics Section */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {statCards.map((card, index) => (
                <StatCard key={index} {...card} darkMode={darkMode} />
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics Section */}
        {activeSection === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CircularProgress
                value={completionRate}
                title="אחוז השלמה"
                icon={Percent}
                color="blue"
                darkMode={darkMode}
                description="אחוז התלמידים עם ניתוח מלא"
                details={[
                  `${analysisReport?.summary?.upToDate || 0} תלמידים מנותחים`,
                  `${analysisReport?.summary?.needAnalysis || 0} דורשים ניתוח`,
                ]}
              />
              <CircularProgress
                value={engagementScore}
                title="מעורבות"
                icon={Activity}
                color="green"
                darkMode={darkMode}
                description="רמת המעורבות הכללית"
                details={["מבוסס על פעילות שבועית", "כולל השתתפות והתקדמות"]}
              />
              <CircularProgress
                value={improvementRate}
                title="שיפור כללי"
                icon={TrendingUp}
                color="purple"
                darkMode={darkMode}
                description="אחוז השיפור הממוצע"
                details={["השוואה לחודש קודם", "מבוסס על ניתוחי AI"]}
              />
              <CircularProgress
                value={Math.round((stats?.averageStrengths / 5) * 100) || 0}
                title="ציון חוזקות"
                icon={Star}
                color="yellow"
                darkMode={darkMode}
                description="ממוצע החוזקות מתוך 5"
                details={[
                  `${stats?.averageStrengths?.toFixed(1) || 0} מתוך 5`,
                  "כולל חוזקות אקדמיות ואישיות",
                ]}
              />
            </div>
          </div>
        )}

        {/* Analysis Section */}
        {activeSection === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="תלמידים מצטיינים"
                value={Math.round((stats?.totalStudents || 0) * 0.3)}
                subtitle="30% מהכיתה"
                icon={UserCheck}
                trend="+8"
                trendLabel="השבוע"
                color="green"
                darkMode={darkMode}
              />
              <MetricCard
                title="דורשים תמיכה"
                value={analysisNeeded}
                subtitle="זקוקים לניתוח"
                icon={UserX}
                trend="-3"
                trendLabel="השבוע"
                color="red"
                darkMode={darkMode}
              />
              <MetricCard
                title="זמן ממוצע לניתוח"
                value="2.5"
                subtitle="ימים"
                icon={Timer}
                trend="0"
                trendLabel="ללא שינוי"
                color="blue"
                darkMode={darkMode}
              />
            </div>
          </div>
        )}

        {/* Charts Section */}
        {activeSection === 'charts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Styles */}
              <ChartCard
                title="סגנונות למידה"
                subtitle="התפלגות לפי סוג"
                icon={PieChart}
                gradient={theme.primary}
                darkMode={darkMode}
              >
                <LearningStylesChart stats={stats} darkMode={darkMode} />
              </ChartCard>

              {/* Class Distribution */}
              <ChartCard
                title="התפלגות כיתות"
                subtitle="תלמידים לפי כיתה"
                icon={BarChart3}
                gradient={theme.secondary}
                darkMode={darkMode}
              >
                <ClassDistributionChart
                  stats={stats}
                  theme={theme}
                  darkMode={darkMode}
                />
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// STAT CARD COMPONENT WITH HOVER TOOLTIP
// ============================================================================

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  trend,
  trendUp,
  darkMode,
  description,
  details,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="group relative z-10 hover:z-[100]"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}
      ></div>
      <div
        className={`relative backdrop-blur-xl ${
          darkMode ? "bg-white/10" : "bg-white/40"
        } rounded-3xl p-6 border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300`}
        style={{ minHeight: "180px" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <Icon className="text-white" size={28} />
          </div>
          <div
            className={`px-3 py-1 rounded-full border ${
              trendUp
                ? "bg-green-500/20 border-green-500/30"
                : "bg-red-500/20 border-red-500/30"
            }`}
          >
            <span
              className={`text-xs font-bold ${trendUp ? "text-green-400" : "text-red-400"}`}
            >
              {trend}
            </span>
          </div>
        </div>
        <div>
          <p
            className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}
          >
            {title}
          </p>
          <p
            className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-2`}
          >
            {value}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                style={{ width: "75%" }}
              ></div>
            </div>
            <span
              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              75%
            </span>
          </div>
        </div>

        {/* Hover Tooltip */}
        {showTooltip && (
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-4 rounded-xl backdrop-blur-xl ${
              darkMode ? "bg-gray-900/95" : "bg-white/95"
            } border border-white/20 shadow-2xl z-50 min-w-[280px] animate-fadeIn`}
          >
            <div
              className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] ${
                darkMode ? "border-b-gray-900/95" : "border-b-white/95"
              }`}
            ></div>
            <div className="text-sm space-y-2">
              <p
                className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {title}
              </p>
              {description && (
                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  {description}
                </p>
              )}
              {details && (
                <div
                  className={`pt-2 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <p
                    className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} mb-1`}
                  >
                    כולל:
                  </p>
                  <ul
                    className={`text-xs ${darkMode ? "text-gray-300" : "text-gray-600"} space-y-1`}
                  >
                    {details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="text-blue-500">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CHART CARD
// ============================================================================

const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  gradient,
  darkMode,
  children,
}) => {
  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-xl opacity-30`}
      ></div>
      <div
        className={`relative backdrop-blur-xl ${
          darkMode ? "bg-white/10" : "bg-white/40"
        } rounded-3xl p-8 border border-white/20 shadow-2xl`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}
            >
              <Icon className="text-white" size={24} />
            </div>
            <div>
              <h3
                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {title}
              </h3>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                {subtitle}
              </p>
            </div>
          </div>
          <button
            className={`p-2 rounded-xl backdrop-blur-md ${
              darkMode
                ? "bg-white/10 hover:bg-white/20"
                : "bg-white/30 hover:bg-white/50"
            } transition-all`}
          >
            <Download
              size={18}
              className={darkMode ? "text-white" : "text-gray-700"}
            />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// LEARNING STYLES CHART
// ============================================================================

const LearningStylesChart = ({ stats, darkMode }) => {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
  ];

  // Translation dictionary for learning styles
  const hebrewTranslations = {
    'cognitive': 'קוגניטיבי',
    'emotional': 'רגשי',
    'behavioral': 'התנהגותי',
    'social': 'חברתי',
    'visual': 'ויזואלי',
    'auditory': 'שמיעתי',
    'kinesthetic': 'קינסתטי',
    'reading': 'קריאה',
    'writing': 'כתיבה'
  };

  // Function to translate style to Hebrew
  const translateStyle = (style) => {
    const lowerStyle = (style || '').toLowerCase().trim();

    // Check if the style is already in Hebrew
    if (/[\u0590-\u05FF]/.test(style)) {
      return style;
    }

    // Try to translate from dictionary
    if (hebrewTranslations[lowerStyle]) {
      return hebrewTranslations[lowerStyle];
    }

    // If contains comma, translate each part
    if (style.includes(',')) {
      return style.split(',')
        .map(s => hebrewTranslations[s.trim().toLowerCase()] || s.trim())
        .join(', ');
    }

    // Return original if no translation found
    return style;
  };

  return (
    <div className="space-y-4">
      {Object.entries(stats?.learningStyles || {}).map(
        ([style, count], index) => {
          const percentage = ((count / stats.totalStudents) * 100).toFixed(1);
          const translatedStyle = translateStyle(style);

          return (
            <div key={style} className="group/item">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {translatedStyle}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {count}
                  </span>
                  <span
                    className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 right-0 bg-gradient-to-l ${colors[index]} rounded-full transition-all duration-1000 group-hover/item:scale-x-105`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
};

// ============================================================================
// CLASS DISTRIBUTION CHART
// ============================================================================

const ClassDistributionChart = ({ stats, theme, darkMode }) => {
  const maxCount = Math.max(...Object.values(stats?.classSizes || {}));

  return (
    <div className="flex items-end justify-between gap-4 h-64">
      {Object.entries(stats?.classSizes || {}).map(([className, count]) => {
        const height = (count / maxCount) * 100;

        return (
          <div
            key={className}
            className="flex-1 flex flex-col items-center gap-3"
          >
            <div className="relative w-full group/bar">
              <div
                className={`w-full bg-gradient-to-t ${theme.secondary} rounded-t-xl transition-all duration-500 hover:opacity-80 cursor-pointer shadow-lg`}
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                    {count} תלמידים
                  </div>
                </div>
              </div>
            </div>
            <span
              className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {className}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// STUDENTS VIEW
// ============================================================================

const FuturisticStudents = ({
  students,
  classes,
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  darkMode,
  theme,
  onStudentClick,
  viewMode,
  setViewMode,
}) => {
  // Separate students into analyzed and unanalyzed
  const analyzedStudents = students.filter((s) => !s.needsAnalysis);
  const unanalyzedStudents = students.filter((s) => s.needsAnalysis);

  // 🔍 DEBUG: Log student filtering
  console.log('🔍 DEBUG - Student Filtering:', {
    totalStudents: students.length,
    analyzedCount: analyzedStudents.length,
    unanalyzedCount: unanalyzedStudents.length,
    firstStudent: students[0],
    firstAnalyzed: analyzedStudents[0],
    firstUnanalyzed: unanalyzedStudents[0],
    allStudentNeedsAnalysis: students.map(s => ({
      code: s.studentCode,
      needsAnalysis: s.needsAnalysis,
      strengthsCount: s.strengthsCount
    }))
  });

  // Filter students based on search term and selected class
  const filterStudents = (studentsList) => {
    return studentsList.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentCode.includes(searchTerm);
      const matchesClass =
        selectedClass === "all" || student.classId === selectedClass;
      return matchesSearch && matchesClass;
    });
  };

  const filteredAnalyzed = filterStudents(analyzedStudents);
  const filteredUnanalyzed = filterStudents(unanalyzedStudents);

  // Group students by classroom
  const groupByClassroom = (studentsList) => {
    const grouped = {};
    studentsList.forEach((student) => {
      const classId = student.classId || 'ללא כיתה';
      if (!grouped[classId]) {
        grouped[classId] = [];
      }
      grouped[classId].push(student);
    });
    return grouped;
  };

  const groupedAnalyzed = groupByClassroom(filteredAnalyzed);
  const groupedUnanalyzed = groupByClassroom(filteredUnanalyzed);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div
        className={`backdrop-blur-xl ${
          darkMode ? "bg-white/10" : "bg-white/40"
        } rounded-3xl p-6 border border-white/20 shadow-2xl`}
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם או קוד תלמיד..."
              className={`w-full pr-12 pl-4 py-3 rounded-2xl backdrop-blur-md ${
                darkMode
                  ? "bg-white/10 text-white placeholder-gray-400 border-white/20"
                  : "bg-white/50 text-gray-900 placeholder-gray-500 border-gray-200"
              } border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className={`px-6 py-3 rounded-2xl backdrop-blur-md ${
              darkMode
                ? "bg-white/10 text-white border-white/20"
                : "bg-white/50 text-gray-900 border-gray-200"
            } border focus:ring-2 focus:ring-purple-500 transition-all`}
          >
            <option value="all">כל הכיתות</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <button
              onClick={() => setViewMode("list")}
              className={`px-6 py-2 rounded-xl transition-all font-medium ${
                viewMode === "list"
                  ? darkMode
                    ? "bg-white/20 text-white shadow-lg"
                    : "bg-white text-gray-900 shadow-lg"
                  : darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>רשימה</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-6 py-2 rounded-xl transition-all font-medium ${
                viewMode === "grouped"
                  ? darkMode
                    ? "bg-white/20 text-white shadow-lg"
                    : "bg-white text-gray-900 shadow-lg"
                  : darkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid3x3 size={18} />
                <span>לפי כיתות</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              דורשים ניתוח: {unanalyzedStudents.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              מנותחים: {analyzedStudents.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span
              className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              סה"כ: {students.length}
            </span>
          </div>
        </div>
      </div>

      {/* Unanalyzed Students Section */}
      {filteredUnanalyzed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>תלמידים הדורשים ניתוח</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    {filteredUnanalyzed.length}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} flex items-center gap-2`}
            >
              <Sparkles size={16} />
              <span>לחץ על כרטיס לצפייה מלאה</span>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUnanalyzed.map((student, index) => (
                <StudentCard
                  key={`unanalyzed-${student.studentCode}-${index}`}
                  student={student}
                  darkMode={darkMode}
                  theme={theme}
                  onClick={() => onStudentClick(student)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedUnanalyzed).map(([classId, classStudents]) => (
                <div key={`unanalyzed-${classId}`} className={`backdrop-blur-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} rounded-3xl p-6 border border-white/20`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-white/50'} border border-white/20`}>
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className={darkMode ? 'text-white' : 'text-gray-900'} />
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{classId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {classStudents.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classStudents.map((student, index) => (
                      <StudentCard
                        key={`unanalyzed-${classId}-${student.studentCode}-${index}`}
                        student={student}
                        darkMode={darkMode}
                        theme={theme}
                        onClick={() => onStudentClick(student)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analyzed Students Section */}
      {filteredAnalyzed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} />
                  <span>תלמידים מנותחים</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    {filteredAnalyzed.length}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} flex items-center gap-2`}
            >
              <CheckCircle size={16} />
              <span>ניתוח AI הושלם</span>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnalyzed.map((student, index) => (
                <StudentCard
                  key={`analyzed-${student.studentCode}-${index}`}
                  student={student}
                  darkMode={darkMode}
                  theme={theme}
                  onClick={() => onStudentClick(student)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAnalyzed).map(([classId, classStudents]) => (
                <div key={`analyzed-${classId}`} className={`backdrop-blur-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} rounded-3xl p-6 border border-white/20`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-white/50'} border border-white/20`}>
                      <div className="flex items-center gap-2">
                        <BookOpen size={18} className={darkMode ? 'text-white' : 'text-gray-900'} />
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{classId}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {classStudents.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classStudents.map((student, index) => (
                      <StudentCard
                        key={`analyzed-${classId}-${student.studentCode}-${index}`}
                        student={student}
                        darkMode={darkMode}
                        theme={theme}
                        onClick={() => onStudentClick(student)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredAnalyzed.length === 0 && filteredUnanalyzed.length === 0 && (
        <div
          className={`text-center py-12 backdrop-blur-xl ${
            darkMode ? "bg-white/10" : "bg-white/40"
          } rounded-3xl border border-white/20`}
        >
          <Users
            size={48}
            className={`mx-auto mb-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
          <p
            className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            לא נמצאו תלמידים
          </p>
          <p
            className={`text-sm mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            נסה לשנות את מסנני החיפוש
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STUDENT CARD WITH HOVER PREVIEW
// ============================================================================

const StudentCard = ({ student, darkMode, theme, onClick }) => {
  const avatarGradients = [theme.stat1, theme.stat2, theme.stat3, theme.stat4];
  const gradient = avatarGradients[student.avatar - 1] || theme.stat1;

  // Choose emoji based on analysis status and performance
  const getStatusEmoji = () => {
    if (student.needsAnalysis) return "📝"; // Needs analysis
    if (student.strengthsCount >= 5) return "⭐"; // Excellent
    if (student.strengthsCount >= 3) return "✨"; // Good
    if (student.challengesCount >= 5) return "⚠️"; // Needs attention
    return "📚"; // Standard
  };

  // Get status text for tooltip
  const getStatusText = () => {
    if (student.needsAnalysis) return "ממתין לניתוח";
    if (student.strengthsCount >= 5) return "ביצועים מצוינים";
    if (student.strengthsCount >= 3) return "ביצועים טובים";
    if (student.challengesCount >= 5) return "דורש תשומת לב";
    return "ביצועים סטנדרטיים";
  };

  // Use graduation cap emoji for all students (university student with cap)
  const studentAvatar = "🎓";

  return (
    <div onClick={onClick} className="group relative cursor-pointer">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
      ></div>

      <div
        className={`relative backdrop-blur-xl ${
          darkMode ? "bg-white/10" : "bg-white/40"
        } rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]`}
        style={{ minHeight: "200px" }}
      >
        {/* Status indicator */}
        {student.needsAnalysis && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}

        {/* Card content with student icon */}
        <div className="flex flex-col h-full">
          {/* Top section with avatar and basic info */}
          <div className="flex items-start justify-between mb-4">
            {/* Student Avatar with gradient background */}
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-md opacity-50`}
              ></div>
              <div
                className={`relative w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <span className="text-2xl">{studentAvatar}</span>
              </div>
              {/* Status badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md group/badge"
                title={getStatusText()}
              >
                <span className="text-xs">{getStatusEmoji()}</span>
              </div>
            </div>

            {/* Arrow indicator */}
            <ChevronRight
              size={20}
              className={`${darkMode ? "text-gray-400" : "text-gray-500"} group-hover:translate-x-1 transition-transform mt-2`}
            />
          </div>

          {/* Student info section */}
          <div className="flex-1">
            {/* Name display with better styling */}
            <h3
              className={`text-lg font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {student.name || `תלמיד ${student.studentCode}`}
            </h3>

            {/* Metadata row */}
            <div
              className={`flex items-center gap-2 text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <div className="flex items-center gap-1">
                <User size={13} />
                <span className="font-mono text-xs">{student.studentCode}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <BookOpen size={13} />
                <span>{student.classId}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar size={13} />
                <span className="text-xs">{student.quarter || "Q1"}</span>
              </div>
            </div>

            {/* Performance indicators */}
            {student.strengthsCount > 0 && (
              <div
                className={`flex items-center gap-4 pt-3 border-t ${darkMode ? "border-white/10" : "border-gray-200"}`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Award size={14} className="text-green-500" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {student.strengthsCount}
                    </div>
                    <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      חוזקות
                    </div>
                  </div>
                </div>
                {student.challengesCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Target size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {student.challengesCount}
                      </div>
                      <div className={`text-[10px] ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        אתגרים
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Circular Progress Component with Tooltip
const CircularProgress = ({
  value,
  title,
  icon: Icon,
  color,
  darkMode,
  description,
  details,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Ensure value is a valid number, default to 0 if NaN
  const safeValue =
    isNaN(value) || value === null || value === undefined ? 0 : value;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  const colorMap = {
    blue: "stroke-blue-500",
    green: "stroke-green-500",
    purple: "stroke-purple-500",
    yellow: "stroke-yellow-500",
    red: "stroke-red-500",
  };

  return (
    <div
      className={`relative backdrop-blur-xl ${
        darkMode ? "bg-white/10" : "bg-white/40"
      } rounded-2xl p-6 border border-white/20 shadow-xl hover:scale-105 transition-transform cursor-pointer z-10 hover:z-[100]`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={String(strokeDashoffset)}
              className={`${colorMap[color]} transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icon
                size={24}
                className={darkMode ? "text-white mb-1" : "text-gray-700 mb-1"}
              />
              <p
                className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {safeValue}%
              </p>
            </div>
          </div>
        </div>
        <p
          className={`mt-4 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          {title}
        </p>
      </div>

      {/* Tooltip */}
      {showTooltip && (description || details) && (
        <div
          className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-3 rounded-xl backdrop-blur-xl ${
            darkMode ? "bg-gray-900/95" : "bg-white/95"
          } border border-white/20 shadow-2xl z-50 min-w-[200px] animate-fadeIn`}
        >
          <div
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] ${
              darkMode ? "border-b-gray-900/95" : "border-b-white/95"
            }`}
          ></div>
          <div className="text-xs space-y-1">
            {description && (
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {description}
              </p>
            )}
            {details && (
              <ul
                className={`${darkMode ? "text-gray-400" : "text-gray-500"} space-y-0.5 mt-1`}
              >
                {details.map((detail, idx) => (
                  <li key={idx}>• {detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color,
  darkMode,
}) => {
  const colorMap = {
    green: "from-green-500 to-emerald-500",
    red: "from-red-500 to-rose-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-violet-500",
  };

  const trendColor =
    trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-gray-500";

  return (
    <div
      className={`relative backdrop-blur-xl ${
        darkMode ? "bg-white/10" : "bg-white/40"
      } rounded-2xl p-6 border border-white/20 shadow-xl hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center`}
        >
          <Icon className="text-white" size={24} />
        </div>
        <div className="flex items-center gap-1">
          {trend > 0 && <TrendingUp size={16} className={trendColor} />}
          {trend < 0 && <TrendingDown size={16} className={trendColor} />}
          <span className={`text-sm font-bold ${trendColor}`}>
            {trend > 0 ? "+" : ""}
            {trend !== 0 ? trend : ""}
          </span>
        </div>
      </div>
      <h3
        className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </h3>
      <p
        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}
      >
        {subtitle}
      </p>
      <p
        className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"} mt-2`}
      >
        {trendLabel}
      </p>
      <h4
        className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mt-3`}
      >
        {title}
      </h4>
    </div>
  );
};

// Strengths vs Challenges Chart
const StrengthsChallengesChart = ({
  avgStrengths,
  avgChallenges,
  darkMode,
}) => {
  const maxValue = Math.max(avgStrengths, avgChallenges, 5);
  const strengthHeight = (avgStrengths / maxValue) * 100;
  const challengeHeight = (avgChallenges / maxValue) * 100;

  return (
    <div className="flex items-end justify-center gap-12 h-48">
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div
            className="w-20 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-xl transition-all duration-1000"
            style={{ height: `${strengthHeight * 1.5}px` }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <span
                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {avgStrengths.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <Award className="text-green-500" size={24} />
        <span
          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          חוזקות
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <div
            className="w-20 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-xl transition-all duration-1000"
            style={{ height: `${challengeHeight * 1.5}px` }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <span
                className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {avgChallenges.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <Target className="text-amber-500" size={24} />
        <span
          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          אתגרים
        </span>
      </div>
    </div>
  );
};

// Weekly Activity Chart
const WeeklyActivityChart = ({ darkMode }) => {
  const weekDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
  const activityData = [3, 5, 2, 8, 6, 4, 1]; // Mock data

  const maxActivity = Math.max(...activityData);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const height = (activityData[index] / maxActivity) * 100;
          const isToday = index === 3; // Mock current day

          return (
            <div key={day} className="flex flex-col items-center gap-2">
              <div className="relative h-32 w-full flex items-end justify-center">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isToday
                      ? "bg-gradient-to-t from-purple-500 to-violet-400"
                      : "bg-gradient-to-t from-blue-500 to-cyan-400"
                  }`}
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span
                      className={`text-xs font-bold ${darkMode ? "text-white" : "text-gray-700"}`}
                    >
                      {activityData[index]}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-xs ${
                  isToday
                    ? "font-bold text-purple-500"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            ניתוחים
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            היום
          </span>
        </div>
      </div>
    </div>
  );
};

// Loader component
const FuturisticLoader = ({ darkMode, theme }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      className={`backdrop-blur-xl ${darkMode ? "bg-white/10" : "bg-white/90"} rounded-3xl p-12 border border-white/20`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className={`w-20 h-20 border-4 border-white/30 rounded-full`}
          ></div>
          <div
            className={`absolute inset-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full animate-spin`}
          ></div>
        </div>
        <p
          className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          טוען...
        </p>
      </div>
    </div>
  </div>
);

export default FuturisticTeacherDashboard;
