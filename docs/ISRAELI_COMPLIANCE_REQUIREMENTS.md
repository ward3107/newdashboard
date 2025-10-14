# Israeli Ministry of Education & Amendment 13 Compliance Requirements

**Last Updated**: October 14, 2025
**Applies to**: Student Analytics & Classroom Management Dashboard

---

## 📋 Overview

This document outlines the security and privacy requirements for educational platforms in Israel, based on:
1. **Amendment 13 to the Privacy Protection Law (2024)** - Effective August 14, 2025
2. **Privacy Protection (Data Security) Regulations (2017)**
3. **Israeli Ministry of Education Guidelines**
4. **Privacy Protection Authority (PPA) Requirements**

---

## 🔐 Security Level Classification

### Your Platform Classification: **MEDIUM SECURITY LEVEL**

**Reasoning**:
- Stores **sensitive student information** (behavioral, emotional, academic data)
- Contains **minors' personal data** (under 18)
- Includes **special categories** (emotional state, learning difficulties)
- Data **shared with third parties** (teachers, consultants, managers)
- Does **NOT** include: medical records, criminal records, biometric data

If your platform expands to include medical/clinical diagnoses, it would be classified as **HIGH SECURITY LEVEL**.

---

## ⚖️ Amendment 13 Key Requirements (Effective August 2025)

### 1. **Legal Basis for Processing**
- ✅ Obtain explicit **parental consent** for processing minors' data (under 18)
- ✅ Provide clear **privacy notice** in Hebrew
- ✅ Define legitimate purpose for data collection (educational improvement)

### 2. **Data Subject Rights**
Must support:
- ✅ **Right to access** - Students/parents can view their data
- ✅ **Right to rectification** - Ability to correct inaccurate data
- ✅ **Right to erasure** - "Right to be forgotten"
- ✅ **Right to data portability** - Export data in common format
- ✅ **Right to object** - Opt-out of certain processing

### 3. **Data Protection Officer (DPO)**
- ✅ **Required** for educational institutions using the platform
- ✅ Schools must appoint a DPO to oversee data protection
- ✅ Contact information must be publicly available

### 4. **Data Breach Notification**
- ✅ Report breaches to PPA within **72 hours**
- ✅ Notify affected individuals if high risk
- ✅ Document all breaches (even if not reported)

### 5. **International Data Transfers**
- ✅ If using OpenAI API (US-based), ensure proper safeguards
- ✅ Use Standard Contractual Clauses (SCCs) or adequacy decisions
- ✅ Document transfer mechanisms

### 6. **Children's Data (Special Protection)**
- ✅ Enhanced protection for minors under 18
- ✅ Parental consent required for data processing
- ✅ Age-appropriate privacy notices
- ✅ No profiling or automated decision-making without safeguards

---

## 🛡️ Data Security Regulations (2017) - Medium Level Requirements

### 1. **Organizational Requirements**

#### A. Information Security Manager
- ✅ Appoint a qualified **Information Security Manager** (רכז אבטחת מידע)
- ✅ Report to management on security status
- ✅ Responsible for implementing security procedures

#### B. Security Procedure Document (תסדיר אבטחה)
Must include:
- ✅ **Access control** policies and authentication measures
- ✅ **Monitoring and logging** of database access
- ✅ **Backup procedures** and disaster recovery
- ✅ **Encryption** requirements for data at rest and in transit
- ✅ **Incident response** procedures
- ✅ **Employee training** requirements
- ✅ **Third-party security** requirements (vendors, APIs)
- ✅ **Physical security** measures
- ✅ **Development security** (secure coding practices)

#### C. Security Committee
- ✅ Hold security meetings **annually** (minimum)
- ✅ Review security incidents and risks
- ✅ Approve security policy updates
- ✅ Document meeting minutes

### 2. **Technical Requirements**

#### A. Access Control
- ✅ **Strong authentication** (passwords minimum 8 characters, complexity rules)
- ✅ **Multi-factor authentication** (MFA) for admin access
- ✅ **Role-based access control** (RBAC) - teachers, managers, consultants
- ✅ **Password policies** (expiration, history, complexity)
- ✅ **Account lockout** after failed login attempts
- ✅ **Session timeout** for inactive users

