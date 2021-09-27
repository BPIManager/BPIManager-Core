import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { AAATableBgColor } from "../table/table";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface Props{
  closeModal:()=>void,
}

export class AAATableExampleModal extends React.Component<Props,{
}> {

  render(){
    const {closeModal} = this.props;
    return (
      <Dialog open={true} onClose={closeModal}>
        <DialogTitle>AAA達成表とは?</DialogTitle>
        <DialogContent>
        <p>
          AAA+0におけるBPIと現在の登録スコアにおけるBPIの差を基準に、色の濃淡でスコアの差を可視化します。<br/>
          各楽曲の下に表示されている数値は、左側がAAA+0におけるBPIを、右側が現在の登録スコアにおけるBPIを表しています。
        </p>
        <p>背景色は以下の通り変化します。</p>
        <p>
        +50より上:<span style={{color:AAATableBgColor(51)}}>青</span><br/>
        +50以下:<span style={{color:AAATableBgColor(45)}}>薄い青</span><br/>
        +40以下:<span style={{color:AAATableBgColor(35)}}>更に濃い薄水色</span><br/>
        +30以下:<span style={{color:AAATableBgColor(25)}}>濃い薄水色</span><br/>
        +20以下:<span style={{color:AAATableBgColor(15)}}>薄水色</span><br/>
        +15以下:<span style={{color:AAATableBgColor(14)}}>濃い緑</span><br/>
        +10以下:<span style={{color:AAATableBgColor(6)}}>濃い緑</span><br/>
        0以上+5以下:<span style={{color:AAATableBgColor(1)}}>薄い緑</span><br/>
        -5以上0未満:<span style={{color:AAATableBgColor(-1)}}>黄色</span><br/>
        -10以上:<span style={{color:AAATableBgColor(-9)}}>薄いピンク</span><br/>
        -15以上:<span style={{color:AAATableBgColor(-14)}}>濃いオレンジ</span><br/>
        -20以上:<span style={{color:AAATableBgColor(-19)}}>更に濃いオレンジ</span><br/>
        -20未満:<span style={{color:AAATableBgColor(-31)}}>濃い赤</span><br/>
        </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
