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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
var equal = require("../..");
var testArr = [
    { text: "green", id: "23" },
    { text: "sunshine", id: "1" },
    { text: "mountain", id: "11" },
    { text: "air", id: "8" },
    { text: "plants", id: "9" },
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
        var todo = this.props.todo;
        return react_1["default"].createElement("div", null, todo.text);
    };
    return TestChild;
}(react_1["default"].Component));
;
var TestContainer = /** @class */ (function (_super) {
    __extends(TestContainer, _super);
    function TestContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestContainer.prototype.render = function () {
        return testArr.map(function (item) { return react_1["default"].createElement(TestChild, { key: item.id, todo: item }); });
    };
    return TestContainer;
}(react_1["default"].Component));
