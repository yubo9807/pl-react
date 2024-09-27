import { Callback, Context, Effect, Memo, Ref, State, Expose, Reducer, Store } from "../hooks";
import { AnyObj, customForEach, isString, len, nextTick } from "../utils";
import { JsxToNodes } from "../client/jsx-node";
import { isTree } from "../tools";
import type { Component, CompTree } from "../tools/type";
// import { clearCompTree, collectChildTree } from "./tree";

export let currentApp: ReturnType<typeof createApp>;

export function createApp() {

  const globalCompMap = new Map<string, Component>();
  function useComponent(name: string, comp: Component) {
    globalCompMap.set(name, comp);
  }

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

  const updateMap = new WeakMap<CompTree, any[]>();
  /**
   * 组件内数据更新
   */
  function stateUpdate(tree: CompTree) {
    // 保证被多次触发只更新一次
    const arr = updateMap.get(tree) || [];
    arr.push(1);
    updateMap.set(tree, arr);
    const size = len(arr);
    nextTick(() => {
      if (len(arr) === size) {
        structure.updateComp(tree);  // 更新组件
        updateMap.delete(tree);
      }
    })

    // hooks.effect.run(tree);
  }

  const structure = new JsxToNodes({
    intercept(tree) {
      if (!isTree(tree)) return;

      const { tag } = tree;
      if (isString(tag)) {
        // 全局组件
        const comp = globalCompMap.get(tag);
        if (comp) {
          tree.tag = comp;
        }
      }
    },

    currentCompTree(tree) {
      currentApp = instance;
      customForEach(hooksValues, hook => {
        hook.setInstance(tree);
      })
    },
    compTreeReplace(newTree, oldTree) {
      customForEach(hooksValues, hook => {
        hook.fixInstance(newTree, oldTree);
      })
    },

    created(tree, childTree) {
      // collectChildTree(tree, childTree)
      hooks.effect.run(tree);
    },
    mount(tree, childTree, nodes) {
      hooks.layoutEffect.run(tree);
    },
    refresh(tree) {
      // 这里为什么不需要执行 effect
      // hooks.effect.runEffects(tree);
      hooks.layoutEffect.run(tree);
    },
    unmount(tree, nodes) {
      hooks.effect.runClear(tree);
      hooks.layoutEffect.runClear(tree);
      hooks.store.remove(tree);

      // clearCompTree(tree);

      customForEach(hooksValues, hook => {
        hook.removeInstance(tree);
      })
    },

    nodeMount(tree, node) {
      const { ref } = tree.attrs as AnyObj;
      if (ref) {
        ref.current = node;
      }
    },
  });

  let rootTree: CompTree
  const instance = {
    ...hooks,
    useComponent,
    /**
     * 渲染组件，并挂载到父节点上
     * @param tree 
     * @param parent 
     */
    render(tree: CompTree, parent?: HTMLElement) {
      rootTree = tree;
      const nodes = structure.render(tree);
      parent && parent.append(...nodes);
      return nodes;
    },
    /**
     * 强制更新组件
     * @param tree 
     * @returns 
     */
    refresh(tree: CompTree) {
      return stateUpdate(tree);
    },
    /**
     * 卸载应用
     */
    unmount() {
      structure.destroyComp(rootTree);
    },
    /**
     * 获取组件树结果
     * @param tree 
     * @returns 
     */
    getCompResult(tree: CompTree) {
      return structure.treeMap.get(tree);
    },
    use(plugin: { install: (instance: ReturnType<typeof createApp>) => void }) {
      plugin.install(instance);
      return instance;
    }
  }

  currentApp = instance;
  return instance;
}
