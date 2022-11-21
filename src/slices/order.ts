import {createSlice, PayloadAction} from '@reduxjs/toolkit';

//객체에 대한 타이핑을 할때 interface를 많이 씀.
export interface Order {
  orderId: string;
  start: {
    latitude: number;
    longitude: number;
  };
  end: {
    latitude: number;
    longitude: number;
  };
  price: number;
  image: string;
  completedAt: string;
}

interface InitialState {
  orders: Order[]; //위 Order의 배열이 됨
  deliveries: Order[];
}

const initialState: InitialState = {
  orders: [], //서버로 실시간 받는 데이터. 수락하면 deliveries로 가고, 거절당하면 빠짐.
  deliveries: [], //수락한 주문
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    addOrder(state, action: PayloadAction<Order>) {
      state.orders.push(action.payload);
    },
    //orderId가 action.payload로 전달이 된 것.
    acceptOrder(state, action: PayloadAction<string>) {
      const index = state.orders.findIndex(v => v.orderId === action.payload);
      if (index > -1) {
        state.deliveries.push(state.orders[index]);
        state.orders.splice(index, 1);
      }
    },
    rejectOrder(state, action: PayloadAction<string>) {
      const index = state.orders.findIndex(v => v.orderId === action.payload);
      if (index > -1) {
        state.orders.splice(index, 1);
      }
      const delivery = state.deliveries.findIndex(
        v => v.orderId === action.payload,
      );
      if (delivery > -1) {
        state.deliveries.splice(delivery, 1);
      }
    },
  },
  extraReducers: builder => {},
});

export default orderSlice;
