
import { h } from '~/core';
import App from './app';
import { createApp } from '~/core';
import { MyComp } from './components/my-comp';

const app = createApp();
app.useComponent('my-comp', MyComp);
const root = document.getElementById('root');
app.render(<App />, root);
