import { createTheme } from "@mui/material";
// import { red } from "@mui/material/colors";

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        text: {
            disabled: "#FFF",
        }
    },
    components: {
        MuiContainer: {
            styleOverrides: {
                root: {
                    padding: "0 !important",
                    height: "100vh"
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    backgroundColor: "transparent"
                }
            }
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: "40px"
                }
            }
        }
    },
    typography: {
        h6: {
            color: "white"
        },        
    }
});
  
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: "rgba(140,186,255, 0.15)",
        },
        primary: {
            "100": "rgba(0, 107, 214, 0.1)",
            "200": "rgba(0, 107, 214, 0.2)",
            "300": "rgba(0, 107, 214, 0.3)",
            "400": "rgba(0, 107, 214, 0.4)",
            "500": "rgba(0, 107, 214, 0.5)",
            "600": "rgba(0, 107, 214, 0.6)",
            "700": "rgba(0, 107, 214, 0.7)",
            "800": "rgba(0, 107, 214, 0.8)",
            "900": "rgba(0, 107, 214, 0.9)",
            "main": "rgba(0, 107, 214, 1)"
        },
        secondary: {
            "main": "#FFF"
        },
        text: {
            disabled: "rgba(0, 107, 214, 1)"
        }
    },
    components: {
        MuiContainer: {
            styleOverrides: {
                root: {
                    backgroundImage: "linear-gradient(135deg, rgb(209, 223, 230) , rgb(224, 232, 236), rgb(245, 249, 253))",
                    padding: "0 !important",
                    height: "100vh"
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    backgroundColor: "transparent"
                }
            }
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: "40px"
                }
            }
        }
    },

});
  