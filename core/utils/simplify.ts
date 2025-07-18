
export function len(value: any) {
  return value.length;
}

export function throwError(msg: string) {
  throw new Error(msg);
}

export function printError(msg: string) {
  console.error(msg);
}

/**
* 在微任务中执行函数
* @param func 
*/
export function nextTick<T extends () => void>(func?: T): Promise<ReturnType<T>> {
  // @ts-ignore
  return Promise.resolve().then(func);
}
