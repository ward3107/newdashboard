# 🎓 Student Analytics & Classroom Management Dashboard

A comprehensive web-based dashboard designed for **teachers, school managers, and educational consultants** to track student performance, analyze behavioral patterns, and optimize classroom seating arrangements using AI-powered insights.

---

## 🌟 Key Features

### 📊 **Student Analytics & Performance Tracking**
- Real-time academic performance monitoring
- Behavioral pattern analysis
- Emotional and social development tracking
- Comprehensive student profiles with strengths and challenges
- Visual analytics with interactive charts and graphs

### 🪑 **AI-Powered Intelligent Classroom Seating**
- 6 different seating arrangement layouts:
  - Traditional Rows (שורות מסורתיות)
  - Clusters (אשכולות)
  - U-Shape (צורת U)
  - Pairs (זוגות)
  - Circle (מעגל)
  - Flexible (גמיש)
- Strategic student placement based on individual needs
- Personalized explanations for each seating decision
- Visual classroom layout with door and window positions
- Drag-and-drop functionality for manual adjustments

### 🤖 **ISHEBOT AI Integration**
- Automated student analysis using OpenAI GPT-4
- Behavioral and emotional assessment
- Academic recommendations
- Learning style identification
- Personalized intervention suggestions

### 🎨 **Modern UI/UX**
- Dark mode and multiple theme options
- Responsive design for all devices
- Hebrew RTL (Right-to-Left) support
- Smooth animations and transitions
- Intuitive navigation

### 📈 **Advanced Analytics & Reports**
- Class-wide performance trends
- Individual student progress tracking
- Behavioral insights dashboard
- Emotional well-being monitoring
- Exportable reports (PDF, Excel, CSV)

### 🔒 **Security Features**
- Password-protected admin panel
- Secure API endpoints
- Data privacy compliance
- Role-based access control

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository** (contact for access)
   ```bash
   git clone [repository-url]
   cd student-dashboard-fixed
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key and Google Sheets credentials
   - Configure admin passwords

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be available in the `dist/` folder.

---

## 📁 Project Structure

```
student-dashboard-fixed/
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx           # Admin control panel
│   │   ├── analytics/               # Analytics dashboards
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── AnalyticsSectionsExtended.jsx
│   │   │   └── EmotionalBehavioralDashboard.jsx
│   │   ├── classroom/               # Classroom management
│   │   │   └── ClassroomSeatingAI.jsx
│   │   ├── dashboard/               # Main dashboard
│   │   │   └── FuturisticDashboard.jsx
│   │   ├── student/                 # Student components
│   │   │   ├── StudentDetail.jsx
│   │   │   └── ISHEBOTReportDisplay.jsx
│   │   └── UnifiedDashboard.jsx     # Unified view
│   ├── services/                    # API and services
│   │   ├── ishebotClient.js         # ISHEBOT API client
│   │   ├── ishebotAnalysisService.js
│   │   └── adminApiExample.js
│   ├── utils/                       # Utility functions
│   │   └── realAnalyticsData.js
│   └── App.tsx                      # Main application
├── docs/                            # Documentation
│   ├── guides/                      # User guides
│   ├── setup/                       # Setup instructions
│   └── troubleshooting/             # Troubleshooting
├── google-apps-scripts/             # Google Sheets integration
└── vite.config.js                   # Vite configuration
```

---

## 🔧 Configuration

### Google Sheets Integration
Connect to your Google Forms and Sheets for automatic data synchronization. See `docs/setup/AUTOMATIC_FORM_ANALYSIS_SETUP.md` for detailed instructions.

### ISHEBOT API
Configure the AI analysis service in `src/services/ishebotClient.js`. You'll need:
- OpenAI API key
- Backend server URL
- Authentication credentials

### Admin Panel
Set the admin password in your environment variables:
```env
VITE_ADMIN_PASSWORD=your_secure_password
```

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Quick start guide
- **[System Overview](docs/SYSTEM_OVERVIEW.md)** - Architecture details
- **[AI Seating System Guide](docs/guides/AI_SEATING_SYSTEM_GUIDE.md)** - Classroom seating features
- **[ISHEBOT Integration](docs/guides/ISHEBOT_INTEGRATION_GUIDE.md)** - AI analysis setup
- **[Production Deployment](docs/guides/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[Troubleshooting](docs/troubleshooting/)** - Common issues and solutions

---

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Framer Motion animations
- **Charts**: Recharts
- **Icons**: Lucide React
- **Drag & Drop**: DndKit
- **AI Integration**: OpenAI GPT-4 API
- **Data Source**: Google Sheets API
- **PWA Support**: Vite PWA plugin

---

## 👥 Target Users

This dashboard is specifically designed for:

- **Teachers** - Track student progress and optimize classroom arrangements
- **School Managers** - Monitor class-wide trends and make data-driven decisions
- **Educational Consultants** - Analyze student data and provide recommendations
- **Special Education Coordinators** - Identify students needing additional support

---

## 🔐 License

**Proprietary Software** - All Rights Reserved

This software is commercial property. Unauthorized copying, distribution, modification, or use is strictly prohibited without explicit written permission.

For licensing inquiries, please contact: [Your Contact Information]

---

## 📞 Support & Contact

For technical support, licensing, or sales inquiries:
- **Email**: [Your Email]
- **Website**: [Your Website]
- **Phone**: [Your Phone Number]

---

## 🙏 Acknowledgments

Built with modern web technologies and powered by AI to help educators create better learning environments for every student.

---

**Version**: 1.0.0
**Last Updated**: 2025-10-14
