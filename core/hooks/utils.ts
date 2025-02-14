import { throwError } from "../utils";

export type Instance = object;
export class BasicHook<I> {
  instance: Instance
  count:    number  // 钩子使用次数计数
  dataMap = new WeakMap<object, Map<number, I>>();

  /**
   * 设置实例
   * @param instance 
   */
  setInstance(instance: object) {
    this.count = 0;
    this.instance = instance;
  }

  /**
   * 修改实例，数据替换
   * @param newInstance 
   * @param oldInstance 
   */
  fixInstance(newInstance: object, oldInstance: object) {
    const data = this.dataMap.get(oldInstance);
    if (!data) return;  // 可能从来没有搜集过实例
    this.dataMap.set(newInstance, data);
    this.dataMap.delete(oldInstance);
  }

  /**
   * 移除数据，清空数据
   * @param instance 
   */
  removeInstance(instance: object) {
    this.dataMap.delete(instance);
  }
}

/**
 * 使用实例提醒
 */
export function useInstanceTips(instance: object) {
  if (!instance) {
    throwError('Please set the instance first');
  }
}

export function isEqual(val: any, val2: any) {
  return Object.is(val, val2);
}

export function isEquals(arr1: object[], arr2: object[]) {
  if ([arr1, arr2].includes(void 0)) return false;
  for (const k in arr1) {
    if (!Object.is(arr1[k], arr2[k])) return false;
  }
  return true;
}