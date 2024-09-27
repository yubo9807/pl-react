import { customForEach, isObject } from "../utils";
import { Component, CompTree, TreeValue } from "../tools/type";
import { isCompTree } from "../tools";

const compTreeMap = new WeakMap<Component, CompTree[]>();

/**
 * 获取组件后代树
 * @param child 
 * @param collect 
 * @returns 
 */
function getChildCompTreeList(child: TreeValue, collect: CompTree[] = []) {
  if (!isObject(child)) return;
  if (isCompTree(child)) {
    collect.push(child);
  }
  customForEach(child.children, child => {
    getChildCompTreeList(child, collect);
  })
  return collect;
}

/**
 * 收集子组件树
 * @param tree 
 * @param child 
 */
export function collectChildTree(tree: CompTree, child: TreeValue) {
  const childList = getChildCompTreeList(child);
  compTreeMap.set(tree.tag, childList);
}

/**
 * 清除子组件树
 * @param tree 
 */
export function clearCompTree(tree: CompTree) {
  compTreeMap.delete(tree.tag);
}

/**
 * 获取子组件树
 * @param comp 
 * @returns 
 */
export function getCompTree(comp: Component) {
  return compTreeMap.get(comp);
}

/**
 * 获取子组件树（深度）
 * @param comp
 */
export function getCompTreeList(comp: Component, collect: CompTree[] = []) {
  const list = getCompTree(comp);
  customForEach(list, tree => {
    collect.push(tree);
    getCompTreeList(tree.tag, collect);
  })
  return collect;
}