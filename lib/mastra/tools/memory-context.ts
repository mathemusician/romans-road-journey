import { AsyncLocalStorage } from 'node:async_hooks';

type MemoryContextStore = {
  sessionId: string;
};

const memoryContext = new AsyncLocalStorage<MemoryContextStore>();

export async function withMemorySession<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    memoryContext.run({ sessionId }, () => {
      fn().then(resolve).catch(reject);
    });
  });
}

export function getMemorySessionId() {
  return memoryContext.getStore()?.sessionId;
}
