import { Fragment, h, useContext, useState } from "~/core"
import { createContext } from "~/core/components";

const Context = createContext<{
  count: number
  add: () => void
}>();

function App() {

  const [count, setCount] = useState(0);
  function add() {
    setCount(count + 1);
  }

  return <>
    App: {count}
    <button onclick={add}>++</button>
    <Context count={count} add={add}>
      <Page />
    </Context>
  </>
}

function Page() {
  console.log('Page');
  // const data = useContext(Context);
  // console.log('Page: ', data);
  return <Comp />
}


function Comp() {
  const data = useContext(Context);
  return <div>
    Comp: 
    {data.count}
    <button onclick={data.add}>++</button>
  </div>
}

export default App;
