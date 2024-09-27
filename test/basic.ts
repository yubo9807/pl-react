import { createApp } from '~/core';
import { MyComp } from './components/my-comp';

const app = createApp();
app.useComponent('my-comp', MyComp);

export default app;