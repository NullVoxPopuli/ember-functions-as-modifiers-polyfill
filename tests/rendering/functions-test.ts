import { tracked } from '@glimmer/tracking';
import { clearRender, render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

module('function modifiers', function (hooks) {
  setupRenderingTest(hooks);

  module('reactivity', function () {
    test('it works', async function (assert) {
      class Demo {
        @tracked num = 3;
        @tracked captures: Array<[Element, number]> = [];

        myModifier = (element: Element, x: number) => {
          this.captures.push([element, x]);
        };
      }

      let demo = new Demo();

      this.setProperties({ demo });

      await render(hbs`<div {{this.demo.myModifier this.demo.num}}></div>`);

      assert.strictEqual(demo.captures.length, 1);

      demo.num = 5;
      await settled();

      assert.strictEqual(demo.captures.length, 2);
    });

    test('positional arguments are always consumed', async function (assert) {
      class Demo {
        @tracked num = 3;
        @tracked unused = 5;

        myModifier = (_element: Element, x: number) => {
          assert.step(`myModifier: ${x}`);
        };
      }

      let demo = new Demo();

      this.setProperties({ demo });

      await render(hbs`<div {{this.demo.myModifier this.demo.num this.demo.unused}}></div>`);

      demo.unused = 5;
      await settled();

      assert.verifySteps(['myModifier: 3', 'myModifier: 3']);
    });

    test('named arguments are consumed only when accessed', async function (assert) {
      class TrackedObject {
        @tracked a = 0;
        @tracked b = 1;
      }

      class Demo {
        @tracked num = 3;
        @tracked sourceObject = new TrackedObject();

        myModifier = (_element: Element, x: number, opts: TrackedObject) => {
          assert.step(`myModifier: ${x}`);

          if (x === 4) {
            assert.step(`x is 4, and opts.a is ${opts.a}`);
          }
        };
      }

      let demo = new Demo();

      this.setProperties({ demo });

      await render(
        hbs`
      <div
      {{this.demo.myModifier
          this.demo.num
          a=this.demo.sourceObject.a
          b=this.demo.sourceObject.b
      }}></div>
      `
      );

      demo.sourceObject.a = 5;
      await settled();

      assert.verifySteps(['myModifier: 3']);

      demo.num = 4;
      await settled();

      demo.sourceObject.a = 6;
      await settled();

      assert.verifySteps([
        'myModifier: 4',
        'x is 4, and opts.a is 5',
        'myModifier: 4',
        'x is 4, and opts.a is 6',
      ]);
    });
  });

  module('lifecycle', function () {
    test('destruction works', async function (assert) {
      class Demo {
        myModifier = () => {
          assert.step('setup');

          return () => assert.step('teardown');
        };
      }

      let demo = new Demo();

      this.setProperties({ demo });

      await render(hbs`<div {{this.demo.myModifier this.demo.num}}></div>`);
      await clearRender();

      assert.verifySteps(['setup', 'teardown']);
    });

    test('destruction called before update', async function (assert) {
      class Demo {
        @tracked x = 0;

        myModifier = () => {
          let localX = this.x;

          assert.step(`setup: ${localX}`);

          return () => assert.step(`teardown: ${localX}`);
        };
      }

      let demo = new Demo();

      this.setProperties({ demo });

      await render(hbs`<div {{this.demo.myModifier this.demo.num}}></div>`);

      demo.x = 1;
      await settled();
      await clearRender();

      assert.verifySteps(['setup: 0', 'teardown: 0', 'setup: 1', 'teardown: 1']);
    });
  });
});
