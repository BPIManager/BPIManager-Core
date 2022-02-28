import * as React from 'react';
import { injectIntl } from 'react-intl';
import Button from '@mui/material/Button';
import { songData } from '@/types/data';
import { httpsCallable } from '@/components/firebase';
import Loader from '@/view/components/common/loader';
import ButtonGroup from '@mui/material/ButtonGroup';
import Alert from '@mui/material/Alert/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { _currentTheme } from '@/components/settings';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import fbActions from '@/components/firebase/actions';

interface S {
  isLoading: boolean,
  onGoing: any,
  onGoingId: string,
  joinModal: boolean,
  song: songData | null,
  loggedIn: boolean,
  rank: any,
  sum: number,
  isModalOpen: boolean,
  currentUserName: string,
  auth: any
}

class InstantWRView extends React.Component<{ intl: any } & RouteComponentProps, S> {

  private fbA: fbActions = new fbActions();

  constructor(props: { intl: any } & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      loggedIn: true,
      onGoing: null,
      onGoingId: "",
      joinModal: false,
      song: null,
      rank: null,
      sum: 0,
      isModalOpen: false,
      currentUserName: "",
      auth: null,
    }
  }

  async componentDidMount() {
    const res = await httpsCallable(`ranking`, `rankSearch`, {
      currentUser: true,
      includeRank: false,
      showFinished: false,
      offset: 0,
      split: 0,
      order: "asc",
      uid: "",
      onlyJoined: false,
      endDate: "0",
    });
    if (!res.data.auth) {
      return this.setState({ isLoading: false, loggedIn: false });
    }
    return this.setState({
      onGoing: null, isLoading: false, loggedIn: true, auth: res.data.auth
    });
  }

  handleToggle = () => this.setState({ joinModal: !this.state.joinModal });

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag });
  open = (uid: string) => this.setState({ isModalOpen: true, currentUserName: uid })

  render() {
    const { onGoing, isLoading, song, auth } = this.state;
    const borderColor = (): string => {
      const t = _currentTheme();
      if (t === "light") {
        return "#ddd";
      }
      if (t === "dark") {
        return "#222";
      }
      return "#0095ff";
    }
    if (isLoading) {
      return (
        <Alert icon={false} severity="info" variant="outlined" style={{ borderLeft: "0", borderRight: "0", borderRadius: "0px", borderBottom: "0", borderTopRightRadius: "10px", borderTopLeftRadius: "10px", backdropFilter: "blur(5px)", borderColor: borderColor() }}>
          <Loader text="認証中" />
        </Alert>
      );
    }
    if (!auth) {
      return (
        <Alert icon={false} severity="info" variant="outlined" style={{ borderLeft: "0", borderRight: "0", borderRadius: "0px", borderBottom: "0", borderTopRightRadius: "10px", borderTopLeftRadius: "10px", backdropFilter: "blur(5px)", borderColor: borderColor() }}>
          <AlertTitle style={{ textAlign: "center" }}>Sign in</AlertTitle>
          <p style={{ textAlign: "center" }}>ログインして全機能を開放</p>
          <ButtonGroup fullWidth>
            {[
              { name: "Twitter", func: () => this.fbA.authWithTwitter() },
              { name: "Google", func: () => this.fbA.authWithGoogle() }
            ].map((item, i) => {
              return (
                <Button startIcon={<ArrowRightIcon />} key={i} onClick={item.func}>
                  {item.name}
                </Button>
              )
            })
            }
          </ButtonGroup>
        </Alert>
      )
    }
    if (!song) {
      return (null);
    }
    if (!isLoading && !onGoing) {
      return (null);
    }
    return (null)
  }
}



export default withRouter(injectIntl(InstantWRView));
