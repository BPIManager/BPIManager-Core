import React, { useEffect } from 'react';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const RedirectMyProfile: React.FC<RouteComponentProps> = props => {
  useEffect(() => {
    props.history.push("/u/" + (props.match.params as any).uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (<Loader hasMargin text="読み込んでいます。お待ち下さい..." />);
}

export default withRouter(RedirectMyProfile);
