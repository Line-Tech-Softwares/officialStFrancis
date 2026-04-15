# Apple Pay Production Deployment Checklist

**St. Francis of Assisi Church - Online Giving**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Apple Developer Account & Certificates

- [ ] **Apple Developer Account Created**
  - URL: https://developer.apple.com
  - Program: Individual or Organization
  - Must have valid business/organization details

- [ ] **Merchant ID Created**
  - Merchant ID format: `merchant.com.sfmamelodwest.giving`
  - Status: Active
  - Associated with Organizer Account

- [ ] **Certificate Signing Request (CSR) Generated**
  ```bash
  openssl req -new -newkey rsa:2048 -nodes \
    -keyout merchant-key.pem \
    -out merchant.csr \
    -subj "/CN=sfmamelodwest.co.za/O=St. Francis of Assisi/C=ZA"
  ```
  - [ ] CSR downloaded and backed up
  - [ ] Private key (merchant-key.pem) secured

- [ ] **Merchant Certificate Signed by Apple**
  - [ ] Upload CSR to Apple Developer Portal
  - [ ] Download signed certificate (merchant-certificate.pem)
  - [ ] Certificate validity verified (should be 365 days)
  - [ ] Downloaded certificates backed up securely

- [ ] **Server SSL Certificates**
  - [ ] HTTPS certificate obtained (Let's Encrypt recommended)
  - [ ] Server key (server-key.pem) secured
  - [ ] Server certificate (server-cert.pem) obtained
  - [ ] Certificates valid for yourdomain.com

---

### 2. Domain Configuration

- [ ] **Primary Domain Setup**
  - Domain: sfmamelodwest.co.za (or actual domain)
  - HTTPS enabled: ✓
  - TLS 1.2+: ✓ (enforced in Apache/Nginx)
  - SNI Support: ✓ (required for Apple Pay)

- [ ] **DNS Configuration**
  - [ ] A record points to server IP
  - [ ] CNAME records set up (if needed)
  - [ ] MX records configured (for email)
  - [ ] DNS propagation verified

- [ ] **HTTPS Certificate Validation**
  - [ ] Certificate matches domain
  - [ ] Chain of trust complete
  - [ ] Auto-renewal configured (if Let's Encrypt)

---

### 3. Server Configuration

#### TLS / SSL Settings

- [ ] **TLS Version**
  - [ ] TLS 1.2 enabled
  - [ ] TLS 1.3 enabled (optional, recommended)
  - [ ] TLS 1.0 / 1.1 disabled
  - Verify: `openssl s_client -connect yourdomain.com:443`

- [ ] **Cipher Suites (Recommended for Apple Pay)**
  ```
  ECDHE-RSA-AES256-GCM-SHA384
  ECDHE-RSA-AES128-GCM-SHA256
  ECDHE-RSA-CHACHA20-POLY1305
  ```

- [ ] **HTTP/2 Enabled** (improves performance)

- [ ] **HSTS Header Configured**
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

#### Firewall Rules

- [ ] **Inbound Rules**
  - Port 443 (HTTPS) opened globally
  - Port 80 (HTTP) opened (redirects to HTTPS)
  - Port 3000 (Node.js backend) NOT exposed to internet

- [ ] **Outbound Rules**
  - Allow HTTPS to Apple Pay gateway
  - HTTPS to `apple-pay-gateway.apple.com`
  - HTTPS to `apple-pay-gateway-cn.apple.com` (China)
  - Allow to payment processor (Stripe, Square, etc.)

- [ ] **IP Whitelist for Apple's Servers** (Optional, for extra security)
  ```
  Allow outbound to: 17.248.0.0/13
  Allow outbound to: 17.142.0.0/15
  Allow outbound to: 217.180.192.0/21
  ```

---

### 4. Application Files

- [ ] **Front-End Files**
  - [ ] `/js/apple-pay.js` deployed
  - [ ] `/css/apple-pay.css` deployed
  - [ ] Donation form updated with Apple Pay button
  - [ ] Pledge form updated with Apple Pay button

- [ ] **Environment Configuration**
  - [ ] `js/config.js` created (for debug mode)
  - [ ] Debug scripts disabled in production
  - [ ] No console.log in production
  - [ ] API endpoints configured correctly

- [ ] **Backend Server**
  - [ ] `/server/apple-pay-backend.js` deployed
  - [ ] Node.js and dependencies installed
  - [ ] Environment variables configured
  - [ ] Certificates placed in `/server/certs/`

---

### 5. Environment Variables

Create `.env` file on server:

```bash
# Apple Pay Configuration
NODE_ENV=production
APPLE_MERCHANT_ID=merchant.com.sfmamelodwest.giving
APPLE_PAY_CERT_PATH=/opt/app/certs/merchant-certificate.pem
APPLE_PAY_KEY_PATH=/opt/app/certs/merchant-key.pem
SANDBOX_MODE=false

# Server SSL
SERVER_KEY_PATH=/opt/app/certs/server-key.pem
SERVER_CERT_PATH=/opt/app/certs/server-cert.pem

# Server Settings
PORT=3000
ALLOWED_DOMAINS=sfmamelodwest.co.za,www.sfmamelodwest.co.za

# Payment Processor (Stripe example)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Payment Processor (Square example)
SQUARE_ACCESS_TOKEN=sq_live_xxxxx

# Logging
LOG_LEVEL=info
```

- [ ] .env file created with all values
- [ ] .env file has correct permissions (600)
- [ ] .env file NOT committed to git

---

## 🔐 SECURITY CHECKLIST

### Network Security

- [ ] **Firewall Configured**
  - [ ] Inbound port 443 open
  - [ ] Inbound port 80 open (redirect only)
  - [ ] Inbound ports 3000+ closed
  - [ ] SSH (port 22) restricted to admin IPs

- [ ] **DDoS Protection**
  - [ ] Cloudflare or similar enabled (optional)
  - [ ] Rate limiting configured
  - [ ] WAF rules applied

### Application Security

- [ ] **HTTPS Everywhere**
  - [ ] HTTP → HTTPS redirect configured
  - [ ] HSTS header set
  - [ ] Secure cookies enabled

- [ ] **CSP Headers**
  ```
  Content-Security-Policy: 
    script-src 'self' https://applepay.cdn-apple.com;
    style-src 'self';
    frame-src 'self'
  ```

- [ ] **CORS Properly Configured**
  - [ ] Only specified domains allowed
  - [ ] No `*` wildcard
  - [ ] Credentials handling correct

- [ ] **Input Validation**
  - [ ] All amounts validated server-side
  - [ ] No negative amounts accepted
  - [ ] Maximum amounts enforced

- [ ] **Error Handling**
  - [ ] No sensitive data in error messages
  - [ ] Stack traces hidden in production
  - [ ] Logging doesn't expose tokens

### Certificate Management

- [ ] **Certificate Security**
  - [ ] Private keys NOT in version control
  - [ ] Certificates backed up securely
  - [ ] Permissions: 600 on key files
  - [ ] Owner: application user (not root)

- [ ] **Certificate Renewal**
  - [ ] Auto-renewal configured (Let's Encrypt)
  - [ ] Reminder set for manual certificates
  - [ ] Monitoring for expiration warnings

### Data Protection

- [ ] **Payment Data**
  - [ ] Apple Pay tokens NEVER stored
  - [ ] Amount encrypted in transit
  - [ ] Billing contact encrypted
  - [ ] PCI compliance (if applicable)

- [ ] **Logging**
  - [ ] Payment tokens NOT logged
  - [ ] Sensitive data NOT logged
  - [ ] Logs stored securely
  - [ ] Logs retained per privacy policy

---

## 🧪 TESTING CHECKLIST

### Sandbox Testing (Before Production)

- [ ] **Test Environment Setup**
  - [ ] Sandbox gateway configured
  - [ ] Test merchant account created
  - [ ] Test certificates installed

- [ ] **Functional Testing**
  - [ ] Apple Pay button appears on iOS/macOS Safari
  - [ ] Apple Pay button hidden on unsupported devices
  - [ ] Click button → Apple Pay sheet displays
  - [ ] Test payment processing works
  - [ ] Success message displays correctly

- [ ] **Test Scenarios**
  - [ ] Successful payment (test card)
  - [ ] Invalid card declined
  - [ ] Expired card declined
  - [ ] User cancels payment midway
  - [ ] Network timeout handled
  - [ ] Invalid amount rejected

- [ ] **Test Cards** (Apple Sandbox)
  - Visa: `4111111111111111` (valid)
  - Visa: `4000000000000002` (declined)
  - Mastercard: `5555555555554444` (valid)
  - Amex: `378282246310005` (valid)

### Production Testing (After Deployment)

- [ ] **Pre-Launch Testing**
  - [ ] Production gateway working
  - [ ] Real payment processing works
  - [ ] Success/failure messages correct
  - [ ] Email confirmations sent
  - [ ] Database transactions recorded

- [ ] **Cross-Device Testing**
  - [ ] iOS Safari: 15.0+ ✓
  - [ ] iPadOS Safari: 15.0+ ✓
  - [ ] macOS Safari: 14.0+ ✓
  - [ ] Android (no Apple Pay) - button hidden ✓

- [ ] **Performance Testing**
  - [ ] Merchant validation: < 2 seconds
  - [ ] Payment processing: < 5 seconds
  - [ ] No page slowdown

---

## 📊 MONITORING & LOGGING

### Server Monitoring

- [ ] **Uptime Monitoring**
  - [ ] Health check configured: `GET /api/health`
  - [ ] Monitoring service set up (UptimeRobot, etc.)
  - [ ] Alerts configured for downtime

- [ ] **Error Tracking**
  - [ ] Error logging enabled
  - [ ] Error alerts set up
  - [ ] Error logs reviewed daily

- [ ] **Performance Monitoring**
  - [ ] Response times monitored
  - [ ] CPU/Memory usage tracked
  - [ ] Database query optimization checked

### Payment Monitoring

- [ ] **Payment Dashboard**
  - [ ] View all donations in processor
  - [ ] Reconciliation process set up
  - [ ] Daily/weekly reports generated

- [ ] **Failed Payments**
  - [ ] Alert on payment failure
  - [ ] Manual retry process documented
  - [ ] Customer notification procedure

- [ ] **Financial Reconciliation**
  - [ ] Bank deposits match processor
  - [ ] Fees accounted for
  - [ ] Monthly audit completed

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Server

```bash
# SSH into server
ssh admin@sfmamelodwest.co.za

# Create application directory
sudo mkdir -p /opt/apple-pay-server
sudo chown appuser:appuser /opt/apple-pay-server

# Create certificates directory
sudo mkdir -p /opt/apple-pay-server/certs
sudo chmod 700 /opt/apple-pay-server/certs
```

### Step 2: Deploy Backend

```bash
# Copy files
scp -r server/ admin@sfmamelodwest.co.za:/tmp/
scp -r certs/ admin@sfmamelodwest.co.za:/tmp/

# On server:
cd /opt/apple-pay-server
cp /tmp/server/* .
cp /tmp/certs/* ./certs/
chmod 600 certs/*

# Install dependencies
npm install

# Verify node_modules installed
ls -la node_modules | head
```

### Step 3: Configure Environment

```bash
# On server, create .env
sudo nano /opt/apple-pay-server/.env

# Paste environment variables (see .env section above)
# Ensure values are correct

# Verify .env
cat /opt/apple-pay-server/.env
```

### Step 4: Test Backend

```bash
# Test locally first
NODE_ENV=production npm test

# Start server
npm start

# In another terminal, test health endpoint
curl https://localhost:3000/api/health

# Should return:
# {"status":"healthy",...}
```

### Step 5: Deploy Frontend

```bash
# Copy frontend files to web server
scp js/apple-pay.js admin@sfmamelodwest.co.za:/var/www/sfmamelodwest/js/
scp css/apple-pay.css admin@sfmamelodwest.co.za:/var/www/sfmamelodwest/css/
```

### Step 6: Update HTML

In `donations.html` and `pledge.html`:

```html
<!-- Add to <head> -->
<link rel="stylesheet" href="css/apple-pay.css">

<!-- Add to donation form -->
<div data-apple-pay-container>
    <h3>Apple Pay</h3>
    <p>The fastest, safest way to donate.</p>
    <button 
        data-apple-pay-button 
        data-amount="100.00"
        aria-label="Pay with Apple Pay">
    </button>
    <div data-apple-pay-message></div>
</div>

<!-- Add before </body> -->
<script src="js/apple-pay.js"></script>
```

### Step 7: Setup Process Manager

```bash
# Install PM2 (process manager)
sudo npm install -g pm2

# Start application with PM2
cd /opt/apple-pay-server
pm2 start apple-pay-backend.js --name "apple-pay"

# Save PM2 config
pm2 save

# Setup auto-restart on server reboot
pm2 startup

# View logs
pm2 logs apple-pay
```

### Step 8: Setup Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/apple-pay.conf

server {
    listen 80;
    server_name sfmamelodwest.co.za www.sfmamelodwest.co.za;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sfmamelodwest.co.za www.sfmamelodwest.co.za;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/sfmamelodwest.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sfmamelodwest.co.za/privkey.pem;

    # TLS Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Apple Pay API proxy
    location ^~ /api/apple-pay/ {
        proxy_pass https://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off; # Self-signed cert
        
        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 5s;
        proxy_read_timeout 5s;
    }

    # Static files
    location / {
        root /var/www/sfmamelodwest;
        try_files $uri $uri/ =404;
    }
}
```

### Step 9: Verify Deployment

```bash
# Test endpoints
curl https://sfmamelodwest.co.za/api/apple-pay/health

# Check logs
pm2 logs apple-pay

# Monitor resources
pm2 monit

# Check SSL certificate
openssl s_client -connect sfmamelodwest.co.za:443
```

---

## 📞 TROUBLESHOOTING

### Common Issues

#### 1. "Invalid Merchant Validation"
- **Cause**: Domain not registered with Apple
- **Fix**: Add domain in Apple Developer Portal

#### 2. "Certificate Verification Failed"
- **Cause**: Expired or invalid merchant certificate
- **Fix**: Request new certificate from Apple

#### 3. "CORS Error"
- **Cause**: Request from unauthorized domain
- **Fix**: Update ALLOWED_DOMAINS in .env

#### 4. "Payment Button Not Showing"
- **Cause**: Device doesn't support Apple Pay
- **Fix**: Tested on Safari iOS/macOS? Correct merchant ID?

#### 5. "Timeout During Validation"
- **Cause**: Slow network to Apple servers
- **Fix**: Check outbound connectivity, increase timeout

---

## 📚 REFERENCES

- **Apple Pay Documentation**: https://developer.apple.com/apple-pay/
- **Apple Pay Web Implementation**: https://developer.apple.com/apple-pay/web/
- **Apple Pay Merchant Setup**: https://developer.apple.com/apple-pay/get-started/
- **Security Best Practices**: https://developer.apple.com/apple-pay/security/
- **TLS Configuration**: https://wiki.mozilla.org/Security/Server_Side_Tls
- **HSTS Preloading**: https://hstspreload.org/

---

**Document Version**: 1.0  
**Last Updated**: April 2026  
**Status**: ✅ Ready for Production
