import { customForEach, isString, len, nextTick } from "../utils";
import { JsxToNodes } from "./jsx-node";
import { initHooks, isTree } from "../tools";
import type { Component, CompTree, NodeTree, Tree, TreeValue } from "../types";
import { jsxToString } from "./jsx-string";
// import { clearCompTree, collectChildTree } from "./tree";

let currentApp: ReturnType<typeof createApp>

export function createApp() {

  // 全局组件
  const globalComp: Record<string, Component> = {};
  function useComponent(name: string, comp: Component) {
    globalComp[name] = comp;
  }

  type Directive = (value: any, el: HTMLElement) => void
  // 全局指令
  const globalDirective: Record<string, Directive> = {};
  function useDirective(name: string, directive: Directive) {
    globalDirective[name] = directive;
  }

  const hooks = initHooks(stateUpdate);
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
        const comp = globalComp[tag];
        if (comp) {
          tree.tag = comp;
        }
      }
    },

    currentCompTree(tree) {
      currentApp = instance;  // 保证在使用 hook 时，能正确的获取到当前实例
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
      const { ref, ...args } = tree.attrs;
      if (ref) {
        ref.current = node;
      }
      handleDirective(args, node);
    },

    nodeUpdate(tree, oldTree, node) {
      nextTick(() => {
        const { ref, ...args } = tree.attrs;
        handleDirective(args, node);
      })
    },
  });

  function handleDirective(attrs: NodeTree['attrs'], node: HTMLElement) {
    for (const attr in attrs) {
      const func = globalDirective[attr];
      func && func(attrs[attr], node);
    }
  }

  function convert(tree: Tree) {
    return structure.render(tree);
  }

  let rootTree: CompTree
  const instance = {
    useComponent,
    useDirective,
    convert,
    /**
     * 渲染组件，并挂载到父节点上
     * @param tree 
     * @param parent 
     */
    render(tree: CompTree, parent?: HTMLElement) {
      rootTree = tree;
      const nodes = convert(tree);
      parent && parent.append(...nodes);
      return nodes;
    },
    /**
     * 卸载应用
     */
    unmount() {
      structure.destroyComp(rootTree);
    },
    /**
     * 转为字符串
     * @param tree 
     * @returns 
     */
    renderToString(tree: TreeValue) {
      return jsxToString(tree, {
        intercept(tree) {
          if (!isTree(tree)) return;
          const { tag, attrs } = tree;
          if (isString(tag)) {
            const comp = globalComp[tag];
            if (comp) return tree.tag = comp;

            for (const attr in attrs) {
              const directive = globalDirective[attr];
              directive && delete attrs[attr];
            }
          }
        },
        currentCompTree(tree) {
          customForEach(hooksValues, hook => {
            hook.setInstance(tree);
          })
        },
      });
    },
    /**
     * 插件绑定
     * @param plugin 
     * @returns 
     */
    use(plugin: { install: (instance) => void }) {
      plugin.install(instance);
      return instance;
    },
    /**
     * 强制更新组件
     * @param tree 
     * @returns 
     */
    compUpdate(tree: CompTree) {
      return stateUpdate(tree);
    },
    /**
     * 获取组件树结果
     * @param tree 
     * @returns 
     */
    compResult(tree: CompTree) {
      return structure.treeMap.get(tree);
    },
  }
  Object.setPrototypeOf(instance, hooks);

  currentApp = instance;
  return instance;
}

/**
 * 获取当前实例
 * @returns 
 */
export function getCurrnetInstance() {
  return currentApp;
}
