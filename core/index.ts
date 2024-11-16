import { getCurrnetInstance } from './client';
import type { Callback, Context, Effect, Expose, Memo, Reducer, Ref, State, Store } from './hooks';

export { Fragment, h } from './tools';
export { createApp } from './client'
export { defineStore } from './hooks';
export { getCurrnetInstance };

/**
 * 获取当前实例
 * @returns 
 */
function getHooks(): any {
  return getCurrnetInstance();
}

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
