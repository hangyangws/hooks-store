import { getInitialState } from "./utils";

test('correct get initial state', () => {
  expect(getInitialState([{
    name: 'notice',
    initialState: 'notice'
  }, {
    name: 'list',
    initialState: 'list'
  }] as any)).toEqual({
    notice: 'notice',
    list: 'list'
  });
});
