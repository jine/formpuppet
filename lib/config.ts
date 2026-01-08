// Configuration module: loads and parses environment variables
import * as dotenv from "dotenv";

// Load environment variables from .env file in parent directory
dotenv.config({ path: __dirname + '/../.env' });

// Configuration object containing all application settings
export const config = {
  // Required - no defaults (must be provided)
  FORM_URL: process.env.FORM_URL!,
  DROPDOWN_BUTTON_SELECTOR: process.env.DROPDOWN_BUTTON_SELECTOR!,
  LISTBOX_SELECTOR: process.env.LISTBOX_SELECTOR!,
  OPTION_SELECTOR: process.env.OPTION_SELECTOR!,
  OPTION_TEXT: process.env.OPTION_TEXT!,
  EMAIL_INPUT_SELECTOR: process.env.EMAIL_INPUT_SELECTOR!,
  EMAIL: process.env.EMAIL!,
  SUBMIT_BUTTON_SELECTOR: process.env.SUBMIT_BUTTON_SELECTOR!,

  // Optional - with defaults
  TARGET_HOURS: process.env.TARGET_HOURS ? process.env.TARGET_HOURS.split(',').map(Number) : [8, 13, 16],
  HEADLESS: process.env.HEADLESS ? process.env.HEADLESS === 'true' : true,
  DEBUG: process.env.DEBUG ? process.env.DEBUG === 'true' : false,
  MIN_DELAY_SECONDS: process.env.MIN_DELAY_SECONDS ? parseInt(process.env.MIN_DELAY_SECONDS) : 10,
  MAX_DELAY_SECONDS: process.env.MAX_DELAY_SECONDS ? parseInt(process.env.MAX_DELAY_SECONDS) : 420,
  MAX_SIZE: process.env.MAX_SIZE ? parseInt(process.env.MAX_SIZE) : 10485760,
  MAX_FILES: process.env.MAX_FILES ? parseInt(process.env.MAX_FILES) : 5,
  LOG_DIR: process.env.LOG_DIR || 'logs',
};