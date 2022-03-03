import * as React from 'react';
import Container from '@mui/material/Container';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import List from '@mui/material/List';
import ModalNotes from './modal';
import Alert from '@mui/material/Alert/Alert';
import AlertTitle from '@mui/material/AlertTitle/AlertTitle';
import { EachMemo } from '../songs/songNotes';
import { getDoc } from "firebase/firestore";

interface S {
  isLoading: boolean,
  likedNotes: any[],
  isModalOpen: boolean,
  data: any
}

class NotesLiked extends React.Component<{}, S> {
  private fbA: fbActions = new fbActions();

  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      isModalOpen: false,
      likedNotes: [],
      data: null,
    }
  }

  async componentDidMount() {
    const likedNotes = await this.fbA.loadLikedNotes();
    if (!likedNotes) {
      return this.setState({
        likedNotes: [],
        isLoading: false,
      })
    }
    const docs = likedNotes.docs;
    const res = [];
    for (let i = 0; i < docs.length; ++i) {
      const data = docs[i].data();
      const ref = data.target ? await getDoc(data.target) : null;
      if (ref) {
        res.push(ref);
      }
    }
    return this.setState({
      likedNotes: res,
      isLoading: false,
    })
  }

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag, data: null })

  onClick = (data: any) => {
    this.setState({
      isModalOpen: true,
      data: data
    })
  }

  render() {
    const { isLoading, likedNotes, isModalOpen, data } = this.state;
    if (isLoading) {
      return (<Loader />);
    }
    return (
      <Container fixed>
        {likedNotes.length === 0 && (
          <Alert severity="error">
            <AlertTitle>いいねをした投稿がありません</AlertTitle>
            <p>投稿に「いいね」をつけると、この画面で一括確認することができます。<br />
              役に立ちそうな投稿にはどんどん「いいね」を付けていきましょう！</p>
          </Alert>
        )}
        <List
          component="nav"
        >
          {likedNotes.map((item: any, i: number) => {
            return (
              <EachMemo item={item} listType noEllipsis onClick={this.onClick} key={i} />
            )
          })}
        </List>
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
      </Container>
    );
  }
}

export default NotesLiked;
