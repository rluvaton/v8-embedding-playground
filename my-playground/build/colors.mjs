export function red(str) {
    return `\x1B[31m${str}\x1B[0m`;
  }
  
  export function green(str) {
    return `\x1B[32m${str}\x1B[0m`;
  }
  
  export function bold(str, reset = true) {
    return `\x1B[1m${str}${reset ? "\x1B[0m" : ""}`;
  }
  
  export function gray(msg) {
    return `\x1B[90m${msg}\x1B[0m`;
  }
  
  export function blue(msg) {
    return `\x1B[34m${msg}\x1B[0m`;
  }
  
  export function yellow(msg) {
    return `\x1B[33m${msg}\x1B[0m`;
  }
  
  export function cyan(msg) {
    return `\x1B[36m${msg}\x1B[0m`;
  }
  
  export function magenta(msg) {
    return `\x1B[35m${msg}\x1B[0m`;
  }
  
  export function brown(msg) {
    return `\x1B[33m${msg}\x1B[0m`;
  }
  
  export function white(msg) {
    return `\x1B[37m${msg}\x1B[0m`;
  }
  
  export function lightRed(msg) {
    return `\x1B[91m${msg}\x1B[0m`;
  }
  
  export function lightGreen(msg) {
    return `\x1B[92m${msg}\x1B[0m`;
  }
  
  export function lightYellow(msg) {
    return `\x1B[93m${msg}\x1B[0m`;
  }
  