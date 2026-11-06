// This file exists to test our types against sample user code
// This is compiled using `tsc` in our `test-ts-usage` script
import React from 'react';
import equal from '../../index.js';

type ITodo = {
  text: string;
  id: string;
};

const testArr: ITodo[] = [
  { text: 'green', id: '23' },
  { text: 'sunshine', id: '1' },
  { text: 'mountain', id: '11' },
  { text: 'air', id: '8' },
  { text: 'plants', id: '9' },
];

type IProps = {
  todo: ITodo;
};

class TestChild extends React.Component<IProps> {
  shouldComponentUpdate(nextProps: IProps) {
    return !equal(this.props, nextProps);
  }

  render() {
    const todo = this.props.todo;
    return <div>{todo.text}</div>;
  }
}

// `equal` must return a plain `boolean`, not a type guard (`a is B`): after a
// `false` result, a guard narrows `prev` to `never`, so `prev.text` would not
// compile (#130).
export function changedText(prev: ITodo, next: ITodo): string | null {
  if (equal(prev, next)) return null;
  return prev.text;
}

class TestContainer extends React.Component {
  render() {
    return testArr.map((item) => <TestChild key={item.id} todo={item} />);
  }
}

export default TestContainer;
