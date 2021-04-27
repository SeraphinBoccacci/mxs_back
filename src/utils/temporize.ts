type CachedValue = {
  [reference: string]: number;
};

export interface TemporizedFn {
  (reference: string, delayedMs: number, ...args: any[]): void;
}

export const temporizeFn = (
  fn: (...args: any[]) => void | Promise<void>
): TemporizedFn => {
  const cachedValues: CachedValue = {};

  const temporizedFn = async (
    reference: string,
    delayedMs: number,
    ...args: any[]
  ) => {
    const temporizeEnd = cachedValues[reference];

    if (temporizeEnd && Date.now() < temporizeEnd) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      await temporizedFn(reference, delayedMs, ...args);
    } else {
      cachedValues[reference] = Date.now() + delayedMs;
      await fn(...args);
    }
  };

  return temporizedFn;
};
