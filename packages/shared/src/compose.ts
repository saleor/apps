export const compose = <T>(...fns: Array<(arg: T) => T>) =>
  fns.reduce((prevFn, nextFn) => (value: T) => prevFn(nextFn(value)));
