// This file exists to test our types against sample user code
// This is compiled using `tsc` in our `test-ts-usage` script
import React from 'react';
import equal from '../../index.js';
import { useSelector } from 'react-redux';

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
  { text: 'air', id: '8' },
  { text: 'air', id: '8' },
];

type IChildProps = {
  todo: ITodo;
};

class TestChild extends React.Component<IChildProps> {
  shouldComponentUpdate(nextProps: IChildProps) {
    return !equal(this.props, nextProps);
  }

  render() {
    const todo = this.props.todo;

    return <div>{todo.text}</div>;
  }
}

type IContainerState = { completed: ITodo[] };

class TestContainer extends React.Component<{}, IContainerState> {
  render() {
    const numberOfOverlappingItems: number = useSelector(
      (state) => this.state.completed.length
    );

    return (
      <div>
        Overlap: {numberOfOverlappingItems}
        <div>
          {testArr.map((item) => (
            <TestChild key={item.id} todo={item} />
          ))}
        </div>
      </div>
    );
  }
}

export default TestContainer;
