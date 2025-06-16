import { h, useEffect, useState } from "~/core";
import { useRouter } from "~/core/router";

export default function Utils(props) {
  console.log(props)
  const [count, setCount] = useState(0);

  const router = useRouter();
  useEffect(() => {
    console.log('page utils')
    // setTimeout(() => {
    //   router.replace('/utils/123')
    // }, 1000)
  }, [])

  return <div>
    utils
    {count}
    <button onclick={() => setCount(count+1)}>click</button>
  </div>
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

Utils.getInitialProps = async (props) => {
  await delay(1000);
  return Promise.reject('lllll')
}