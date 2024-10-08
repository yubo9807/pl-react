import { isEmpty, len } from "../utils";
import { Children, PropsType, Tag } from "../types";

export function h(tag: Tag, attrs: PropsType = {}, ...children: Children) {
  attrs ||= {};
  const tree = {
    tag,
    attrs,
    children: (attrs.children || children).filter(val => !isEmpty(val)),
  }

  // 保证节点片段中至少有一个节点，保证当中的节点能够正常更新
  if (isFragment(tag) && !len(tree.children)) {
    tree.children.push('');
  }

  return tree;
}

export function Fragment() {}

export function isFragment(tag: any): tag is typeof Fragment {
  return tag === Fragment;
}