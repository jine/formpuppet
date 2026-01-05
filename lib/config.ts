// Configuration module: loads and parses environment variables
import * as dotenv from "dotenv";

// Load environment variables from .env file in parent directory
dotenv.config({ path: __dirname + '/../.env' });

// Configuration object containing all application settings
export const config = {
  FORM_URL: process.env.FORM_URL!, // URL of the form to submit
  DROPDOWN_BUTTON_SELECTOR: process.env.DROPDOWN_BUTTON_SELECTOR!, // CSS selector for the dropdown button
  LISTBOX_SELECTOR: process.env.LISTBOX_SELECTOR!, // CSS selector for the dropdown listbox
  OPTION_SELECTOR: process.env.OPTION_SELECTOR!, // CSS selector for dropdown options
  OPTION_TEXT: process.env.OPTION_TEXT!, // Text to match in the dropdown option
  EMAIL_INPUT_SELECTOR: process.env.EMAIL_INPUT_SELECTOR!, // CSS selector for the email input field
  EMAIL: process.env.EMAIL!, // Email address to fill in the form
  SUBMIT_BUTTON_SELECTOR: process.env.SUBMIT_BUTTON_SELECTOR!, // CSS selector for the submit button
  TARGET_HOURS: process.env.TARGET_HOURS!.split(',').map(Number), // Array of hours when the script should run
  HEADLESS: process.env.HEADLESS === 'true', // Whether to run browser in headless mode
  DEBUG: process.env.DEBUG === 'true', // Whether to run in debug mode (immediate execution)
  MIN_DELAY_SECONDS: parseInt(process.env.MIN_DELAY_SECONDS!), // Minimum random delay before execution
  MAX_DELAY_SECONDS: parseInt(process.env.MAX_DELAY_SECONDS!), // Maximum random delay before execution
  MAX_SIZE: parseInt(process.env.MAX_SIZE!), // Maximum log file size in bytes
  MAX_FILES: parseInt(process.env.MAX_FILES!), // Maximum number of log files to keep
};