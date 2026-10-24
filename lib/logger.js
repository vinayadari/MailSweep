/**
 * Structured logging for MailSweep
 * 
 * Usage:
 *   log.info('scan.started', { userId, monthsBack: 6 })
 *   log.warn('gmail.rate_limited', { retryAfter: 30 })
 *   log.error('scan.failed', { jobId, error: err.message })
 */

const LEVELS = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

function emit(level, event, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  const fn = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

export const log = {
  info: (event, data) => emit(LEVELS.info, event, data),
  warn: (event, data) => emit(LEVELS.warn, event, data),
  error: (event, data) => emit(LEVELS.error, event, data),
};
