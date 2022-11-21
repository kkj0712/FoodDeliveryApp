import React, {useCallback} from 'react';
import {FlatList} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store/reducer';
import {Order} from '../slices/order';
import EachOrder from '../components/EachOrder';

//AppInner를 보면 <Tab.Screen>으로 등록되어있는 Order이므로 navigation 사용가능. EachOrder는 AppInner에 없기 때문에 Orders에서 props로 가져와서 내려줄 수도 있다. 그런데 EachOrder의 하위 컴포넌트도 navigationd을 쓰고 싶다면? props drilling을 해야하나? 그러지 않기 위해서 EachOrder에서 useNavigation() 이라는 훅을 쓰면 된다.
function Orders() {
  const orders = useSelector((state: RootState) => state.order.orders);

  //반복문 내의 컴포넌트는 무조건 파일 분리. 최적화를 위해서.
  const renderItem = useCallback(({item}: {item: Order}) => {
    return <EachOrder item={item} />;
  }, []);

  return (
    //스크롤뷰는 내부에 있는걸 전부다 렌더링 해버림. 메모리낭비, 성능 낭비. orders  같은건 서버에서 내려보내주는 데이터 이므로 양이 얼마나 되는지를 모른다. 그래서 FlatList를 쓰는게 좋음. 사용법은 찾아보도록.
    <FlatList
      data={orders}
      renderItem={renderItem}
      keyExtractor={item => item.orderId}
    />
  );
}

export default Orders;
