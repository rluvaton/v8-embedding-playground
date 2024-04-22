import { spawn } from "node:child_process";

export class CommandError extends Error {
  constructor(command, code) {
    super(`Command failed with code ${code} (${command})`);
  }
}

/**
 * Promisified exec with stdio set to inherit
 * @param  {Parameters<import('node:child_process')['spawn']>} args
 */
export async function runCommand(...spawnArgs) {
  let [commandWithArgs, options] = spawnArgs;

  // console.log(getColoredCommand(commandWithArgs));

  if (options === undefined) {
    options = {};
  }

  // All output is printed to the console
  if (!("stdio" in options)) {
    options.stdio = "inherit";
  }

  const [command, ...args] = commandWithArgs.split(" ");

  const cp = spawn(command, args, {
    ...options,
    stdio: "pipe",
  });

  cp.stdout.pipe(process.stdout);
  cp.stderr.pipe(process.stderr);

  return new Promise((resolve, reject) => {
    cp.once("exit", (code) =>
      code === 0 ? resolve() : reject(new CommandError(commandWithArgs, code))
    );
  });
}
