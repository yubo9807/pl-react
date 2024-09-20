import { BasicHook, useInstanceTips } from "./utils";

export type RefItem<T> = {
  current: T
}
export class Ref extends BasicHook<RefItem<any>> {

  use<T>(initialValue?: T): RefItem<T> {
    const { instance, dataMap, count } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, RefItem<T>>();
    let item = map.get(count);

    if (!item) {
      item = { current: initialValue }
      map.set(count, item)
      dataMap.set(instance, map);
    }

    this.count ++;
    return item;
  }

}
