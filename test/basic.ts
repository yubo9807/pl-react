import { createApp } from '~/core';
import { MyComp } from './components/my-comp';
import { initRouter } from '~/core/router';

// initRouter({ base: '/admin' });
const app = createApp();
app.useComponent('my-comp', MyComp);

export default app;