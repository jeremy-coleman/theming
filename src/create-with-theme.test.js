// @flow
import test from 'ava';
import createReactContext from 'create-react-context';
import React from 'react';
import TestRenderer from 'react-test-renderer';

import createWithTheme from './create-with-theme';

// eslint-disable-next-line no-unused-vars
const FunctionalComponent = (props: { theme: {} }) => null;

class ClassComponent extends React.Component<{ theme: {} }> {
  static displayName = 'foo';

  static someSpecialStatic = 'bar';

  inner = true;

  render() {
    return null;
  }
}

test('createWithTheme\'s type', (t) => {
  t.true(typeof createWithTheme === 'function', 'createWithTheme should be a function');
});

test('createWithTheme\'s result is function on its own', (t) => {
  const context = createReactContext({});
  const withTheme = createWithTheme(context);

  t.true(typeof withTheme === 'function', 'withTheme should be a function');
});

test('should pass the default value of the context', (t) => {
  const theme = {};
  const context = createReactContext(theme);
  const WithTheme = createWithTheme(context)(FunctionalComponent);
  const { root } = TestRenderer.create(<WithTheme />);

  t.true(root.findByType(FunctionalComponent).props.theme === theme);
});


test('should pass the value of the Provider', (t) => {
  const theme = { test: 'test' };
  const context = createReactContext(theme);
  const WithTheme = createWithTheme(context)(FunctionalComponent);
  const { root } = TestRenderer.create((
    <context.Provider value={theme}>
      <WithTheme />
    </context.Provider>
  ));

  t.true(root.findByType(FunctionalComponent).props.theme === theme);
});

test('should allow overriding the prop from the outer props', (t) => {
  const theme = {};
  const otherTheme = {};
  const context = createReactContext(theme);
  const WithTheme = createWithTheme(context)(FunctionalComponent);
  const { root } = TestRenderer.create((
    <WithTheme theme={otherTheme} />
  ));

  t.true(root.findByType(FunctionalComponent).props.theme === otherTheme);
});

test('innerRef should set the ref prop on the wrapped component', (t) => {
  const context = createReactContext({});
  const withTheme = createWithTheme(context);
  let refComp = null;
  const innerRef = (comp) => {
    refComp = comp;
  };
  const WithTheme = withTheme(ClassComponent);

  TestRenderer.create((
    <WithTheme innerRef={innerRef} />
  ));

  t.deepEqual(refComp !== null && refComp.inner, true);
});

test('should forward the innerRef to the wrapped component when forwardInnerRef is true', (t) => {
  const context = createReactContext({});
  const WithTheme = createWithTheme(context)(FunctionalComponent, { forwardInnerRef: true });
  const innerRef = () => undefined;
  const { root } = TestRenderer.create((
    <WithTheme innerRef={innerRef} />
  ));

  t.true(root.findByType(FunctionalComponent).props.innerRef === innerRef);
});

test('withTheme(Comp) hoists non-react static class properties', (t) => {
  const context = createReactContext({});
  const withTheme = createWithTheme(context);
  const WithTheme = withTheme(ClassComponent);

  t.deepEqual(
    WithTheme.displayName,
    'WithTheme(foo)',
    'withTheme(Comp) should not hoist react static properties',
  );
  t.deepEqual(
    // $FlowFixMe: Need to find a better way to type the hoist-non-react-statics
    WithTheme.someSpecialStatic,
    ClassComponent.someSpecialStatic,
    'withTheme(Comp) should hoist non-react static properties',
  );
});
