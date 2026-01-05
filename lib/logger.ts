// Logger module: handles logging to console and rotating log files
import fs from 'fs';
import path from 'path';
import { config } from './config';

let logFile: string;
let logStream: fs.WriteStream;

// Initialize logger: create logs directory, set up log file stream, and handle process signals
export function initLogger() {
  const logDir = path.join(process.cwd(), config.LOG_DIR);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const baseName = `form-script-${new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })}`;
  logFile = path.join(logDir, `${baseName}.log`);
  logStream = fs.createWriteStream(logFile, { flags: 'a' });

  process.on('exit', () => logStream.end());
  process.on('SIGINT', () => process.exit());
  process.on('SIGTERM', () => process.exit());
}

// Check if log file needs rotation based on size and rotate if necessary
function rotateIfNeeded() {
  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile);
    if (stats.size >= config.MAX_SIZE) {
      logStream.end();
      const baseName = path.basename(logFile, '.log');
      for (let i = config.MAX_FILES - 1; i >= 0; i--) {
        const oldFile = i === 0 ? logFile : path.join(path.dirname(logFile), `${baseName}.log.${i}`);
        const newFile = path.join(path.dirname(logFile), `${baseName}.log.${i + 1}`);
        if (fs.existsSync(oldFile)) {
          fs.renameSync(oldFile, newFile);
        }
      }
      logFile = path.join(path.dirname(logFile), `${baseName}.log`);
      logStream = fs.createWriteStream(logFile, { flags: 'w' });
      log('INFO', 'Log rotated due to size limit');
    }
  }
}

// Log a message with level and timestamp to both console and log file
export const log = (level: string, message: string) => {
  const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  const logLine = `[${timestamp}] [${level}] ${message}\n`;
  process.stdout.write(logLine);
  logStream.write(logLine, () => rotateIfNeeded());
};