/** @format */

export const isObject = (variable: unknown): boolean => {
  return Object.prototype.toString.call(variable) === "[object Object]";
};
