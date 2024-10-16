import { customForEach, isObject, isString, isEmpty, isEquals, isArray } from "../utils";
import { attrAssign, nodes_after, nodes_remove, nodes_replaceWith, WithNode } from "./dom";
import { isFragment, isCompTree, isTree, diffObject, DiffType, joinClass, compExec } from "../tools";
import { getKeepAliveBackup } from "../components/keep-alive";
import type { TreeValue, CompTree, NodeTree } from "../types";

type Option = {
  /**
   * 组件/节点树拦截
   * @param tree 
   * @returns 
   */
  intercept?: (tree: TreeValue) => void

  /**
   * 当前组件
   * @param tree 
   */
  currentCompTree?: (tree: CompTree) => void
  /**
   * 组件树替换
   * @param newTree 
   * @param oldTree 
   */
  compTreeReplace?: (newTree: CompTree, oldTree: CompTree) => void

  /**
   * 组件刷新
   * @param tree 
   * @param node 
   */
  refresh?: (tree: CompTree, childTree: TreeValue, nodes: WithNode[]) => void
  /**
   * 组件执行结束
   * @param tree 
   */
  created?: (tree: CompTree, childTree: TreeValue) => void
  /**
   * 组件挂载
   * @param tree 
   * @param node 
   */
  mount?: (tree: CompTree, childTree: TreeValue, nodes: WithNode[]) => void
  /**
   * 组件卸载
   * @param tree 
   * @param node 
   */
  unmount?: (tree: CompTree, node: WithNode[]) => void

  /**
   * 节点元素挂载
   * @param tree 
   * @param node 
   */
  nodeMount?: (tree: NodeTree, node: HTMLElement) => void
}


export class JsxToNodes {

  option: Option
  constructor(option: Option = {}) {
    this.option = option;
  }

  /**
   * 将组件树创建为真实DOM树
   * @param tree 
   * @returns 
   */
  render(tree: TreeValue): WithNode[] {
    const { intercept } = this.option;
    intercept?.(tree);

    if (!isObject(tree)) {
      // @ts-ignore
      return [document.createTextNode(tree as string)];
    }

    const { tag } = tree;
    if (isString(tag)) {
      return [this.toReals(tree as NodeTree)];
    }

    if (isFragment(tag)) {
      return this.toFragment(tree as CompTree);
    }

    return this.createComp(tree as CompTree);
  }

  /**
   * 创建DOM
   * @param tree 
   * @returns 
   */
  toReals(tree: NodeTree) {
    const { nodeMount } = this.option;

    const { tag, attrs, children } = tree;
    const el = document.createElement(tag);

    for (const key in attrs) {
      attrAssign(el, key, attrs[key]);
    }

    customForEach(children, val => {
      const nodes = this.render(val);
      el.append(...nodes);
    });

    nodeMount?.(tree, el);
    return el;
  }

  fragmentMap = new Map<TreeValue,  WithNode[]>();
  /**
   * 创建节点片段
   * @param tree 
   * @returns 
   */
  toFragment(tree: CompTree) {
    const childNodes: WithNode[] = [];
    customForEach(tree.children, val => {
      const nodes = this.render(val);
      childNodes.push(...nodes);
    })
    this.fragmentMap.set(tree, childNodes);

    return childNodes;
  }

  treeMap = new WeakMap<CompTree, { tree: TreeValue, nodes: WithNode[] }>();
  replaceTreeMap(newTree: CompTree, oldTree: CompTree) {
    this.option.compTreeReplace?.(newTree, oldTree);
    const backup = this.treeMap.get(oldTree)!;
    this.treeMap.set(newTree, backup);
    this.treeMap.delete(oldTree);
  }

  /**
   * 组件树执行
   * @param tree 
   * @returns 
   */
  compTreeExec(tree: CompTree) {
    const { currentCompTree, created } = this.option;
    currentCompTree?.(tree);

    const newTree = compExec(tree);
    created?.(tree, newTree);

    return newTree;
  }

  /**
   * 创建组件节点
   * @param tree 
   * @returns 
   */
  createComp(tree: CompTree) {
    const alive = getKeepAliveBackup(tree);
    if (alive) {
      this.treeMap.set(tree, alive);
      return alive.nodes;
    }

    const newTree = this.compTreeExec(tree);
    const nodes = this.render(newTree);

    this.treeMap.set(tree, { tree: newTree, nodes });

    this.option.mount?.(tree, newTree, nodes);
    return nodes;
  }

