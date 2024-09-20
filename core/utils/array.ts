import { len } from "./simplify";

/**
 * 简化 while 循环
 * @param array 
 * @param callback 
 * @param index    起始索引
 */
export function customForEach<T extends Array<any>>(array: T, callback: (item: T[number], i: number) => void, index = 0): void {
  while (index < len(array)) {
    callback(array[index], index)
    index++;
  }
}
