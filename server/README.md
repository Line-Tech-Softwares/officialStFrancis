# Apple Pay Backend Server Setup Guide

**St. Francis of Assisi Church - Online Giving**

---

## 📋 Overview

This is a production-ready Node.js/Express backend that handles Apple Pay merchant validation and payment processing. It works in conjunction with the front-end JavaScript implementation to provide complete Apple Pay support on the church donation website.

**Key Features:**
- ✅ Merchant validation with Apple's servers
- ✅ Secure payment token handling
- ✅ Integration with payment processors (Stripe, Square, PayPal)
- ✅ Rate limiting and security middleware
- ✅ Error logging and monitoring
- ✅ HTTPS-only (TLS 1.2+)
- ✅ Production-ready code

---

## 🚀 Prerequisites

### Required Software
```bash
# Node.js 14+ (LTS recommended)
node --version  # Should be v14.x or higher

# npm 6+ (comes with Node.js)
npm --version

# OpenSSL (for certificate management)
openssl version
```

### Accounts & Credentials

- [ ] **Apple Developer Account** (for Apple Pay)
- [ ] **Payment Processor Account** (Stripe, Square, or PayPal)
- [ ] **Web Server** (Apache/Nginx with HTTPS)
- [ ] **Domain** (with valid SSL certificate)

### Certificates (from Apple Developer Portal)

1. **Merchant Certificate**
   - `merchant-certificate.pem` (signed by Apple)
   - `merchant-key.pem` (your private key)

2. **Server SSL Certificate**
   - `server-cert.pem` (domain certificate)
   - `server-key.pem` (private key)

---

## 📦 Installation

### Step 1: Clone or Download Files

```bash
# Clone the church repository
git clone https://github.com/Line-Tech-Softwares/officialStFrancis.git
cd officialStFrancis/server
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Verify installation
npm ls
```

Required packages:
- **express** - Web framework
- **body-parser** - JSON parsing
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security headers
- **dotenv** - Environment variables
- **stripe** (optional) - Stripe payments

### Step 3: Setup Certificates Directory

```bash
# Create certificates directory
mkdir -p certs
chmod 700 certs

# Copy your certificates here
cp /path/to/merchant-certificate.pem certs/
cp /path/to/merchant-key.pem certs/
cp /path/to/server-cert.pem certs/
cp /path/to/server-key.pem certs/

# Verify permissions (should be 600)
chmod 600 certs/*
ls -la certs/
```

### Step 4: Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env
```

Update these critical values:
```bash
APPLE_MERCHANT_ID=merchant.com.sfmamelodwest.giving
SANDBOX_MODE=false
ALLOWED_DOMAINS=sfmamelodwest.co.za,www.sfmamelodwest.co.za
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Required Variables
NODE_ENV=production
PORT=3000
APPLE_MERCHANT_ID=merchant.com.sfmamelodwest.giving
SANDBOX_MODE=false

# Certificate Paths
APPLE_PAY_CERT_PATH=/opt/app/certs/merchant-certificate.pem
APPLE_PAY_KEY_PATH=/opt/app/certs/merchant-key.pem
SERVER_KEY_PATH=/opt/app/certs/server-key.pem
SERVER_CERT_PATH=/opt/app/certs/server-cert.pem

# Security
ALLOWED_DOMAINS=sfmamelodwest.co.za,www.sfmamelodwest.co.za

# Payment Processor (Stripe example)
STRIPE_SECRET_KEY=sk_live_xxxxx

# Logging
LOG_LEVEL=info
```

### Payment Processor Integration

#### Option A: Stripe

1. **Get API Keys**
   - Visit: https://dashboard.stripe.com/apikeys
   - Copy Secret Key (starts with `sk_live_`)

2. **Update .env**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```

3. **Backend handles payment**
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   // See apple-pay-backend.js for full implementation
   ```

#### Option B: Square

1. **Get Access Token**
   - Visit: https://developer.squareup.com/apps
   - Copy Production Access Token

2. **Update .env**
   ```bash
   SQUARE_ACCESS_TOKEN=sq_live_xxxxx
   ```

#### Option C: PayPal

1. **Get Credentials**
   - Visit: https://developer.paypal.com
   - Copy Client ID and Secret

2. **Update .env**
   ```bash
   PAYPAL_CLIENT_ID=xxxxx
   PAYPAL_SECRET=xxxxx
   ```

---

## 🧪 Testing

### 1. Local Development

```bash
# Start server in development mode
NODE_ENV=development npm start

# In another terminal, test the health endpoint
curl https://localhost:3000/api/health

# Expected response:
# {"status":"healthy",...}
```

### 2. Test Sandbox Mode

```bash
# Enable sandbox in .env
SANDBOX_MODE=true

# Use Apple's test cards
# Visa: 4111111111111111
# Mastercard: 5555555555554444
```

### 3. Test Payment Flow

```bash
# Merchant validation test
curl -X POST https://localhost:3000/api/apple-pay/validate-merchant \
  -H "Content-Type: application/json" \
  -d '{
    "validationURL": "https://apple-pay-gateway.apple.com/...",
    "domainName": "sfmamelodwest.co.za",
    "displayName": "St. Francis Church"
  }'
```

### 4. API Health Check

```bash
# Health status
curl https://localhost:3000/api/health

# Detailed status
curl https://localhost:3000/api/status
```

---

## 🌐 Deployment

### Option 1: Heroku (Easiest)

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create your-church-app

# Set environment variables
heroku config:set APPLE_MERCHANT_ID=merchant.com.sfmamelodwest.giving
heroku config:set SANDBOX_MODE=false
heroku config:set STRIPE_SECRET_KEY=sk_live_xxxxx

# Add certificate files
# (Add to repository or use Heroku's config vars)

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Railway (Better Free Tier)

1. Visit: https://railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Option 3: Render

1. Visit: https://render.com
2. Create "New Web Service"
3. Connect GitHub
4. Configure environment
5. Deploy

### Option 4: AWS EC2 (Full Control)

```bash
# Connect to server
ssh ubuntu@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/Line-Tech-Softwares/officialStFrancis.git
cd officialStFrancis/server

