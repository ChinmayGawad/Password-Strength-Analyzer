# Vault — Password Strength Analyzer & Breach Checker

A high-performance, responsive client-side web application that evaluates password strength in real time, checks passwords against 800M+ leaked accounts using privacy-preserving k-Anonymity (HIBP API), and generates cryptographically secure password suggestions.

## Key Features

- **Cryptographically Secure Generator**: Powered by `window.crypto.getRandomValues()` for unbiased, cryptographically secure password & passphrase generation.
- **Have I Been Pwned Integration**: Real-time breach check using k-Anonymity SHA-1 range queries. Only the first 5 characters of the SHA-1 hash leave the browser.
- **Multi-Scenario Attack Analysis**: Estimates cracking durations across 3 realistic threat scenarios:
  1. *Online Rate-Limited Attack* (100 attempts/hr)
  2. *Slow Hashing Offline* (Argon2 / bcrypt @ 10,000 / sec)
  3. *Fast GPU Hashing Offline* (MD5 / NTLM @ 100 Billion / sec)
- **Advanced Pattern Detection**: Detects spatial keyboard walks (`qwerty`, `asdfgh`), dates/years (`1990-2029`), character repetition, and leetspeak substitutions (`P@ssw0rd`).
- **Theme Switcher**: Pick from 4 curated visual themes: *Vault Gold (Default)*, *Cyberpunk Neon*, *Emerald Security*, and *Clean Light*.
- **UX & Accessibility Upgrades**:
  - One-click copy buttons for inputs and suggested passwords.
  - Keyboard shortcuts (`Ctrl+G` to generate, `Esc` to clear input).
  - Screen reader `aria-live` support for real-time strength updates.
- **Automated Unit Testing**: Includes an in-browser test suite (`test.js`).

## Technologies Used

- HTML5 (Semantic & Accessible ARIA markup)
- CSS3 (Custom properties, grid layout, theme switching, responsive design)
- JavaScript (Web Crypto API `crypto.subtle` & `crypto.getRandomValues`)
- Have I Been Pwned PwnedPasswords API (k-Anonymity privacy model)

## Run Locally

This project is fully client-side. Open `index.html` directly in any modern web browser or run a local static server:

```bash
cd "d:\Projects\Password Strength Analyzer"
python -m http.server 8000
```

Then open `http://127.0.0.1:8000` in your browser.

## Project Structure

```text
Password-Strength-Analyzer/
│
├── index.html       # Application markup & UI layout
├── script.js        # Core security engine, HIBP lookup, evaluator, generator & UI bindings
├── style.css        # Design tokens, themes (default, cyberpunk, emerald, light) & CSS rules
├── test.js          # Automated unit test suite
└── README.md        # Documentation
```
