"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var react_1 = require("react");
var react_redux_1 = require("react-redux");
var equal = require("../..");
var testArr = [
    { text: "green", id: "23" },
    { text: "sunshine", id: "1" },
    { text: "mountain", id: "11" },
    { text: "air", id: "8" },
    { text: "plants", id: "9" }
];
var TestChild = /** @class */ (function (_super) {
    __extends(TestChild, _super);
    function TestChild() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestChild.prototype.shouldComponentUpdate = function (nextProps) {
        return !equal(this.props, nextProps);
    };
    TestChild.prototype.render = function () {
        var todo = react_redux_1.useSelector(function (state) { return state.todos[props.id]; });
        return <div>{todo}</div>;
    };
    return TestChild;
}(react_1["default"].Component));
var TestContainer = /** @class */ (function (_super) {
    __extends(TestContainer, _super);
    function TestContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestContainer.prototype.render = function () {
        return (testArr.map(function (item) { return <TestChild todo={item}/>; }));
    };
    return TestContainer;
}(react_1["default"].Component));