# Install dependencies
npm install

# Create .env file
sudo nano .env

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start apple-pay-backend.js --name "apple-pay"

# Enable auto-restart
pm2 startup
pm2 save
```

### Option 5: DigitalOcean App Platform

```bash
# Deploy using doctl CLI
doctl apps create-from-spec spec.yaml

# Or use the web dashboard
# https://cloud.digitalocean.com/apps
```

---

## 🔒 Security Hardening

### 1. Update Security Headers

The server includes helmet.js for automatic security headers. Verify they're set:

```bash
curl -I https://your-server.com/api/health
```

Look for headers:
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`

### 2. Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 80/tcp   # HTTP (redirect only)
sudo ufw allow 22/tcp   # SSH
sudo ufw enable

# Don't expose port 3000 to the internet!
# Use Nginx reverse proxy instead
```

### 3. SSL/TLS Configuration

```bash
# Test TLS configuration
openssl s_client -connect your-server.com:443 -tls1_2

# Verify cipher strength
echo "Q" | openssl s_client -cipher HIGH -connect your-server.com:443
```

### 4. Secrets Management

```bash
# Never commit .env file
echo ".env" >> .gitignore

# Rotate keys regularly
# Use environment-specific values

# In production, use managed secrets:
# - AWS Secrets Manager
# - Heroku Config Vars
# - Railway Environment Variables
```

---

## 📊 Monitoring

### Application Monitoring

```bash
# View logs with PM2
pm2 logs apple-pay

# Monitor resources
pm2 monit

# Setup remote logging (Sentry example)
npm install @sentry/node
```

Add to apple-pay-backend.js:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Health Check Endpoint

```bash
# Check application health
curl https://your-server.com/api/apple-pay/health

# Response example:
{
  "status": "healthy",
  "timestamp": "2026-04-15T10:30:00Z",
  "applePay": {
    "certificateLoaded": true,
    "gatewayConfigured": true
  }
}
```

### Payment Monitoring

1. **Stripe Dashboard**
   - https://dashboard.stripe.com/payments
   - View all donations
   - Monitor failed payments

2. **Process Logs**
   ```bash
   tail -f logs/payment.log
   ```

3. **Database Queries**
   ```javascript
   // Log every transaction
   console.log(`Payment: ${amount} ${currency} - ${transactionId}`);
   ```

---

## 🐛 Troubleshooting

### Issue: "Certificate not found"

**Problem:**
```
Error: Merchant certificate not found: ./certs/merchant-certificate.pem
```

**Solution:**
```bash
# Check certificate path
ls -la certs/

# Update .env if path is different
APPLE_PAY_CERT_PATH=/correct/path/to/cert.pem
```

### Issue: "Invalid merchant validation"

**Problem:**
```json
{"error": "Device does not support Apple Pay"}
```

**Solution:**
- Test on Safari (iOS/macOS only)
- Verify merchant domain in Apple Developer Portal
- Check domainName matches certificate

### Issue: "CORS error"

**Problem:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Verify ALLOWED_DOMAINS in .env
ALLOWED_DOMAINS=sfmamelodwest.co.za,www.sfmamelodwest.co.za

# Restart server
pm2 restart apple-pay
```

### Issue: "Timeout during payment"

**Problem:**
```
Request to Apple timed out
```

**Solution:**
```bash
# Check network connectivity
ping apple-pay-gateway.apple.com

# Increase timeout in apple-pay-backend.js
requestTimeout: 10000 // 10 seconds
```

### Issue: "TLS error"

**Problem:**
```
Error: EPROTO: protocol error, ssl handshake failure
```

**Solution:**
```bash
# Verify TLS version
openssl s_client -tls1_2 -connect localhost:3000

# Check certificate validity
openssl x509 -in certs/server-cert.pem -text -noout
```

---

## 📚 API Reference

### POST /api/apple-pay/validate-merchant

**Request:**
```json
{
  "validationURL": "https://apple-pay-gateway.apple.com/...",
  "domainName": "sfmamelodwest.co.za",
  "displayName": "St. Francis Church"
}
```

**Response (Success):**
```json
{
  "epochTimestamp": 1650000000,
  "expiresAt": 1650003600,
  "merchantSessionIdentifier": "...",
  "nonce": "...",
  "signature": "..."
}
```

**Response (Error):**
```json
{
  "error": "Merchant validation failed",
  "message": "Detail..."
}
```

### POST /api/apple-pay/process-payment

**Request:**
```json
{
  "paymentToken": {"...": "..."},
  "billingContact": {
    "givenName": "John",
    "familyName": "Doe",
    "emailAddress": "john@example.com",
    "phoneNumber": "+27814421719"
  },
  "amount": "100.00",
  "currency": "ZAR"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "TXN_1234567890",
  "amount": 100.00,
  "currency": "ZAR"
}
```

### GET /api/health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-15T10:30:00Z",
  "applePay": {
    "certificateLoaded": true,
    "gatewayConfigured": true
  }
}
```

---

## 📞 Support & Contact

For issues or questions:
- **Email**: info@sfmamelodwest.co.za
- **Phone**: +27 81 442 1719
- **Website**: https://sfmamelodwest.co.za

---

## 📄 License

This project is part of the St. Francis of Assisi Church Website and is proprietary. All rights reserved.

---

**Created**: April 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
