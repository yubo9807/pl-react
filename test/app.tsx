import state from './example/state';
import effect from './example/effect';
import expose from './example/expose'
import context from './example/context';
import reducer from './example/reducer';
import keepAlive from './example/keep-alive';
import store from './example/store';
import router from './example/router';
import instance from './example/instance';
import directive from './example/directive';
import { useComponent } from '~/core';

export default router;

import { MyComp } from './components/my-comp';
const a = useComponent(MyComp, {})
console.log(a)
document.body.appendChild(a._nodes[0]);
