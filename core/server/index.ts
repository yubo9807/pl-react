import { isFragment, isTree, joinClass } from "../common";
import { BaseComponent, CompTree, NodeTree, TreeValue } from "../common/type";
import { customForEach, isClass, isObject, isString } from "../utils";

/**
 * 将组件树转为字符串
 * @param tree 
 * @returns 
 */
export function renderToString(tree: TreeValue) {
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

function toFragment(children: TreeValue[]) {
  let text = '';
  customForEach(children, tree => {
    text += renderToString(tree);
  })
  return text;
}

function createComp(tree: CompTree) {
  const { tag, attrs, children } = tree;
  const props = { ...attrs, children };

  let comp = tag as BaseComponent;

  if (isClass(tag)) {
    // 将类组件变为函数组件
    const t = new tag(props);
    comp = t.render();
  }

  return renderToString(comp(props));
}