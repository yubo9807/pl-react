
import { h } from '~/core';
import App from './app';
import { createApp } from '~/core/instance/app';

const app = createApp();

app.render(<App />, document.getElementById('root'));
