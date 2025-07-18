# Security Policy

## Supported Versions

We actively maintain security updates for the following versions:

| Version | Supported          | Notes                   |
| ------- | ------------------ | ----------------------- |
| 1.0.x   | :white_check_mark: | Current stable release  |
| < 1.0.0 | :x:                | Please upgrade to 1.0.x |

## Reporting a Vulnerability

If you discover a security vulnerability in AgentInterface, please report it responsibly through our coordinated disclosure process.

### Contact Method
Send an email to **tyson.chan@proton.me** with the subject line `SECURITY: AgentInterface Vulnerability Report`

**Please include:**
- Detailed description of the vulnerability
- Step-by-step reproduction instructions
- Potential impact and attack scenarios
- Affected versions and platforms (Python, JavaScript, or both)
- Suggested remediation approaches (optional)
- Your preferred contact method for follow-up

### Response Timeline
- **Acknowledgment:** Within 48 hours of receipt
- **Initial Assessment:** Within 5 business days
- **Regular Updates:** Every 7 days during active investigation
- **Critical Issues:** Expedited response within 24 hours
- **Resolution Target:** 30 days for critical, 90 days for non-critical vulnerabilities

### Security Scope

Given AgentInterface's role in UI generation and cross-platform communication, we're particularly concerned with vulnerabilities in these areas:

#### High Priority
- **XSS Vulnerabilities:** Malicious content injection through component properties or agent responses
- **Code Injection:** Unsafe evaluation of dynamic component configurations
- **Protocol Manipulation:** Malformed protocol messages that bypass validation
- **Client-Side Attacks:** DOM manipulation or script injection in rendered components

#### Medium Priority  
- **Information Disclosure:** Sensitive data exposure through component state or protocol messages
- **Denial of Service:** Resource exhaustion through malicious component rendering
- **CSRF Attacks:** Unauthorized actions through component interactions
- **Dependency Vulnerabilities:** Security issues in third-party libraries

#### Documentation & Examples
- **Insecure Usage Patterns:** Examples that demonstrate unsafe implementation practices
- **Misleading Security Guidance:** Documentation that could lead to insecure deployments

### Resolution Process

1. **Triage:** Vulnerability assessment and severity classification
2. **Investigation:** Root cause analysis and impact evaluation  
3. **Development:** Security patch creation and testing
4. **Review:** Internal security review and validation
5. **Coordination:** Timeline discussion with reporter
6. **Release:** Patch deployment and security advisory publication
7. **Disclosure:** Public notification and credit attribution

### Severity Classification

- **Critical:** Remote code execution, XSS, or widespread data exposure
- **High:** Significant security bypass or sensitive information disclosure
- **Medium:** Limited security impact or requires specific conditions
- **Low:** Minor security concerns or theoretical vulnerabilities

### Public Disclosure Policy

We follow responsible disclosure practices:
- **Coordination:** Work with reporters to determine appropriate disclosure timeline
- **Embargo Period:** Minimum 30 days for non-critical issues, negotiable for critical vulnerabilities
- **Public Advisory:** Security advisories published after patch release
- **CVE Assignment:** Request CVE identifiers for significant vulnerabilities when appropriate

### Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Acknowledged in security advisories and release notes
- Listed in our project security contributors (unless anonymity is preferred)
- Invited to review our security improvements related to their findings

### Out of Scope

The following are generally considered out of scope:
- Vulnerabilities in third-party dependencies (please report directly to maintainers)
- Issues requiring physical access to the system
- Social engineering attacks
- Denial of service attacks requiring excessive resources

### Security Best Practices

When implementing AgentInterface in production:

**Python (Agent Side)**
- **Input Sanitization:** Always validate and sanitize component properties
- **Content Security:** Review agent-generated content before rendering
- **Protocol Validation:** Validate all protocol messages before processing

**JavaScript (Client Side)**
- **XSS Prevention:** Use React's built-in XSS protection, avoid dangerouslySetInnerHTML
- **Content Security Policy:** Implement strict CSP headers
- **Component Isolation:** Sandbox untrusted component content when possible
- **Dependency Auditing:** Regularly audit npm dependencies for vulnerabilities

**Cross-Platform**
- **Protocol Security:** Use secure transport (HTTPS/WSS) for protocol communication
- **Authentication:** Implement proper authentication for agent-client communication
- **Rate Limiting:** Prevent abuse through component rendering limits

### Questions?

For general security questions or guidance on secure implementation practices, please email tyson.chan@proton.me with the subject `SECURITY: General Inquiry`

---

*This security policy is effective as of July 2025 and will be reviewed quarterly.*