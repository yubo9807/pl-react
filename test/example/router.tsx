import { h, useMemo, useState } from "~/core"
import { createRouter, Router, Route, useRouter, Link } from "~/core/router";

function App() {
  const [child, setChild] = useState();

  const router = useMemo(() => {
    return createRouter({
      routes: [
        { path: /^\/home(\/?|)$/, element: <Home /> },
        { path: /^\/about(\/?|\/.+)$/, element: <About /> },
        { element: <h1>404</h1> }
      ],
      controls(route) {
        setChild(route.element);
      },
    });
  }, [])

  return <div className='111'>
    <nav>
      <a onclick={() => router.push('/home')}>home</a>
      &nbsp;
      <a onclick={() => router.push('/about')}>about</a>
      &nbsp;
      <a onclick={() => router.push('/123')}>404</a>
    </nav>
    {child}
  </div>
}

function App2() {
  const router = useRouter();

  return <div>
    <nav>
      <Link to='/home'>home</Link>
      &nbsp;
      <Link to='/about'>about</Link>
      &nbsp;
      <Link to='/123' onClick={(to, next) => {
        console.log(to);
        next('/404');
      }}>404</Link>
    </nav>
    <Router>
      <Route path='/home' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route element={<h1>404</h1>} />
    </Router>
  </div>
}

function Home() {
  const [count, setCount] = useState(0);
  return <div>Home
    <button onclick={() => setCount(count + 1)}>{count}</button>
  </div>
}
function About() {
  const [count, setCount] = useState(0);
  return <div>About
    <button onclick={() => setCount(count + 1)}>{count}</button>
  </div>
}

export default App2;