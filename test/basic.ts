import { createApp } from '~/core';
import { MyComp } from './components/my-comp';
import { initRouter } from '~/core/router';

// initRouter({ base: '/admin' });
const app = createApp();
app.useComponent('my-comp', MyComp);
app.useDirective('bank-num', (value, node) => {
  const reg = /(?=(\B)(\d{3})+$)/g;
  const str = node.textContent.replace(reg, ',');
  node.textContent = str;
})

export default app;