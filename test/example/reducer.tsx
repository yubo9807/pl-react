import { Fragment, h, useReducer } from "~/core"

type State = {
  count: number
}
type Action = {
  type: 'add' | 'sub'
}
function reduceer(state: State, action: Action) {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        count: state.count + 1,
      }
    case 'sub':
      return {
        ...state,
        count: state.count - 1,
      }
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reduceer, { count: 0 });
  const [state2, dispatch2] = useReducer(reduceer, { count: 0 }, (state) => {
    state.count += 10;
    return state;
  });

  return <>
    {state.count}
    {state2.count}
    <button onclick={() => {
      dispatch({ type: 'add' });
      dispatch2({ type: 'sub' });
    }}>add</button>
  </>
}

export default App;
