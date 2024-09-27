import { customForEach } from "../utils"
import { h, Fragment, isCompTree, isTree } from "../tools";
import { getCurrnetInstance, useLayoutEffect, useMemo } from '..'
import type { CompTree, Tree, TreeValue } from "../tools/type"

type Key = string | Function
type BackupData = { tree: TreeValue, nodes: HTMLElement[] }
const keepAliveMap = new Map<Symbol, Map<Key, BackupData>>();

/**
 * 获取 keepAlive 备份数据
 * @param tree 
 * @returns 
 */
export function getKeepAliveBackup(tree: CompTree) {
  for (const val of keepAliveMap.values()) {
    const backup = val.get(tree.attrs.key || tree.tag);
    if (backup) return backup;
  }
}

type Props = {
  include?:  Key[]
  exclude?:  Key[]
  max?:      number
  children?: Tree[]
}
export function KeepAlive(props: Props) {

  const { children } = props;

  const id = useMemo(() => Symbol('keep_alive'), []);
  const map = useMemo(() => {
    const val = keepAliveMap.get(id);
    if (val) return val;
    const map = new Map<Key, BackupData>();
    keepAliveMap.set(id, map);
    return map;
  })

  const { include, exclude, max } = props;
  useLayoutEffect(() => {
    customForEach(children, tree => {
      if (!(isTree(tree) && isCompTree(tree))) return;

      const result = getCurrnetInstance().getCompResult(tree);
      const { attrs, tag } = tree;
      const key = attrs.key || tag;
      if (exclude && exclude.includes(key)) return;
      if (include && !include.includes(key)) return;
      map.set(key, result);
    })

    // 超出缓存最大数，清除最早的数据
    const len = map.size - max;
    if (len) {
      const keys = map.keys();
      for (let i = 0; i < len; i++) {
        map.delete(keys[i])
      }
    }
  })

  useLayoutEffect(() => {
    return () => {
      keepAliveMap.delete(id);
    }
  }, [])

  return h(Fragment, {}, ...children);
}