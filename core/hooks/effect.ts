import { isEquals } from "../utils"
import { BasicHook, Instance, useInstanceTips } from "./utils"

type EffectFunc = () => (Function | void)
type EffectDeps = any[]
type EffectItem = {
  func:    EffectFunc
  deps:    EffectDeps
  oldDeps: EffectDeps
  clear?:  Function | void
}

export class Effect extends BasicHook<EffectItem> {

  /**
   * 使用 effect
   * @param func 
   * @param deps 
   */
  use(func: EffectFunc, deps?: EffectDeps) {

    const { instance, dataMap, count } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, EffectItem>();
    const item = map.get(count);

    map.set(count, {
      func,
      deps,
      oldDeps: item?.oldDeps,
      clear: item?.clear,
    });

    dataMap.set(instance, map);
    this.count ++;
  }

  /**
   * 执行 effect
   */
  run(instance: Instance) {
    const map = this.dataMap.get(instance);
    if (!map) return;

    map.forEach(item => {
      const { clear, func, deps, oldDeps } = item;

      // 对比数据变化
      if (deps !== void 0 && isEquals(deps, oldDeps)) return;

      // 执行上一次的函数清理
      clear && clear();

      item.clear = func();
      item.oldDeps = deps;
    })
  }

  /**
   * 执行 effect 清理函数
   * @param instance 
   * @returns 
   */
  runClear(instance: Instance) {
    const map = this.dataMap.get(instance);
    if (!map) return;

    map.forEach(item => {
      item.clear && item.clear();
    })
  }
}
