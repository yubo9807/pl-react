import { Fragment, h, useEffect, useState } from "~/core"

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('effect1');
    return () => {
      console.log('cleanup1');
    }
  })

  useEffect(() => {
    console.log('effect2');
  }, [])

  useEffect(() => {
    return () => {
      console.log('cleanup3');
    }
  }, [])

  return <>
    {count}
    <button onclick={() => setCount(count + 1)}>+</button>
  </>
}

export default App;
