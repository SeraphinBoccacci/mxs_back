/** @format */

type ShouldStopPollingFn = (() => boolean) | (() => Promise<boolean>);

/**
 * @param fn function to execute in loop; can be async
 * @param delay delay between loops; min: 1000ms
 * @param shouldStopPolling function resolving/returning a boolean to continue loop; can alse be used to execute extra code.
 */
export const poll = async (
  fn: (() => void) | null,
  delay: number,
  shouldStopPolling: ShouldStopPollingFn,
  duration?: number,
): Promise<void> => {
  const compelledDelay = Math.max(1000, delay);

  const endTimestamp = duration ? Date.now() + duration : null;

  const shouldStop = async () => {
    if (endTimestamp && Date.now() > endTimestamp) return true;

    return shouldStopPolling();
  };

  do {
    if (fn) await fn();
    await new Promise(resolve => setTimeout(resolve, compelledDelay));
  } while (!(await shouldStop()));
};
export default poll;
