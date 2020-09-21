import { ExecException } from 'child_process';

export class ProcessExecutionError extends Error {
  constructor(error: ExecException) {
    super();
    this.error = error;
  }

  public readonly error: ExecException;
}
