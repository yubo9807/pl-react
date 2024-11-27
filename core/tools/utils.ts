import { isFragment } from './h';
import { BaseComponent, CompTree, Tree, TreeValue } from "../types";
import { customForEach, isClass, isEmpty, isEquals, isFunction, isObject } from "../utils";

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
  create  = 1,
  update  = 2,
	reserve = 3,
  remove  = 4,
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

    // 数据未发生变化
    if (isObject(val1) && isObject(val2)) {
      const { node, ...args } = val2;
			const value = val1;
      if (isEquals(value, args)) {
				if (isTree(value) && isCompTree(value)) {
					collect.push({ type: DiffType.reserve, ...item });
				}
				continue;
			}
    }
    if (isEquals(val1, val2)) continue;

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
