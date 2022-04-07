import React, { useEffect } from 'react';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const RedirectMyProfile: React.FC<RouteComponentProps> = props => {
  useEffect(() => {
    new fbActions().auth().onAuthStateChanged((user: any) => {
      console.log(user);
      props.history.push("/u/_/" + user.uid);
    });
  }, [])
  return (<Loader hasMargin text="読み込んでいます。お待ち下さい..." />);
}

export default withRouter(RedirectMyProfile);
