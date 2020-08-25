import * as React from 'react';
import Container from '@material-ui/core/Container/Container';
import fbActions from '@/components/firebase/actions';

export default class SitemapGen extends React.Component<{},{}> {

  async componentDidMount(){
    const fbA = new fbActions();
    const users = await fbA.loadUserList();
    let t = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
    users.map((item)=>{
      if(item.exists){
        const p = item.data();
        if(p.displayName){
          t += "<url><loc>https://bpi.poyashi.me/u/" + encodeURI(p.displayName) + "</loc></url>\n";
        }
      }
      return 0;
    });
    const notes = await fbA.loadNoteList();
    let songs:any[] = [];
    notes.map((item)=>{
      if(item.exists){
        const p = item.data();
        songs.push(p.songName + "/" + p.songDiff + "/" + (p.isSingle ? "sp" : "dp"));
      }
      return 0;
    });
    const songsCert = songs.filter(function (x:any, i:any, self:any) {
      return self.indexOf(x) === i;
    });
    for(let i = 0;i < songsCert.length; ++i){
      t += "<url><loc>https://bpi.poyashi.me/notes/" + encodeURI(songsCert[i]) + "</loc></url>\n";
    }
    console.log(t + "</urlset>");
  }

  render(){
    return (
      <Container fixed className="commonLayout">
        Sitemap was generated. Please check the browser console.
      </Container>
    );
  }
}
