import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      50: '#dedede',
      100: '#808080',
      200: '#5e5e5e',
      300: '#4b4b4b',
      400: '#434343',
      500: '#3a3a3a',
      600: '#2d2d2d',
      700: '#272727',
      800: '#1c1c1c',
      900: '#111111',
      A100: '#cecece',
      A200: '#949494',
      A400: '#6f6f6f',
      A700: '#4c4c4c',
    },
    secondary: {
      50: '#d0e0e3',
      100: '#a2c4c9',
      200: '#76a5af',
      300: '#648c95',
      400: '#45818e',
      500: '#396872',
      600: '#2a5059',
      700: '#23434a',
      800: '#1f353a',
      900: '#0c343d',
      A100: '#a2c4c9',
      A200: '#76a5af',
      A400: '#45818e',
      A700: '#205966',
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
