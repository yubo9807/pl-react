import { customForEach } from "../utils";

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
  const lastNode = newNodes[newNodes.length - 1];
  customForEach(newNodes, node => {
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

export function nodes_remove(newNodes: WithNode[]) {
  customForEach(newNodes, node => {
    node.remove();
  });
}