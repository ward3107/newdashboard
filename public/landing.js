        // Form submission handler
        document.getElementById('demoForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // Collect basic form data
            const formData = {
                name: document.getElementById('name').value,
                school: document.getElementById('school').value,
                role: document.getElementById('role').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                classroomDetails: []
            };

            // Collect dynamic classroom details
            Object.keys(selectedGradesData).forEach(grade => {
                const gradeData = selectedGradesData[grade];

                // Get all subclasses for this grade
                if (gradeData.subclasses && gradeData.subclasses.length > 0) {
                    gradeData.subclasses.forEach(subclass => {
                        const subclassId = `subclass-${grade}-${subclass.num}`;
                        const students = document.getElementById(`${subclassId}-students`)?.value;
                        const teachers = document.getElementById(`${subclassId}-teachers`)?.value;

                        if (students && teachers) {
                            formData.classroomDetails.push({
                                subclass: subclass.name,
                                students: students,
                                teachers: teachers
                            });
                        }
                    });
                }
            });

            console.log('Demo request:', formData);

            // Here you would typically send the data to your backend
            alert('תודה! ניצור איתך קשר בקרוב להדגמה.');

            // Reset form and dynamic data
            this.reset();
            document.getElementById('gradeDetailsContainer').innerHTML = '';
            document.getElementById('gradeSelectionGrid').querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            selectedGradesData = {};
        });

        // Dynamic Classroom Details Generation
        const hebrewGrades = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'יא', 'יב'];
        let selectedGradesData = {};

        // Initialize grade selection grid on page load
        (function initializeGradeSelection() {
            const gradeGrid = document.getElementById('gradeSelectionGrid');

            // Generate grade checkboxes
            const gradeCheckboxesHTML = hebrewGrades.map(grade => `
                <label class="grade-checkbox-label" for="grade-${grade}">
                    <input type="checkbox" id="grade-${grade}" name="grade" value="${grade}" class="grade-checkbox">
                    <span class="grade-checkbox-custom">כיתה ${grade}</span>
                </label>
            `).join('');

            gradeGrid.innerHTML = gradeCheckboxesHTML;

            // Add event listeners to grade checkboxes
            const gradeCheckboxes = gradeGrid.querySelectorAll('.grade-checkbox');
            gradeCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleGradeSelection);
            });
        })();

        function handleGradeSelection(e) {
            const grade = e.target.value;
            const isChecked = e.target.checked;
            const gradeDetailsContainer = document.getElementById('gradeDetailsContainer');

            if (isChecked) {
                // Add grade details section
                const gradeSection = document.createElement('div');
                gradeSection.id = `grade-${grade}-section`;
                gradeSection.className = 'grade-detail-section';
                gradeSection.innerHTML = `
                    <div class="grade-detail-header">
                        <h4>כיתה ${grade}</h4>
                    </div>
                    <div class="form-group">
                        <label>בחר את תתי-הכיתות הקיימות *</label>
                        <p class="form-help-text">סמן את תתי-הכיתות שקיימות במוסד שלך</p>
                        <div class="subclass-selection-grid" id="subclass-grid-${grade}">
                            <label class="subclass-checkbox-label" for="subclass-${grade}-0">
                                <input type="checkbox" id="subclass-${grade}-0" name="subclass-${grade}" value="0" class="subclass-checkbox" data-grade="${grade}">
                                <span class="subclass-checkbox-custom">כיתה ${grade}</span>
                            </label>
                            ${Array.from({length: 10}, (_, i) => i + 1).map(num => `
                                <label class="subclass-checkbox-label" for="subclass-${grade}-${num}">
                                    <input type="checkbox" id="subclass-${grade}-${num}" name="subclass-${grade}" value="${num}" class="subclass-checkbox" data-grade="${grade}">
                                    <span class="subclass-checkbox-custom">${grade}${num}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div id="grade-${grade}-subclass-details" class="subclass-details-container"></div>
                `;
                gradeDetailsContainer.appendChild(gradeSection);

                // Add event listeners for subclass checkboxes
                const subclassCheckboxes = document.querySelectorAll(`.subclass-checkbox[data-grade="${grade}"]`);
                subclassCheckboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', handleSubclassSelection);
                });

                selectedGradesData[grade] = { subclasses: [] };
            } else {
                // Remove grade details section
                const gradeSection = document.getElementById(`grade-${grade}-section`);
                if (gradeSection) {
                    gradeSection.remove();
                }
                delete selectedGradesData[grade];
            }
        }

        function handleSubclassSelection(e) {
            const subclassNum = e.target.value;
            const grade = e.target.dataset.grade;
            const isChecked = e.target.checked;
            const subclassDetailsContainer = document.getElementById(`grade-${grade}-subclass-details`);

            const subclassName = subclassNum === '0' ? grade : `${grade}${subclassNum}`;
            const subclassId = `subclass-${grade}-${subclassNum}`;

            if (isChecked) {
                // Create student and teacher options
                let studentOptions = '<option value="">בחר מספר</option>';
                for (let s = 10; s <= 30; s++) {
                    studentOptions += `<option value="${s}">${s}</option>`;
                }

                let teacherOptions = '<option value="">בחר מספר</option>';
                for (let t = 1; t <= 5; t++) {
                    teacherOptions += `<option value="${t}">${t}</option>`;
                }

                // Check if container is empty, if so create the grid
                if (!subclassDetailsContainer.querySelector('.subclass-grid')) {
                    subclassDetailsContainer.innerHTML = '<div class="subclass-grid"></div>';
                }

                const grid = subclassDetailsContainer.querySelector('.subclass-grid');

                // Create and add the subclass card
                const cardHTML = `
                    <div class="subclass-card" id="${subclassId}">
                        <h5>כיתה ${subclassName}</h5>
                        <div class="form-group">
                            <label for="${subclassId}-students">מספר תלמידים *</label>
                            <select id="${subclassId}-students" name="${subclassId}-students" required>
                                ${studentOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="${subclassId}-teachers">מספר מורים *</label>
                            <select id="${subclassId}-teachers" name="${subclassId}-teachers" required>
                                ${teacherOptions}
                            </select>
                        </div>
                    </div>
                `;
                grid.insertAdjacentHTML('beforeend', cardHTML);

                // Add to data
                if (!selectedGradesData[grade].subclasses) {
                    selectedGradesData[grade].subclasses = [];
                }
                selectedGradesData[grade].subclasses.push({
                    name: subclassName,
                    num: subclassNum,
                    students: '',
                    teachers: ''
                });
            } else {
                // Remove the subclass card
                const card = document.getElementById(subclassId);
                if (card) {
                    card.remove();
                }

                // Remove from data
                if (selectedGradesData[grade].subclasses) {
                    selectedGradesData[grade].subclasses = selectedGradesData[grade].subclasses.filter(
                        sc => sc.num !== subclassNum
                    );
                }

                // If no more subclasses, remove the grid
                const grid = subclassDetailsContainer.querySelector('.subclass-grid');
                if (grid && grid.children.length === 0) {
                    subclassDetailsContainer.innerHTML = '';
                }
            }
        }

        // Smooth scrolling for anchor links
        // CSS handles smooth scroll with proper offset (scroll-behavior: smooth + scroll-margin-top)
        // No JavaScript needed - native browser behavior works better

        // Add animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        document.querySelectorAll('.problem-card, .feature-card, .benefit-card, .pricing-card').forEach(el => {
            observer.observe(el);
        });

        // Scroll to Top Button functionality
        const scrollToTopBtn = document.getElementById('scrollToTop');

        if (scrollToTopBtn) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            });

            // Scroll to top when button is clicked
            scrollToTopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Multilingual Translation System - Complete
        const translations = {
            he: {
                dir: 'rtl',
                nav: {
                    features: 'תכונות',
                    benefits: 'יתרונות',
                    roi: 'חישוב ROI',
                    pricing: 'מחירים',
                    contact: 'צור קשר'
                },
                hero: {
                    badge: '🔥 פתרון לעבודה הכי צורבת של המורים',
                    title: '<span class="highlight">ISHEBOT</span> - הופך מורים<br>ליעילים ופרודוקטיביים פי 10!',
                    subtitle: 'AI חכם שעושה את העבודה הכבדה במקומך: ניתוח תלמידים וסידור כיתה אוטומטי',
                    stats: [
                        'חסוך 15+ שעות<br>עבודה בשבוע',
                        'ניתוח 30+ תלמידים<br>תוך דקות!',
                        'AI עושה את<br>החשיבה הכבדה',
                        'פתרון מושלם<br>בלחיצת כפתור'
                    ],
                    ctaPrimary: '🎁 תן למערכת לעבוד במקומך - התחל עכשיו!',
                    ctaSecondary: 'ראה איך זה חוסך לך זמן'
                },
                problems: {
                    title: '🔥 העבודה שגוזלת ממורים את כל האנרגיה 🔥',
                    subtitle: 'האם אתה מבזבז שעות יקרות על המשימות האלו?',
                    items: [
                        { text: 'ניתוח ידני של 30+ תלמידים', impact: '⏱️ 8+ שעות בשבוע!' },
                        { text: 'מעקב אחר חוזקות ואתגרים של כל תלמיד', impact: '💔 בלתי אפשרי ידנית!' },
                        { text: 'סידור ישיבה בניסוי וטעייה', impact: '❌ תוצאות לא אופטימליות!' },
                        { text: 'מידע מפוזר באקסל, דפים ופתקים', impact: '🗂️ כאוס מוחלט!' },
                        { text: 'החלטות על בסיס אינטואיציה בלבד', impact: '⚠️ ללא נתונים מדויקים!' },
                        { text: 'חוסר זמן לתשומת לב אישית לכל תלמיד', impact: '💥 עומס עצום!' },
                        { text: 'כאוס היום הראשון - סידור כיתות ברגע האחרון', impact: '😱 לחץ אדיר בתחילת שנה!' },
                        { text: 'מורים עמוסים עם שעות עבודה ארוכות', impact: '💼 שעות נוספות אין סופיות!' },
                        { text: 'מנהלים מתמודדים עם תלונות וצרות', impact: '📞 מאות שיחות ומיילים!' }
                    ]
                },
                features: {
                    title: '💎 ISHEBOT - הפתרון שישנה לך את החיים! 💎',
                    subtitle: 'AI חזק שעושה את כל העבודה הכבדה במקומך',
                    cards: [
                        {
                            title: 'ניתוח חכם אוטומטי',
                            items: [
                                '50+ נקודות נתונים לכל תלמיד',
                                'זיהוי אוטומטי של חוזקות ואתגרים',
                                'מערכת צבעים ויזואלית (🔴🟡🟢)',
                                'סיווג מיידי לפי צרכים',
                                'תובנות AI מתקדמות'
                            ]
                        },
                        {
                            title: 'אלגוריתם גנטי מהפכני',
                            items: [
                                '100 דורות של אופטימיזציה',
                                'חישוב תואמות בין כל זוג תלמידים',
                                'מציאת הסידור המושלם ביותר',
                                '6 מבני כיתה שונים',
                                'התאמה לכל מטרת למידה'
                            ]
                        },
                        {
                            title: 'ניתוח מיקום חכם',
                            items: [
                                'הסבר למה כל תלמיד יושב שם',
                                'ניתוח לפי מיקום (קדמי/אחורי)',
                                'התחשבות במיקום יחסי',
                                'Hover Tooltip מפורט',
                                'המלצות מותאמות אישית'
                            ]
                        },
                        {
                            title: 'גרור ושחרר עם AI',
                            items: [
                                'שינוי מיידי בגרירה',
                                'משוב AI מיידי על כל שינוי',
                                'ציון תואמות לכל זוג',
                                'התראות על סידורים בעייתיים',
                                'המלצות אוטומטיות לשיפור'
                            ]
                        },
                        {
                            title: 'לוח בקרה פוטוריסטי',
                            items: [
                                'ממשק מודרני עם אנימציות',
                                'גרפים אינטראקטיביים בזמן אמת',
                                'דוחות מקצועיים להדפסה',
                                'יצוא PDF איכותי',
                                'מצב כהה/בהיר'
                            ]
                        },
                        {
                            title: 'רב-לשוני ונגיש',
                            items: [
                                '4 שפות (עברית, אנגלית, ערבית, רוסית)',
                                'תמיכה RTL/LTR מלאה',
                                'נגישות WCAG 2.1 מלאה',
                                'תמיכה בקוראי מסך',
                                'ניווט מקלדת מלא'
                            ]
                        }
                    ]
                },
                roi: {
                    title: '💰 תשואה על ההשקעה (ROI)',
                    subtitle: 'למה ISHEBOT היא ההשקעה הכי חכמה שלכם?',
                    manualTitle: '❌ עבודה ידנית מסורתית',
                    manualCost: '₪200,000',
                    manualDesc: 'עלות זמן המורים בשנה',
                    manualItems: [
                        '❌ 10 שעות/שבוע × 25 מורים × 25 שבועות',
                        '❌ 6,250 שעות עבודה במקום הוראה',
                        '❌ סידור בניסוי וטעייה - תוצאות חלשות',
                        '❌ ללא נתונים או אופטימיזציה',
                        '❌ שחיקת מורים ותסכול'
                    ],
                    ishebotTitle: '✅ ISHEBOT - פתרון מקצועי',
                    ishebotCost: '₪88,000',
                    ishebotDesc: 'השקעה שנתית עבור 25 מורים',
                    ishebotItems: [
                        '✅ חיסכון ₪112,000 בזמן מורים מדי שנה!',
                        '✅ 6,250 שעות משוחררות להוראה אמיתית',
                        '✅ שיפור של 40% בהישגים התלמידים',
                        '✅ סידור מבוסס מדע ואלגוריתם גנטי',
                        '✅ מורים מרוצים + הורים מרוצים'
                    ],
                    note: '* חישוב מבוסס על: 10 שעות/שבוע × 25 מורים × 25 שבועות × ₪32/שעה = ₪200,000 בעלות זמן שנתית. עם ISHEBOT ב-₪88,000, אתם חוסכים ₪112,000 בזמן מורים + מקבלים שיפור של 40% בהישגים. ההשקעה מחזירה את עצמה כבר בשנה הראשונה!'
                },
                pricing: {
                    title: 'מחירים שקופים ומשתלמים',
                    basicTitle: '📦 חבילה בסיסית',
                    basicPrice: '₪47,200',
                    basicItems: [
                        'ניתוח 50+ נקודות נתונים לכל תלמיד',
                        'מערכת צבעים חכמה (אדום/צהוב/ירוק)',
                        '3 מבני כיתה (שורות, זוגות, אשכולות)',
                        'סידור ישיבה אוטומטי עם AI',
                        'לוח בקרה פוטוריסטי בסיסי',
                        'הדפסה ויצוא PDF',
                        'תמיכה ב-2 שפות (עברית ואנגלית)',
                        'עד 10 מורים',
                        'תמיכה במייל'
                    ],
                    proTitle: '📦 חבילה מקצועית',
                    proPrice: '₪88,000',
                    proItems: [
                        'אלגוריתם גנטי מתקדם (CSP) - 100 דורות',
                        'ניתוח 50+ נקודות נתונים + ניתוח מיקום חכם',
                        'כל 6 מבני הכיתה (שורות, זוגות, אשכולות, U-Shape, מעגל, גמיש)',
                        'Hover Tooltip עם הסבר מפורט למיקום',
                        'גרור ושחרר עם משוב מיידי',
                        'לוח בקרה פוטוריסטי מלא עם אנימציות',
                        'תמיכה ב-4 שפות (עברית, אנגלית, ערבית, רוסית)',
                        'נגישות מלאה WCAG 2.1',
                        'עד 25 מורים',
                        'תמיכה מהירה ב-WhatsApp',
                        'הדרכה אישית מקיפה'
                    ],
                    enterpriseTitle: '📦 חבילה ארגונית',
                    enterprisePrice: '₪120,000',
                    enterpriseItems: [
                        'כל תכונות החבילה המקצועית',
                        'אלגוריתם גנטי מותאם אישית לארגון',
                        'אינטגרציה עם Google Forms אוטומטית',
                        'ניתוח ISHEBOT מתקדם עם תובנות AI',
                        'דוחות מפורטים להנהלה והורים',
                        'התאמה אישית למבני כיתה ייחודיים',
                        'כל 4 השפות עם תמיכה RTL/LTR מלאה',
                        'תואם תיקון 13 ומשרד החינוך',
                        'מורים ללא הגבלה',
                        'תמיכה פרימיום 24/7',
                        'מנהל חשבון ייעודי',
                        'עדכונים ושדרוגים ראשונים'
                    ],
                    perYear: 'לשנה',
                    cta: 'התחל עכשיו'
                },
                contact: {
                    title: 'מוכנים לחוות את עתיד ניהול הכיתה?',
                    subtitle: 'הצטרפו למורים שמשתמשים באלגוריתם גנטי מתקדם לסידור כיתה אופטימלי',
                    namePlaceholder: 'שם מלא',
                    schoolPlaceholder: 'בית ספר',
                    rolePlaceholder: 'תפקיד',
                    phonePlaceholder: 'טלפון',
                    emailPlaceholder: 'אימייל',
                    submit: 'קבל הדגמה חינמית עכשיו'
                },
                footer: {
                    about: 'ISHEBOT',
                    aboutDesc: 'AI חכם לניהול כיתה מתקדם',
                    quickLinks: 'קישורים מהירים',
                    legal: 'משפטי',
                    privacy: 'מדיניות פרטיות',
                    terms: 'תנאי שימוש',
                    contactTitle: 'צור קשר',
                    socialMedia: 'עקבו אחרינו',
                    copyright: '© 2025 ISHEBOT Ltd. כל הזכויות שמורות'
                }
            },
            en: {
                dir: 'ltr',
                nav: {
                    features: 'Features',
                    benefits: 'Benefits',
                    roi: 'ROI Calculator',
                    pricing: 'Pricing',
                    contact: 'Contact'
                },
                hero: {
                    badge: '🔥 Solution to Teachers\' Biggest Challenge',
                    title: '<span class="highlight">ISHEBOT</span> - Makes Teachers<br>10x More Efficient & Productive!',
                    subtitle: 'Smart AI that does the heavy lifting for you: student analysis and automatic classroom seating',
                    stats: [
                        'Save 15+ hours<br>of work per week',
                        'Analyze 30+ students<br>in minutes!',
                        'AI does the<br>heavy thinking',
                        'Perfect solution<br>with one click'
                    ],
                    ctaPrimary: '🎁 Let the system work for you - Start now!',
                    ctaSecondary: 'See how it saves you time'
                },
                problems: {
                    title: '🔥 The Work That Drains Teachers\' Energy 🔥',
                    subtitle: 'Are you wasting precious hours on these tasks?',
                    items: [
                        { text: 'Manual analysis of 30+ students', impact: '⏱️ 8+ hours per week!' },
                        { text: 'Tracking strengths and challenges of each student', impact: '💔 Impossible manually!' },
                        { text: 'Trial and error seating arrangement', impact: '❌ Non-optimal results!' },
                        { text: 'Scattered info in Excel, papers, and notes', impact: '🗂️ Total chaos!' },
                        { text: 'Decisions based on intuition only', impact: '⚠️ No accurate data!' },
                        { text: 'Lack of time for personal attention to each student', impact: '💥 Massive overload!' },
                        { text: 'First day chaos - Last minute class arrangements', impact: '😱 Intense pressure at year start!' },
                        { text: 'Teachers overwhelmed with excessive work hours', impact: '💼 Endless overtime hours!' },
                        { text: 'Managers dealing with complaints and issues', impact: '📞 Hundreds of calls and emails!' }
                    ]
                },
                features: {
                    title: '💎 ISHEBOT - The Solution That Will Change Your Life! 💎',
                    subtitle: 'Powerful AI that does all the heavy lifting for you',
                    cards: [
                        {
                            title: 'Smart Automatic Analysis',
                            items: [
                                '50+ data points per student',
                                'Automatic identification of strengths and challenges',
                                'Visual color system (🔴🟡🟢)',
                                'Instant classification by needs',
                                'Advanced AI insights'
                            ]
                        },
                        {
                            title: 'Revolutionary Genetic Algorithm',
                            items: [
                                '100 generations of optimization',
                                'Compatibility calculation between every pair',
                                'Finding the most perfect arrangement',
                                '6 different classroom layouts',
                                'Adaptation to any learning goal'
                            ]
                        },
                        {
                            title: 'Smart Position Analysis',
                            items: [
                                'Explanation why each student sits there',
                                'Analysis by position (front/back)',
                                'Consideration of relative position',
                                'Detailed Hover Tooltip',
                                'Personalized recommendations'
                            ]
                        },
                        {
                            title: 'Drag and Drop with AI',
                            items: [
                                'Instant change by dragging',
                                'Immediate AI feedback on every change',
                                'Compatibility score for each pair',
                                'Alerts on problematic arrangements',
                                'Automatic improvement recommendations'
                            ]
                        },
                        {
                            title: 'Futuristic Dashboard',
                            items: [
                                'Modern interface with animations',
                                'Real-time interactive graphs',
                                'Professional print reports',
                                'High-quality PDF export',
                                'Dark/Light mode'
                            ]
                        },
                        {
                            title: 'Multilingual and Accessible',
                            items: [
                                '4 languages (Hebrew, English, Arabic, Russian)',
                                'Full RTL/LTR support',
                                'Full WCAG 2.1 accessibility',
                                'Screen reader support',
                                'Full keyboard navigation'
                            ]
                        }
                    ]
                },
                roi: {
                    title: '💰 Return on Investment (ROI)',
                    subtitle: 'Why ISHEBOT is the smartest investment?',
                    manualTitle: '❌ Traditional Manual Work',
                    manualCost: '₪200,000',
                    manualDesc: 'Teacher time cost per year',
                    manualItems: [
                        '❌ 10 hours/week × 25 teachers × 25 weeks',
                        '❌ 6,250 hours spent on admin instead of teaching',
                        '❌ Trial-and-error seating - poor results',
                        '❌ No data or optimization',
                        '❌ Teacher burnout and frustration'
                    ],
                    ishebotTitle: '✅ ISHEBOT - Professional Solution',
                    ishebotCost: '₪88,000',
                    ishebotDesc: 'Annual investment for 25 teachers',
                    ishebotItems: [
                        '✅ Save ₪112,000 in teacher time annually!',
                        '✅ 6,250 hours freed for actual teaching',
                        '✅ 40% improvement in student outcomes',
                        '✅ Science-based seating with genetic algorithm',
                        '✅ Happy teachers + satisfied parents'
                    ],
                    note: '* Calculation based on: 10 hours/week × 25 teachers × 25 weeks × ₪32/hour = ₪200,000 in annual time cost. With ISHEBOT at ₪88,000, you save ₪112,000 in teacher time + get 40% improvement in outcomes. The investment pays for itself in the first year!'
                },
                pricing: {
                    title: 'Transparent and Affordable Pricing',
                    basicTitle: '📦 Basic Package',
                    basicPrice: '₪47,200',
                    basicItems: [
                        '50+ data points analysis per student',
                        'Smart color system (red/yellow/green)',
                        '3 classroom layouts (rows, pairs, clusters)',
                        'Automatic AI seating arrangement',
                        'Basic futuristic dashboard',
                        'Print and PDF export',
                        'Support for 2 languages (Hebrew and English)',
                        'Up to 10 teachers',
                        'Email support'
                    ],
                    proTitle: '📦 Professional Package',
                    proPrice: '₪88,000',
                    proItems: [
                        'Advanced genetic algorithm (CSP) - 100 generations',
                        '50+ data points + smart position analysis',
                        'All 6 classroom layouts (rows, pairs, clusters, U-Shape, circle, flexible)',
                        'Hover Tooltip with detailed position explanation',
                        'Drag and drop with immediate feedback',
                        'Full futuristic dashboard with animations',
                        'Support for 4 languages (Hebrew, English, Arabic, Russian)',
                        'Full WCAG 2.1 accessibility',
                        'Up to 25 teachers',
                        'Fast WhatsApp support',
                        'Comprehensive personal training'
                    ],
                    enterpriseTitle: '📦 Enterprise Package',
                    enterprisePrice: '₪120,000',
                    enterpriseItems: [
                        'All professional package features',
                        'Custom genetic algorithm for organization',
                        'Automatic Google Forms integration',
                        'Advanced ISHEBOT analysis with AI insights',
                        'Detailed reports for management and parents',
                        'Custom adaptation for unique classroom layouts',
                        'All 4 languages with full RTL/LTR support',
                        'Amendment 13 and Ministry of Education compliant',
                        'Unlimited teachers',
                        'Premium 24/7 support',
                        'Dedicated account manager',
                        'First access to updates and upgrades'
                    ],
                    perYear: 'per year',
                    cta: 'Get Started'
                },
                contact: {
                    title: 'Ready to Experience the Future of Classroom Management?',
                    subtitle: 'Join teachers using advanced genetic algorithms for optimal classroom seating',
                    namePlaceholder: 'Full Name',
                    schoolPlaceholder: 'School',
                    rolePlaceholder: 'Role',
                    phonePlaceholder: 'Phone',
                    emailPlaceholder: 'Email',
                    submit: 'Get Free Demo Now'
                },
                footer: {
                    about: 'ISHEBOT',
                    aboutDesc: 'Smart AI for Advanced Classroom Management',
                    quickLinks: 'Quick Links',
                    legal: 'Legal',
                    privacy: 'Privacy Policy',
                    terms: 'Terms of Use',
                    contactTitle: 'Contact',
                    socialMedia: 'Follow Us',
                    copyright: '© 2025 ISHEBOT Ltd. All rights reserved'
                }
            },
            ar: {
                dir: 'rtl',
                nav: {
                    features: 'الميزات',
                    benefits: 'الفوائد',
                    roi: 'حاسبة ROI',
                    pricing: 'الأسعار',
                    contact: 'اتصل بنا'
                },
                hero: {
                    badge: '🔥 الحل الأمثل لأكبر تحدي للمعلمين',
                    title: '<span class="highlight">ISHEBOT</span> - يجعل المعلمين<br>أكثر كفاءة وإنتاجية بعشر مرات!',
                    subtitle: 'ذكاء اصطناعي ذكي يقوم بالعمل الشاق نيابة عنك: تحليل الطلاب وترتيب الفصل الدراسي التلقائي',
                    stats: [
                        'وفر أكثر من 15 ساعة<br>عمل أسبوعيًا',
                        'تحليل أكثر من 30 طالبًا<br>في دقائق!',
                        'الذكاء الاصطناعي يقوم<br>بالتفكير الشاق',
                        'حل مثالي<br>بنقرة واحدة'
                    ],
                    ctaPrimary: '🎁 دع النظام يعمل نيابة عنك - ابدأ الآن!',
                    ctaSecondary: 'شاهد كيف يوفر لك الوقت'
                },
                problems: {
                    title: '🔥 العمل الذي يستنزف طاقة المعلمين 🔥',
                    subtitle: 'هل تضيع ساعات ثمينة على هذه المهام؟',
                    items: [
                        { text: 'تحليل يدوي لأكثر من 30 طالبًا', impact: '⏱️ أكثر من 8 ساعات أسبوعيًا!' },
                        { text: 'تتبع نقاط القوة والتحديات لكل طالب', impact: '💔 مستحيل يدويًا!' },
                        { text: 'ترتيب المقاعد بالتجربة والخطأ', impact: '❌ نتائج غير مثالية!' },
                        { text: 'معلومات مبعثرة في Excel وأوراق وملاحظات', impact: '🗂️ فوضى كاملة!' },
                        { text: 'قرارات مبنية على الحدس فقط', impact: '⚠️ بدون بيانات دقيقة!' },
                        { text: 'نقص الوقت للاهتمام الشخصي بكل طالب', impact: '💥 حمل هائل!' },
                        { text: 'فوضى اليوم الأول - ترتيب الفصول في اللحظة الأخيرة', impact: '😱 ضغط هائل في بداية العام!' },
                        { text: 'المعلمون مثقلون بساعات عمل طويلة', impact: '💼 ساعات عمل إضافية لا نهائية!' },
                        { text: 'المديرون يتعاملون مع الشكاوى والمشاكل', impact: '📞 مئات المكالمات والرسائل!' }
                    ]
                },
                features: {
                    title: '💎 ISHEBOT - الحل الذي سيغير حياتك! 💎',
                    subtitle: 'ذكاء اصطناعي قوي يقوم بكل العمل الشاق نيابة عنك',
                    cards: [
                        {
                            title: 'تحليل ذكي تلقائي',
                            items: [
                                'أكثر من 50 نقطة بيانات لكل طالب',
                                'تحديد تلقائي لنقاط القوة والتحديات',
                                'نظام ألوان بصري (🔴🟡🟢)',
                                'تصنيف فوري حسب الاحتياجات',
                                'رؤى ذكاء اصطناعي متقدمة'
                            ]
                        },
                        {
                            title: 'خوارزمية جينية ثورية',
                            items: [
                                '100 جيل من التحسين',
                                'حساب التوافق بين كل زوج من الطلاب',
                                'إيجاد الترتيب الأكثر مثالية',
                                '6 تخطيطات مختلفة للفصل الدراسي',
                                'التكيف مع أي هدف تعليمي'
                            ]
                        },
                        {
                            title: 'تحليل الموقع الذكي',
                            items: [
                                'شرح لماذا يجلس كل طالب هناك',
                                'تحليل حسب الموقع (أمامي/خلفي)',
                                'مراعاة الموقع النسبي',
                                'تلميح تفصيلي عند التمرير',
                                'توصيات مخصصة'
                            ]
                        },
                        {
                            title: 'السحب والإفلات مع الذكاء الاصطناعي',
                            items: [
                                'تغيير فوري بالسحب',
                                'ملاحظات فورية من الذكاء الاصطناعي على كل تغيير',
                                'درجة التوافق لكل زوج',
                                'تنبيهات حول الترتيبات الإشكالية',
                                'توصيات تحسين تلقائية'
                            ]
                        },
                        {
                            title: 'لوحة تحكم مستقبلية',
                            items: [
                                'واجهة حديثة مع رسوم متحركة',
                                'رسوم بيانية تفاعلية في الوقت الفعلي',
                                'تقارير احترافية للطباعة',
                                'تصدير PDF عالي الجودة',
                                'وضع داكن/فاتح'
                            ]
                        },
                        {
                            title: 'متعدد اللغات وسهل الوصول',
                            items: [
                                '4 لغات (عربي، عبري، إنجليزي، روسي)',
                                'دعم كامل RTL/LTR',
                                'إمكانية الوصول الكاملة WCAG 2.1',
                                'دعم قارئ الشاشة',
                                'التنقل الكامل بلوحة المفاتيح'
                            ]
                        }
                    ]
                },
                roi: {
                    title: '💰 العائد على الاستثمار (ROI)',
                    subtitle: 'لماذا ISHEBOT هو الاستثمار الأذكى؟',
                    manualTitle: '❌ العمل اليدوي التقليدي',
                    manualCost: '₪200,000',
                    manualDesc: 'تكلفة وقت المعلمين سنويًا',
                    manualItems: [
                        '❌ 10 ساعات/أسبوع × 25 معلمًا × 25 أسبوعًا',
                        '❌ 6,250 ساعة عمل بدلاً من التدريس',
                        '❌ ترتيب بالتجربة والخطأ - نتائج ضعيفة',
                        '❌ بدون بيانات أو تحسين',
                        '❌ إرهاق المعلمين والإحباط'
                    ],
                    ishebotTitle: '✅ ISHEBOT - حل احترافي',
                    ishebotCost: '₪88,000',
                    ishebotDesc: 'استثمار سنوي لـ 25 معلمًا',
                    ishebotItems: [
                        '✅ توفير ₪112,000 من وقت المعلمين سنويًا!',
                        '✅ 6,250 ساعة محررة للتدريس الفعلي',
                        '✅ تحسين بنسبة 40٪ في نتائج الطلاب',
                        '✅ ترتيب علمي مع خوارزمية جينية',
                        '✅ معلمون سعداء + آباء راضون'
                    ],
                    note: '* الحساب بناءً على: 10 ساعات/أسبوع × 25 معلمًا × 25 أسبوعًا × ₪32/ساعة = ₪200,000 تكلفة وقت سنوية. مع ISHEBOT بسعر ₪88,000، توفر ₪112,000 من وقت المعلمين + تحصل على تحسين 40٪ في النتائج. الاستثمار يسترد نفسه في السنة الأولى!'
                },
                pricing: {
                    title: 'أسعار شفافة ومعقولة',
                    basicTitle: '📦 الباقة الأساسية',
                    basicPrice: '₪47,200',
                    basicItems: [
                        'تحليل أكثر من 50 نقطة بيانات لكل طالب',
                        'نظام ألوان ذكي (أحمر/أصفر/أخضر)',
                        '3 تخطيطات للفصل (صفوف، أزواج، مجموعات)',
                        'ترتيب مقاعد تلقائي بالذكاء الاصطناعي',
                        'لوحة تحكم مستقبلية أساسية',
                        'طباعة وتصدير PDF',
                        'دعم لغتين (عبري وإنجليزي)',
                        'حتى 10 معلمين',
                        'دعم البريد الإلكتروني'
                    ],
                    proTitle: '📦 الباقة المهنية',
                    proPrice: '₪88,000',
                    proItems: [
                        'خوارزمية جينية متقدمة (CSP) - 100 جيل',
                        'أكثر من 50 نقطة بيانات + تحليل موقع ذكي',
                        'جميع تخطيطات الفصل الـ 6 (صفوف، أزواج، مجموعات، على شكل U، دائرة، مرن)',
                        'تلميح عند التمرير مع شرح تفصيلي للموقع',
                        'السحب والإفلات مع ملاحظات فورية',
                        'لوحة تحكم مستقبلية كاملة مع رسوم متحركة',
                        'دعم 4 لغات (عبري، إنجليزي، عربي، روسي)',
                        'إمكانية الوصول الكاملة WCAG 2.1',
                        'حتى 25 معلمًا',
                        'دعم سريع عبر WhatsApp',
                        'تدريب شخصي شامل'
                    ],
                    enterpriseTitle: '📦 الباقة المؤسسية',
                    enterprisePrice: '₪120,000',
                    enterpriseItems: [
                        'جميع ميزات الباقة المهنية',
                        'خوارزمية جينية مخصصة للمؤسسة',
                        'تكامل تلقائي مع Google Forms',
                        'تحليل ISHEBOT متقدم مع رؤى الذكاء الاصطناعي',
                        'تقارير مفصلة للإدارة والآباء',
                        'تخصيص لتخطيطات الفصول الفريدة',
                        'جميع اللغات الـ 4 مع دعم كامل RTL/LTR',
                        'متوافق مع التعديل 13 ووزارة التعليم',
                        'معلمون غير محدودين',
                        'دعم مميز 24/7',
                        'مدير حساب مخصص',
                        'الوصول الأول للتحديثات والترقيات'
                    ],
                    perYear: 'سنويًا',
                    cta: 'ابدأ الآن'
                },
                contact: {
                    title: 'هل أنت مستعد لتجربة مستقبل إدارة الفصول الدراسية؟',
                    subtitle: 'انضم إلى المعلمين الذين يستخدمون خوارزميات جينية متقدمة',
                    namePlaceholder: 'الاسم الكامل',
                    schoolPlaceholder: 'المدرسة',
                    rolePlaceholder: 'الدور',
                    phonePlaceholder: 'الهاتف',
                    emailPlaceholder: 'البريد الإلكتروني',
                    submit: 'احصل على عرض توضيحي مجاني'
                },
                footer: {
                    about: 'ISHEBOT',
                    aboutDesc: 'ذكاء اصطناعي ذكي لإدارة الفصول المتقدمة',
                    quickLinks: 'روابط سريعة',
                    legal: 'قانوني',
                    privacy: 'سياسة الخصوصية',
                    terms: 'شروط الاستخدام',
                    contactTitle: 'اتصل بنا',
                    socialMedia: 'تابعنا',
                    copyright: '© 2025 ISHEBOT Ltd. جميع الحقوق محفوظة'
                }
            },
            ru: {
                dir: 'ltr',
                nav: {
                    features: 'Функции',
                    benefits: 'Преимущества',
                    roi: 'Калькулятор ROI',
                    pricing: 'Цены',
                    contact: 'Контакты'
                },
                hero: {
                    badge: '🔥 Решение самой сложной задачи учителей',
                    title: '<span class="highlight">ISHEBOT</span> - Делает учителей<br>в 10 раз эффективнее и продуктивнее!',
                    subtitle: 'Умный ИИ, который выполняет тяжелую работу за вас: анализ учеников и автоматическая рассадка в классе',
                    stats: [
                        'Экономьте более 15 часов<br>работы в неделю',
                        'Анализируйте 30+ учеников<br>за минуты!',
                        'ИИ выполняет<br>тяжелую работу',
                        'Идеальное решение<br>одним кликом'
                    ],
                    ctaPrimary: '🎁 Пусть система работает за вас - Начните сейчас!',
                    ctaSecondary: 'Посмотрите, как это экономит время'
                },
                problems: {
                    title: '🔥 Работа, которая истощает энергию учителей 🔥',
                    subtitle: 'Тратите ли вы драгоценные часы на эти задачи?',
                    items: [
                        { text: 'Ручной анализ 30+ учеников', impact: '⏱️ 8+ часов в неделю!' },
                        { text: 'Отслеживание сильных сторон и проблем каждого ученика', impact: '💔 Невозможно вручную!' },
                        { text: 'Рассадка методом проб и ошибок', impact: '❌ Неоптимальные результаты!' },
                        { text: 'Разбросанная информация в Excel, бумагах и заметках', impact: '🗂️ Полный хаос!' },
                        { text: 'Решения основаны только на интуиции', impact: '⚠️ Нет точных данных!' },
                        { text: 'Нехватка времени для личного внимания каждому ученику', impact: '💥 Огромная перегрузка!' },
                        { text: 'Хаос первого дня - организация классов в последний момент', impact: '😱 Огромное давление в начале года!' },
                        { text: 'Учителя перегружены долгими рабочими часами', impact: '💼 Бесконечные сверхурочные!' },
                        { text: 'Менеджеры разбираются с жалобами и проблемами', impact: '📞 Сотни звонков и писем!' }
                    ]
                },
                features: {
                    title: '💎 ISHEBOT - Решение, которое изменит вашу жизнь! 💎',
                    subtitle: 'Мощный ИИ, который делает всю тяжелую работу за вас',
                    cards: [
                        {
                            title: 'Умный автоматический анализ',
                            items: [
                                '50+ точек данных на ученика',
                                'Автоматическое определение сильных сторон и проблем',
                                'Визуальная цветовая система (🔴🟡🟢)',
                                'Мгновенная классификация по потребностям',
                                'Продвинутые инсайты ИИ'
                            ]
                        },
                        {
                            title: 'Революционный генетический алгоритм',
                            items: [
                                '100 поколений оптимизации',
                                'Расчет совместимости между каждой парой',
                                'Поиск наиболее идеальной расстановки',
                                '6 различных планировок класса',
                                'Адаптация к любой учебной цели'
                            ]
                        },
                        {
                            title: 'Умный анализ позиций',
                            items: [
                                'Объяснение, почему каждый ученик сидит там',
                                'Анализ по позиции (передняя/задняя)',
                                'Учет относительной позиции',
                                'Детальная подсказка при наведении',
                                'Персонализированные рекомендации'
                            ]
                        },
                        {
                            title: 'Перетаскивание с ИИ',
                            items: [
                                'Мгновенное изменение перетаскиванием',
                                'Немедленная обратная связь ИИ по каждому изменению',
                                'Оценка совместимости для каждой пары',
                                'Предупреждения о проблемных расстановках',
                                'Автоматические рекомендации по улучшению'
                            ]
                        },
                        {
                            title: 'Футуристическая панель управления',
                            items: [
                                'Современный интерфейс с анимациями',
                                'Интерактивные графики в реальном времени',
                                'Профессиональные отчеты для печати',
                                'Высококачественный экспорт PDF',
                                'Темный/Светлый режим'
                            ]
                        },
                        {
                            title: 'Многоязычный и доступный',
                            items: [
                                '4 языка (иврит, английский, арабский, русский)',
                                'Полная поддержка RTL/LTR',
                                'Полная доступность WCAG 2.1',
                                'Поддержка программ чтения с экрана',
                                'Полная навигация с клавиатуры'
                            ]
                        }
                    ]
                },
                roi: {
                    title: '💰 Возврат инвестиций (ROI)',
                    subtitle: 'Почему ISHEBOT - самая умная инвестиция?',
                    manualTitle: '❌ Традиционная ручная работа',
                    manualCost: '₪200,000',
                    manualDesc: 'Стоимость времени учителей в год',
                    manualItems: [
                        '❌ 10 часов/неделю × 25 учителей × 25 недель',
                        '❌ 6,250 часов работы вместо преподавания',
                        '❌ Рассадка методом проб - слабые результаты',
                        '❌ Без данных или оптимизации',
                        '❌ Выгорание и фрустрация учителей'
                    ],
                    ishebotTitle: '✅ ISHEBOT - Профессиональное решение',
                    ishebotCost: '₪88,000',
                    ishebotDesc: 'Годовая инвестиция для 25 учителей',
                    ishebotItems: [
                        '✅ Экономия ₪112,000 времени учителей в год!',
                        '✅ 6,250 часов освобождено для реального преподавания',
                        '✅ Улучшение результатов учеников на 40%',
                        '✅ Научная рассадка с генетическим алгоритмом',
                        '✅ Довольные учителя + удовлетворенные родители'
                    ],
                    note: '* Расчет основан на: 10 часов/неделю × 25 учителей × 25 недель × ₪32/час = ₪200,000 годовой стоимости времени. С ISHEBOT за ₪88,000, вы экономите ₪112,000 времени учителей + получаете улучшение на 40%. Инвестиция окупается в первый же год!'
                },
                pricing: {
                    title: 'Прозрачные и доступные цены',
                    basicTitle: '📦 Базовый пакет',
                    basicPrice: '₪47,200',
                    basicItems: [
                        'Анализ 50+ точек данных на ученика',
                        'Умная цветовая система (красный/желтый/зеленый)',
                        '3 планировки класса (ряды, пары, группы)',
                        'Автоматическая рассадка с ИИ',
                        'Базовая футуристическая панель',
                        'Печать и экспорт PDF',
                        'Поддержка 2 языков (иврит и английский)',
                        'До 10 учителей',
                        'Поддержка по email'
                    ],
                    proTitle: '📦 Профессиональный пакет',
                    proPrice: '₪88,000',
                    proItems: [
                        'Продвинутый генетический алгоритм (CSP) - 100 поколений',
                        '50+ точек данных + умный анализ позиций',
                        'Все 6 планировок класса (ряды, пары, группы, U-образная, круг, гибкая)',
                        'Подсказка при наведении с подробным объяснением позиции',
                        'Перетаскивание с немедленной обратной связью',
                        'Полная футуристическая панель с анимациями',
                        'Поддержка 4 языков (иврит, английский, арабский, русский)',
                        'Полная доступность WCAG 2.1',
                        'До 25 учителей',
                        'Быстрая поддержка в WhatsApp',
                        'Комплексное личное обучение'
                    ],
                    enterpriseTitle: '📦 Корпоративный пакет',
                    enterprisePrice: '₪120,000',
                    enterpriseItems: [
                        'Все функции профессионального пакета',
                        'Индивидуальный генетический алгоритм для организации',
                        'Автоматическая интеграция с Google Forms',
                        'Продвинутый анализ ISHEBOT с инсайтами ИИ',
                        'Подробные отчеты для руководства и родителей',
                        'Индивидуальная адаптация для уникальных планировок',
                        'Все 4 языка с полной поддержкой RTL/LTR',
                        'Соответствие поправке 13 и Министерству образования',
                        'Неограниченное количество учителей',
                        'Премиум поддержка 24/7',
                        'Выделенный менеджер аккаунта',
                        'Первый доступ к обновлениям и апгрейдам'
                    ],
                    perYear: 'в год',
                    cta: 'Начать'
                },
                contact: {
                    title: 'Готовы испытать будущее управления классом?',
                    subtitle: 'Присоединяйтесь к учителям, использующим продвинутые генетические алгоритмы',
                    namePlaceholder: 'Полное имя',
                    schoolPlaceholder: 'Школа',
                    rolePlaceholder: 'Роль',
                    phonePlaceholder: 'Телефон',
                    emailPlaceholder: 'Email',
                    submit: 'Получить бесплатную демонстрацию'
                },
                footer: {
                    about: 'ISHEBOT',
                    aboutDesc: 'Умный ИИ для продвинутого управления классом',
                    quickLinks: 'Быстрые ссылки',
                    legal: 'Юридический',
                    privacy: 'Политика конфиденциальности',
                    terms: 'Условия использования',
                    contactTitle: 'Контакты',
                    socialMedia: 'Подписывайтесь',
                    copyright: '© 2025 ISHEBOT Ltd. Все права защищены'
                }
            }
        };

        let currentLang = 'he';

        function switchLanguage(lang) {
            if (!translations[lang]) return;

            currentLang = lang;
            const t = translations[lang];

            // Update document direction
            document.body.setAttribute('dir', t.dir);
            document.documentElement.setAttribute('lang', lang);

            // Navigation is hardcoded in HTML - no need to update via JS
            // (תכונות, סרטון הדגמה, המהפכה, שאלות נפוצות, חישוב ROI, מחירים, צור קשר)

            // Update hero section
            const heroBadge = document.querySelector('.hero-badge');
            if (heroBadge) heroBadge.textContent = t.hero.badge;

            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle) heroTitle.innerHTML = t.hero.title;

            const heroSubtitle = document.querySelector('.hero h2');
            if (heroSubtitle) heroSubtitle.textContent = t.hero.subtitle;

            // Update hero stats
            const statCards = document.querySelectorAll('.stat-card h3');
            if (t.hero.stats) {
                statCards.forEach((stat, index) => {
                    if (t.hero.stats[index]) {
                        stat.innerHTML = t.hero.stats[index];
                    }
                });
            }

            // Update hero CTA buttons
            const ctaPrimary = document.querySelector('.cta-buttons .btn-primary');
            if (ctaPrimary && t.hero.ctaPrimary) ctaPrimary.textContent = t.hero.ctaPrimary;

            const ctaSecondary = document.querySelector('.cta-buttons .btn-secondary');
            if (ctaSecondary && t.hero.ctaSecondary) ctaSecondary.textContent = t.hero.ctaSecondary;

            // Update problems section
            if (t.problems) {
                const problemTitle = document.querySelector('.problem .section-title');
                if (problemTitle) problemTitle.textContent = t.problems.title;

                const problemSubtitle = document.querySelector('.problem .section-subtitle');
                if (problemSubtitle) problemSubtitle.textContent = t.problems.subtitle;

                const problemCards = document.querySelectorAll('.problem-card');
                problemCards.forEach((card, index) => {
                    if (t.problems.items[index]) {
                        const text = card.querySelector('p');
                        const impact = card.querySelector('.problem-impact');
                        if (text) text.textContent = t.problems.items[index].text;
                        if (impact) impact.textContent = t.problems.items[index].impact;
                    }
                });
            }

            // Update features section
            const featuresTitle = document.querySelector('.features .section-title');
            if (featuresTitle) featuresTitle.textContent = t.features.title;

            const featuresSubtitle = document.querySelector('.features .section-subtitle');
            if (featuresSubtitle) featuresSubtitle.textContent = t.features.subtitle;

            // Update feature cards
            if (t.features.cards) {
                const featureCards = document.querySelectorAll('.feature-card');
                featureCards.forEach((card, index) => {
                    if (t.features.cards[index]) {
                        const title = card.querySelector('h3');
                        if (title) title.textContent = t.features.cards[index].title;

                        const items = card.querySelectorAll('li');
                        items.forEach((item, itemIndex) => {
                            if (t.features.cards[index].items[itemIndex]) {
                                item.textContent = t.features.cards[index].items[itemIndex];
                            }
                        });
                    }
                });
            }

            // Update ROI section
            const roiTitle = document.querySelector('.roi-section .section-title');
            if (roiTitle) roiTitle.textContent = t.roi.title;

            const roiSubtitle = document.querySelector('.roi-section .section-subtitle');
            if (roiSubtitle) roiSubtitle.textContent = t.roi.subtitle;

            // Update ROI comparison items
            const roiComparison = document.querySelectorAll('.roi-comparison-item');
            if (roiComparison[0] && t.roi.manualTitle) {
                const manualTitle = roiComparison[0].querySelector('h4');
                const manualCost = roiComparison[0].querySelector('.amount');
                const manualDesc = roiComparison[0].querySelectorAll('p')[0];
                const manualList = roiComparison[0].querySelectorAll('p')[1];

                if (manualTitle) manualTitle.textContent = t.roi.manualTitle;
                if (manualCost) manualCost.textContent = t.roi.manualCost;
                if (manualDesc) manualDesc.textContent = t.roi.manualDesc;
                if (manualList && t.roi.manualItems) {
                    manualList.innerHTML = t.roi.manualItems.join('<br>');
                }
            }

            if (roiComparison[1] && t.roi.ishebotTitle) {
                const ishebotTitle = roiComparison[1].querySelector('h4');
                const ishebotCost = roiComparison[1].querySelector('.amount');
                const ishebotDesc = roiComparison[1].querySelectorAll('p')[0];
                const ishebotList = roiComparison[1].querySelectorAll('p')[1];

                if (ishebotTitle) ishebotTitle.textContent = t.roi.ishebotTitle;
                if (ishebotCost) ishebotCost.textContent = t.roi.ishebotCost;
                if (ishebotDesc) ishebotDesc.textContent = t.roi.ishebotDesc;
                if (ishebotList && t.roi.ishebotItems) {
                    ishebotList.innerHTML = t.roi.ishebotItems.join('<br>');
                }
            }

            // Update ROI note
            const roiNote = document.querySelector('.roi-note');
            if (roiNote && t.roi.note) roiNote.textContent = t.roi.note;

            // Update pricing section
            const pricingTitle = document.querySelector('.pricing .section-title');
            if (pricingTitle) pricingTitle.textContent = t.pricing.title;

            // Update pricing cards
            const pricingCards = document.querySelectorAll('.pricing-card');
            const pricingData = [
                { title: t.pricing.basicTitle, price: t.pricing.basicPrice, items: t.pricing.basicItems },
                { title: t.pricing.proTitle, price: t.pricing.proPrice, items: t.pricing.proItems },
                { title: t.pricing.enterpriseTitle, price: t.pricing.enterprisePrice, items: t.pricing.enterpriseItems }
            ];
            pricingCards.forEach((card, index) => {
                if (pricingData[index]) {
                    const title = card.querySelector('h3');
                    if (title) title.textContent = pricingData[index].title;

                    const price = card.querySelector('.price');
                    if (price) price.textContent = pricingData[index].price;

                    const period = card.querySelector('.period');
                    if (period) period.textContent = t.pricing.perYear;

                    const btn = card.querySelector('.btn');
                    if (btn) btn.textContent = t.pricing.cta;

                    // Update pricing list items
                    if (pricingData[index].items) {
                        const items = card.querySelectorAll('li');
                        items.forEach((item, itemIndex) => {
                            if (pricingData[index].items[itemIndex]) {
                                item.textContent = pricingData[index].items[itemIndex];
                            }
                        });
                    }
                }
            });

            // Update contact section
            const contactTitle = document.querySelector('.cta-section h2');
            if (contactTitle) contactTitle.textContent = t.contact.title;

            const contactSubtitle = document.querySelector('.cta-section p');
            if (contactSubtitle) contactSubtitle.textContent = t.contact.subtitle;

            // Update form placeholders
            const nameInput = document.querySelector('input[name="name"]');
            if (nameInput) nameInput.placeholder = t.contact.namePlaceholder;

            const schoolInput = document.querySelector('input[name="school"]');
            if (schoolInput) schoolInput.placeholder = t.contact.schoolPlaceholder;

            const roleInput = document.querySelector('input[name="role"]');
            if (roleInput) roleInput.placeholder = t.contact.rolePlaceholder;

            const phoneInput = document.querySelector('input[name="phone"]');
            if (phoneInput) phoneInput.placeholder = t.contact.phonePlaceholder;

            const emailInput = document.querySelector('input[name="email"]');
            if (emailInput) emailInput.placeholder = t.contact.emailPlaceholder;

            const submitBtn = document.querySelector('.cta-section button[type="submit"]');
            if (submitBtn) submitBtn.textContent = t.contact.submit;

            // Update footer
            const footerSections = document.querySelectorAll('.footer-section');
            if (footerSections[0]) {
                const aboutTitle = footerSections[0].querySelector('h4');
                const aboutDesc = footerSections[0].querySelector('p');
                if (aboutTitle) aboutTitle.textContent = t.footer.about;
                if (aboutDesc) aboutDesc.textContent = t.footer.aboutDesc;
            }
            if (footerSections[1]) {
                const quickLinksTitle = footerSections[1].querySelector('h4');
                if (quickLinksTitle) quickLinksTitle.textContent = t.footer.quickLinks;

                const quickLinks = footerSections[1].querySelectorAll('a');
                if (quickLinks[0]) quickLinks[0].textContent = t.nav.features;
                if (quickLinks[1]) quickLinks[1].textContent = t.nav.roi;
                if (quickLinks[2]) quickLinks[2].textContent = t.nav.pricing;
                if (quickLinks[3]) quickLinks[3].textContent = t.nav.contact;
            }
            if (footerSections[2]) {
                const legalTitle = footerSections[2].querySelector('h4');
                if (legalTitle) legalTitle.textContent = t.footer.legal;

                const legalLinks = footerSections[2].querySelectorAll('a');
                if (legalLinks[0]) legalLinks[0].textContent = t.footer.privacy;
                if (legalLinks[1]) legalLinks[1].textContent = t.footer.terms;
            }
            if (footerSections[3]) {
                const contactTitleFooter = footerSections[3].querySelector('h4');
                if (contactTitleFooter) contactTitleFooter.textContent = t.footer.contactTitle;
            }
            if (footerSections[4]) {
                const socialMediaTitle = footerSections[4].querySelector('h4');
                if (socialMediaTitle) socialMediaTitle.textContent = t.footer.socialMedia;
            }

            const copyright = document.querySelector('.footer-bottom');
            if (copyright) copyright.textContent = t.footer.copyright;

            // Update active button
            document.querySelectorAll('.language-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });

            // Update flag on toggle button
            const flagMap = {
                'he': '🇮🇱',
                'en': 'EN',
                'ar': 'AR',
                'ru': '🇷🇺'
            };
            const currentLangFlagEl = document.getElementById('currentLangFlag');
            if (currentLangFlagEl && flagMap[lang]) {
                currentLangFlagEl.textContent = flagMap[lang];
            }

            // Store preference
            localStorage.setItem('preferredLanguage', lang);

            console.log(`Language switched to: ${lang}`);
        }

        // Load saved language preference
        window.addEventListener('DOMContentLoaded', () => {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang && translations[savedLang]) {
                switchLanguage(savedLang);
            }
        });

        // FAQ Accordion Toggle
        document.addEventListener('DOMContentLoaded', () => {
            const faqGrid = document.querySelector('.faq-grid');

            if (faqGrid) {
                // Use event delegation to handle clicks on FAQ questions
                faqGrid.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Find the closest .faq-question element
                    const questionEl = e.target.closest('.faq-question');

                    if (questionEl) {
                        // Find the parent .faq-item
                        const faqItem = questionEl.closest('.faq-item');

                        if (faqItem) {
                            const isCurrentlyActive = faqItem.classList.contains('active');

                            // Close ALL FAQ items first
                            const allFaqItems = faqGrid.querySelectorAll('.faq-item');
                            allFaqItems.forEach(item => {
                                item.classList.remove('active');
                                const itemToggle = item.querySelector('.faq-toggle');
                                if (itemToggle) {
                                    itemToggle.textContent = '+';
                                }
                            });

                            // If the clicked item was not active, open it
                            if (!isCurrentlyActive) {
                                faqItem.classList.add('active');
                                const toggle = questionEl.querySelector('.faq-toggle');
                                if (toggle) {
                                    toggle.textContent = '−';
                                }
                            }
                        }
                    }
                }, true); // Use capture phase
            }
        });

        // Sticky Header Scroll Effect
        const header = document.querySelector('header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add 'scrolled' class when scrolled past 50px
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });

        // Mobile Menu Toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navLinks = document.getElementById('navLinks');

        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                const isActive = navLinks.classList.contains('active');

                // Toggle menu
                navLinks.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');

                // Update aria-expanded for accessibility
                mobileMenuToggle.setAttribute('aria-expanded', !isActive);

                // Prevent body scroll when menu is open
                document.body.style.overflow = isActive ? '' : 'hidden';
            });

            // Close menu when clicking on a link
            const menuLinks = navLinks.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    mobileMenuToggle.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (event) => {
                if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                    if (navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        mobileMenuToggle.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                }
            });
        }

        // Mobile Language Switcher - Click/Tap Functionality
        const langToggleBtn = document.getElementById('langToggleBtn');
        const languageSwitcher = document.querySelector('.language-switcher');

        if (langToggleBtn && languageSwitcher) {
            // Toggle language menu on click (for mobile)
            langToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                languageSwitcher.classList.toggle('active');
            });

            // Close language menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!languageSwitcher.contains(e.target)) {
                    languageSwitcher.classList.remove('active');
                }
            });

            // Close language menu when selecting a language
            const languageBtns = document.querySelectorAll('.language-btn');
            languageBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    setTimeout(() => {
                        languageSwitcher.classList.remove('active');
                    }, 300); // Small delay to allow language switch animation
                });
            });
        }

        // Video Demo Player
        const videoPlayButton = document.getElementById('videoPlayButton');
        const videoPlaceholder = document.getElementById('videoPlaceholder');
        const videoThumbnail = document.getElementById('videoThumbnail');
        const videoIframeContainer = document.getElementById('videoIframeContainer');
        const videoIframe = document.getElementById('videoIframe');

        if (videoPlayButton && videoIframeContainer && videoIframe) {
            // Replace this with your actual YouTube video ID or URL
            // Example: https://www.youtube.com/watch?v=YOUR_VIDEO_ID
            const videoId = 'dQw4w9WgXcQ'; // Replace with actual ISHEBOT demo video ID
            const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

            videoPlayButton.addEventListener('click', () => {
                // Hide thumbnail and play button
                videoThumbnail.style.display = 'none';
                videoPlayButton.style.display = 'none';

                // Show and load video
                videoIframeContainer.style.display = 'block';
                videoIframe.src = videoUrl;

                // Optional: Track video play event
                console.log('Video demo started');
            });

            // Alternative: Make entire placeholder clickable
            videoPlaceholder.style.cursor = 'pointer';
            videoPlaceholder.addEventListener('click', (e) => {
                if (e.target === videoPlaceholder || e.target.closest('.video-thumbnail, .video-overlay')) {
                    videoPlayButton.click();
                }
            });
        // Enhanced Navigation with Scroll-Spy
        (function() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

            // Function to remove active class from all links
            function removeActiveClasses() {
                navLinks.forEach(link => link.classList.remove('active'));
            }

            // Function to add active class to matching links
            function setActiveLink(sectionId) {
                removeActiveClasses();
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === '#' + sectionId ||
                        link.getAttribute('data-section') === sectionId) {
                        link.classList.add('active');
                    }
                });
            }

            // Scroll-spy functionality
            function scrollSpy() {
                const scrollPosition = window.scrollY + 150; // Offset for header

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    const sectionId = section.getAttribute('id');

                    if (scrollPosition >= sectionTop &&
                        scrollPosition < sectionTop + sectionHeight) {
                        setActiveLink(sectionId);
                    }
                });
            }

            // Smooth scrolling for navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        const offsetTop = targetSection.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });

                        // Update active state immediately
                        setActiveLink(targetId);
                    }
                });
            });

            // Enhanced scroll to top button
            const scrollToTopBtn = document.getElementById('scrollToTop');
            if (scrollToTopBtn) {
                // Improve styling for the button
                scrollToTopBtn.style.fontSize = '24px';
                scrollToTopBtn.style.width = '50px';
                scrollToTopBtn.style.height = '50px';
                scrollToTopBtn.style.display = 'flex';
                scrollToTopBtn.style.alignItems = 'center';
                scrollToTopBtn.style.justifyContent = 'center';
                scrollToTopBtn.innerHTML = `
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                    </svg>
                `;
            }

            // Run scroll-spy on scroll and load
            window.addEventListener('scroll', scrollSpy);
            window.addEventListener('load', scrollSpy);

            // Run scroll-spy initially
            scrollSpy();
        })();

        // ============================================================================
        // PWA SERVICE WORKER REGISTRATION
        // ============================================================================
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('✅ Service Worker registered successfully:', registration.scope);
                    })
                    .catch(error => {
                        console.error('❌ Service Worker registration failed:', error);
                    });
            });
        }

        // ============================================================================
        // PWA INSTALL PROMPT
        // ============================================================================
        let deferredPrompt;
        const installButton = document.createElement('button');
        installButton.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>התקן אפליקציה</span>
        `;
        installButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
            display: none;
            align-items: center;
            gap: 8px;
            z-index: 1000;
            transition: all 0.3s ease;
            font-family: 'Rubik', sans-serif;
        `;
        installButton.addEventListener('mouseenter', () => {
            installButton.style.transform = 'translateY(-3px)';
            installButton.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.5)';
        });
        installButton.addEventListener('mouseleave', () => {
            installButton.style.transform = 'translateY(0)';
            installButton.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
        });

        document.body.appendChild(installButton);

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            // Show the install button
            installButton.style.display = 'flex';

            console.log('💡 PWA install prompt available');
        });

        // Handle install button click
        installButton.addEventListener('click', async () => {
            if (!deferredPrompt) {
                return;
            }

            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`👤 User response to install prompt: ${outcome}`);

            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }

            // Clear the deferredPrompt
            deferredPrompt = null;
            // Hide the install button
            installButton.style.display = 'none';
        });

        // Listen for successful installation
        window.addEventListener('appinstalled', (e) => {
            console.log('🎉 PWA installed successfully!');
            // Hide the install button if it's still visible
            installButton.style.display = 'none';

            // Show success message
            const successMessage = document.createElement('div');
            successMessage.textContent = '✅ האפליקציה הותקנה בהצלחה!';
            successMessage.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #10B981, #059669);
                color: white;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                animation: slideUp 0.3s ease;
                font-family: 'Rubik', sans-serif;
            `;
            document.body.appendChild(successMessage);

            setTimeout(() => {
                successMessage.style.opacity = '0';
                successMessage.style.transition = 'opacity 0.3s ease';
                setTimeout(() => successMessage.remove(), 300);
            }, 3000);
        });

        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            console.log('📱 PWA is running in standalone mode');
            installButton.style.display = 'none';
        }

        }
