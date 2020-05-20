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

class TestContainer extends React.Component {
  render() {
    return testArr.map((item) => <TestChild key={item.id} todo={item} />);
  }
}
