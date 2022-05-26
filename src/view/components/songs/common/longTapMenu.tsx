import { songData } from "@/types/data";
import { SwipeableDrawer } from "@mui/material";
import EditList from "../detailScreen/editList";
import JumpWeb from "../detailScreen/jumpWeb";

const Menu: React.FC<{ close: () => void; open: boolean; song: songData | null }> = ({ close, open, song }) => {
  if (!song) return null;
  return (
    <SwipeableDrawer anchor={"bottom"} onOpen={() => null} open={open} onClose={close}>
      <JumpWeb onlyList song={song} />
      <EditList onlyList song={song} closeFunc={close} />
    </SwipeableDrawer>
  );
};

export default Menu;
