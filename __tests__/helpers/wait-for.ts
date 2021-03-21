const futureTick = setTimeout;

const TIMEOUTS = [0, 1, 2, 5, 7];
const MAX_TIMEOUT = 10;

export class TimeoutError extends Error {}

type AssertionCallback = () => Promise<void> | void;
type WaitForOptions = {
  timeout?: number;
};

export async function waitFor(
  assertionCallback: AssertionCallback,
  { timeout = 1000 }: WaitForOptions = {}
): Promise<void> {
  const waitUntilTimeoutError = new TimeoutError('Condition not met within timeout');

  return new Promise<void>((resolve, reject) => {
    let time = 0;

    function scheduleCheck(timeoutsIndex: number) {
      let interval = TIMEOUTS[timeoutsIndex];
      if (interval === undefined) {
        interval = MAX_TIMEOUT;
      }

      futureTick(async function () {
        time += interval;

        try {
          await assertionCallback();
          resolve();
        } catch (error) {
          if (time < timeout) {
            scheduleCheck(timeoutsIndex + 1);
          } else {
            reject(waitUntilTimeoutError);
          }
        }
      }, interval);
    }

    scheduleCheck(0);
  });
}
