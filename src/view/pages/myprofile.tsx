import * as React from 'react';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class RedirectMyProfile extends React.Component<RouteComponentProps, {}> {

  componentDidMount() {
    new fbActions().auth().onAuthStateChanged((user: any) => {
      console.log(user);
      this.props.history.push("/u/_/" + user.uid);
    });
  }

  render() {
    return (<Loader hasMargin text="読み込んでいます。お待ち下さい..." />);
  }
}

export default withRouter(RedirectMyProfile);
