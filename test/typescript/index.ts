import React from "react";

const equal = require("../..");

type DeepObject = {
  any: any;
};

type State = {
  any: {
    any: any;
  };
};

// State
const selector = (state: State) => {
  a: {
    b: [1, 2, 3];
  }
};

class TestComponent extends React.Component {
  constructor() {
    super();
    this.useSelector = this.useSelector;
  }

  shouldComponentUpdate(nextProps) {
    return !equal(this.props, nextProps);
  }

  useSelector<TState, TSelected>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
  
  this.useSelector(selector); // typed correctly as DeepObject
  this.useSelector(selector, equal); // typed as any

  render() {
    // ...
  }
};
