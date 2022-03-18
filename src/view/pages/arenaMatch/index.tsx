import React from 'react';
import Loader from '@/view/components/common/loader';
import Container from '@mui/material/Container';
import Button from "@mui/material/Button";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import CreateDialog from "@/view/components/arenaMatch/dialogs/create";
import MatchList from "./list";

interface S {
  isLoading: boolean,
  createDialog: boolean,
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: false,
      createDialog: false,
    }
  }

  openCreateDialog = () => this.setState({ createDialog: !this.state.createDialog });

  async componentDidMount() {
  }

  render() {
    const { isLoading, createDialog } = this.state;

    if (isLoading) {
      return (<Loader />);
    }
    return (
      <Container fixed className="commonLayout">
        <Button fullWidth onClick={this.openCreateDialog}>新しいマッチを作成</Button>
        <MatchList/>
        {createDialog && <CreateDialog toggle={this.openCreateDialog} />}
      </Container>
    );
  }
}

export default withRouter(Index);
