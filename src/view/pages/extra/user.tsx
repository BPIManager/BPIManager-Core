import * as React from 'react';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';

class RedirectUserProfile extends React.Component<RouteComponentProps, {}> {

  componentDidMount() {
    console.log(this.props);
    this.props.history.push("/u/" + (this.props.match.params as any).uid);
  }

  render() {
    return (<Loader hasMargin text="読み込んでいます。お待ち下さい..." />);
  }
}

export default withRouter(RedirectUserProfile);
