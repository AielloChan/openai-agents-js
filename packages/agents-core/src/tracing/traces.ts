import { defaultProcessor, TracingProcessor } from './processor';
import { generateTraceId } from './utils';

export type TraceOptions = {
  traceId?: string;
  name?: string;
  groupId?: string;
  metadata?: Record<string, any>;
  started?: boolean;
};

export class Trace {
  public type = 'trace' as const;
  public traceId: string;
  public name: string;
  public groupId: string | null = null;
  public metadata?: Record<string, any>;

  #processor: TracingProcessor;
  #started: boolean;

  constructor(options: TraceOptions, processor?: TracingProcessor) {
    this.traceId = options.traceId ?? generateTraceId();
    this.name = options.name ?? 'Agent workflow';
    this.groupId = options.groupId ?? null;
    this.metadata = options.metadata ?? {};
    this.#processor = processor ?? defaultProcessor();
    this.#started = options.started ?? false;
  }

  async start() {
    if (this.#started) {
      return;
    }

    this.#started = true;
    await this.#processor.onTraceStart(this);
  }

  async end() {
    if (!this.#started) {
      return;
    }

    this.#started = false;
    await this.#processor.onTraceEnd(this);
  }

  clone(): Trace {
    return new Trace({
      traceId: this.traceId,
      name: this.name,
      groupId: this.groupId ?? undefined,
      metadata: this.metadata,
      started: this.#started,
    });
  }

  toJSON(): object | null {
    return {
      object: this.type,
      id: this.traceId,
      workflow_name: this.name,
      group_id: this.groupId,
      metadata: this.metadata,
    };
  }
}

export class NoopTrace extends Trace {
  constructor() {
    super({});
  }

  async start(): Promise<void> {
    return;
  }

  async end(): Promise<void> {
    return;
  }

  toJSON(): object | null {
    return null;
  }
}
