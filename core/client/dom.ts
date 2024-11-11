import { joinClass } from "../tools";
import { customForEach, isArray, isObject } from "../utils";

export type WithNode = HTMLElement

/**
 * 替换节点
 * @param newNodes 新节点
 * @param oldNodes 旧节点
 */
export function nodes_replaceWith(newNodes: WithNode[], oldNodes: WithNode[]) {
  customForEach(oldNodes, (node, i) => {
    const newNode = newNodes[i];
    if (newNode) {
      node.replaceWith(newNode);
    } else {
      node.remove();
    }
  });
  customForEach(newNodes, (node, i) => {
    const lastNode = newNodes[i - 1];
    lastNode.after(node);
  }, oldNodes.length);
}

/**
 * 追加节点 
 * @param newNodes 
 * @param lastNode 
 */
export function nodes_after(newNodes: WithNode[], lastNode: WithNode) {
  lastNode.after(...newNodes);
}

/**
 * 删除节点
 * @param newNodes 
 */
export function nodes_remove(newNodes: WithNode[]) {
  customForEach(newNodes, node => {
    node.remove();
  });
}

/**
 * 属性赋值
 * @param el 
 * @param key 
 * @param value 
 */
export function attrAssign(el: HTMLElement, key: string, value: any) {
  if (key === 'style' && isObject(value)) {
    for (const s in value) {
      el[key][s] = value[s];
    }
    return;
  }

  if (key === 'className' && isArray(value)) {
    value = joinClass(...value);
  }
  el[key] = value;
}