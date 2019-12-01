import React from 'react';

import { StoreData, Middleware } from './types';

export const applyMiddleware = <Action>(
  state: StoreData,
  dispatch: React.Dispatch<Action>,
  middlewares: Middleware<Action>[]
) => {
  // in the same middleware three should be the shame next function
  // so there must cache the index of current
  const executeMiddleware = (index: number) => (action: Action) => {
    if (index >= middlewares.length) {
      dispatch(action);
      return;
    }

    middlewares[index]({ next: executeMiddleware(index + 1), action, state });
  };

  return (action: Action) => {
    middlewares[0]({ next: executeMiddleware(1), action, state });
  };
};
