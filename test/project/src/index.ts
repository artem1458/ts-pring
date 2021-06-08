import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const context = container.getOrInitContext<IBeans>({
    name: 'ApplicationContext',
});

console.log(context.getBeans());

import { xz } from './IBeans';

console.log(xz + 123);
