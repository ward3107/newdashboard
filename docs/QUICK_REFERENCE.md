# 📋 ISHEBOT Quick Reference Card

## 🚀 Start Commands

### Start ISHEBOT Backend
```bash
# Option 1: Windows Batch Script
Double-click: start-ishebot-backend.bat

# Option 2: Manual
cd C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine
npm run dev
```

### Start Dashboard
```bash
# Already running at:
http://localhost:3001
```

---

## 🔗 URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:3001 | Main UI |
| ISHEBOT Backend | http://localhost:3000 | Analysis engine |
| Health Check | http://localhost:3000/healthz | Backend status |
| Google Apps Script | https://script.google.com/macros/s/.../exec | Data source |

---

## 📊 API Endpoints

### ISHEBOT Backend

#### Health Check
```bash
GET /healthz
Response: {"ok": true}
```

#### Analyze Student
```bash
POST /analyze
Content-Type: application/json

{
  "student_id": "S123",
  "class_id": "7A",
  "language": "he",
  "answers": [
    {"q": 1, "a": "מתמטיקה"},
    {"q": 2, "a": "חזותי"}
  ],
  "premium": false
}
```

---

## 🎨 Component Locations

| Component | Path | Purpose |
|-----------|------|---------|
| ISHEBOT Service | `src/services/ishebotAnalysisService.js` | API client |
| Report Display | `src/components/student/ISHEBOTReportDisplay.jsx` | UI component |
| Student Detail | `src/components/student/StudentDetail.jsx` | Parent page |

---

## 🔧 Configuration Files

| File | Location | Contains |
|------|----------|----------|
| Dashboard .env | `./env` | VITE_ISHEBOT_API_URL |
| Backend .env | `ishebot-analysis-engine/.env` | OPENAI_API_KEY, PORT, MODELS |

---

## 📝 Report Structure

```json
{
  "insights": [4-6 items],
  "stats": {
    "scores": {
      "focus": 0.0-1.0,
      "motivation": 0.0-1.0,
      "collaboration": 0.0-1.0,
      "emotional_regulation": 0.0-1.0
    },
    "risk_flags": ["array of strings"]
  },
  "seating": {
    "recommended_seat": "A1",
    "rationale": "explanation"
  },
  "summary": "2-3 sentences"
}
```

### Each Insight Contains:
- `id` - Unique identifier
- `domain` - cognitive | emotional | social | motivation | self-regulation | environmental
- `title` - Short Hebrew title
- `summary` - Detailed explanation
- `evidence` - Question numbers & patterns
- `confidence` - 0.0-1.0
- `recommendations` - [3-6 items]

### Each Recommendation Contains:
- `action` - What to do
- `how_to` - Step-by-step
- `when` - Timing
- `duration` - How long
- `materials` - Required tools
- `follow_up_metric` - Success measurement
- `priority` - critical | high | medium | low
- `rationale` - Why it works

---

## 🎯 Domain Colors

| Domain | Color | Hex |
|--------|-------|-----|
| Cognitive | Blue | #3B82F6 |
| Emotional | Pink | #EC4899 |
| Social | Purple | #A855F7 |
| Motivation | Yellow | #EAB308 |
| Self-Regulation | Green | #10B981 |
| Environmental | Indigo | #6366F1 |

---

## 📋 28 Questions Mapping

| Q# | Topic | Column |
|----|-------|--------|
| 1 | Favorite Subject | F (5) |
| 2 | Learning Style | G (6) |
| 3 | Learning Challenges | H (7) |
| 4 | Focus & Concentration | I (8) |
| 5 | Test Preparation | J (9) |
| 6 | New Topic Approach | K (10) |
| 7 | Task Approach | L (11) |
| 8 | Lesson Success Type | M (12) |
| 9 | Group Work | N (13) |
| 10 | Understanding Helpers | O (14) |
| 11 | When Don't Understand | P (15) |
| 12 | Favorite Teacher Type | Q (16) |
| 13 | Classroom Mood | R (17) |
| 14 | Test Anxiety | S (18) |
| 15 | Calm Techniques | T (19) |
| 16 | Seating Partner | U (20) |
| 17 | Speaking in Class | V (21) |
| 18 | Sadness Triggers | W (22) |
| 19 | Anger Response | X (23) |
| 20 | Focus Helpers | Y (24) |
| 21 | Classroom Distractions | Z (25) |
| 22 | Preferred Seating | AA (26) |
| 23 | Boredom Response | AB (27) |
| 24 | Break Time Behavior | AC (28) |
| 25 | Learning Importance | AD (29) |
| 26 | Teacher Wish | AE (30) |
| 27 | Homework Preference | AF (31) |
| 28 | Test Preference | AG (32) |

