import { AnyObj, customForEach, throwError } from "../utils";
import { h, Fragment, getCurrnetInstance, useEffect, useLayoutEffect } from "..";
import type { CompTree } from "../types";

/**
 * 创建上下文
 * @param initial 
 * @returns 
 */
export function createContext<T extends AnyObj>(initial = {} as T) {

  const treeSet = new Set<CompTree>();
  let   lock    = true;

  function Provider(props: Partial<T>) {

    const { children, ...args } = props;
    Object.assign(initial, args);

    useEffect(() => {
      // 在组件卸载时，清除数据
      return () => {
        customForEach(Object.keys(args), key => {
          delete initial[key];
        })
      }
    }, []);

    useEffect(() => {
      lock = true;        // 开始搜集子组件
      treeSet.forEach(tree => {
        // 强制更新用到 context 数据的子组件
        getCurrnetInstance().refresh(tree);
      })
    })
    useLayoutEffect(() => {
      // 保证子组件都已经执行过 useContext
      lock = false;        // 结束搜集子组件
    })

    return h(Fragment, {}, ...children as any[]);
  }

  Provider.inject = () => {
    return { ...initial };
  }

  /**
    * 搜集子组件实例
    * @param tree 
    * @returns 
    */
  Provider.append = (tree: CompTree) => {
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
  Provider.replace = (newTree: CompTree, oldTree: CompTree) => {
    if (treeSet.has(oldTree)) {
      treeSet.add(newTree);
      treeSet.delete(oldTree);
    }
  };

  return Provider;
}
