import { AnyObj } from "./type";

/**
 * 设置对象 value 值
 * @param obj  PS: {}
 * @param propPath 要改变的 key 值  PS: a 或 b.c
 * @param value 设置 value
 * @call const obj = {} setNestedPropertyValue(obj, 'a.b', 3)  //--> obj={a: {b: 3}}
 */
export function setNestedPropertyValue(obj: AnyObj, propPath: string | string[], value: any) {
  if (typeof propPath === 'string') {
    propPath = propPath.split('.');
  }

  if (propPath.length > 1) {
    const prop = propPath.shift();
    obj[prop] = obj[prop] || {};
    setNestedPropertyValue(obj[prop], propPath, value);
  } else {
    obj[propPath[0]] = value;
  }
}
