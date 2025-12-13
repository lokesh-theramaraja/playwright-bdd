# Playwright + Cucumber (JS) BDD Test Automation Framework

A lightweight, scalable end-to-end (E2E) test automation framework built using Playwright, Cucumber (Gherkin BDD), and JavaScript. Supports multi-browser execution, page object model, hooks, custom world, parallel runs, and CI integration.

## Features
- BDD Gherkin syntax (Given/When/Then)
- Playwright automation (Chromium, Firefox, WebKit)
- Page Object Model (POM)
- Before/After hooks with shared browser context and screenshot on failure
- Parallel cross-browser execution
- JSON, HTML, and JUnit reporting support
- CI-friendly (GitHub Actions, Jenkins, GitLab)
- Fast, reliable, modern web automation

## Project Structure
```
playwright-cucumber-js/
├── features/
│   └── sample.feature
├── steps/
│   └── login.steps.js
├── pages/
│   └── login.page.js
├── support/
│   ├── hooks.js
│   ├── world.js
│   └── cucumber.js
├── reports/
├── .env
├── package.json
└── README.md
```

## Installation
```bash
npm install
npx playwright install --with-deps
```

## Running Tests
Tests are executed using `cucumber-js`. You can control browser and headless mode using environment variables.

### Default run (Chromium, headless)
```bash
npm test
```

### Run Tests on Different Browsers
```bash
BROWSER=chromium npm test
BROWSER=firefox npm test
BROWSER=webkit npm test
```

### Run All Browsers Sequentially
```bash
npm run test:all
```

### Run in Headed mode
Set the `HEADLESS` environment variable to `false`.
```bash
HEADLESS=false npm test
```
Or use the predefined script:
```bash
npm run test:headed
```

### Parallel Execution
For parallel execution, you can run tests for different browsers concurrently:
```bash
BROWSER=chromium npm test & BROWSER=firefox npm test & BROWSER=webkit npm test
```

## Writing Tests (BDD Gherkin)
Feature files define your test scenarios using Gherkin syntax.
Example: [`features/sample.feature`](features/sample.feature)
```gherkin
Feature: Sample Feature
  As a user
  I want to visit the Playwright website
  So that I can learn about its features

@test
  Scenario: Visit the Playwright website
    Given I am on the Playwright website
    When I click the "Get started" button
    Then I should be on the "Installation | Playwright1" page

@login
  Scenario: Test site login
    Given I open the login page
    When I login with username "practice" and password "SuperSecretPassword!"
    Then I should see the dashboard
```

## Step Definitions
Step definitions implement the logic for your Gherkin steps.
Example: [`steps/login.steps.js`](steps/login.steps.js)
```js
const { expect } = require('@playwright/test');
const { Given, When, Then } = require('@cucumber/cucumber');
const LoginPage = require('../pages/login.page');

Given('I am on the Playwright website', async function () {
  await this.page.goto('https://playwright.dev/');
});

When('I click the "Get started" button', async function () {
  await this.page.getByRole('link', { name: 'Get started' }).click();
});

Then('I should be on the {string} page', async function (title) {
  await expect(this.page).toHaveTitle(title);
});

Given('I open the login page', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.goto('https://practice.expandtesting.com/login');
});

When('I login with username {string} and password {string}', async function (username, password) {
  await this.loginPage.login(username, password);
});

Then('I should see the dashboard', async function () {
  const dashboardHeader = await this.page.textContent('h1');
  expect(dashboardHeader).toEqual('Secure Area page for Automation Testing Practice');
});
```

## Page Object Example
Page objects encapsulate page interactions and selectors, promoting reusability and maintainability.
Example: [`pages/login.page.js`](pages/login.page.js)
```js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
    this.submitBtn = 'button[type="submit"]';
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitBtn);
  }

  async getError() {
    return await this.page.textContent('.error');
  }
}

module.exports = LoginPage;
```

## Hooks and World Setup
### [`support/world.js`](support/world.js)
The `CustomWorld` class provides a shared context (`this.browser`, `this.context`, `this.page`, `this.attach`) across all step definitions within a scenario.
```js
const { setWorldConstructor } = require('@cucumber/cucumber');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.attach = null; // cucumber attach function (set in hooks)
  }
}

setWorldConstructor(CustomWorld);
```

