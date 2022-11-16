import {createSlice} from '@reduxjs/toolkit';

// action: state를 바꾸는 행위/동작
// dispatch: 그 액션을 실제로 실행하는 함수
// reducer: 액션이 실제로 실행되면 state를 바꾸는 로직
// 만약 slice 나누는걸 모르겠다고 하면? 앱 전체 데이터를 가지고 있는 state와 reducer를 한개의 slice에 몰아서 복잡함을 줄인다.
const initialState = {
  name: '',
  email: '',
  accessToken: '',
  refreshToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setName(state, action) {
      state.name = action.payload.name;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
  },
  extraReducers: builder => {},
});

export default userSlice;
