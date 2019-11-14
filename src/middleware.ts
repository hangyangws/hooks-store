import React from 'react';

import { StoreData, Middleware } from './types';

export const applyMiddleware = <Action>(
  state: StoreData,
  dispatch: React.Dispatch<Action>,
  middlewares: Middleware<Action>[]
) => {
  let index: number;

  const next = (action: Action) => {
    index++;

    if (index >= middlewares.length) {
      dispatch(action);
      return;
    }

    middlewares[index]({ next, action, state });
  };

  return (action: Action) => {
    index = 0;
    middlewares[0]({ next, action, state });
  };
};
