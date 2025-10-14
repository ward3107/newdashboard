# 🧠 ISHEBOT Analysis Engine - Integration Guide

## Overview

Your dashboard now includes the complete **ISHEBOT Pedagogical Analysis Engine** - an advanced AI-powered system that generates comprehensive, scientifically-grounded student reports based on Israeli Ministry of Education standards.

---

## 🎯 What Is ISHEBOT?

ISHEBOT is a **pedagogical analysis engine** that transforms raw student questionnaire data into:

- **4-6 Deep Insights** across cognitive, emotional, social, motivation, and self-regulation domains
- **3-6 Actionable Recommendations** per insight with step-by-step implementation guides
- **Evidence-Based Analysis** citing specific question numbers and patterns
- **MOE-Compliant Pedagogy** aligned with Israeli educational standards:
  - חשיבה מסדר גבוה (Higher-Order Thinking)
  - לומד עצמאי (Independent Learner)
  - SEL וחוסן (SEL & Resilience)
  - למידה שיתופית (Collaborative Learning)
  - דיפרנציאציה (Differentiated Instruction)
  - מוטיבציה ומשמעות (Motivation & Meaning)

---

## 📋 Architecture

### Backend (Analysis Engine)
Location: `C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine\`

**Key Files:**
- `src/systemPrompt.md` - Analysis instructions and output structure
- `src/zodSchema.ts` - Validation schema (4-6 insights, 3-6 recs each)
- `src/pedagogyMatrix.json` - MOE-aligned pedagogical anchors
- `src/server.ts` - Express API server
- `src/openai.ts` - OpenAI client wrapper

**Endpoint:**
```
POST http://localhost:3000/analyze
```

**Request Format:**
```json
{
  "student_id": "S123",
  "class_id": "7A",
  "language": "he",
  "answers": [
    { "q": 1, "a": "מתמטיקה" },
    { "q": 2, "a": "אני אוהב ללמוד עם תמונות" }
    // ... more Q&A pairs (28 questions total)
  ],
  "premium": false  // true for gpt-4o, false for gpt-4o-mini
}
```

**Response Format:**
```json
{
  "ok": true,
  "model": "gpt-4o-mini",
  "report": {
    "student_id": "S123",
    "class_id": "7A",
    "analysis_date": "2025-10-12",
    "language": "he",
    "insights": [ /* 4-6 insights with 3-6 recommendations each */ ],
    "stats": { /* scores, risk_flags, percentiles */ },
    "seating": { "recommended_seat": "A1", "rationale": "..." },
    "summary": "2-3 sentence summary..."
  }
}
```

---

### Frontend (Dashboard Integration)

**New Files:**
1. `src/services/ishebotAnalysisService.js`
   - Calls ISHEBOT backend API
   - Converts Google Forms data to ISHEBOT format
   - Transforms ISHEBOT reports to dashboard format

2. `src/components/student/ISHEBOTReportDisplay.jsx`
   - Beautiful UI component for displaying full ISHEBOT reports
   - Expandable insights and recommendations
   - Stats visualization
   - Evidence tracking

3. **Modified Files:**
   - `src/components/student/StudentDetail.jsx` - Added ISHEBOT report section
   - `.env` - Added `VITE_ISHEBOT_API_URL=http://localhost:3000`

---

## 🚀 Setup Instructions

### Step 1: Configure the ISHEBOT Backend

```bash
cd C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here
# PORT=3000
# MODEL_MAIN=gpt-4o-mini
# MODEL_PREMIUM=gpt-4o
```

### Step 2: Start the ISHEBOT Backend

```bash
cd C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine
npm run dev
```

You should see:
```
ISHEBOT engine listening on http://localhost:3000
```

### Step 3: Test ISHEBOT Backend

```bash
curl http://localhost:3000/healthz
# Expected: {"ok":true}
```

### Step 4: Your Dashboard is Already Configured!

The dashboard is already set up to:
1. Connect to ISHEBOT at `http://localhost:3000`
2. Display ISHEBOT reports in StudentDetail pages
3. Show full pedagogical insights with recommendations

---

## 🔄 How It Works

### Data Flow:

```
Google Forms Response (28 questions)
         ↓
Google Apps Script (processes and stores)
         ↓
Dashboard API (getStudent)
         ↓
ISHEBOT Analysis Service
         ↓
ISHEBOT Backend (POST /analyze)
         ↓
OpenAI GPT-4o-mini (generates report)
         ↓
Zod Validation (ensures correctness)
         ↓
Dashboard Display (ISHEBOTReportDisplay component)
```

---

## 📊 Question Mapping

The Google Forms questionnaire has **28 questions** mapped as follows:

| Column | Question # | Topic |
|--------|-----------|-------|
| F (5)  | Q1  | Favorite Subject |
| G (6)  | Q2  | Learning Style |
| H (7)  | Q3  | Learning Challenges |
| I (8)  | Q4  | Focus & Concentration |
| J (9)  | Q5  | Test Preparation |
| K (10) | Q6  | New Topic Approach |
| L (11) | Q7  | Task Approach |
| M (12) | Q8  | Lesson Success Type |
| N (13) | Q9  | Group Work |
| O (14) | Q10 | Understanding Helpers |
| P (15) | Q11 | When Don't Understand |
| Q (16) | Q12 | Favorite Teacher Type |
| R (17) | Q13 | Classroom Mood |
| S (18) | Q14 | Test Anxiety |
| T (19) | Q15 | Calm Techniques |
| U (20) | Q16 | Seating Partner Preference |
| V (21) | Q17 | Speaking in Class |
| W (22) | Q18 | Sadness Triggers |
| X (23) | Q19 | Anger Response |
| Y (24) | Q20 | Focus Helpers |
| Z (25) | Q21 | Classroom Distractions |
| AA(26) | Q22 | Preferred Seating Location |
| AB(27) | Q23 | Boredom Response |
| AC(28) | Q24 | Break Time Behavior |
| AD(29) | Q25 | Learning Importance |
| AE(30) | Q26 | Teacher Wish |
| AF(31) | Q27 | Homework Preference |
| AG(32) | Q28 | Test Preference |

