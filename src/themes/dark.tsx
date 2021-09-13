import { createTheme } from "@material-ui/core";

export const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1a1a1a',
      light: '#ce6c52',
      dark: '#232323',
    },
    secondary: {
      main: '#ffa247',
    },
    background: {
      default: '#0a0a0a',
      paper: '#181818',
    },
  },

  'breakpoints': {
    'keys': [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
    ],
    'values': {
      'xs': 360,
      'sm': 768,
      'md': 992,
      'lg': 1400,
      'xl': 1800,
    },
  },

  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
  },
});

export default theme;
