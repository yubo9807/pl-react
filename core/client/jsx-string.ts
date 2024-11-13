import { compExec, isFragment, isTree, joinClass } from "../tools";
import { CompTree, NodeTree, TreeValue } from "../types";
import { customForEach, isObject, isString } from "../utils";

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

}
export function jsxToString(tree: TreeValue, option: Option = {}) {

  const { intercept, currentCompTree } = option;

  function render(tree: TreeValue) {
    intercept?.(tree);

    if (!isTree(tree)) {
      return tree;
    }
  
    const { tag } = tree;
    if (isString(tag)) {
      return toReal(tree as NodeTree);
    }
  
    if (isFragment(tag)) {
      return toFragment(tree.children);
    }
  
    return createComp(tree as CompTree);
  }

  /**
   * 单节点
   * @param tree 
   * @returns 
   */
  function toReal(tree: NodeTree) {
    const { tag, attrs, children } = tree;
    let attrStr = '';
  
    for (const attr in attrs) {
      let value = attrs[attr];
  
      if (attr.startsWith('on')) continue;
  
      if (['innerHTML', 'innerText', 'textContent'].includes(attr)) {
        children[0] = value;
        continue;
      }
  
      if (attr === 'className') {
        attrStr += ` class="${joinClass(...[value].flat())}"`;
        continue;
      }
  
      if (attr === 'style' && isObject(value)) {
        value = JSON.stringify(value).slice(1, -1).replace(/"/g, '').replace(/,/g, ';');
      }
  
      attrStr += ` ${attr}="${value}"`;
    }
  
    return `<${tag}${attrStr}>${toFragment(children)}</${tag}>`;
  }


  /**
   * 节点片段
   * @param children 
   * @returns 
   */
  function toFragment(children: TreeValue[]) {
    let text = '';
    customForEach(children, tree => {
      text += render(tree);
    })
    return text;
  }


  /**
   * 组件
   * @param tree 
   * @returns 
   */
  function createComp(tree: CompTree) {
    currentCompTree?.(tree);
    return render(compExec(tree));
  }

  return render(tree);
}