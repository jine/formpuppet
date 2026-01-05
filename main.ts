// Main entry point: initializes logger and starts the form submission scheduler

// Import modules
import { initLogger, log } from './lib/logger';
import { config } from './lib/config';
import { sleep } from './lib/utils';
import { mainLoop } from './lib/scheduler';
import { executeFormSubmission } from './lib/formSubmission';

// Initialize the logger
initLogger();

// Start the main scheduling loop
mainLoop(executeFormSubmission, log, config, sleep).catch((err: Error) => {
  log('FATAL', `Unexpected error in main loop: ${err.message}`);
  process.exit(1);
});