import { IntrinsicElements as SourceIntrinsicElements } from '~/core/jsx';
import { MyComp } from './components/my-comp';

type JoinDirective = {
  [K in keyof SourceIntrinsicElements]: SourceIntrinsicElements[K] & {
    'bank-num'?: boolean
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends JoinDirective {
      'my-comp': Parameters<typeof MyComp>[0]
    }
  }
}
