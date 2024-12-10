import { CompTree, TreeValue } from "../types";

export type KeepAliveKey = string | Function
export type KeepAliveBackupData = { tree: TreeValue, nodes: HTMLElement[] }
export const keepAliveMap = new Map<Symbol, Map<KeepAliveKey, KeepAliveBackupData>>();

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
