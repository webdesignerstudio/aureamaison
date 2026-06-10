# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Aurea Maison E2E Tests >> Login flow with test account
- Location: e2e/login.spec.ts:8:7

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - generic [ref=e5]:
      - heading "Aurea Maison Floors" [level=1] [ref=e6]
      - paragraph [ref=e7]: Log in om toegang te krijgen tot het platform
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: E-mailadres
        - textbox "eigenaar@aurea.nl" [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]: Wachtwoord
        - textbox "••••••••" [ref=e14]
      - button "Inloggen" [ref=e15]
    - paragraph [ref=e16]: Problemen met inloggen? Neem contact op met de beheerder.
```