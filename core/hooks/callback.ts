import { isEquals } from "../utils";
import { BasicHook, useInstanceTips } from "./utils";

type CallBackFunc = Function
type CallBackDeps = any[]
type CallBackItem = {
  func: CallBackFunc
  deps: CallBackDeps
}
export class Callback extends BasicHook<CallBackItem> {

  /**
   * 缓存执行函数
   * @param func 
   * @param deps 
   * @returns 
   */
  use(func: CallBackFunc, deps?: CallBackDeps) {
    const { instance, dataMap, count } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, CallBackItem>();
    const item = map.get(count);

    if (item && deps !== void 0 && isEquals(deps, item.deps)) {
      return item.func;
    }

    map.set(count, { func, deps });
    this.count ++;

    return func;
  }
}