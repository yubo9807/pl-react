
const map = new WeakMap<Function, any>();

/**
 * 缓存函数执行结果
 * @param fn 
 * @returns 
 */
export function cache<T>(fn: () => T) {
  const result = map.get(fn);
  if (result) return result;

  const value = fn();
  map.set(fn, value);
  return value;
}