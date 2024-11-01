import { Fragment, h, useMemo, useState } from "~/core"
import { createRouter, Router, Route, useRouter, Link, Helmet } from "~/core/router";

function App() {
  const [child, setChild] = useState();

  useMemo(() => {
    return createRouter({
      fristUrl: location.href.replace(location.origin, ''),
      routes: [
        { path: /^\/home(\/?|)$/, element: <Home /> },
        { path: /^\/about(\/?|\/.+)$/, element: <About /> },
        { path: /./, element: <h1>404</h1> }
      ],
      controls(route) {
        setChild(route.element);
      },
    });
  }, [])

  const router = useRouter();

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

    <Router loading={<div>loading</div>}>
      <Route path='/home' element={Home} exact={false} />
      <Route path='/about' element={About} />
      <Route path={/./} element={() => <h1>404</h1>} />
    </Router>
  </div>
}

function Home(props) {
  const [count, setCount] = useState(0);

  return <div>
    <Helmet config={{
      'helmet_title': <title>首页</title>
    }} />
    Home
    <button onclick={() => setCount(count + 1)}>{count}</button>

    <nav>
      <Link to='/home'>home</Link>
      &nbsp;
      <Link to='/home/about'>about</Link>
      &nbsp;
    </nav>
    {/* <div> */}
      <Router prefix="/home">
        <Route path='/about' element={About} />
      </Router>
    {/* </div> */}
  </div>
}
// Home.getInitialProps = async () => {
//   await delay(1000);
//   return { count: 1 }
// }
function About() {
  const [count, setCount] = useState(0);
  return <>
    About
    <button onclick={() => setCount(count + 1)}>{count}</button>
  </>
}

export default App2;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}