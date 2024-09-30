import { h } from "~/core";
import { PropsType } from "~/core/types";

interface Props extends PropsType {}
export function MyComp(props: Props) {
  return <div>
    <label>MyComp</label>
    <span>...</span>
  </div>
}