# 🔒 SECURITY POLICY

## 🎯 Overview
ISHEBOT is a commercial educational software product that handles sensitive student data. Security is our top priority.

## ⚠️ NEVER COMMIT TO REPOSITORY

The following items must NEVER be committed to version control:

### 🔴 Critical - Never Commit:
- Real API keys (OpenAI, Google, etc.)
- Database credentials
- Production `.env` files
- Private keys (`.pem`, `.key`, `.p12`)
- Authentication tokens
- SSL certificates

### 🟠 Sensitive Data - Never Commit:
- Student names, IDs, grades, or personal information
- School contact information
- Customer lists or contracts
- Real ISHEBOT analysis results
- Actual usage data or analytics

### 🟡 Business Information - Never Commit:
- Pricing strategies or license keys
- Sales documents or proposals
- Client communications
- Internal business processes
- Financial information

## ✅ Safe to Commit

- Source code (UI, logic, algorithms)
- Configuration templates (`.env.example`)
- Documentation
- Build scripts
- Tests (without real data)

## 🛡️ Data Protection Compliance

ISHEBOT complies with:
- ✅ Israeli Privacy Protection Law, 5741-1981
- ✅ Amendment 13 (Privacy Protection Regulations)
- ✅ Israeli Ministry of Education requirements
- ✅ GDPR (where applicable)

## 🔐 Best Practices

### For Developers:
1. **Always** use `.env` files for secrets (never commit them)
2. **Always** check `.gitignore` before committing
3. **Never** hardcode API keys in source code
4. **Always** use environment variables
5. **Never** commit real student or school data

### For Deployment:
1. Use secure environment variable management
2. Rotate API keys regularly
3. Use HTTPS only
4. Implement proper access controls
5. Monitor for unauthorized access

## 🚨 Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public GitHub issue
2. Email: [YOUR_SECURITY_EMAIL]
3. Include detailed description
4. We will respond within 48 hours

## 📞 Contact

For security concerns or questions:
- Email: [YOUR_SECURITY_EMAIL]
- Emergency: [YOUR_EMERGENCY_CONTACT]

---

**Remember**: When in doubt, DON'T commit it. Ask first.

Last Updated: October 2025
