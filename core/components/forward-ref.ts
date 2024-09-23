import type { RefItem } from "../hooks";

/**
 * 将函数 props.ref 进行解构
 * 不明白 react 实现这个函数的意义是什么，我猜可能是：
 * 在 ref 发生改变时，子组件不会因为对比数据而重新渲染
 * @param comp 
 * @returns 
 */
export function forwardRef<F extends (...args: any[]) => any>(comp: F) {
  return function Forward(props: { ref: RefItem<unknown> } & Parameters<F>[0]) {
    const { ref, ...args } = props;
    return comp(args, ref);
  }
}
