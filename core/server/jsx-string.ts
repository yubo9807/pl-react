import { isFragment, isTree, joinClass } from "../tools";
import { BaseComponent, CompTree, NodeTree, TreeValue } from "../tools/type";
import { customForEach, isClass, isObject, isString } from "../utils";
export { h, Fragment } from "../tools";

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
export class JsxToString {

  option: Option
  constructor(option: Option = {}) {
    this.option = option;
  }

  render(tree: TreeValue) {
    if (!isTree(tree)) {
      return tree;
    }
  
    const { tag } = tree;
    if (isString(tag)) {
      return this.toReal(tree as NodeTree);
    }
  
    if (isFragment(tag)) {
      return this.toFragment(tree.children);
    }
  
    return this.createComp(tree as CompTree);
  }

  toReal(tree: NodeTree) {
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
  
    return `<${tag}${attrStr}>${this.toFragment(children)}</${tag}>`;
  }

  toFragment(children: TreeValue[]) {
    let text = '';
    customForEach(children, tree => {
      text += this.render(tree);
    })
    return text;
  }

  createComp(tree: CompTree) {
    const { currentCompTree } = this.option;
    currentCompTree?.(tree);

    const { tag, attrs, children } = tree;
    const props = { ...attrs, children };
  
    let comp = tag as BaseComponent;
  
    if (isClass(tag)) {
      // 将类组件变为函数组件
      const t = new tag(props);
      comp = t.render();
    }
  
    return this.render(comp(props));
  }
}