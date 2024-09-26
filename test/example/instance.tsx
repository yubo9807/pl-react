import { createApp, h, useLayoutEffect, useRef, useState } from "~/core"

function App() {

  const sub1Ref = useRef<HTMLElement>();
  const sub2Ref = useRef<HTMLElement>();
  useLayoutEffect(() => {
    const sub1 = createApp();
    sub1.render(<Sub1 />, sub1Ref.current);

    const sub2 = createApp();
    sub2.render(<Sub2 />, sub2Ref.current);
  }, [])

  return <div>
    <div ref={sub1Ref} className='sub1'></div>
    <div ref={sub2Ref} className='sub2'></div>
  </div>
}

function Sub1() {
  const [count, setCount] = useState(0);
  return <div>
    Sub1
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
    {count % 2 !== 0 && <Comp1 />}
  </div>
}

function Comp1() {
  const [count, setCount] = useState(0);
  return <div>
    Comp1
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
  </div>
}

function Sub2() {
  const [count, setCount] = useState(0);
  return <div>
    Sub2
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
    {count % 2 !== 0 && <Comp2 />}
  </div>
}

function Comp2() {
  const [count, setCount] = useState(0);
  return <div>
    Comp2
    {count}
    <button onclick={() => setCount(count + 1)}>++</button>
  </div>
}


export default App;