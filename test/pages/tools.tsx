import { h, useState } from "~/core";

export default function Tools() {
  const [count, setCount] = useState(0);
  return <div>
    tools
    {count}
    <button onclick={() => setCount(count+1)}>click</button>
  </div>
}


function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

Tools.getInitialProps = async (props) => {
  await delay(1000);
  return Promise.reject('lllll')
}