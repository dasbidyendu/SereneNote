import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

type ErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// We need to cast EventEmitter to a more specific type
// to get type safety for our specific events.
class TypedEventEmitter {
  private emitter = new EventEmitter();

  on<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]) {
    this.emitter.on(event, listener as (...args: any[]) => void);
  }

  off<T extends keyof ErrorEvents>(event: T, listener: ErrorEvents[T]) {
    this.emitter.off(event, listener as (...args: any[]) => void);
  }

  emit<T extends keyof ErrorEvents>(event: T, ...args: Parameters<ErrorEvents[T]>) {
    this.emitter.emit(event, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter();
