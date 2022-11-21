import {io, Socket} from 'socket.io-client';
import {useCallback} from 'react';
import Config from 'react-native-config';

let socket: Socket | undefined;
// () : [리턴 타입]
// socket 객체와 disconnect 함수를 반환하는 커스텀 훅(함수)이다.
const useSocket = (): [typeof socket, () => void] => {
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = undefined;
    }
  }, []);
  if (!socket) {
    socket = io(`${Config.API_URL}`, {
      transports: ['websocket'],
    });
  }
  return [socket, disconnect];
};

export default useSocket;
