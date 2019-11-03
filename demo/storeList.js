// 为了方便，这里把两个 store 写在一个文件里面。实际开发中，不建议这样做。

// 使用 immutable 的 setIn 方法
import { setIn } from "immutable";

// 第一个 Store：
// 管理全局通知状态，类似于是否出去加载中。

const noticeInitialState = {
  loading: false
};

// 注意：reducer 的 switch 不需要 default return
const noticeReducer = (state, action) => {
  switch (action.type) {
    case "LOADING_START": // 加载开始
      return setIn(state, ["loading"], true);
    case "LOADING_STOP": // 加载结束
      return setIn(state, ["loading"], false);
  }
};

// 第二个 Store：
// todolist 数据列表。
const todolistInitialState = {
  data: []
};

const todolistReducer = (state, action) => {
  switch (action.type) {
    case "TODOLIST_INIT": // 数据初始化
      return setIn(state, ["data"], action.payload);
    case "TODOLIST_DELETE": // 删除数据
    const newTodolist = state.data.filter(
      todo => todo.id !== action.payload.id
    );
    return setIn(state, ['data'], newTodolist);
    case "TODOLIST_CLEAR": // 数据清空
      return setIn(state, ["data"], []);
  }
};

const noticeStore = {
  name: "notice",
  initialState: noticeInitialState,
  reducer: noticeReducer
};

const todolistStore = {
  name: "todolist",
  initialState: todolistInitialState,
  reducer: todolistReducer
};

const storeList = [todolistStore, noticeStore];

export default storeList;
