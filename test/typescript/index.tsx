import React from "react";
import { useSelector } from "react-redux";

const equal = require("../..");

const testArr = [
  { text: "green", id: "23" },
  { text: "sunshine", id: "1" },
  { text: "mountain", id: "11" },
  { text: "air", id: "8" },
  { text: "plants", id: "9" },
] as ITodo[];

type ITodo = {
  text: string;
  id: string;
};

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
};

class TestContainer extends React.Component {
  render() {
    return testArr.map((item) => <TestChild key={item.id} todo={item} />);
  }
}
