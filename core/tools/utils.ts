import { isFragment } from './h';
import { BaseComponent, CompTree, Tree, TreeValue } from "./type";
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
    comp = t.render();
  }

  return comp(props);
}

export enum DiffType {
  create  = 'create',
  remove  = 'remove',
  update  = 'update',
	reserve = 'reserve',
}
type DiffObjectReturn = {
  key:      string
  type:     DiffType
  newValue: any
  oldValue: any
}[]
export function diffObject(obj1: object, obj2: object): DiffObjectReturn {
  const collect = [];
  const keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);

  for (const k of keys1) {
    const item = { key: k, newValue: obj1[k], oldValue: obj2[k] }
    // 旧对象中不存在，新增
    if (!keys2.includes(k)) {
      collect.push({ type: DiffType.create, ...item });
      continue;
    }

    // 数据未发生变化
    if (isObject(obj1[k]) && isObject(obj2[k])) {
      const { node, ...args } = obj2[k];
			const value = obj1[k];
      if (isEquals(value, args)) {
				if (isTree(value) && isCompTree(value)) {
					collect.push({ type: DiffType.reserve, ...item });
				}
				continue;
			}
    }
    if (isEquals(obj1[k], obj2[k])) continue;

    // 更新
    collect.push({ type: DiffType.update, ...item });

    if (!isObject(obj1[k]) && !isFunction(obj1[k])) {
      obj2[k] = obj1[k];
    }
  }

  for (const k of keys2) {
    if (keys1.includes(k)) continue;

    // 新对象中没有，删除
    collect.push({ type: DiffType.remove, key: k, newValue: obj1[k], oldValue: obj2[k] });
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
