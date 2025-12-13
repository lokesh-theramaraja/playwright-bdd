import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import playwright from 'playwright';
import fs from 'fs';
import 'dotenv/config';


setDefaultTimeout(30 * 1000); // 30s timeout for steps

Before(async function (scenario) {
  const browserName = process.env.BROWSER || 'chromium';
  const headless = process.env.HEADLESS === 'true'; // Convert to boolean
  this.browser = await playwright[browserName].launch({ headless: headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();

  // Assign the attach function from the Cucumber World object
  this.attach = this.attach;

  console.log(`\n--- Executing scenario: ${scenario.pickle.name} ---`);
  console.log(`Environment: ${process.env.ENV}`);
  console.log(`Base URL: ${process.env.BASE_URL}`);
  console.log(`Browser launched: ${browserName} (headless: ${headless})`);

  // await this.world.goto(process.env.BASE_URL); 
  
});

After(async function (scenario) {
  if (scenario.result && String(scenario.result.status).toLowerCase() === 'failed') {
    // capture screenshot, attach to report if attach available
    await this.takeAndAttachScreenshot(`${scenario.pickle.name}-failure-screenshot.png`);
  }
  // close resources if they exist
  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
  if (this.browser) await this.browser.close();
});