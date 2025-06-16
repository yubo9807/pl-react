import { Fragment, h, useEffect, useMemo, useState } from "~/core"
import { createRouter, Router, Route, useRouter, Link, Helmet } from "~/core/router";

// function App() {
//   const [child, setChild] = useState();

//   useMemo(() => {
//     return createRouter({
//       fristUrl: location.href.replace(location.origin, ''),
//       routes: [
//         { path: /^\/home(\/?|)$/, element: <Home /> },
//         { path: /^\/about(\/?|\/.+)$/, element: <About /> },
//         { path: /./, element: <h1>404</h1> }
//       ],
//       controls(route) {
//         setChild(route.element);
//       },
//     });
//   }, [])

//   const router = useRouter();

//   return <div className='111'>
//     <nav>
//       <a onclick={() => router.push('/home')}>home</a>
//       &nbsp;
//       <a onclick={() => router.push('/about')}>about</a>
//       &nbsp;
//       <a onclick={() => router.push('/123')}>404</a>
//     </nav>
//     {child}
//   </div>
// }


function App2() {
  return <div>
    <nav>
      <Link to='/home'>home</Link>
      &nbsp;
      <Link to='/utils'>utils</Link>
      &nbsp;
      <Link to='/tools'>tools</Link>
      &nbsp;
      <Link to='/123' onClick={(to, next) => {
        console.log(to);
        next('/404');
      }}>404</Link>
    </nav>

    <Router loading={() => <div>loading</div>}>
      <Route path='/home' element={() => import('../pages/home')} />
      <Route path='/utils' element={() => import('../pages/utils')} exact={false} />
      <Route path='/tools' element={() => import('../pages/tools')} />
      <Route path={/./} element={() => <h1>404</h1>} />
    </Router>
  </div>
}


function About() {
  const [count, setCount] = useState(0);
  return <>
    About
    <button onclick={() => setCount(count + 1)}>{count}</button>
  </>
}

export default App2;

