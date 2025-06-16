import { h, useState } from "~/core";

export default function() {
  const [count, setCount] = useState(0);
  return <div>
    tools
    {count}
    <button onclick={() => setCount(count+1)}>click</button>
  </div>
}