ember-functions-as-modifiers-polyfill
==============================================================================


[![npm version](https://badge.fury.io/js/ember-functions-as-modifiers-polyfill.svg)](https://badge.fury.io/js/ember-functions-as-modifiers-polyfill)
[![CI](https://github.com/NullVoxPopuli/ember-functions-as-modifiers-polyfill/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/NullVoxPopuli/ember-functions-as-modifiers-polyfill/actions/workflows/ci.yml)


Use plain functions as modifiers.
Polyfill for [RFC: 757 | Default Modifier Manager](https://github.com/emberjs/rfcs/pull/757)

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.25 or above
* Ember CLI v3.25 or above
* Node.js v14 or above
* ember-auto-import v1 or above
* embroider-optimized


Installation
------------------------------------------------------------------------------

```
ember install ember-functions-as-modifiers-polyfill
```


Usage
------------------------------------------------------------------------------

Define a function (doesn't have to be in a component)


```js
import Component  from '@glimmer/component';

export default class MyComponent extends Component {
  myModifier = (element, x) => {
    let handler = () => console.log(x);

    element.addEventListener('click', handler);

    return () => element.removeEventListener('click', handler);
  }
```
```hbs
<div {{this.myModifier 3}}>
```

Named arguments will all be grouped together in the last argument of the helper:

```js
import Component  from '@glimmer/component';

export default class MyComponent extends Component {
  doStuff = (element, x, options) => {
    let handler = () => console.log(x, options.optionA, options.optionB);

    element.addEventListener('click', handler);

    return () => element.removeEventListener('click', handler);
  };
}
```
```hbs
<div {{this.doStuff 3 optionA=2 optionB=3}}>
```


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
