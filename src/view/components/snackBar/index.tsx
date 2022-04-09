import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { amber, green } from '@mui/material/colors';
import Snackbar from '@mui/material/Snackbar';
import WarningIcon from '@mui/icons-material/Warning';
import { Theme } from '@mui/material/styles';

import makeStyles from '@mui/styles/makeStyles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const styles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export interface Props {
  className?: string;
  message?: any;
  onClose?: () => void;
  variant: keyof typeof variantIcon;
  autoHideDuration?: number
  open?: boolean,
  handleClose?: () => void
}

const ShowSnackBar:React.FC<Props> = (props) => {
  const classes = styles();
  if (!props.open) {
    return (null);
  }
  return (
    <Snackbar
      className={classes.message}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      open={props.open}
      autoHideDuration={props.autoHideDuration ? props.autoHideDuration : 2000}
      onClose={props.handleClose}
      message={props.message}
    />
  );
}

export default ShowSnackBar;
