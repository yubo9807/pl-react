import { isEquals } from "../utils";
import { BasicHook, useInstanceTips } from "./utils";

type CallBackDeps = any[]
type CallBackItem = {
  func: Function
  deps: CallBackDeps
}
export class Callback extends BasicHook<CallBackItem> {

  /**
   * 缓存执行函数
   * @param func 
   * @param deps 
   * @returns 
   */
  use<T extends Function>(func: T, deps?: CallBackDeps): T {
    const { instance, dataMap, count } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, CallBackItem>();
    const item = map.get(count);

    if (item && deps !== void 0 && isEquals(deps, item.deps)) {
      return item.func as T;
    }

    map.set(count, { func, deps });
    this.count ++;

    return func;
  }
}