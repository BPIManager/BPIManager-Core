import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import ClearLampTable from '@/view/components/table/table';

interface S {
}

class Stats extends React.Component<{intl:any},S> {

  render(){
    return (
      <Container fixed  className="commonLayout">
        <ClearLampTable/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
