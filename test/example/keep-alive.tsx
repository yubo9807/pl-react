import { Fragment, h, KeepAlive, useState } from "~/core"

function App() {
  const [count, setCount] = useState(0);

  return <div>
    <button onclick={() => setCount(count + 1)}>++</button>
    <KeepAlive>
      {count % 2 === 0 && <Comp1 />}
      {count % 2 === 1 && <Comp2 />}
    </KeepAlive>
  </div>
}

function Comp1() {
  const [count, setCount] = useState(0);
  return <div>
    Comp1:
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
  </div>
}

function Comp2() {
  const [count, setCount] = useState(10);
  return <div>
    Comp2:
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
  </div>
}

export default App;
