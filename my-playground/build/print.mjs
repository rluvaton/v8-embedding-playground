import { prettyMs } from "./pretty-ms.mjs";
import { bold, green, red } from "./colors.mjs";

export function printError(errorMessage) {
  console.log(red(errorMessage));
}

export function printSuccess(successMessage) {
  console.log(green(successMessage));
}

export function printInfo(str) {
  const message = bold(str);

  process.stdout.cursorTo(0);
  process.stdout.clearLine(0);
  process.stdout.write(message);
}

export function error(strings, ...values) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

export function withTime(cb, options) {
  let msPassed = 0;

  /**
   * @type {NodeJS.Timeout}
   */
  let timer;

  timer = setInterval(() => {
    // not using elapsed time because timers can be inaccurate and it's annoying to see 3.1s and not 3
    msPassed += 250;

    if (msPassed < 2000) {
      cb(prettyMs(msPassed));
      return;
    }

    // After 2 seconds we call every second to not update every time when it doesn't matter
    if (msPassed % 1000 === 0) {
      cb(prettyMs(msPassed));
    }
  }, 250);

  timer.unref();

  if (options?.leading) {
    cb();
  }

  return {
    reset() {
      clearInterval(timer);
      // go to new line
      console.log("");
    },
  };
}

process.on("exit", () => {
  process.stdout.write("\n");
});
