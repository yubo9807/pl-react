import { isPromise } from "../utils";
import { BasicHook, isEquals, useInstanceTips } from "./utils";
import type { RefItem } from "./ref";

type ExposeItem = {
  expose: any
  deps: any[]
}
export class Expose extends BasicHook<ExposeItem> {

  /**
   * 将一些暴露出去，绑定在 ref 上
   * @param ref 
   * @param handle 可以在当中处理一些逻辑
   * @param deps   若 handle 中逻辑较为耗性能时，可加入依赖项来优化性能
   */
  use<T>(ref: RefItem<T>, handle: () => T, deps?: any[]) {
    const { instance, dataMap, count } = this;
    useInstanceTips(instance);
    if (!ref) return;  // ref 不存在，不进行计数（该钩子在组件中无效）

    const map = dataMap.get(instance) || new Map<number, ExposeItem>();
    const item = map.get(count);

    // 不存在 || 依赖项发生变化
    if (!item || !isEquals(item.deps, deps)) {
      const expose = handle();
      if (isPromise(expose)) {
        expose.then((res) => {
          ref.current = res;
        })
      } else {
        ref.current = expose;
      }
      map.set(count, { expose, deps });
      dataMap.set(instance, map);
    } else {
      ref.current = item.expose;
    }

    this.count++;
  }
}