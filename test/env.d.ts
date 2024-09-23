import { IntrinsicElements as PlReactIntrinsicElements } from '~/core/jsx';
import { MyComp } from './components/my-comp';

declare global {
  namespace JSX {
    interface IntrinsicElements extends PlReactIntrinsicElements {
      'my-comp': Parameters<typeof MyComp>[0]
    }
  }
}
