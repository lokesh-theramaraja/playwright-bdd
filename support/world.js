import { setWorldConstructor } from '@cucumber/cucumber';

class CustomWorld {
  constructor({ attach }) {
    // will be set in hooks before each scenario
    this.browser = null;
    this.context = null;
    this.page = null;
    this.attach = attach;
  }

  async takeAndAttachScreenshot(name = 'screenshot.png') {
    if (!this.page) throw new Error('No page available on World');
    const buffer = await this.page.screenshot({ fullPage: true });
    if (this.attach) {
      await this.attach(buffer, 'image/png');
    }
    return buffer;
  }

  async goto(url, options = {}) {
    if (!this.page) throw new Error('No page available on World');
    await this.page.goto(url, options);
    await this.page.waitForLoadState('load',{ timeout: 10000 });
  }
}

setWorldConstructor(CustomWorld);