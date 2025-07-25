import { AnyObj, ExcludeKey } from '../utils';
import { h } from '../tools';
import { createApp, getCurrnetInstance } from './instace';
import type { Callback, Context, Effect, Expose, Memo, Reducer, Ref, State, Store } from '../hooks';
import type { CompTree } from '../types';

/**
 * 获取当前实例
 * @returns 
 */
const getHooks: any = getCurrnetInstance;

// #region hooks
export const useState: State['use'] = (initialValue) => {
  return getHooks().state.use(initialValue);
}
export const useMemo: Memo['use'] = (memo, deps) => {
  return getHooks().memo.use(memo, deps);
}
export const useEffect: Effect['use'] = (effect, deps) => {
  return getHooks().effect.use(effect, deps);
}
export const useLayoutEffect: Effect['use'] = (effect, deps) => {
  return getHooks().layoutEffect.use(effect, deps);
}
export const useCallback: Callback['use'] = (callback, deps) => {
  return getHooks().callback.use(callback, deps);
}
export const useRef: Ref['use'] = (value) => {
  return getHooks().ref.use(value);
}
export const useContext: Context['use'] = (context) => {
  return getHooks().context.use(context);
}
export const useImperativeHandle: Expose['use'] = (ref, handle, deps) => {
  return getHooks().expose.use(ref, handle, deps);
}
export const useReducer: Reducer['use'] = (reducer, initialState, init) => {
  return getHooks().reducer.use(reducer, initialState, init);
}
export const useStore: Store['use'] = (result) => {
  return getHooks().store.use(result);
}
// #endregion


export type ComponentExpose<C extends (p: AnyObj) => any> = Parameters<C>[0]['ref']['current']
type UseComponentResult<C extends (p: AnyObj) => any> = ComponentExpose<C> & { _nodes: HTMLElement[] }
/**
 * 直接使用一个组件
 * @param Comp 
 * @param props 
 * @param parent 
 * @returns 
 */
export function useComponent<C extends (p: AnyObj) => any>(
  Comp:    C,
  props:   ExcludeKey<Parameters<C>[0], 'ref'>,
  parent?: HTMLElement,
): UseComponentResult<C> {
  const ref = { current: {} as UseComponentResult<C> };
  const nodes = createApp().render(h(Comp, { ref, ...props }) as CompTree, parent);
  ref.current._nodes = nodes;
  return ref.current;
}

export * from './instace';
export { h, Fragment } from '../tools';
export { defineStore } from '../hooks';
