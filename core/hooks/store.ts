import { Reducer, ReducerAction, ReducerHandle } from "./reducer";
import { getCurrnetInstance } from "../client/instace";
import { BasicHook, useInstanceTips } from "./utils";
import type { CompTree } from "../common/type";

const map = new Map<object, Set<CompTree>>();

export function defineStore<S, A extends ReducerAction>(
  handle: ReducerHandle<S, A>,
  state:  S, 
  init?:  (state: S) => S
) {
  const key = { id: Math.random() };

  function update() {
    map.get(key).forEach(tree => {
      getCurrnetInstance().refresh(tree);
    })
  }

  const reducer = new Reducer({ update });
  reducer.setInstance(key);

  return {
    reducer,
    handle,
    state,
    init,
    key,
  };
}

type StoreItem = {}
export class Store extends BasicHook<StoreItem> {

  use<S extends ReturnType<typeof defineStore>>(store: S):
    [S['state'], (action: Parameters<S['handle']>[1]) => void]
  {
    const { instance } = this;
    useInstanceTips(instance);

    const { reducer, handle, state, init, key } = store;

    const set = map.get(key);
    if (set) {
      set.add(instance as CompTree);
    } else {
      map.set(key, new Set([instance as CompTree]));
    }

    reducer.count = 0;

    return reducer.use(handle, state, init);
  }

  remove(tree: CompTree) {
    map.forEach(set => {
      set.delete(tree);
    })
  }
}



