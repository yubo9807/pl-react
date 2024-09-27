import { Callback, Context, Effect, Memo, Ref, State, Expose, Reducer, Store } from "../hooks";
import type { CompTree } from "./type";

export function initHooks(update: (tree: CompTree) => void) {
  return {
    state:        new State({ update }),
    memo:         new Memo(),
    effect:       new Effect(),
    callback:     new Callback(),
    layoutEffect: new Effect(),
    ref:          new Ref(),
    expose:       new Expose(),
    context:      new Context(),
    reducer:      new Reducer({ update }),
    store:        new Store(),
  }
}