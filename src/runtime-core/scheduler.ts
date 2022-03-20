import { EffectFn } from "../reactivity/effect";

const queue: EffectFn[] = [];
let isFlushing = false;
const resolvedPromise = Promise.resolve();
let currentFlushPromise: Promise<any> | null = null;

export function nextTick(fn: () => void) {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(fn) : p;
}

export const queueJob = (job: EffectFn) => {
  if (!queue.length || !queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
}

const queueFlush = () => {
  if (!isFlushing) {
    isFlushing = true;
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}

const flushJobs = () => {
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i];
      job();
    }
  } finally {
    isFlushing = false;
    queue.length = 0;
    currentFlushPromise = null;
  }
}
