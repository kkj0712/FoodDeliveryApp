import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import Orders from './src/pages/Orders';
import Delivery from './src/pages/Delivery';
import Settings from './src/pages/Settings';
import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from './src/store/reducer';
import {SafeAreaView} from 'react-native-safe-area-context';
import useSocket from './src/hooks/useSocket';
import {useEffect} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import axios, {AxiosError} from 'axios';
import userSlice from './src/slices/user';
import {Alert} from 'react-native';
import orderSlice from './src/slices/order';
import usePermissions from './src/hooks/usePermissions';

export type LoggedInParamList = {
  Orders: undefined;
  Settings: undefined;
  Delivery: undefined;
  Complete: {orderId: string};
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function AppInner() {
  //로그인 했는지 안했는지의 정보는 app 전반에 걸쳐 두루두루 쓰이기 때문에 redux로 관리하는 것.

  const dispatch = useDispatch();
  //쌍느낌표 = undefined 혹은 null 값을 false 로 형변환. 즉 state.user.email 값이 있으면 true 가 반환되고, 없으면 (undefined 혹은 null 이면) false 가 반환된다.
  const isLoggedIn = useSelector((state: RootState) => !!state.user.email);
  const [socket, disconnect] = useSocket();

  console.log('isLoggedIn', isLoggedIn);

  //권한체크 hook
  usePermissions();

  useEffect(() => {
    axios.interceptors.response.use(
      response => {
        console.log(response);
        return response;
      },
      async error => {
        const {
          //원래 요청
          config,
          response: {status},
        } = error;
        if (status === 419) {
          if (error.response.data.code === 'expired') {
            const originalRequest = config;
            const refreshToken = await EncryptedStorage.getItem('refreshToken');
            // token refresh 요청
            const {data} = await axios.post(
              `${Config.API_URL}/refreshToken`,
              {},
              {
                headers: {
                  authorization: `Bearer ${refreshToken}`,
                },
              },
            );
            //새로운 토큰 저장
            dispatch(userSlice.actions.setAccessToken(data.data.accessToken));
            originalRequest.headers.authorization = `Bearer ${data.data.accessToken}`; //소문자임에 유의
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      },
    );
  }, [dispatch]);

  // 앱 실행시 토큰이 있으면 로그인하는 코드
  useEffect(() => {
    const getTokenAndRefresh = async () => {
      try {
        const token = await EncryptedStorage.getItem('refreshToken');
        if (!token) {
          return;
        }
        const response = await axios.post(
          `${Config.API_URL}/refreshToken`,
          {},
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch(
          userSlice.actions.setUser({
            name: response.data.data.name,
            email: response.data.data.email,
            accessToken: response.data.data.accessToken,
          }),
        );
      } catch (error) {
        console.error(error);
        if (
          (error as AxiosError<{code: string}>).response?.data.code ===
          'expired'
        ) {
          Alert.alert('알림', '다시 로그인 해주세요.');
        }
      } finally {
        //TODO : 스플래시 스크린
      }
    };
    getTokenAndRefresh(); //useEffect는 async 함수가 안되기 때문에 함수를 하나 만들어주고 그걸 호출하는 방식.
  }, [dispatch]); //dispatch는 불변성이 보장된 함수기 때문에 AppInner()가 여러번 실행되어도 항상 주소 값이 똑같다. 그래서 [] 로만 써도 되는데, ESlint가 그걸 모르기 때문에 넣어주라고 경고함.

  useEffect(() => {
    const callback = (data: any) => {
      console.log(data);
      dispatch(orderSlice.actions.addOrder(data));
    };
    if (socket && isLoggedIn) {
      console.log(socket);
      socket.emit('acceptOrder', 'hello'); //서버한테 데이터를 보낼때 'login'이라는 키로 보내고 hello라는 키로 받겠다.
      socket.on('order', callback); //서버한테 데이터를 'hello' 라는 키로 받음. callback 방식으로 처리함.
    }
    return () => {
      if (socket) {
        socket.off('order', callback); //받는 것 그만하기
      }
    };
  }, [dispatch, isLoggedIn, socket]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log('!isLoggedIn', !isLoggedIn);
      disconnect();
    }
  }, [isLoggedIn, disconnect]);

  return (
    <SafeAreaView style={{flex: 1}}>
      {isLoggedIn ? (
        <Tab.Navigator>
          <Tab.Group>
            <Tab.Screen
              name="Orders"
              component={Orders}
              options={{title: '오더 목록'}}
            />
            <Tab.Screen
              name="Delivery"
              component={Delivery}
              options={{headerShown: true}}
            />
            <Tab.Screen
              name="Settings"
              component={Settings}
              options={{title: '내 정보'}}
            />
          </Tab.Group>
        </Tab.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{title: '로그인'}}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{title: '회원가입'}}
          />
        </Stack.Navigator>
      )}
    </SafeAreaView>
  );
}

export default AppInner;
