// Types for compiled templates
declare module 'ember-functions-as-modifiers-polyfill/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}
