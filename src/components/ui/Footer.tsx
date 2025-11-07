import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, BookOpen, Mail } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { to: '/privacy-policy', icon: Shield, label: 'מדיניות פרטיות' },
    { to: '/terms', icon: FileText, label: 'תנאי שימוש' },
    { to: '/data-processing', icon: Lock, label: 'הסכם עיבוד נתונים' },
    { to: '/security', icon: BookOpen, label: 'אבטחת מידע' },
  ];

  const contactLinks = [
    { href: 'mailto:wardwas3107@gmail.com', icon: Mail, label: 'צור קשר' },
  ];

  return (
    <footer className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">

          {/* Company Info */}
          <div className="text-center md:text-right">
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ISHEBOT
            </h3>
            <p className="text-sm text-slate-300 mb-2">
              מערכת ניתוח תלמידים בע"מ
            </p>
            <p className="text-xs text-slate-400">
              ניתוח מתקדם באמצעות בינה מלאכותית
            </p>
          </div>

          {/* Legal Links */}
          <div className="text-center">
            <h4 className="text-sm font-semibold mb-3 text-slate-200">
              מסמכים משפטיים
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Links */}
          <div className="text-center md:text-left">
            <h4 className="text-sm font-semibold mb-3 text-slate-200">
              יצירת קשר
            </h4>
            <ul className="space-y-2">
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Copyright */}
            <p className="text-xs text-slate-400 text-center md:text-right">
              © {currentYear} ISHEBOT - מערכת ניתוח תלמידים בע"מ. כל הזכויות שמורות.
            </p>

            {/* Compliance Badges */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-400" />
                תאימות לחוק הגנת הפרטיות
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-blue-400" />
                ISO 27001
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 text-center mt-4">
            המידע באתר זה מיועד למטרות חינוכיות בלבד. השימוש במערכת כפוף לתנאי השימוש ומדיניות הפרטיות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
