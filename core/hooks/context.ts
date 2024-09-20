import { createContext } from "../instance/context";
import { AnyObj } from "../utils";
import { CompTree } from "../vdom/type";
import { BasicHook, useInstanceTips } from "./utils";

export class Context extends BasicHook<AnyObj> {

  constructor() {
    super();
    const backupFix = this.fixInstance;
    this.fixInstance = (newInstance, oldInstance) => {
      // @ts-ignore
      this.ctx && this.ctx.replace(newInstance, oldInstance);
      backupFix.call(this, newInstance, oldInstance);
    }
  }

  ctx: ReturnType<typeof createContext>

  use<T extends ReturnType<typeof createContext>>(value: T): ReturnType<T['inject']> {
    const { instance } = this;
    useInstanceTips(instance);

    this.ctx = value;
    value.append(instance as CompTree);
    return value.inject() as ReturnType<T['inject']>;
  }
}