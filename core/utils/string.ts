
/**
 * 创建一个随机 Id
 * @returns 
 */
export function createId() {
  return Number((Math.random() + '').slice(2)).toString(32);
}
