// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: "'Montserrat', sans-serif", // Global font for all text and typography
    
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Montserrat', sans-serif", // Apply to <body> and global text
        },
        '*': {
          fontFamily: "'Montserrat', sans-serif", // Ensure all elements inherit Montserrat
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontFamily: "'Montserrat', sans-serif", // Ensure Montserrat in inputs
            height: 40, // Consistent height for all TextFields
            padding: 0,
            borderRadius: "12px", // Ensure rounded corners
            backgroundColor: "white",

          },
          "& .MuiInputBase-input": {
            height: "100%",
            width: "100%",
            padding: "0 10px", // Comfortable padding
            fontSize: "14px",
            lineHeight: 1.2,
            boxSizing: "border-box",
            margin: "10px"
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            fontFamily: "'Montserrat', sans-serif", // Ensure Montserrat in select inputs
            height: 40, // Matching height for consistency
            padding: 0,
            borderRadius: "12px",
            backgroundColor: "#eee", // Same background as TextFields
            color: "#333", // Ensure readable text colour
          },
          "& .MuiSelect-select": {
            height: "100%",
            padding: "0 10px",
            fontSize: "14px",
            lineHeight: 1.2,
            boxSizing: "border-box",
            borderRadius: "12px",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "12px", // Ensure consistent rounding for OutlinedInput
          fontFamily: "'Montserrat', sans-serif", // Ensure font consistency
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          "& .MuiInputBase-root": {
            height: 40, // Matching height for Autocomplete inputs
            padding: 0,
            borderRadius: "12px", // Rounded corners
            backgroundColor: "#eee", // Same background for consistency
            fontFamily: "'Montserrat', sans-serif", // Font consistency in Autocomplete
          },
          "& .MuiAutocomplete-input": {
            fontSize: "14px",
            padding: "0 10px", // Comfortable padding
            lineHeight: 1.2,
            boxSizing: "border-box",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Montserrat', sans-serif", // Ensure Typography uses Montserrat
        },
      },
    },
  },
});

export default theme;
