// This file exists to test our types against sample user code
// This is compiled using `tsc` in our `test-ts-usage` script
import React from 'react';
import ReactDOM from 'react-dom';
// useSelector
import { Provider, useSelector, DefaultRootState } from 'react-redux';
import { createStore } from 'redux';

import equal from '../../index.js';

type IItem = {
  text: string;
  id: string;
};

const testArr: IItem[] = [
  { text: 'green', id: '23' },
  { text: 'sunshine', id: '1' },
  { text: 'mountain', id: '11' },
  { text: 'air', id: '8' },
  { text: 'plants', id: '9' },
  { text: 'air', id: '8' },
  { text: 'air', id: '8' },
];

interface IContainerState extends DefaultRootState {
  overlap: IItem[];
}

const overlap = (state = [], action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return state.concat([action.text]);
    default:
      return state;
  }
};

const store = createStore(overlap, ['mountain']);

class TestContainer extends React.Component<{}, IContainerState> {
  render() {
    useSelector(this.state, equal);

    return (
      <div>
        Testing react-redux
        <div>
          {testArr.map((item) => (
            <p key={item.id}>{item.text}</p>
          ))}
        </div>
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
