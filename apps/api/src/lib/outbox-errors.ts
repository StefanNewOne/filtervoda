/**
 * Thrown by an outbox handler when the failure is permanent (e.g. a Meta CAPI error code that
 * retrying will never fix — bad token, invalid field). The processor marks the job DEAD
 * immediately instead of burning all backoff attempts.
 */
export class NonRetriableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetriableError';
  }
}
