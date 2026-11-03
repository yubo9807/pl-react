import { h } from "~/core"

export default function Home() {
  return <div>home</div>
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

Home.getInitialProps = async (props) => {
  await delay(1000);
  return Promise.reject('lllll')
}