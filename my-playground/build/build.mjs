import path from "node:path";
import { printError, printSuccess, printInfo, withTime } from "./print.mjs";
import { CommandError, runCommand } from "./run-command.mjs";

const __dirname = new URL(".", import.meta.url).pathname;

const rootDir = path.join(__dirname, "../../../");

printInfo("Compiling V8\n");
try {
  await runCommand(
    [
      //
      "ninja",

      "-C",
      "out.gn/arm64.release.sample",
      "v8_monolith",
    ].join(" "),
    {
      cwd: rootDir,
    }
  );
} catch (e) {
  if (!(e instanceof CommandError)) {
    console.error(e);
  }

  // Don't print error to avoid spamming output
  printError("V8 Compilation failed");
  process.exit(1);
}

const compilingPrint = withTime(
  (time) => {
    const message = time ? `Compiling (${time})` : "Compiling";
    printInfo(message);
  },
  { leading: true }
);
try {
  await runCommand(
    [
      "g++",

      // verbose output
      // "-v",

      // Add directory to the end of the list of include search paths
      "-I .",
      "-I include",

      // input file
      "samples/my-playground/my-pg.cc",
      // "samples/hello-world.cc",

      // output binary (Write output to file)
      "-o my-pg",
      // "-o hello_world",

      // Disable generation of rtti information
      "-fno-rtti",

      // Include the following libraries
      "-l v8_monolith",

      // Having the following lines caused error
      // ld: multiple errors: unknown file type in '<source>/v8/v8/out.gn/x64.release.sample/obj/libv8_libplatform.a'; unknown file type in '<source>/v8/v8/out.gn/x64.release.sample/obj/libv8_libbase.a'
      // "-l v8_libbase",
      // "-l v8_libplatform",
      "-l dl",

      // Add directory to library search path
      "-L out.gn/arm64.release.sample/obj/",

      // Support POSIX threads in generated code
      "-pthread",

      // Language standard to compile for
      "-std=c++17",

      // Required so we won't get FATAL error - Embedder-vs-V8 build configuration mismatch
      // Ref: https://stackoverflow.com/a/62921689/5923666
      "-DV8_COMPRESS_POINTERS=1",
      "-DV8_ENABLE_SANDBOX",

      // --- Debugging ---

      // https://stackoverflow.com/a/58145029/5923666

      // Turn on runtime checks for various forms of undefined or suspicious behavior
      "-fsanitize=address",
      // Generate source-level debug information
      // https://stackoverflow.com/a/7509066/5923666
      // "-g",
      // "-O0",
      // "-Og",

      // Suppress warnings (e.g. about unused variables)
      "-w",
    ].join(" "),
    { cwd: rootDir }
  );
} catch (e) {
  if (!(e instanceof CommandError)) {
    console.error(e);
  }

  // Don't print error to avoid spamming output
  printError("Compilation failed");
  process.exit(1);
} finally {
  compilingPrint.reset();
}

printSuccess("Compiled successfully\n");

printInfo("Running\n");

// Only see output from the run
// console.clear();

try {
  await runCommand(path.join(rootDir, "my-pg"), {
    cwd: path.join(__dirname, ".."),
  });
} catch (e) {
  if (!(e instanceof CommandError)) {
    console.error(e);
  }
  // Don't print error to avoid spamming output
  printError("\n\nRun failed");
  process.exit(1);
}
