# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take the security of the FIRE Simulator seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Send an email to the repository maintainers via [GitHub Security Advisories](https://github.com/Festas/FIRE-Simulator/security/advisories/new).
3. Include a detailed description of the vulnerability, steps to reproduce, and potential impact.

### What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours.
- **Assessment**: We will assess the vulnerability and determine its severity within 5 business days.
- **Resolution**: We aim to release a fix within 14 days for critical vulnerabilities.
- **Disclosure**: We will coordinate with you on public disclosure timing.

### Scope

The following are in scope:

- The FIRE Simulator web application (`fire-simulator/`)
- Calculation engine (`lib/fireCalculations/`)
- Tax engine (`lib/tax/`)
- Data export functionality (`lib/export/`)
- URL state serialization (`app/hooks/useUrlState.ts`)

### Out of Scope

- The FIRE Simulator is a **client-side only** application with no backend server or database.
- All calculations and data storage happen in the user's browser (localStorage).
- No personal data is transmitted to any server.

### Security Design

- **No server-side data storage** — all user data stays in the browser.
- **No authentication** — the app is a standalone calculator.
- **No external API calls** — all computation is local.
- **URL state** uses base64 encoding for compact sharing, not for security.
- **Content Security Policy** headers are set via nginx in production.

## Acknowledgments

We appreciate the security research community's efforts in helping keep the FIRE Simulator safe. Contributors who responsibly disclose vulnerabilities will be acknowledged in our release notes (with permission).
