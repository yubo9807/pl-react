import { forwardRef, h, useImperativeHandle, useRef, useState } from "~/core"
import { RefItem } from "~/core/hooks"

type CompExpose = {
  addCount: Function
}

function Comp(_, ref: RefItem<CompExpose>) {
  const [count, setCount] = useState(0);

  useImperativeHandle(ref, () => {
    return {
      addCount() {
        setCount(count + 1);
      },
    }
  })

  return <div>Comp: {count}</div>
}

const Forward = forwardRef(Comp);

function App() {
  const compRef = useRef<CompExpose>();

  return <div>
    App:
    <button onclick={() => compRef.current.addCount()}>++</button>
    <Forward ref={compRef} />
  </div>
}

export default App;
