import { defineStore, Fragment, h, useState, useStore } from "~/core";

type State = {
  count: number
}
type Action = {
  type: "add",
}
function reducer(state: State, action: Action) {
  switch (action.type) {
    case "add": {
      return {
        ...state,
        count: state.count + 1,
      };
    }
    default:
      return state;
  }
}

const testStore = defineStore(reducer, { count: 0 });

function App() {
  const [bool, setBool] = useState(true);
  return <>
    {bool ? <Comp1 /> : <Comp2 />}
    <div>
      <button onclick={() => setBool(!bool)}>change</button>
    </div>
  </>;
}

function Comp1() {
  const { state, dispatch } = useStore(testStore);

  return <div>
    Comp1:
    {state.count}
    <button onclick={() => dispatch({ type: 'add' })}>++</button>
  </div>
}

function Comp2() {
  const { state, dispatch } = useStore(testStore);

  return <div>
    Comp2:
    {state.count}
    <button onclick={() => dispatch({ type: 'add' })}>++</button>
  </div>
}

export default App;