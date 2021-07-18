import * as React from 'react';
import Container from '@material-ui/core/Container/Container';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

class NotFound extends React.Component<{},{}> {

  render(){
    return (
      <Container fixed className="commonLayout">
        <Typography variant="h3">404</Typography>
        <Divider/>
        <p>指定のドキュメントが見つかりませんでした。</p>
        <p>URLに誤りが無いか確認するか、トップページからお探しのコンテンツへアクセスしてください。</p>
      </Container>
    );
  }
}

export default NotFound;
