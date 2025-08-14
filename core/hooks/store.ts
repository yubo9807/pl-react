import { Reducer, ReducerAction, ReducerHandle } from "./reducer";
import { BasicHook, useInstanceTips } from "./utils";
import { getCurrnetInstance } from "..";
import type { CompTree } from "../types";

const map = new Map<object, Set<object>>();

export function defineStore<S, A extends ReducerAction>(
  handle: ReducerHandle<S, A>,
  state:  S, 
  init?:  (state: S) => S
) {
  const key = { id: Math.random() };

  let app: ReturnType<typeof getCurrnetInstance>;
  function bind(currentApp: typeof app) {
    app = currentApp;
  }

  function update() {
    map.get(key).forEach(tree => {
      app.compUpdate(tree as CompTree);
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
    bind,
  };
}

type StoreItem = {}
export class Store extends BasicHook<StoreItem> {

  use<S extends ReturnType<typeof defineStore>>(store: S)
    : {
        state: S['state'], 
        dispatch: (action: Parameters<S['handle']>[1]) => 
          S['handle'] extends Promise<any> ? Promise<S['state']> : S['state']
      }
  {
    const { instance } = this;
    useInstanceTips(instance);

    const { reducer, handle, state, init, key, bind } = store;
    bind(getCurrnetInstance());

    const set = map.get(key);
    if (set) {
      set.add(instance);
    } else {
      map.set(key, new Set([instance]));
    }

    reducer.count = 0;

    const [data, dispatch] = reducer.use(handle, state, init);
    return {
      state: data,
      dispatch,
    } as any
  }

  remove(tree: CompTree) {
    map.forEach(set => {
      set.delete(tree);
    })
  }
}



