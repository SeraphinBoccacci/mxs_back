interface CacheData {
  expiration: number;
  value: null | unknown;
}

export const withCache = (
  cacheDelay: number,
  fn: (...args: unknown[]) => unknown,
  args?: unknown[]
): (() => Promise<unknown>) => {
  let cacheData: CacheData = {
    expiration: Date.now(),
    value: null,
  };

  return async () => {
    if (Date.now() > cacheData.expiration || !cacheData.value) {
      const newValue = await fn(...(args || []));

      const valueToKeep = newValue ? newValue : cacheData.value;

      cacheData = {
        expiration: Date.now() + cacheDelay * 1000,
        value: valueToKeep,
      };

      return valueToKeep;
    }

    return cacheData.value;
  };
};
