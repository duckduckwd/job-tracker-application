# Security Headers and Content Security Policy

## Overview

Security headers provide the first line of defence against common web vulnerabilities by instructing browsers how to handle content and requests.

## Implemented Headers

### X-Frame-Options

```text
X-Frame-Options: DENY
```

**Purpose**: Prevents the page from being embedded in frames/iframes
**Protection**: Clickjacking attacks
**Impact**: Page cannot be embedded in other sites

### X-Content-Type-Options

```text
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents browsers from MIME-sniffing content types
**Protection**: MIME confusion attacks
**Impact**: Browser respects declared content types only

### X-XSS-Protection

```text
X-XSS-Protection: 1; mode=block
```

**Purpose**: Enables browser XSS filtering
**Protection**: Reflected XSS attacks
**Impact**: Browser blocks detected XSS attempts

### Referrer-Policy

```text
Referrer-Policy: origin-when-cross-origin
```

**Purpose**: Controls referrer information sent to other sites
**Protection**: Information leakage
**Impact**: Only origin sent for cross-origin requests

### Strict-Transport-Security (Production Only)

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Purpose**: Enforces HTTPS connections
**Protection**: Man-in-the-middle attacks, protocol downgrade
**Impact**: Browser always uses HTTPS for 1 year

### Permissions-Policy

```text
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Purpose**: Disables unnecessary browser features
**Protection**: Unauthorized access to device features
**Impact**: Prevents access to camera, microphone, location

## Content Security Policy (CSP)

### Current Policy

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.sentry.io;
  frame-ancestors 'none'
```

### Directive Breakdown

#### default-src 'self'

- **Purpose**: Default policy for all resource types
- **Value**: Only allow resources from same origin
- **Fallback**: Used when specific directive not defined

#### script-src 'self' 'unsafe-eval' 'unsafe-inline'

- **Purpose**: Controls JavaScript execution
- **'self'**: Scripts from same origin
- **'unsafe-eval'**: Required for Next.js development
- **'unsafe-inline'**: Required for Next.js inline scripts

#### style-src 'self' 'unsafe-inline'

- **Purpose**: Controls CSS loading
- **'self'**: Stylesheets from same origin
- **'unsafe-inline'**: Required for Tailwind CSS

#### img-src 'self' data: https

- **Purpose**: Controls image loading
- **'self'**: Images from same origin
- **data:**: Base64 encoded images
- **https:**: Any HTTPS image source

#### font-src 'self' data

- **Purpose**: Controls font loading
- **'self'**: Fonts from same origin
- **data:**: Base64 encoded fonts

#### connect-src 'self' <https://api.sentry.io>

- **Purpose**: Controls network requests (fetch, XHR, WebSocket)
- **'self'**: Requests to same origin
- **<https://api.sentry.io>**: Sentry error reporting

#### frame-ancestors 'none'

- **Purpose**: Controls embedding in frames
- **'none'**: Cannot be embedded anywhere
- **Replaces**: X-Frame-Options header

## Configuration Location

Headers are configured in `next.config.js`:

```javascript
async headers() {
  const securityHeaders = [
    // Header configurations
  ];

  // Environment-specific headers
  if (process.env.NODE_ENV === "production") {
    securityHeaders.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  return [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ];
}
```

## Testing Security Headers

### Online Tools

- [Security Headers](https://securityheaders.com/) - Comprehensive header analysis
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security assessment
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - CSP policy analysis

### Browser Developer Tools

```javascript
// Check headers in browser console
fetch(window.location.href).then((response) => {
  console.log("Security Headers:");
  console.log("CSP:", response.headers.get("content-security-policy"));
  console.log("X-Frame-Options:", response.headers.get("x-frame-options"));
  console.log("HSTS:", response.headers.get("strict-transport-security"));
});
```

### Command Line Testing

```bash
# Check headers with curl
curl -I https://your-domain.com

# Check specific header
curl -I https://your-domain.com | grep -i "content-security-policy"
```

## CSP Violation Reporting

### Report-Only Mode (Development)

```text
Content-Security-Policy-Report-Only: [policy]; report-uri /api/csp-report
```

### Violation Reports

CSP violations can be reported to an endpoint for monitoring:

```javascript
// Example violation report
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "referrer": "",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "default-src 'self'; script-src 'self'",
    "blocked-uri": "https://evil.com/malicious.js",
    "status-code": 200
  }
}
```

## Common Issues and Solutions

### Next.js Development Issues

**Problem**: CSP blocks Next.js hot reload
**Solution**: Use 'unsafe-eval' in development only

**Problem**: Tailwind styles blocked
**Solution**: Allow 'unsafe-inline' for styles

### External Service Integration

**Problem**: Third-party scripts blocked
**Solution**: Add specific domains to script-src

**Problem**: External API calls blocked
**Solution**: Add domains to connect-src

### Image Loading Issues

**Problem**: External images not loading
**Solution**: Add https: to img-src or specific domains

## Security Header Evolution

### Phase 1: Basic Protection (Current)

- Essential headers implemented
- CSP with necessary exceptions
- Production HSTS enabled

### Phase 2: Strict CSP (Future)

- Remove 'unsafe-inline' from styles
- Implement nonce-based script loading
- Add report-uri for violation monitoring

### Phase 3: Advanced Security (Future)

- Implement Trusted Types
- Add Cross-Origin-Embedder-Policy
- Enable Cross-Origin-Opener-Policy

## Monitoring and Maintenance

### Regular Tasks

- Monitor CSP violation reports
- Test headers after deployments
- Review and tighten policies over time
- Update HSTS max-age periodically

### Security Header Checklist

- [ ] All headers return expected values
- [ ] CSP doesn't break functionality
- [ ] HSTS only enabled in production
- [ ] External services properly whitelisted
- [ ] Headers tested across browsers

## Browser Compatibility

### Modern Browsers (Full Support)

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

### Legacy Browser Considerations

- Graceful degradation for unsupported headers
- Fallback security measures
- User agent detection if needed
