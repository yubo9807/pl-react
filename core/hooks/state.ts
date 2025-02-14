import { isEquals, isFunction } from "../utils";
import { BasicHook, isEqual, useInstanceTips } from "./utils";

type Update = (k: object) => void
type Option = {
  update: Update
}
type SetValue<T> = (newValue: T | ((oldValue: T) => T)) => void
export class State extends BasicHook<any> {

  option: Option
  constructor(option: Option) {
    super();
    this.option = option;
  }

  /**
   * 状态响应
   * @param initialValue 
   * @returns 
   */
  use<T>(initialValue?: T | (() => T)): [T, SetValue<T>] {

    const { instance, dataMap, count, option } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map();

    let value: T
    if (!map.has(count)) {
      map.set(count, isFunction(initialValue) ? initialValue() : initialValue);
    }
    value = map.get(count);

    const setValue: SetValue<T> = (newValue) => {
      const value = map.get(count);
      newValue = isFunction(newValue) ? newValue(value) : newValue;
      if (isEqual(newValue, value)) return;
      map.set(count, newValue);
      option.update(instance);
    }

    dataMap.set(instance, map);
    this.count++;

    return [
      value,
      setValue,
    ]
  }

}
