# Uptime Monitoring Setup Guide

This guide explains how to set up uptime monitoring for ISHEBOT.

## Health Check Endpoint

ISHEBOT includes a built-in health check endpoint at:

```
https://your-domain.com/health
```

### Response Format

**Human-Readable (default):**
```
Status: Healthy
Services:
  ✅ Firebase/Firestore (operational) - 75ms
  ✅ API Backend (operational) - 82ms
```

**JSON (for monitoring tools):**
```
https://your-domain.com/health?format=json
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-02T10:30:00.000Z",
  "uptime": 15234,
  "services": [
    {
      "name": "Firebase/Firestore",
      "status": "operational",
      "latency": 75
    },
    {
      "name": "API Backend",
      "status": "operational",
      "latency": 82
    }
  ]
}
```

---

## Free Uptime Monitoring Services

### 1. UptimeRobot (Recommended)

**Free Tier:**
- 50 monitors
- 5-minute intervals
- Email alerts
- No credit card required

**Setup:**

1. Go to https://uptimerobot.com
2. Sign up for free account
3. Click "Add New Monitor"
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-domain.com/health?format=json`
   - **Monitor Interval**: 5 minutes
   - **Keyword**: `"status":"healthy"` (optional - checks for healthy status)
5. Set up alert contacts (email, Slack, etc.)
6. Click "Create Monitor"

**Slack Integration:**
1. In UptimeRobot, go to "My Settings" → "Alert Contacts"
2. Click "Add New" → "Slack"
3. Follow instructions to connect to your Slack workspace
4. Add the Slack contact to your monitor

---

### 2. Pingdom (Free Tier)

**Free Tier:**
- 10 monitors
- 1-minute intervals
- Email alerts
- 30-day history

**Setup:**

1. Go to https://www.pingdom.com
2. Sign up for free
3. Click "Add New Uptime Monitor"
4. Configure:
   - **URL**: `https://your-domain.com/health`
   - **Check Interval**: 1 minute
   - **Regions**: Select closest region
5. Set up alerts
6. Click "Create Monitor"

---

### 3. Better Uptime (Open Source Alternative)

**Features:**
- Free forever (self-hosted option)
- 10 monitors on hosted tier
- Status page included
- Multiple alert channels

**Setup:**

1. Go to https://betteruptime.com
2. Sign up for free
3. Click "Monitors" → "Add Monitor"
4. Configure:
   - **Monitor Type**: HTTP
   - **URL**: `https://your-domain.com/health`
   - **Check Interval**: 30 seconds (free tier)
   - **Regions**: Auto
5. Configure alerts (email, SMS, Slack, Discord)
6. Click "Create"

---

## Setting Up Status Page (Optional)

### Using Better Uptime (Recommended)

Better Uptime includes a free public status page:

1. Go to "Status Pages" → "Create Status Page"
2. Customize:
   - Brand name: ISHEBOT
   - Logo: Upload your logo
   - Domain: `status.your-domain.com` (custom domain)
3. Add your monitors to the page
4. Publish

### Using Notion (Free Alternative)

1. Create a Notion page
2. Add a table with:
   - Service name
   - Status (Operational/Degraded/Down)
   - Last updated
3. Embed on your site or share publicly

---

## Alert Configuration

### Recommended Alerts

| Alert Type | Trigger | Recipients |
|------------|---------|------------|
| **Down** | 2 consecutive failures | Primary email, Slack |
| **Slow Response** | Response time > 3 seconds | Slack only |
| **Recovered** | Service back up | Email, Slack |

### Slack Alert Setup (UptimeRobot)

1. Create a Slack channel: `#site-status`
2. In Slack: Apps → Incoming Webhooks → "Add to Slack"
3. Copy the webhook URL
4. In UptimeRobot: My Settings → Alert Contacts → Add → Slack
5. Paste webhook URL
6. Add to your monitor

---

## Advanced: Kubernetes/Helm Monitoring

If using Kubernetes, use these probes:

```yaml
livenessProbe:
  httpGet:
    path: /health?format=json
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health?format=json
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Custom Monitoring (DIY)

### Simple Bash Script

```bash
#!/bin/bash
# health-check.sh - Run every 5 minutes via cron

HEALTH_URL="https://your-domain.com/health?format=json"
EXPECTED_STATUS='"status":"healthy"'

response=$(curl -s $HEALTH_URL)

if [[ $response == *"$EXPECTED_STATUS"* ]]; then
  echo "✅ System healthy"
else
  echo "❌ System down!"
  # Send alert (email, Slack, etc.)
  curl -X POST "$SLACK_WEBHOOK" -d '{"text":"ISHEBOT is DOWN!"}'
fi
```

### Cron Job Setup

```bash
# Edit crontab
crontab -e

# Add: Check every 5 minutes
*/5 * * * * /path/to/health-check.sh
```

---

## Testing Your Health Check

Before setting up monitoring, test the endpoint:

```bash
# Test human-readable version
curl https://your-domain.com/health

# Test JSON version
curl https://your-domain.com/health?format=json

# Check HTTP status code (should be 200)
curl -I https://your-domain.com/health
```

---

## Monitoring Checklist

Before going live:

- [ ] Health check endpoint is accessible
- [ ] JSON format returns valid JSON
- [ ] Set up at least one monitoring service
- [ ] Configure email alerts
- [ ] Configure Slack/Discord alerts (optional)
- [ ] Create status page (optional)
- [ ] Test alert system by temporarily stopping service
- [ ] Document incident response procedure

---

## Incident Response

When an alert triggers:

1. **Verify the issue**
   - Check health endpoint manually
   - Visit the site
   - Check hosting dashboard

2. **Identify the cause**
   - Check error logs (Sentry)
   - Check hosting status (Vercel/Firebase)
   - Check recent deployments

3. **Fix the issue**
   - Rollback recent changes if needed
   - Fix the bug
   - Deploy hotfix

4. **Communicate**
   - Update status page
   - Notify stakeholders
   - Document incident

5. **Post-incident review**
   - Write up what happened
   - Identify how to prevent recurrence
   - Update monitoring if needed

---

## Related Files

- **Health Check Page**: `src/pages/HealthCheckPage.tsx`
- **Route Config**: `src/App.tsx`
- **Sentry Error Tracking**: `src/monitoring/sentry.ts`
