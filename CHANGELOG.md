# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/SemVer).

## [1.6.0] - 2026-01-07

### Added
- Docker support with multi-stage Dockerfile for containerized deployment
- Docker Compose configuration for easy development setup
- Volume mounts for `.env` configuration and log persistence
- Environment variable defaults in configuration (most settings now optional)
- Production script (`npm run start:prod`) for compiled JavaScript execution
- Comprehensive Docker documentation in README
- Security hardening with non-root user in Docker container
- Health checks for container monitoring

### Changed
- Modified configuration system to provide defaults for most environment variables
- Updated code structure documentation to include Docker files
- Enhanced development scripts with production variant

### Technical Details
- Multi-stage Docker build with Node.js 20 LTS and Chromium for Puppeteer
- Volume mounting for configuration and logs in Docker Compose
- Environment variable precedence: Docker env > .env file > code defaults
- Auto-run functionality when container starts

## [1.5.0] - 2026-01-07

### Added
- Added keypress listener for ENTER or SPACEBAR to display remaining time to next execution during wait periods.

## [1.4.0] - 2026-01-07

### Changed
- Modified logger to only output DEBUG level messages when the DEBUG flag is set, improving log cleanliness in production.

## [1.3.0] - 2026-01-07

### Fixed
- Fixed detached frame error during form submission by adding proper error handling to catch and log detached frame exceptions as successful submissions.

## [1.2.0] - 2026-01-07

### Changed
- Updated author information to Jim Nelin <jim@jine.se>
- Added co-author attribution for Grok <grok@x.ai>

## [1.1.0] - 2026-01-07

### Added
- Comprehensive README with detailed documentation and flowcharts
- Mermaid flowcharts showing main loop and form submission processes
- Detailed configuration documentation with all environment variables
- Architecture overview and code structure explanation
- Troubleshooting guide and development instructions
- Security considerations section

### Changed
- Updated README from basic description to comprehensive documentation
- Enhanced project description and features list

### Technical Details
- Added visual flowcharts for script execution flow
- Documented all configuration options with examples
- Included scheduling logic explanation
- Added browser automation process details
- Comprehensive error handling documentation

## [1.0.0] - 2026-01-07

### Added
- Initial release of formpuppet
- Automated form submission using Puppeteer
- Scheduled execution at configurable hours
- TypeScript implementation with comprehensive logging
- Environment-based configuration system
- Random delays to avoid detection
- Rotating log file system
- Headless/browser mode support
- Debug mode for immediate execution

### Features
- Puppeteer-based browser automation
- Configurable form selectors and data
- Scheduled runs with TARGET_HOURS
- Randomized execution delays
- Comprehensive error handling and logging
- Timezone-aware timestamps (Europe/Stockholm)
- Log file rotation based on size