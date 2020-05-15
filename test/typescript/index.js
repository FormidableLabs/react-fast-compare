import React from "react";
import { useSelector } from "react-redux";
const equal = require("../..");
// const equal = (a: any, b: any) => { return true; }
/**
 * - [ ] Component to wrap the to-dos (Container)
 *       Maps over an array of random strings to pass into the Child component
 * - [ ] Component to render each to-do individually (Child)
 */
const testArr = [
    { text: "green", id: "23" },
    { text: "sunshine", id: "1" },
    { text: "mountain", id: "11" },
    { text: "air", id: "8" },
    { text: "plants", id: "9" }
];
class TestChild extends React.Component {
    // is this doing anything for us?
    // should the container be improved to ensure that this update is happening?
    // should the container be within a container? 🤔
    shouldComponentUpdate(nextProps) {
        return !equal(this.props, nextProps);
    }
    render() {
        const todo = useSelector((state) => state.todos[props.id]);
        return React.createElement("div", null, todo);
    }
}
class TestContainer extends React.Component {
    render() {
        return (testArr.map(item => React.createElement(TestChild, { todo: item })));
    }
}
