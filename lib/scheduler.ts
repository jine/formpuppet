// Scheduler module: handles timing and scheduling of form submissions

let globalNextRun: Date | null = null;

// Calculate the next run time based on target hours
export function getNextRunTime(targetHours: number[]): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let next: Date | null = null;

  // Find the next target hour today that is after current time
  for (const hour of targetHours) {
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
    next.setHours(targetHours[0], 0, 0, 0);
  }

  return next;
}

// Main loop: schedules and executes form submissions indefinitely
export async function mainLoop(
  executeFormSubmission: (log: (level: string, message: string) => void, config: any, sleep: (ms: number) => Promise<void>) => Promise<void>,
  log: (level: string, message: string) => void,
  config: any,
  sleep: (ms: number) => Promise<void>
) {
  log('INFO', 'Script started - running indefinitely');
  log('INFO', `Target times: ${config.TARGET_HOURS.map((h: number) => `${h.toString().padStart(2, '0')}:00`).join(', ')}`);

  // If in debug mode, run immediately and exit
  if (config.DEBUG) {
    log('INFO', 'Debug mode: running immediately');
    await executeFormSubmission(log, config, sleep);
    return;
  }

  // Set up key listening for status queries
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (key: Buffer) => {
    const keyCode = key[0];
    if (keyCode === 13 || keyCode === 32) { // ENTER or SPACE
      if (globalNextRun) {
        const now = new Date();
        const remaining = globalNextRun.getTime() - now.getTime();
        if (remaining > 0) {
          log('INFO', `Remaining time: ${Math.round(remaining / 60000)} minutes`);
        } else {
          log('INFO', 'Execution time has passed');
        }
      }
    } else if (keyCode === 3) { // Ctrl+C
      log('INFO', 'Exiting...');
      process.exit(0);
    }
  });

  // Infinite loop to schedule and run submissions
  while (true) {
    // Calculate next run time
    const nextRun = getNextRunTime(config.TARGET_HOURS);
    globalNextRun = nextRun;
    const now = new Date();
    const waitMs = nextRun.getTime() - now.getTime();

    log('INFO', `Next run scheduled at ${nextRun.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })} (in ${Math.round(waitMs / 60000)} minutes)`);

    // Wait until next run time
    await sleep(waitMs);

    // Add random delay to avoid detection
    const randomDelay = Math.floor(Math.random() * (config.MAX_DELAY_SECONDS - config.MIN_DELAY_SECONDS + 1)) + config.MIN_DELAY_SECONDS;
    log('INFO', `Waiting random delay of ${randomDelay} seconds before execution...`);
    await sleep(randomDelay * 1000);

    // Execute the form submission
    await executeFormSubmission(log, config, sleep);
  }
}