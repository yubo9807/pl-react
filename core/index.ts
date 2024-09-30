import { isClient } from './utils';
import { currentApp as clientCurrentApp } from './client';
import { currentApp as serverCurrentApp } from './server';
import type { Callback, Context, Effect, Expose, Memo, Reducer, Ref, State, Store } from './hooks';

export { Fragment, h } from './tools';
export { createApp } from './client'
export { defineStore } from './hooks';

const client = isClient();

/**
 * 获取当前实例
 * @returns 
 */
export function getCurrnetInstance(): typeof clientCurrentApp {
  // @ts-ignore
  return client ? clientCurrentApp : serverCurrentApp;
}

export const useState: State['use'] = (initialValue) => {
  return getCurrnetInstance().state.use(initialValue);
}
export const useMemo: Memo['use'] = (memo, deps) => {
  return getCurrnetInstance().memo.use(memo, deps);
}
export const useEffect: Effect['use'] = (effect, deps) => {
  return getCurrnetInstance().effect.use(effect, deps);
}
export const useLayoutEffect: Effect['use'] = (effect, deps) => {
  return getCurrnetInstance().layoutEffect.use(effect, deps);
}
export const useCallback: Callback['use'] = (callback, deps) => {
  return getCurrnetInstance().callback.use(callback, deps);
}
export const useRef: Ref['use'] = (value) => {
  return getCurrnetInstance().ref.use(value);
}
export const useContext: Context['use'] = (context) => {
  return getCurrnetInstance().context.use(context);
}
export const useImperativeHandle: Expose['use'] = (ref, handle, deps) => {
  return getCurrnetInstance().expose.use(ref, handle, deps);
}
export const useReducer: Reducer['use'] = (reducer, initialState, init) => {
  return getCurrnetInstance().reducer.use(reducer, initialState, init);
}
export const useStore: Store['use'] = (result) => {
  return getCurrnetInstance().store.use(result);
}
