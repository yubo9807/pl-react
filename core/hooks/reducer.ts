import { isPromise } from "../utils";
import { BasicHook, Instance, isEqual, useInstanceTips } from "./utils";

export type ReducerAction = {
  type: string
  [k: string]: any
}

type ReducerResult<S> = S extends Promise<any> ? Promise<S> : S
export type ReducerHandle<S, A extends ReducerAction> = (state: S, action: A) => (S | Promise<S>);
type ReducerItem<S> = {
  state: any
  dispatch: (action: ReducerAction) => ReducerResult<S>
}
type Option = {
  update: (instance: Instance) => void
}
export class Reducer extends BasicHook<ReducerItem<any>> {

  option: Option
  constructor(option: Option) {
    super();
    this.option = option;
  }

  use<S, A extends ReducerAction>(
    reducer: ReducerHandle<S, A>,
    state:   S, 
    init?:   (state: S) => S
  ): [S, (action: A) => ReducerResult<S>] {

    const { instance, dataMap, count, option } = this;
    useInstanceTips(instance);

    const map = dataMap.get(instance) || new Map<number, ReducerItem<S>>();

    if (map.has(count)) {
      const item = map.get(count);
      this.count ++;
      return [item.state, item.dispatch];
    }

    // 初始化
    state = init ? init(state) : state;

    function dispatch(action: A) {
      let result = reducer(state, action);
      function update(result: S) {
        if (isEqual(state, result)) return state;
        state = result;
        map.set(count, { state, dispatch });
        option.update(instance);
        return state;
      }
      return isPromise(result) ? result.then(res => update(res)) : update(result);
    }

    map.set(count, { state, dispatch });
    dataMap.set(instance, map);

    this.count ++;
    // @ts-ignore
    return [state, dispatch]
  }
}
