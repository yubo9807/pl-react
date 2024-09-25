import { h, useMemo, useState } from "~/core"
import { createRouter } from "~/core/router";
import { nextTick } from "~/core/utils";

function App() {
  const [child, setChild] = useState();

  const router = useMemo(() => {
    return createRouter({
      routes: [
        { path: '/home', element: <Home /> },
        { path: '/about', element: <About /> },
        { element: <h1>404</h1> }
      ],
      controls(route) {
        nextTick(() => {
          setChild(route.element);
        })
      },
    });
  }, [])

  return <div className='111'>
    <nav>
      <a onclick={() => router.push('/home')}>home</a>
      &nbsp;
      <a onclick={() => router.push('/about')}>about</a>
    </nav>
    {child}
  </div>
}

function Home() {
  return <div>Home</div>
}
function About() {
  return <div>About</div>
}

export default App;