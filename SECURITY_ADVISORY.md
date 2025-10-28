# Security Advisory

## Known Vulnerabilities

### 1. xlsx Library - High Severity ⚠️

**Package**: `xlsx` (all versions)
**Severity**: High
**Status**: No fix available
**Issue**: [GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9]

#### Vulnerability Details
- **Prototype Pollution**: The SheetJS library is vulnerable to prototype pollution attacks
- **Regular Expression Denial of Service (ReDoS)**: Vulnerable to ReDoS attacks through specific input patterns

#### Impact
- Potential for malicious file uploads to pollute object prototypes
- DoS attacks through crafted Excel files
- Could affect application stability and security

#### Current Mitigation
Currently, the application uses `xlsx` for:
- Exporting analytics data to Excel format
- Importing student data from Excel files

#### Recommended Actions

**Short-term** (Implemented):
1. ✅ File size limits enforced (10MB max)
2. ✅ Input validation on all uploaded files
3. ✅ Sandboxed file processing
4. ✅ Content Security Policy (CSP) headers

**Long-term** (Recommended):
Consider replacing `xlsx` with one of these alternatives:

1. **exceljs** (Recommended)
   ```bash
   npm install exceljs
   npm uninstall xlsx
   ```
   - Actively maintained
   - No known security vulnerabilities
   - Better TypeScript support
   - More features

2. **SheetJS Community Edition** (if staying with xlsx)
   - Watch for security updates
   - Consider implementing additional validation layers

3. **Server-side processing**
   - Move Excel processing to backend
   - Use Python (openpyxl) or Node.js server
   - Reduces client-side attack surface

#### Migration Guide (exceljs)

**Before (xlsx)**:
```typescript
import * as XLSX from 'xlsx';

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, 'export.xlsx');
```

**After (exceljs)**:
```typescript
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Sheet1');
worksheet.columns = [...]; // Define columns
worksheet.addRows(data);
await workbook.xlsx.writeBuffer();
```

## Resolved Vulnerabilities

### 1. Vite - Moderate Severity ✅

**Package**: `vite@7.1.0-7.1.10`
**Status**: ✅ **FIXED** (Updated to 7.1.11+)
**Issue**: Server.fs.deny bypass via backslash on Windows
**Resolution**: Updated via `npm audit fix`

## Security Best Practices Implemented

### 1. Input Sanitization
- All user inputs are sanitized
- SQL injection prevention
- XSS prevention through React's built-in escaping
- Path traversal prevention

### 2. Content Security Policy
- Strict CSP headers configured
- Inline script restrictions
- External resource whitelist

### 3. API Security
- Rate limiting implemented
- Request timeout configuration
- Error message sanitization (no internal details exposed)
- IP address and file path redaction in logs

### 4. Development vs Production
- Console statements only in development
- Debug logs disabled in production
- Source maps excluded from production builds

### 5. Dependency Management
- Regular security audits (`npm audit`)
- Automated vulnerability scanning
- Lock file integrity checks

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: [Your Security Email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Update Schedule

- **Critical**: Immediate patch within 24 hours
- **High**: Patch within 7 days
- **Moderate**: Patch within 30 days
- **Low**: Addressed in next regular release

---

**Last Updated**: 2025-10-25
**Next Review**: 2025-11-25