  /**
   * 销毁组件
   * @param tree 
   */
  destroyComp(tree: CompTree, isRemove = true) {
    const alive = getKeepAliveBackup(tree);
    const backup = this.treeMap.get(tree);
    const { tree: oldTree, nodes } = backup;
    if (alive) {  // 如果设置了 keepAlive，将不会触发钩子，数据也将保留
      isRemove && nodes_remove(nodes);
      return;
    }

    // 卸载子组件
    if (isTree(oldTree)) {
      customForEach(oldTree.children, childTree => {
        if (isTree(childTree) && isCompTree(childTree)) {
          this.destroyComp(childTree);
        }
      })
    }

    this.option.unmount?.(tree, nodes);
    isRemove && nodes_remove(nodes);
    this.treeMap.delete(tree);
  }

  /**
   * 更新组件树
   * @param comp 
   * @param tree 
   */
  updateComp(tree: CompTree) {
    const backup = this.treeMap.get(tree);
    if (!backup) return;

    const newTree = this.compTreeExec(tree);
    this.updateTree(newTree, backup.tree, backup.nodes); 
    backup.tree = newTree;  // 旧数据替换

    return newTree;
  }

  updateTree(newTree: TreeValue, oldTree: TreeValue, nodes: WithNode[]) {
    const self = this;

    if (isTree(newTree) && isTree(oldTree)) {

      // 节点发生变化，直接替换
      if (newTree.tag !== oldTree.tag) {
        if (isCompTree(oldTree)) {
          self.destroyComp(oldTree, false);
        }
        const newNodes = self.render(newTree);
        nodes_replaceWith(newNodes, nodes);
        return newNodes;
      }

      // 节点片段
      if (isFragment(newTree.tag)) {
        const childNodes = self.fragmentMap.get(oldTree);
        const newChildNodes: WithNode[] = [];
        customForEach(newTree.children, (newChildTree, i) => {
          const oldChildTree = oldTree.children[i];
          const oldChildNode = childNodes[i];

          // 无需更新的节点
          if (isEquals(newChildTree, oldChildTree)) {
            newChildNodes.push(oldChildNode);
            return;
          }

          let newNodes: WithNode[] = [];
          if (isEmpty(oldChildTree)) {
            // 新增节点
            newNodes = self.render(newChildTree);
            const lastChildNode = newChildNodes[i - 1];
            nodes_after(newNodes, lastChildNode);
          } else {
            // 替换节点
            const nodes = self.updateTree(newChildTree, oldChildTree, [oldChildNode]);
            newNodes.push(...nodes);
          }
          newChildNodes.push(...newNodes);
        })

        customForEach(childNodes, node => {
          node.remove();
        }, newTree.children.length);
        self.fragmentMap.set(newTree, newChildNodes);
        self.fragmentMap.delete(oldTree);
        return newChildNodes;
      }

      // 普通节点
      if (isString(newTree.tag)) {
        const attrs = diffObject(newTree.attrs, oldTree.attrs);
        const node = nodes[0];
        customForEach(attrs, val => {
          const { type, key } = val;
          let value = val.newValue;
          if (type === DiffType.remove) {
            // 删除属性
            node.removeAttribute(key === 'className' ? 'class' : key);
          } else {
            // 创建，更新属性
            attrAssign(node, key, value);
          }
        })

        const childs = diffObject(newTree.children, oldTree.children);
        const removeNodes: HTMLElement[] = [];
        customForEach(childs, val => {
          const { type, key, newValue, oldValue } = val;
          const childNode = node.childNodes[key];

          if (type === DiffType.reserve) {
            // 需要替换回旧数据的子组件
            newTree.children[key] = oldValue;
          } else if (type === DiffType.remove) {
            if (isTree(oldValue) && isCompTree(oldValue)) {
              // 卸载子组件
              self.destroyComp(oldValue);
            } else {
              // 删除子节点
              removeNodes.push(childNode);
            }
          } else if (type === DiffType.create) {
            // 添加子节点
            const newNodes = self.render(newValue);
            node.append(...newNodes);
          } else {
            // 组件
            if (isTree(oldValue) && isCompTree(oldValue)) {
              self.updateTree(newValue, oldValue, self.treeMap.get(oldValue).nodes);
            } else {
              self.updateTree(newValue, oldValue, [childNode]);
            }
          }
        })

        customForEach(removeNodes, node => node.remove());

        return nodes;
      }

      // 组件更新
      if (isCompTree(newTree)) {
        self.replaceTreeMap(newTree, oldTree as CompTree);
        const backup = self.treeMap.get(newTree);
        const tree = self.compTreeExec(newTree);
        const newNodes = self.updateTree(tree, backup.tree, nodes);
        backup.tree = tree;
        self.option.refresh?.(newTree, tree, nodes);
        return newNodes;
      }

    }

    // 删除节点
    if (isEmpty(newTree)) {
      nodes_remove(nodes);
      return [];
    }

    // 其他情况
    const newNodes = self.render(newTree);
    nodes_replaceWith(newNodes, nodes);

    return newNodes;
  }

}