#### B. Encryption
- ✅ **TLS/SSL** for all data in transit (HTTPS only)
- ✅ **Encryption at rest** for databases containing sensitive data
- ✅ **Encrypted backups**
- ✅ **API key encryption** in environment variables

#### C. Logging and Monitoring
- ✅ **Audit logs** for all database access (who, what, when)
- ✅ **Login/logout tracking**
- ✅ **Data modification logs** (changes to student records)
- ✅ **Log retention** for at least 6 months
- ✅ **Real-time monitoring** for suspicious activity
- ✅ **Alert system** for security incidents

#### D. Backup and Recovery
- ✅ **Regular backups** (daily minimum for critical data)
- ✅ **Encrypted backup storage**
- ✅ **Tested recovery procedures** (quarterly)
- ✅ **Backup retention policy** (at least 30 days)
- ✅ **Off-site backup** storage

#### E. Network Security
- ✅ **Firewall** protection
- ✅ **Intrusion Detection System** (IDS) or monitoring
- ✅ **DDoS protection**
- ✅ **Regular security patches** and updates
- ✅ **Vulnerability scanning** (quarterly)

### 3. **Audit Requirements**

#### External Security Audit
- ✅ Conduct **external security audit** every **2 years** (minimum)
- ✅ Use qualified security professional/firm
- ✅ Document findings and remediation actions
- ✅ Report to management and security committee

#### Internal Reviews
- ✅ **Quarterly** internal security reviews
- ✅ Access control reviews
- ✅ Log analysis
- ✅ Policy compliance checks

### 4. **Third-Party Security**

#### Vendor Management
- ✅ **Data Processing Agreements** (DPA) with all vendors
- ✅ Security requirements for OpenAI, Google Sheets, hosting providers
- ✅ Vendor security assessments
- ✅ Contractual data protection obligations

---

## 📚 Ministry of Education Specific Requirements

### 1. **Student Privacy Protection**
- ✅ Minimize data collection (only necessary information)
- ✅ **Data minimization principle** - don't collect excessive data
- ✅ Clear retention periods (delete data when no longer needed)
- ✅ **Anonymization** for analytics when possible

### 2. **Parental Rights**
- ✅ Parents can access their child's data
- ✅ Parents can request corrections or deletions
- ✅ **Transparent communication** about data usage
- ✅ Parental consent for data processing

### 3. **Educational Use Only**
- ✅ Data used **only** for educational purposes
- ✅ No commercial use or advertising
- ✅ No selling student data to third parties
- ✅ No profiling for non-educational purposes

### 4. **Staff Training**
- ✅ **Annual training** for all teachers/staff on data protection
- ✅ Security awareness training
- ✅ Incident reporting procedures
- ✅ Confidentiality agreements

---

## 🎯 Compliance Checklist for Your Platform

### Immediate Actions (Before Launch)

#### Legal & Policy
- [ ] Draft comprehensive **Privacy Policy** in Hebrew
- [ ] Create **Terms of Service** for schools
- [ ] Prepare **Parental Consent Forms**
- [ ] Establish **Data Processing Agreements** (DPAs) for third parties
- [ ] Appoint **Information Security Manager**
- [ ] Consider appointing or consulting with a **Data Protection Officer**

#### Technical Security
- [ ] Implement **HTTPS/TLS** across entire platform
- [ ] Add **multi-factor authentication** (MFA) for admin panel
- [ ] Implement **comprehensive audit logging**
- [ ] Enable **encryption at rest** for database
- [ ] Set up **automated backups** with encryption
- [ ] Implement **session management** with timeout
- [ ] Add **password complexity** requirements
- [ ] Implement **rate limiting** on API endpoints
- [ ] Add **CSRF protection**
- [ ] Implement **input validation** and sanitization

#### Operational
- [ ] Create **Security Procedure Document** (תסדיר אבטחה)
- [ ] Establish **Incident Response Plan**
- [ ] Set up **security monitoring** and alerts
- [ ] Create **backup and recovery procedures**
- [ ] Document **data retention policies**
- [ ] Prepare **breach notification templates**