---

## 🔍 Troubleshooting

### "ISHEBOT not responding"
```bash
# Check backend is running
curl http://localhost:3000/healthz

# Should return: {"ok":true}
# If not, start backend:
cd C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine
npm run dev
```

### "Missing OpenAI API key"
```bash
# Check backend .env file:
cd C:\Users\Waseem\Downloads\ishebot-analysis-engine\ishebot-analysis-engine
# Edit .env and add:
OPENAI_API_KEY=sk-your-key-here
```

### "Report not showing"
1. Check student data has `analysis_engine: 'ISHEBOT'`
2. Check `student.insights` exists
3. Check browser console for errors
4. Verify backend URL in dashboard .env

### "Invalid report structure"
1. Check backend logs for Zod validation errors
2. Ensure OpenAI is returning all required fields
3. Verify insights have 3-6 recommendations

---

## 💰 Cost Estimates

| Model | Speed | Cost per Analysis | Typical Use |
|-------|-------|-------------------|-------------|
| gpt-4o-mini | 2-4s | $0.15-0.30 | Default, most students |
| gpt-4o | 8-15s | $3-6 | Premium, complex cases |

### Monthly Estimates:
- **100 students/month** (mini): ~$15-30
- **100 students/month** (premium): ~$300-600

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `ISHEBOT_README.md` | Quick start guide |
| `ISHEBOT_INTEGRATION_GUIDE.md` | Complete technical guide |
| `INTEGRATION_COMPLETE.md` | What was accomplished |
| `SYSTEM_OVERVIEW.md` | Architecture diagrams |
| `QUICK_REFERENCE.md` | This file |

---

## 🧪 Test Commands

### Test Health
```bash
curl http://localhost:3000/healthz
```

### Test Analysis (Minimal)
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "TEST",
    "class_id": "7A",
    "language": "he",
    "answers": [
      {"q": 1, "a": "מתמטיקה"},
      {"q": 2, "a": "חזותי"},
      {"q": 3, "a": "קושי בריכוז"},
      {"q": 4, "a": "מקום שקט"}
    ]
  }'
```

---

## ✅ Checklist

### Initial Setup:
- [ ] Backend dependencies installed (`npm install`)
- [ ] OpenAI API key in backend `.env`
- [ ] Backend running on port 3000
- [ ] Dashboard .env has ISHEBOT URL
- [ ] Dashboard running on port 3001

### Testing:
- [ ] Health check passes
- [ ] Test analysis returns valid JSON
- [ ] Dashboard displays ISHEBOT section
- [ ] Insights expand/collapse
- [ ] Recommendations show details
- [ ] Stats visualizations work

### Production Ready:
- [ ] API key secured (not in Git)
- [ ] Error handling tested
- [ ] Rate limits configured
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 🎓 Pedagogical Frameworks Reference

| Framework | Application | Example |
|-----------|-------------|---------|
| Bloom's Taxonomy | Cognitive levels | "נדרש תרגול בחשיבה מסדר גבוה" |
| Vygotsky ZPD | Scaffolding | "חלק משימות לשלבים קטנים" |
| CASEL | SEL | "תרגול ויסות רגשי" |
| SDT | Motivation | "הצבת יעדים עצמאיים" |
| UDL | Accessibility | "מספר דרכי הצגת מידע" |
| Cooperative Learning | Group work | "קבוצות קטנות הטרוגניות" |
| Info Processing | Cognitive load | "הפחתת עומס מידע" |
| Bronfenbrenner | Environment | "התאמת סביבת הכיתה" |
| Executive Functions | Self-reg | "תכנון ויזואלי של משימות" |
| Growth Mindset | Beliefs | "שבח המאמץ, לא התוצאה" |

---

## 🇮🇱 MOE Standards (משרד החינוך)

1. **חשיבה מסדר גבוה** - Higher-Order Thinking
2. **לומד עצמאי** - Independent Learner
3. **SEL וחוסן** - Social-Emotional Learning & Resilience
4. **למידה שיתופית** - Collaborative Learning
5. **דיפרנציאציה** - Differentiated Instruction
6. **מוטיבציה ומשמעות** - Motivation & Meaning

All ISHEBOT recommendations align with these standards.

---

## 📞 Support Resources

1. **Documentation**: Check the 5 doc files in project root
2. **Backend Logs**: Check terminal running ISHEBOT
3. **Frontend Logs**: Check browser console (F12)
4. **Health Check**: `http://localhost:3000/healthz`
5. **OpenAI Status**: https://status.openai.com

---

**Keep this card handy for quick reference! 📌**
