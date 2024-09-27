import app from './basic'
import { h } from '~/core';
import App from './app';

const root = document.getElementById('root');
root.innerHTML = '';
app.render(<App />, root);
