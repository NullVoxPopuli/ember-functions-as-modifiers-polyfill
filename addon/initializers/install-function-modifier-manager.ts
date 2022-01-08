/* eslint-disable @typescript-eslint/ban-types */
// typed-ember doesn't have types for `@ember/helper` yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { capabilities as modifierCapabilities, setModifierManager } from '@ember/modifier';

export function initialize(): void {
  // noop.
  // we just want the host app to import this file
  // (because the default manager behavior is in glimmer-vm,
  //  and I don't know how to monkey-patch ESM... (I don't think I'd want to either? (danger!)))
}

export default {
  initialize,
};

// Including @glimmer/interfaces in package.json breaks typescript... :(
//  (in ember apps)
//  maybe one day glimmer and ember will be more interchangeable, type-wise
export interface Arguments {
  positional: readonly unknown[];
  named: Record<string, unknown>;
}

type FnArgs<Args extends Arguments = Arguments> =
  | [...Args['positional'], Args['named']]
  | [...Args['positional'], {}];

interface FunctionModifierState<Args extends Arguments = Arguments> {
  fn: <Return>(...args: FnArgs<Args>) => Return;
  args: Args;
  element?: Element;
  destructor?: () => void;
}

class FunctionModifierManager<State extends FunctionModifierState> {
  capabilities = modifierCapabilities('3.22');

  createModifier(fn: State['fn'], args: State['args']) {
    return { fn, args, element: undefined, destructor: undefined };
  }

  installModifier(state: State, element: Element) {
    state.element = element;
    this.setupModifier(state);
  }

  updateModifier(state: State) {
    this.destroyModifier(state);
    this.setupModifier(state);
  }

  setupModifier(state: State) {
    let { fn, args, element } = state;

    let argsForFn: FnArgs<Arguments> = [
      ...args.positional,
      Object.keys(args.named).length > 0 ? args.named : {},
    ];

    state.destructor = fn(element, ...argsForFn);
  }

  destroyModifier(state: State) {
    if (typeof state.destructor === 'function') {
      state.destructor();
    }
  }

  getDebugName(fn: State['fn']) {
    return fn.name || '(anonymous function)';
  }
}

const FUNCTIONAL_MODIFIER_MANAGER = new FunctionModifierManager();

setModifierManager(() => FUNCTIONAL_MODIFIER_MANAGER, Function.prototype);
