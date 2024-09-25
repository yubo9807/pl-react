import { AnyObj, customForEach, throwError } from "../utils";
import { h, Fragment, getCurrnetInstance, useEffect, useLayoutEffect } from "../client";
import type { CompTree } from "../common/type";

/**
 * 创建上下文
 * @param initial 
 * @returns 
 */
export function createContext<T extends AnyObj>(initial = {} as T) {

  const treeSet = new Set<CompTree>();
  let   lock    = true;

  /**
   * 搜集子组件实例
   * @param tree 
   * @returns 
   */
  function append(tree: CompTree) {
    if (!lock && !treeSet.has(tree)) {
      throwError(`The component '${tree.tag.name}' is not wrapped by the Provider`);
      return;
    }
    treeSet.add(tree);
  }

  /**
   * 子组件实例替换
   * @param newTree 
   * @param oldTree 
   */
  function replace(newTree: CompTree, oldTree: CompTree) {
    if (treeSet.has(oldTree)) {
      treeSet.add(newTree);
      treeSet.delete(oldTree);
    }
  }

  function Provider(props: Partial<T>) {

    const { children, ...args } = props;
    Object.assign(initial, args);

    // 组件卸载，清除数据
    useEffect(() => {
      return () => {
        customForEach(Object.keys(args), key => {
          delete initial[key];
        })
      }
    }, []);

    // 更新子组件
    useEffect(() => {
      lock = true;        // 开始搜集子组件
      treeSet.forEach(tree => {
        // 强制更新组件
        getCurrnetInstance().refresh(tree);
      })
    })
    useLayoutEffect(() => {
      lock = false;        // 结束搜集子组件
    })

    return h(Fragment, {}, ...children as any[]);
  }

  function inject() {
    return { ...initial };
  }

  return {
    Provider,
    inject,
    append,
    replace,
  }
}
