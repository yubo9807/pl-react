# Pl React

一个用来搭建用户界面的微型前端框架。

> 该库不依赖于任何其他库，与 React 没有任何关系，只是在 API 命名上大多数一致。

## Install

`npm install pl-react`

## Use

```tsx
import { h, createApp, useState } from 'pl-react';

function App() {
  const [count, setCount] = useState(0);

  return <div>
    <h1>{count}</h1>
    <button onclick={() => setCount(count + 1)}>click</button>
  </div>
}

const app = createApp();
app.render(<App />, document.getElementById('root'));
```
