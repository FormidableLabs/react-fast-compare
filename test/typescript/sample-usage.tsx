import React from 'react';

const equal = require('../..');

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