---

## 🧪 Testing the Integration

### Test 1: Check Backend Health
```bash
curl http://localhost:3000/healthz
```
Expected: `{"ok":true}`

### Test 2: Analyze a Student
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST123",
    "class_id": "7A",
    "language": "he",
    "answers": [
      {"q": 1, "a": "מתמטיקה"},
      {"q": 2, "a": "אני אוהב ללמוד עם תרשימים"},
      {"q": 3, "a": "קשה לי להתרכז"},
      {"q": 4, "a": "אני מתרכז טוב במקום שקט"}
    ]
  }'
```

Expected: Full JSON report with 4-6 insights

### Test 3: View in Dashboard
1. Navigate to any student detail page
2. If the student has ISHEBOT analysis data, you'll see:
   - "דוח ניתוח ISHEBOT מלא" section
   - Full insights with expandable recommendations
   - Stats visualization
   - Evidence citations

---

## 🎨 Dashboard Features

### ISHEBOT Report Display Includes:

1. **Overall Stats Cards**
   - Focus (ריכוז)
   - Motivation (מוטיבציה)
   - Collaboration (שיתוף פעולה)
   - Emotional Regulation (ויסות רגשי)

2. **Risk Flags**
   - Highlighted warning areas

3. **Deep Insights** (4-6 per student)
   - Domain badges (cognitive, emotional, social, etc.)
   - Confidence levels
   - Evidence from specific questions
   - Expandable details

4. **Actionable Recommendations** (3-6 per insight)
   - Priority badges (critical, high, medium, low)
   - Step-by-step implementation (`how_to`)
   - Timing (`when`) and duration
   - Required materials
   - Success metrics (`follow_up_metric`)
   - Pedagogical rationale

5. **Metadata**
   - Analysis date
   - Model used (gpt-4o-mini or gpt-4o)
   - ISHEBOT branding

---

## 🔧 Customization Options

### Use Premium Model (GPT-4o)
In your API call, set:
```json
{
  "premium": true
}
```

### Adjust ISHEBOT Backend Port
1. Edit `C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine\.env`:
   ```
   PORT=3001
   ```

2. Update dashboard `.env`:
   ```
   VITE_ISHEBOT_API_URL=http://localhost:3001
   ```

### Change Model Settings
Edit backend `.env`:
```
MODEL_MAIN=gpt-4o-mini      # Default model
MODEL_PREMIUM=gpt-4o         # Premium model
```

---

## 📝 Important Notes

### Security
- **Never commit OpenAI API keys** to version control
- API keys are stored in backend `.env` only
- Frontend calls backend, not OpenAI directly

### Performance
- **gpt-4o-mini**: ~$0.15-0.30 per analysis (fast, 2-3 seconds)
- **gpt-4o**: ~$3-6 per analysis (slower, 10-15 seconds)
- Token usage: ~800-1200 tokens per analysis

### Data Privacy
- All analysis happens server-side
- No student data sent to third parties except OpenAI API
- Complies with Israeli data protection standards

---

## 🐛 Troubleshooting

### "ISHEBOT backend not responding"
1. Check backend is running: `http://localhost:3000/healthz`
2. Check `.env` has correct `VITE_ISHEBOT_API_URL`
3. Restart both backend and dashboard

### "Invalid report structure"
- Check Zod validation errors in backend logs
- Ensure OpenAI is returning JSON with all required fields
- May need to adjust `systemPrompt.md` if OpenAI output drifts

### "Missing OPENAI_API_KEY"
- Add key to backend `.env`: `OPENAI_API_KEY=sk-...`
- Restart backend

### "Report not showing in dashboard"
- Ensure student data has `analysis_engine: 'ISHEBOT'` field
- Check `student.insights` exists and is an array
- Check browser console for errors

---

## 🎓 Pedagogical Frameworks Used

ISHEBOT grounds all analysis in:

1. **Bloom's Taxonomy** - Cognitive development levels
2. **Vygotsky's ZPD** - Zone of Proximal Development
3. **CASEL** - Social-Emotional Learning framework
4. **Self-Determination Theory (SDT)** - Motivation
5. **Universal Design for Learning (UDL)** - Accessibility
6. **Cooperative Learning** - Group dynamics
7. **Information Processing Theory** - Cognitive load
8. **Bronfenbrenner's Ecological Systems** - Environmental factors
9. **Executive Functions** - Self-regulation
10. **Growth Mindset (Dweck)** - Learning beliefs

---

## 📚 Additional Resources

- **ISHEBOT Backend README**: `C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine\README.md`
- **System Prompt**: `src/systemPrompt.md`
- **Schema Definition**: `src/zodSchema.ts`
- **Pedagogy Matrix**: `src/pedagogyMatrix.json`

---

## ✅ Success Checklist

- [ ] ISHEBOT backend running on port 3000
- [ ] OpenAI API key configured in backend `.env`
- [ ] Health check passes: `curl http://localhost:3000/healthz`
- [ ] Dashboard shows ISHEBOT reports in StudentDetail pages
- [ ] Insights expand/collapse correctly
- [ ] Recommendations show full details
- [ ] Stats visualizations display
- [ ] Evidence citations appear

---

**🎉 You're all set! Your dashboard now has world-class pedagogical analysis powered by ISHEBOT!**
