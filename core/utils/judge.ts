import { len } from "./simplify";
import { AnyObj, WideClass } from "./type";

export type Type = 'String'    | 'Number'  | 'Boolean' |
                   'Symbol'    | 'Bigint'  |
                   'Undefined' | 'Null'    |
                   'regexp'    | 'Date'    |
                   'Array'     | 'Object'  |
                   'Function'  | 'Promise' |
                   'Set'       | 'Map'     |
                   'WeakSet'   | 'WeakMap' | 'WeakRef'

/**
 * 属于什么类型
 * @param o
 */
export function isType(o: any): Type {
  return Object.prototype.toString.call(o).slice(8, -1);
}

/**
 * 是否为字符串
 * @param value 
 * @returns 
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * 是否为一个对象
 * @param value 
 * @returns 
 */
export function isObject(value: any): value is AnyObj {
  return typeof value === 'object' && value !== null;
}

/**
 * 是否为一个数组
 * @param value 
 * @returns 
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

/**
 * 是否为一个函数
 * @param value 
 * @returns 
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

/**
 * 函数是否是为类声明
 * @param func 
 * @returns 
 */
export function isClass(func: Function): func is WideClass {
  return func.toString().slice(0, 5) === 'class';
}

/**
 * 是否为正则
 * @param value 
 * @returns 
 */
export function isRegExp(value: any): value is RegExp {
  return value instanceof RegExp;
}

/**
 * 判断两个值是否相等
 * @param val1 
 * @param val2 
 * @returns 
 */
export function isEquals(val1: any, val2: any) {
  const set = new WeakSet();

  function _isEquals(val1: any, val2: any) {
    if (isObject(val1) && isObject(val2)) {
      if (set.has(val1) || set.has(val2)) return true;
      set.add(val1);
      set.add(val2);
      const keys1 = Object.keys(val1), keys2 = Object.keys(val2);
      if (len(keys1) !== len(keys2)) return false;
      for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        const bool = _isEquals(val1[key], val2[key]);
        if (!bool) return false;
      }
      return true;
    } else {
      return val1 === val2;
    }
  }

  return _isEquals(val1, val2);
}

/**
 * 是否为空值
 * @param value 
 * @returns 
 */
export function isEmpty(value: any) {
  return [null, void 0, false].includes(value);
}

/**
 * 是否为客户端
 * @returns 
 */
export function isClient() {
  return typeof window === 'object';
}
