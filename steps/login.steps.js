import { expect } from '@playwright/test';
import { Given, When, Then } from '@cucumber/cucumber';
import LoginPage from '../pages/login.page.js';

Given('I am on the Playwright website', async function () {
  await this.goto('https://playwright.dev/');
});

When('I click the "Get started" button', async function () {
  await this.page.getByRole('link', { name: 'Get started' }).click();
});

Then('I should be on the {string} page', async function (title) {
  await expect(this.page).toHaveTitle(title);
});

Given('I open the login page', async function () {
  await this.goto(process.env.BASE_URL);
  this.loginPage = new LoginPage(this.page);
});

When('I login with username {string} and password {string}', async function (username, password) {
  await this.loginPage.login(username, password);
});

Then('I should see the dashboard', async function () {
  // simple check - adjust selector to your app
  const dashboardHeader = await this.page.textContent('h1');
  expect(dashboardHeader).toEqual('Secure Area page for Automation Testing Practice');
});