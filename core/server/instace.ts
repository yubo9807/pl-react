import { initHooks } from "../tools";
import { cache, customForEach } from "../utils";
import { JsxToString } from "./jsx-string";
import type { TreeValue } from "../types";

function instace() {
  const hooks = initHooks(() => {})
  const hooksValues = Object.values(hooks);

  const structure = new JsxToString({
    currentCompTree(tree) {
      customForEach(hooksValues, hook => {
        hook.setInstance(tree);
      })
    }
  })

  return {
    ...hooks,
    render: structure.render.bind(structure),
  }
}

export const currentApp: ReturnType<typeof instace> = cache(instace);

export function renderToString(tree: TreeValue) {
  return currentApp.render(tree);
}
