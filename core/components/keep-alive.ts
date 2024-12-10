import { customForEach } from "../utils"
import { h, Fragment,  getCurrnetInstance, useLayoutEffect, useMemo } from "../instace";
import { isCompTree, isTree, keepAliveMap, KeepAliveKey, KeepAliveBackupData } from '../tools'
import type { Tree } from "../types"

type Props = {
  include?:  KeepAliveKey[]
  exclude?:  KeepAliveKey[]
  max?:      number
  children?: Tree[]
}
export function KeepAlive(props: Props) {

  const { children } = props;

  const id = useMemo(() => Symbol('keep_alive'), []);
  const map = useMemo(() => {
    const val = keepAliveMap.get(id);
    if (val) return val;
    const map = new Map<KeepAliveKey, KeepAliveBackupData>();
    keepAliveMap.set(id, map);
    return map;
  })

  const { include, exclude, max } = props;
  useLayoutEffect(() => {
    customForEach(children, tree => {
      if (!(isTree(tree) && isCompTree(tree))) return;

      const result = getCurrnetInstance().compResult(tree);
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