### [`support/hooks.js`](support/hooks.js)
Hooks manage browser setup and teardown before and after each scenario. It also captures screenshots on test failure.
```js
const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const playwright = require('playwright');
const fs = require('fs');
require('dotenv').config();

setDefaultTimeout(30 * 1000); // 30s timeout for steps

Before(async function (scenario) {
  const browserName = process.env.BROWSER || 'chromium';
  const headless = process.env.HEADLESS === 'false' ? false : true; // Default to true if not set or not 'false'
  this.browser = await playwright[browserName].launch({ headless: headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.attach = this.attach; // Make Cucumber's attach function available in World
});

After(async function (scenario) {
  if (scenario.result && String(scenario.result.status).toLowerCase() === 'failed') {
    // Capture screenshot and attach to report if attach is available
    try {
      const buffer = await this.page.screenshot();
      if (this.attach) {
        this.attach(buffer, 'image/png');
      }
    } catch (e) {
      console.error('Error capturing screenshot on failure:', e);
    }
  }
  // Close resources if they exist
  try { if (this.page) await this.page.close(); } catch(e){}
  try { if (this.context) await this.context.close(); } catch(e){}
  try { if (this.browser) await this.browser.close(); } catch(e){}
});
```

## Reporting
Cucumber JSON output is configured in [`cucumber.js`](cucumber.js):
```js
// filepath: /Users/lokeshtheramaraja/my_work/playwright-bdd/cucumber.js
module.exports = {
  default: "--require ./support/world.js --require ./support/hooks.js --require ./steps/**/*.js --format json:./reports/report.json --publish-quiet"
};
```
You can generate HTML reports from the JSON output using tools like `cucumber-html-reporter`.

## CI Integration (GitHub Actions)
Example GitHub Actions workflow for running tests across different browsers.
```yaml
name: E2E Tests
jobs:
  playwright-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Run Tests
        run: BROWSER=${{ matrix.browser }} npm test
      - name: Upload Cucumber Report
        uses: actions/upload-artifact@v4
        with:
          name: cucumber-report-${{ matrix.browser }}
          path: reports/cucumber-report.json
```

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| `this.page undefined` | Hooks/World not loaded | Ensure correct cucumber config in [`cucumber.js`](cucumber.js) |
| Flaky selectors | Timing issues | Use Playwright's [expectations](https://playwright.dev/docs/assertions) and [wait for selectors](https://playwright.dev/docs/api/class-page#page-wait-for-selector) |
| Browser fails to launch | Missing dependencies or browsers | Run `npx playwright install --with-deps` |

## Summary
This framework provides:
- Modern Playwright automation
- Clean BDD structure
- Multi-browser support
- CI-ready architecture
- Extensible foundation

Here are some common CLI options available from the Cucumber library:

-p, --profile <NAME>: Specify a profile to use (defined in [`cucumber.js`](cucumber.js)).
-r, --require <FILE|DIR>: Require files before executing features.
-t, --tags <EXPRESSION>: Only run scenarios or features with tags matching the expression.
-g, --glue <FILE|DIR>: Same as --require.
-f, --format <FORMAT[:PATH]>: Specify a formatter (e.g., json, html, progress, summary).
-o, --format-options <JSON>: Specify options for formatters as a JSON string.
-i, --dry-run: Skip executing step definitions.
-w, --world-parameters <JSON>: Custom parameters to pass to the World constructor.
-n, --name <REGEXP>: Only run scenarios whose names match the regular expression.
-b, --backtrace: Show full backtrace for errors.
--no-colors: Disable colors in the output.
--fail-fast: Abort the run on first failure.
--strict: Fail if there are undefined or pending steps.
--retry <COUNT>: Specify the number of times to retry failing scenarios.
--parallel <COUNT>: Run scenarios in parallel. Use 0 to disable parallel execution.
--timeout <MILLISECONDS>: Timeout for step definitions and hooks (default: 5000ms).
--exit: Exit the process once all tests complete.
--publish: Publish a report to Cucumber Reports.
--publish-quiet: Suppress the publish message.
--order <TYPE[:SEED]>: Run scenarios in a specific order (defined, random).
--version: Show version number.
--help: Show help message.