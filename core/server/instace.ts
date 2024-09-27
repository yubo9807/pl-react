import { CompTree, TreeValue } from "../client";
import { Callback, Context, Effect, Memo, Ref, State, Expose, Reducer, Store } from "../hooks";
import { customForEach } from "../utils";
import { JsxToString } from "./jsx-string";

export let currentApp: typeof hooks;

const hooks = {
  state:        new State({ update: stateUpdate }),
  memo:         new Memo(),
  effect:       new Effect(),
  callback:     new Callback(),
  layoutEffect: new Effect(),
  ref:          new Ref(),
  expose:       new Expose(),
  context:      new Context(),
  reducer:      new Reducer({ update: stateUpdate }),
  store:        new Store(),
}
const hooksValues = Object.values(hooks);
function stateUpdate(tree: CompTree) {}

export function renderToString(tree: TreeValue) {

  const structure = new JsxToString({
    currentCompTree(tree) {
      customForEach(hooksValues, hook => {
        hook.setInstance(tree);
      })
    }
  })

  currentApp ??= {
    ...hooks,
  }

  return structure.render(tree);
}
