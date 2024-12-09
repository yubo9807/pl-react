import { h } from '../tools';
import { CompTree } from '../types';
import { AnyObj, ExcludeKey } from '../utils';
import { createApp } from './instace';

export * from './instace';
export * from './dom';

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
) {
  const ref = { current: {} as any };
  const nodes = createApp().render(h(Comp, { ref, ...props }) as CompTree, parent);
  ref.current._nodes = nodes;
  return ref.current;
}
