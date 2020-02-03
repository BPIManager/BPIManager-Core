import { createMuiTheme } from "@material-ui/core";

export const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      50: '#e3e3e3',
      100: '#b9b9b9',
      200: '#8b8b8b',
      300: '#5c5c5c',
      400: '#393939',
      500: '#161616',
      600: '#131313',
      700: '#101010',
      800: '#0c0c0c',
      900: '#060606',
      A100: '#ff4e4e',
      A200: '#ff1b1b',
      A400: '#e70000',
      A700: '#ce0000',
    },
    secondary: {
      50: '#e2e0e0',
      100: '#b6b3b3',
      200: '#868080',
      300: '#564d4d',
      400: '#312626',
      500: '#0d0000',
      600: '#0b0000',
      700: '#090000',
      800: '#070000',
      900: '#030000',
      A100: '#a6a6a6',
      A200: '#8c8c8c',
      A400: '#737373',
      A700: '#666666',
    },
    background: {
      paper: '#222',
      default: "#111"
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
