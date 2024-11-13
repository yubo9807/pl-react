import { h, useState } from "~/core";

export default () => {
  const [count, setCount] = useState(1000);

  return <div>
    <my-comp />
    <p bank-num>{count}</p>
    <button onclick={() => setCount(count + count * 10)}>click</button>
  </div>
}
