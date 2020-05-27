// This file exists to test our types against sample user code
// This is compiled using `tsc` in our `test-ts-usage` script
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import { createStore } from 'redux';

import equal from '../../index.js';

type IState = {
  items: string[];
};

type IAction = {
  type: string;
  payload: any;
};

const initialState: IState = {
  items: ['green', 'sunshine', 'mountain', 'air', 'plants'],
};

const reducer = (state: IState, action: IAction) => {
  return state;
};

const lengthSelector = (state: IState): number => state.items.length;

const store = createStore(reducer, initialState);

class TestContainer extends React.Component {
  render() {
    const length = useSelector(lengthSelector, equal);
    return (
      <div>
        Testing react-redux useSelector. There are
        {length.toExponential()} items.
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <TestContainer />
  </Provider>,
  document.getElementById('root')
);