### Within 6 Months

- [ ] Conduct **security awareness training** for users
- [ ] Perform **vulnerability assessment**
- [ ] Review and update security policies
- [ ] Conduct **internal security audit**
- [ ] Test **disaster recovery procedures**
- [ ] Review **access control** lists

### Annual Requirements

- [ ] Hold **Security Committee meeting** (minimum annually)
- [ ] Conduct **security awareness training**
- [ ] Review and update **Security Procedure Document**
- [ ] Review **third-party security** compliance
- [ ] Update **risk assessments**

### Every 2 Years

- [ ] Conduct **external security audit** by qualified professional
- [ ] Review and update **Data Processing Agreements**
- [ ] Comprehensive **security policy review**

---

## 🚨 Penalties for Non-Compliance

### Amendment 13 Penalties (After August 2025)

#### Administrative Fines:
- **Minor violations**: Up to NIS 100,000
- **Moderate violations**: Up to NIS 250,000
- **Severe violations**: Up to NIS 500,000 or 2% of annual turnover

#### Data Security Violations:
- **Basic level**: NIS 20,000-80,000
- **Medium level**: NIS 20,000-80,000 (organizations), NIS 40,000-160,000 (higher)
- **High level**: NIS 40,000-160,000

#### Criminal Penalties:
- **Intentional violations**: Up to 3 years imprisonment
- **Unauthorized access**: Up to 5 years imprisonment

---

## 🔗 Key Regulations & Resources

### Primary Laws
1. **Privacy Protection Law, 1981** (as amended by Amendment 13, 2024)
2. **Privacy Protection (Data Security) Regulations, 2017**
3. **Youth Law (Trial, Punishment and Treatment), 1971**

### Government Resources
- **Israel Privacy Protection Authority (PPA)**: https://www.gov.il/he/departments/the_privacy_protection_authority
- **Ministry of Education**: https://www.gov.il/he/departments/ministry_of_education
- **Cyber Directorate**: https://www.gov.il/he/departments/israel_national_cyber_directorate

### Professional Standards
- **ISO/IEC 27001** - Information Security Management
- **ISO/IEC 27701** - Privacy Information Management
- **ISA/IEC 62443** - Security for Educational Systems

---

## 📞 Recommended Actions for Schools

### Before Purchasing/Implementing:

1. **Conduct Data Protection Impact Assessment (DPIA)**
2. **Review vendor security certifications**
3. **Sign Data Processing Agreement (DPA)**
4. **Obtain parental consent** for data processing
5. **Train staff** on platform usage and data protection
6. **Establish data breach response procedures**

### Questions Schools Should Ask Vendors:

1. What security level does your platform meet? (Basic/Medium/High)
2. Do you have ISO 27001 certification?
3. Where is data stored? (Israel/EU/US)
4. How is data encrypted?
5. What backup procedures exist?
6. How long is data retained?
7. Can parents access and delete their child's data?
8. Have you conducted security audits?
9. Do you have cyber insurance?
10. What is your incident response time?

---

## 📋 Summary: Your Platform Must Have

### For Medium Security Level Compliance:

✅ **Technical Controls:**
- HTTPS/TLS encryption
- Strong authentication + MFA for admins
- Comprehensive audit logging
- Encrypted backups
- Role-based access control
- Session management
- Vulnerability management

✅ **Organizational Controls:**
- Information Security Manager
- Security Procedure Document
- Annual security meetings
- Employee training program
- Incident response procedures
- Data Processing Agreements

✅ **Operational Controls:**
- External audit every 2 years
- Regular backups and tested recovery
- Access control reviews
- Security monitoring and alerts
- Vendor security management

✅ **Legal Compliance:**
- Privacy Policy (Hebrew)
- Parental consent mechanisms
- Data subject rights implementation
- Breach notification procedures
- Data retention policies

---

**For detailed implementation guidance, consult with:**
- Israeli Privacy Protection Authority
- Certified Information Security Professional
- Legal counsel specializing in education law
- Data Protection Officer (DPO)

---

**Document Version**: 1.0
**Effective Date**: October 14, 2025
**Next Review**: October 14, 2026
