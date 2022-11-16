import React, {Component} from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

//accessible={false}는 스크린 리더기가 읽지 못하도록 막는 것.
//<KeyboardAvoidingView behavior={Platform.OS === 'android' ? 'position' : 'padding' > 을 KeyboardAwareScrollView 대신에 쓸 수 있음. 하지만 KeyboardAvoidingView는 UX가 이상하기 때문에 react-native-keyborad-aware-scrollview 라는 라이브러리를 쓰는 것.
//children이 있는 컴포넌트들은 function 보다는 React.FC를 쓰는게 더 낫다.
//StyleProp<ViewStyle>: 리액트 스타일의 타입 추론
type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};
const DismissKeyboardView: React.FC<Props> = ({children, ...props}) => (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAwareScrollView {...props} style={props.style}>
      {children}
    </KeyboardAwareScrollView>
  </TouchableWithoutFeedback>
);

export default DismissKeyboardView;
