import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

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
