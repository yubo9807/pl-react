import { isEquals } from "../utils";
import { BasicHook, useInstanceTips } from "./utils";

type MemoFunc = Function
type MemoDeps = any[]
type MemoItem = {
  result: any
  deps:   MemoDeps
}
export class Memo extends BasicHook<MemoItem> {

  /**
   * 缓存函数执行结果
   * @param func 
   * @param deps 
   */
  use<T extends MemoFunc>(func: T, deps?: MemoDeps) {

    const { instance, dataMap, count } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, MemoItem>();
    const item = map.get(count);

    if (item && deps !== void 0 && isEquals(deps, item.deps)) {
      return item.result;
    }

    const result = func();
    map.set(count, { result, deps });

    dataMap.set(instance, map);
    this.count ++;

    return result;
  }

}