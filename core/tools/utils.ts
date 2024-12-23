import { isFragment } from './h';
import { BaseComponent, CompTree, Tree, TreeValue } from "../types";
import { customForEach, isClass, isEmpty, isEquals, isFunction, isObject, setNestedPropertyValue } from "../utils";

export function isTree(tree: any): tree is Tree {
  return isObject(tree) && isObject(tree.attrs);
}

/**
 * 是否为组件树
 * @param tree 
 * @returns 
 */
export function isCompTree(tree: Tree): tree is CompTree {
  return !isFragment(tree.tag) && isFunction(tree.tag);
}

/**
 * 组件执行
 * @param tree 
 * @returns 
 */
export function compExec(tree: CompTree): TreeValue {
  const { tag, attrs, children } = tree;
  const props = { ...attrs, children };

  let comp = tag as BaseComponent;

  if (isClass(tag)) {
    // 将类组件变为函数组件
    const t = new tag(props);
    comp = t.render.bind(t);
  }

  return comp(props);
}

export enum DiffType {
  create  = 'create',
  update  = 'update',
	// reserve = 'reserve',
  remove  = 'remove',
}
type DiffObjectReturn = {
  key:      string
  type:     DiffType
  newValue: any
  oldValue: any
}[]
export function diffObject(newObj: object, oldObj: object): DiffObjectReturn {
  const collect = [];
  const getKeys = (o: object) => Object.keys(o);
  const keys1 = getKeys(newObj), keys2 = getKeys(oldObj);

  for (const k of keys1) {
    const val1 = newObj[k], val2 = oldObj[k];
    const item = { key: k, newValue: val1, oldValue: val2 }
    // 旧对象中不存在，新增
    if (!keys2.includes(k)) {
      collect.push({ type: DiffType.create, ...item });
      continue;
    }

    /**
     * 递归检查对象是否发生变化
     * @param tree1 
     * @param tree2 
     */
    function recursion(tree1, tree2, key = '') {
      if (isTree(tree1) && isTree(tree2)) {
        // 组件未发生变化，但需要保留原来的实例
        if (isCompTree(tree1) && isEquals(tree1, tree2)) {
          setNestedPropertyValue(newObj, key, tree2);
          return true;
        }
        key += `.children`;
        customForEach(tree1.children, (childTree1, i) => {
          const childTree2 = tree2.children[i];
          recursion(childTree1, childTree2, `${key}.${i}`);
        })
      } else {
        return isEquals(tree1, tree2);
      }
    }
    if (recursion(val1, val2, k)) continue;

    // 更新
    collect.push({ type: DiffType.update, ...item });

    if (!isObject(val1) && !isFunction(val1)) {
      oldObj[k] = val1;
    }
  }

  for (const k of keys2) {
    if (keys1.includes(k)) continue;

    // 新对象中没有，删除
    collect.push({ type: DiffType.remove, key: k, newValue: newObj[k], oldValue: oldObj[k] });
    // delete obj2[k];
  }

  return collect;
}

/**
 * 连接 class
 * @param args 剩余参数，类名
 * @returns 
 */
export function joinClass(...args: (string | (() => string))[]) {
  const results = [];
  customForEach(args, val => {
    if (isFunction(val)) val = val();
    if (!isEmpty(val)) {
      results.push(val);
    }
  })
  return results.join(' ').trim().replace(/\s+/, ' ');
}
