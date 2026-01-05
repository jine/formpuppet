import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Configuration constants
const FORM_URL ='https://forms.office.com/Pages/ResponsePage.aspx?id=GNk0MoRU0kyNmTTzaJRdhsCPWLw6KNFPrYJfUsqa-BJUNEE2MUZUUUM2UDNSM0JRWDE1OVRUQzU0OS4u';
const DROPDOWN_BUTTON_SELECTOR = 'div[role="button"][aria-haspopup="listbox"]';
const LISTBOX_SELECTOR = '[role="listbox"]';
const OPTION_SELECTOR = '[role="option"]';
const OPTION_TEXT = 'Jim Nelin';
const EMAIL_INPUT_SELECTOR = 'input[aria-label="Single line text"]';
const EMAIL = 'jim@jine.se';
const SUBMIT_BUTTON_SELECTOR = 'button[data-automation-id="submitButton"]';
const TARGET_HOURS = [8, 13, 16];
const HEADLESS = false;
const MIN_DELAY_SECONDS = 10;
const MAX_DELAY_SECONDS = 120;

// Log rotation setup
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const baseName = `form-script-${new Date().toISOString().slice(0,10)}`;
let logFile = path.join(logDir, `${baseName}.log`);
let logStream: fs.WriteStream = fs.createWriteStream(logFile, { flags: 'a' });

function rotateIfNeeded() {
  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile);
    if (stats.size >= MAX_SIZE) {
      logStream.end();
      for (let i = MAX_FILES - 1; i >= 0; i--) {
        const oldFile = i === 0 ? logFile : path.join(logDir, `${baseName}.log.${i}`);
        const newFile = path.join(logDir, `${baseName}.log.${i + 1}`);
        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile);
        }
      }
      logFile = path.join(logDir, `${baseName}.log`);
      logStream = fs.createWriteStream(logFile, { flags: 'w' });
      log('INFO', 'Log rotated due to size limit');
    }
  }
}

const log = (level: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  process.stdout.write(logLine);
  logStream.write(logLine, () => rotateIfNeeded());
};

process.on('exit', () => logStream.end());
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

// Target execution times (24-hour format)
const TARGET_HOURS = [8, 13, 16];

async function executeFormSubmission() {
  let browser: puppeteer.Browser | undefined;
  let page: puppeteer.Page | undefined;

  try {
    log('INFO', '=== Starting form submission ===');
    log('INFO', 'Launching browser...');
    browser = await puppeteer.launch({ headless: HEADLESS });

    log('INFO', 'Opening new page...');
    page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36');

    log('INFO', 'Navigating to form URL...');
    await page.goto(FORM_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    log('SUCCESS', 'Page loaded');

    await page.waitForSelector(DROPDOWN_BUTTON_SELECTOR, { visible: true, timeout: 30000 });
    log('INFO', 'Dropdown button visible');

    await page.click(DROPDOWN_BUTTON_SELECTOR);
    log('INFO', 'Clicked dropdown button');

    await page.waitForSelector(LISTBOX_SELECTOR, { visible: true, timeout: 10000 });
    log('INFO', 'Listbox visible');

    const options = await page.$$eval(`${LISTBOX_SELECTOR} ${OPTION_SELECTOR}`, opts =>
      opts.map(opt => opt.textContent?.trim() || '')
    );
    log('DEBUG', `Options: ${options.join(', ')}`);

    const targetOptionIndex = options.findIndex(opt => opt.includes(OPTION_TEXT));
    if (targetOptionIndex === -1) throw new Error(`${OPTION_TEXT} not found in dropdown`);

    const optionElements = await page.$$(`${LISTBOX_SELECTOR} ${OPTION_SELECTOR}`);
    await optionElements[targetOptionIndex].click();
    log('SUCCESS', 'Option selected');

    await page.waitForSelector(EMAIL_INPUT_SELECTOR, { visible: true, timeout: 10000 });
    log('INFO', 'Email input visible');
    await page.fill(EMAIL_INPUT_SELECTOR, EMAIL);
    log('SUCCESS', 'Email filled');

    await page.waitForSelector(SUBMIT_BUTTON_SELECTOR, { visible: true, timeout: 10000 });

    log('INFO', 'NOT Submitting form...');
    /*await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(e => log('WARN', `Navigation timeout: ${e.message}`)),
      page.click(SUBMIT_BUTTON_SELECTOR),
    ]);
    log('SUCCESS', 'Form submitted');
    log('INFO', `Final URL: ${page.url()}`);*/
  } catch (error) {
    log('ERROR', `Submission failed: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) log('STACK', error.stack);
  } finally {
    if (browser) {
      await browser.close().catch(err => log('ERROR', `Browser close error: ${err.message}`));
    }
    log('INFO', '=== Submission completed ===');
  }
}

function getNextRunTime(): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let next: Date | null = null;

  for (const hour of TARGET_HOURS) {
    const candidate = new Date(today);
    candidate.setHours(hour, 0, 0, 0);

    if (candidate > now) {
      if (!next || candidate < next) next = candidate;
    }
  }

  // If no time left today, schedule for first time tomorrow
  if (!next) {
    next = new Date(today);
    next.setDate(next.getDate() + 1);
    next.setHours(TARGET_HOURS[0], 0, 0, 0);
  }

  return next;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mainLoop() {
  log('INFO', 'Script started - running indefinitely');
  log('INFO', `Target times: ${TARGET_HOURS.map(h => `${h.toString().padStart(2,'0')}:00`).join(', ')}`);

  while (true) {
    const nextRun = getNextRunTime();
    const now = new Date();
    const waitMs = nextRun.getTime() - now.getTime();

    log('INFO', `Next run scheduled at ${nextRun.toISOString().slice(0,19).replace('T', ' ')} (in ${Math.round(waitMs / 60000)} minutes)`);

    await sleep(waitMs);

    // Add random delay
    const randomDelay = Math.floor(Math.random() * (MAX_DELAY_SECONDS - MIN_DELAY_SECONDS + 1)) + MIN_DELAY_SECONDS;
    log('INFO', `Waiting random delay of ${randomDelay} seconds before execution...`);
    await sleep(randomDelay * 1000 * 60);

    //await executeFormSubmission();
  }
}

// Start the loop
mainLoop().catch(err => {
  log('FATAL', `Unexpected error in main loop: ${err.message}`);
  process.exit(1);
});