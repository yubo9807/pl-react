import { Fragment, h, useState } from "~/core";

function App() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(() => 1);
  const [count3, setCount3] = useState(2);

  return <>
    <div>
      <button onclick={() => setCount1(count1 + 1)}>count1 ++</button>
      <span>{count1}</span>
    </div>

    <div>
      <button onclick={() => setCount2(count2 + 1)}>count2 ++</button>
      <span>{count2}</span>
    </div>

    <div>
      <button onclick={() => setCount3((num) => ++num)}>count3 ++</button>
      <span>{count3}</span>
    </div>
  </>
}

export default App;
