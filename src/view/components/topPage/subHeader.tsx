import { Typography } from "@mui/material";

const SubHeader: React.FC<{
  icon: React.ReactNode;
  text: string | React.ReactNode;
}> = ({ icon, text }) => (
  <div className="TypographywithIconAndLinesContainer">
    <div className="TypographywithIconAndLinesInner">
      <Typography
        color="textSecondary"
        gutterBottom
        className="TypographywithIconAndLines"
      >
        {icon}&nbsp;{text}
      </Typography>
    </div>
  </div>
);

export default SubHeader;
