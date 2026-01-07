// Form submission module: handles automated form filling and submission using Puppeteer
import puppeteer from 'puppeteer';

// Execute the form submission process: launch browser, navigate to form, fill fields, and submit
export async function executeFormSubmission(log: (level: string, message: string) => void, config: any, sleep: (ms: number) => Promise<void>) {
  let browser: any;
  let page: any;

  try {
    log('INFO', '=== Starting form submission ===');
    // Launch Puppeteer browser
    log('INFO', 'Launching browser...');
    browser = await puppeteer.launch({ headless: config.HEADLESS, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    // Create new page and set user agent
    log('INFO', 'Opening new page...');
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');

    // Navigate to the form URL
    log('INFO', 'Navigating to form URL...');
    await page.goto(config.FORM_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    log('SUCCESS', 'Page loaded');

    // Wait for and click the dropdown button
    await page.waitForSelector(config.DROPDOWN_BUTTON_SELECTOR, { visible: true, timeout: 30000 });
    log('INFO', 'Dropdown button visible');
    await page.click(config.DROPDOWN_BUTTON_SELECTOR);
    log('INFO', 'Clicked dropdown button');

    // Wait for listbox and get options
    await page.waitForSelector(config.LISTBOX_SELECTOR, { visible: true, timeout: 10000 });
    log('INFO', 'Listbox visible');
    const options = await page.$$eval(`${config.LISTBOX_SELECTOR} ${config.OPTION_SELECTOR}`, (opts: HTMLElement[]) =>
      opts.map((opt: HTMLElement) => opt.textContent?.trim() || '')
    );
    log('DEBUG', `Options: ${options.join(', ')}`);

    // Find and select the target option
    const targetOptionIndex = options.findIndex((opt: string) => opt.includes(config.OPTION_TEXT));
    if (targetOptionIndex === -1) throw new Error(`${config.OPTION_TEXT} not found in dropdown`);
    const optionElements = await page.$$(`${config.LISTBOX_SELECTOR} ${config.OPTION_SELECTOR}`);
    await optionElements[targetOptionIndex].click();
    log('SUCCESS', 'Option selected');

    // Fill in the email input
    await page.waitForSelector(config.EMAIL_INPUT_SELECTOR, { visible: true, timeout: 10000 });
    log('INFO', 'Email input visible');
    await page.type(config.EMAIL_INPUT_SELECTOR, config.EMAIL);
    log('SUCCESS', 'Email filled');

    // Wait for submit button and add random delay
    await page.waitForSelector(config.SUBMIT_BUTTON_SELECTOR, { visible: true, timeout: 10000 });
    const submitDelay = Math.floor(Math.random() * 15) + 1;
    log('INFO', `Waiting ${submitDelay} seconds before submitting...`);
    await sleep(submitDelay * 1000);

     // Submit the form
     log('INFO', 'Submitting form...');
     try {
       await Promise.all([
         page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch((e: any) => log('WARN', `Navigation timeout: ${e.message}`)),
         page.click(config.SUBMIT_BUTTON_SELECTOR),
       ]);
       log('SUCCESS', 'Form submitted');
     } catch (error) {
       if (error instanceof Error && error.message.includes('detached Frame')) {
         log('INFO', 'Frame detached during submission, assuming form was submitted successfully');
       } else {
         throw error;
       }
     }
     log('INFO', `Final URL: ${page.url()}`);
  } catch (error) {
    // Log errors
    log('ERROR', `Submission failed: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) log('STACK', error.stack);
  } finally {
    // Close browser after a delay to allow viewing results
    if (browser) {
      await sleep(10000);
      await browser.close().catch((err: Error) => log('ERROR', `Browser close error: ${err.message}`));
    }
    log('INFO', '=== Submission completed ===');
  }
}