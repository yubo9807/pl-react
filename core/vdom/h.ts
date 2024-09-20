import { isEmpty } from "../utils";
import { Children, PropsType, Tag } from "./type";

export function h(tag: Tag, attrs: PropsType = {}, ...children: Children) {
  attrs ||= {};
  const tree = {
    tag,
    attrs,
    children: (attrs.children || children).filter(val => !isEmpty(val)),
  }
  return tree;
}

export function Fragment() {}
// const FragmentMark = Symbol('Fragment');
// Fragment[FragmentMark] = FragmentMark;

export function isFragment(tag: any): tag is typeof Fragment {
  // return tag && tag[FragmentMark] === FragmentMark;
  return tag === Fragment;
}