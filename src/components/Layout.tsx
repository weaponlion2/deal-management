import { Alert, AlertColor, AppBar, Avatar, Backdrop, Box, Breadcrumbs, Button, CircularProgress, Container, Divider, IconButton, Link, ListItemIcon, Menu, MenuItem, Paper, Snackbar, SnackbarCloseReason, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { BiMoon, BiSun } from 'react-icons/bi';
import { styled } from "@mui/material/styles";
import { Outlet, useNavigate } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { AccountBox, AddCircle, CancelOutlined, Visibility } from '@mui/icons-material';
import { FIRE, HEADER, HEADER_FIRE, Loader, Response, START_LOADER } from './Layout.Interface';
import logo from "../assets/logo.png";
import CloseIcon from '@mui/icons-material/Close';
import LockResetIcon from '@mui/icons-material/LockReset';
import myAxios from './api';
import { IDealView } from './Deal/List';
import ChangePassword from './Auth/ChangePassword';
import { AxiosError } from 'axios';

interface PropType {
    setIsDark: () => void;
    isDark: boolean
}

const errorList = {
    "S": "success",
    "E": "error",
    "W": "warning",
    "N": "info",
}

const MainContainer = styled(Container)(() => ({
    height: "88.7vh",
    overflowY: 'auto',
    overflowX: 'auto',
    scrollbarWidth: 'thin',
    padding: "1.5rem !important",
    // border: "3px solid red",
    maxWidth: "initial !important",
    paddingBottom: "5px !important"
}))



export const Layout = ({ setIsDark, isDark }: PropType) => {
    const [menu, setMenu] = useState<boolean>(false);
    const [searchBar, setSearchBar] = useState<boolean>(false);

    const [query, setQuery] = useState<string | null>(null);
    const [loader, setLoader] = useState<boolean>(false);

    const emailid: string = localStorage.getItem("@User") ?? "";
    // const userType: MemType = (localStorage.getItem("@Type") as MemType | null) ?? "STAFF";
    const [header, setHeader] = useState<HEADER>();
    // const [backDrop, setBackDrop] = useState<boolean>(false);
    const [layoutDrop, setLayoutDrop] = useState<Loader>({
        status: false,
        color: "#fff",
        size: 40
    });


    function handleClose(): void {
        setMenu(!menu)
    }

    useEffect(() => {
        if (typeof localStorage.getItem('@User') !== "object") {
            // findRight();
        }
        else {
            navigate("/login")
        }
    }, [menu])

    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [type, setType] = useState<"S" | "E" | "W" | "N">("N");
    const custRef = useRef<() => ReactNode>();

    const startFir: FIRE = useCallback(({ msg, type, func }) => {
        if (typeof func !== "undefined") {
            custRef.current = func;
        }
        setType(type)
        setMsg(msg)
        setSnackbarOpen(true)
    }, [])

    const setUpHeader: HEADER_FIRE = useCallback(({ title, breadcrum, sub_title }) => {
        document.title = title;
        setHeader({
            title,
            ...(sub_title && { sub_title }),
            ...(typeof breadcrum !== "undefined" && { breadcrum: breadcrum })
        })
    }, [])

    const startLoader: START_LOADER = useCallback((args) => {
        if (typeof args === "object") {
            setLayoutDrop(args)
        }
        else {
            setLayoutDrop({
                status: args,
                color: "#fff",
                size: 40
            })
        }
    }, [])

    function handleSnackbarClose(__: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    }

    const navigate = useNavigate();
    const handleNavigate = useCallback((arg0: string, state?: Record<any, any>): undefined => {
        setList([]);
        setQuery("");
        setSearchBar(false);
        navigate(arg0, { state: state ?? {} })
    }, []);

    const [list, setList] = useState<IDealView[]>([]);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        if (e.target.value.length > 2) {
            getData(e.target.value);
            setSearchBar(true);
        }
    };

    const getData = useCallback(async (val: string) => {
        setList([])
        setLoader(true);
        try { //2024-12-20
            const req = await myAxios.get(`/Deal/SearchDeal?parameter=${val}`);
            if (req.status === 200) {
                const { data, status }: Response<IDealView[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setList(data);
                    }
                }
                else setList([])
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }
        }
        setLoader(false)
    }, []);


    const [passwordModel, setPasswordModel] = useState<boolean>(false);
    const handlePasswordModel = (val: boolean) => setPasswordModel(val);

    const dealRef = useRef<HTMLDivElement | null>(null);
        const handleClickOutside = (event: MouseEvent) => {
            if (event.target !== null) {
                if (dealRef.current && !dealRef.current.contains(event.target as Node)) {
                    setSearchBar(false);
                }
            }
    
        };
    
        useEffect(() => {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

    return (
        <Container sx={{ scrollbarWidth: "0px !important", overflow: "hidden", maxWidth: "initial !important" }}>
            {/* <Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={backDrop} >
                <CircularProgress color="inherit" size={40} />
            </Backdrop> */}
            <Backdrop sx={(theme) => ({ color: layoutDrop.color, zIndex: theme.zIndex.drawer + 1 })} open={layoutDrop.status} >
                <CircularProgress color="inherit" size={layoutDrop.size} />
            </Backdrop>
            <AppBar position="absolute" sx={{ backgroundColor: (theme) => theme.palette.background.paper, overflow: "hidden", zIndex: "3 !important", width: "100%" }}>
                <Toolbar disableGutters sx={{ paddingLeft: 0, justifyContent: "normal", maxHeight: "65px", overflow: "hidden", }}>
                    <Paper square sx={{ width: "70%", bgcolor: "transparent", display: "flex", height: 50 }} elevation={0} >
                        <Box sx={{ width: "150px", overflow: "hidden", height: "100%", marginX: 1, cursor: "pointer", marginTop:'10px' }} onClick={() => handleNavigate("")} ><img src={logo} style={{ width: "100%", height: "60%" }} /></Box>

                        <Box sx={{ my: 1, mx: 2, flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {/* <Button variant='text' onClick={() => handleNavigate("/tickets")} sx={{ display: 'block' }} >
                                {"Home"}
                            </Button> */}
                            {/* {userType === "ADMIN" && <Button variant='text' onClick={() => handleNavigate("/users")} sx={{ display: 'block' }} >
                                {"User"}
                            </Button>} */}
                            <Button variant='text' onClick={() => handleNavigate("/tickets")} sx={{ display: 'block' }} >
                                {"Ticket"}
                            </Button>
                            <Button variant='text' onClick={() => handleNavigate("/organizations")} sx={{ display: 'block' }} >
                                {"Organization"}
                            </Button>
                            {/* <Button variant='text' onClick={() => handleNavigate("/task")} sx={{ display: 'block' }} >
                                {"Task"}
                            </Button> */}
                            <Button variant='text' onClick={() => handleNavigate("/contacts")} sx={{ display: 'block' }} >
                                {"Contact"}
                            </Button>
                            {/* <Button variant='text' onClick={() => handleNavigate("/mastertask")} sx={{ display: 'block' }} >
                                {"Master Task"}
                            </Button> */}
                            <Button variant='text' onClick={() => handleNavigate("/deals")} sx={{ display: 'block' }} >
                                {"Deal"}
                            </Button>
                            <Button variant='text' onClick={() => handleNavigate("/report/deal")} sx={{ display: 'block' }} >
                                {"Deal Report"}
                            </Button>
                            {/* <Button variant='text' onClick={() => handleNavigate("/report/visit")} sx={{ display: 'block' }} >
                                {"Visit Report"}
                            </Button> */}
                            {/* <Button variant='text' onClick={() => handleNavigate("/product")} sx={{ display: 'block' }} >
                                {"Product"}
                            </Button> */}
                        </Box>
                    </Paper>
                    <Paper square sx={{ width: "35%", display: "flex", bgcolor: "transparent", justifyContent: "end", height: 50 }} elevation={0} >
                        <TextField
                            value={query ?? ""}
                            onChange={handleSearch}
                            placeholder='Search here...'
                            size='small'
                            name='searhbar'
                            type='text'
                            sx={{ width: 450, mt: 0.8, mr: 1 }}
                            onFocus={() => setSearchBar(true)}
                            slotProps={{
                                input: {
                                    name: `${"nnnnnnn" + Math.random()}`
                                },
                            }}
                        />

                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <IconButton sx={{ display: "none" }} size="large" aria-label="show 4 new mails" onClick={setIsDark} >
                                {isDark ? <BiSun /> : <BiMoon />}
                            </IconButton>
                        </Box>
                        <Box sx={{ display: { xs: 'flex', md: 'flex' } }}>
                            <IconButton
                                size="small"
                                aria-label="show more"
                                aria-controls={'primary-search-account-menu'}
                                aria-haspopup="true"
                                onClick={handleClose}
                                sx={{ color: "" }}
                            >
                                <Avatar alt='User' src='https://www.w3schools.com/howto/img_avatar.png' />
                            </IconButton>
                        </Box>
                        <Menu
                            id="primary-search-account-menu"
                            open={menu}
                            onClose={handleClose}
                            MenuListProps={{
                                'aria-labelledby': 'basic-button',
                            }}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            sx={{ marginTop: 4.5 }}
                        >
                            <Box sx={{ width: 250 }}>
                                <Box sx={{ display: { xs: 'flex', md: 'flex' }, flexDirection: "column", alignItems: "center" }}>
                                    <IconButton
                                        size="small"
                                        sx={{ color: "" }}
                                    >
                                        <Avatar alt='User' src='https://www.w3schools.com/howto/img_avatar.png' />
                                    </IconButton>
                                    <Typography variant='subtitle2'>{localStorage.getItem("firstname")} {localStorage.getItem("lastname")}</Typography>
                                    {
                                        emailid.length <= 30 ? <Typography variant='caption'>{emailid}</Typography>
                                            : (
                                                <>
                                                    <Typography variant='caption'>{emailid.slice(0, 30)}</Typography>
                                                    <Typography variant='caption'>{emailid.slice(30, emailid.length)}</Typography>
                                                </>
                                            )
                                    }
                                </Box>
                                <Divider sx={{ marginY: 1 }} />
                                <MenuItem color='primary' onClick={handleClose}>
                                    <ListItemIcon>
                                        <AccountBox />
                                    </ListItemIcon>
                                    <Typography>My Acount</Typography>
                                </MenuItem>
                                <MenuItem color='primary' onClick={() => { handleClose(); handlePasswordModel(true) }}>
                                    <ListItemIcon>
                                        <LockResetIcon />
                                    </ListItemIcon>
                                    <Typography>Change Password</Typography>
                                </MenuItem>
                                <MenuItem color='primary' onClick={() => { handleClose(); localStorage.clear(); handleNavigate("/login") }}>
                                    <ListItemIcon>
                                        <ExitToAppIcon />
                                    </ListItemIcon>
                                    <Typography>Logout</Typography>
                                </MenuItem>
                            </Box>
                        </Menu>
                    </Paper>
                </Toolbar>
            </AppBar>

            <Box onClick={() => { setSearchBar(false); }} onFocus={() => {setSearchBar(false);}} sx={{ display: "flex", marginTop: '64px' }}>
                <MainContainer>
                    {typeof header?.title !== "undefined" && <Box>
                        <Toolbar sx={{ justifyContent: "space-between", padding: "0px !important", minHeight: "20px !important" }}>
                            <Box>
                                <Typography fontSize={24} fontWeight={500} >{header?.title}</Typography>
                            </Box>
                            <Box>
                                <Breadcrumbs aria-label="breadcrumb">
                                    {header?.breadcrum?.()}
                                </Breadcrumbs>
                            </Box>
                        </Toolbar>
                        <Box>
                            <Typography component={'h6'} fontSize={14} color='grey'>{header?.sub_title}</Typography>
                        </Box>
                    </Box>}

                    <Box sx={{ width: "100%", height: "91%", padding: "0px" }}>
                        <Box marginTop={2} sx={{ minHeight: '92%' }}>
                            {<Outlet context={{ startFir: startFir, setUpHeader: setUpHeader, startLoader: startLoader }} />}
                        </Box>
                        <Box sx={{ justifyContent: "center", display: "flex", paddingTop: 1.5 }} width={"100%"}>
                            <Typography color='text.disabled'>@ Copyright CELECT. All Rights Reserved</Typography>
                        </Box>
                    </Box>
                </MainContainer>
            </Box>
            <Snackbar anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleSnackbarClose}
                    >
                        <CloseIcon fontSize="small" sx={{ color: "black" }} />
                    </IconButton>
                }
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={`${errorList[type]}` as AlertColor}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {msg}
                    {custRef.current?.()}
                </Alert>
            </Snackbar>

            {/* onMouseLeave={() => { loader === false && setSearchBar(false); setList([]); }}  */}
            <Paper ref={dealRef} onMouseEnter={() => setSearchBar(true)} sx={{ position: "absolute", right: 50, top: 53, zIndex: 111, width: 400, borderRadius: 1, display: searchBar ? "block" : "none" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant='caption' fontSize={15} p={1} px={2}>List of Deal</Typography>
                    <IconButton onClick={() => { setSearchBar(false); setList([]) }}><CancelOutlined /></IconButton>
                </Box>
                <Divider />
                {
                    list.map((v) => (
                        <MenuItem color='primary' key={v.dealId}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                <Box sx={{ display: "flex" }}>
                                    <ListItemIcon>
                                        <AccountBox />
                                    </ListItemIcon>
                                    <Typography>{v.organizationName === "" ? `${v.contactName} - ${v.phone}` : v.organizationName.length > 20 ? `${v.organizationName.slice(0,20)}...`: v.organizationName}
                                        <Typography variant='subtitle2' fontSize={10}>{v.itemName} {v.serialno !== "" && `(${v.serialno})`}</Typography>
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex" }}>
                                    <Tooltip title={"Create Ticket"}>
                                        <IconButton onClick={() => handleNavigate(`/ticket/form`, v)}>
                                            <AddCircle />
                                        </IconButton>
                                    </Tooltip>

                                    <Tooltip title={"View Deal"}>
                                        <IconButton onClick={() => handleNavigate(`/deal/${v.dealId}`)}>
                                            <Visibility />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </MenuItem>
                    ))
                }
                {
                    list.length === 0 && loader && (
                        <MenuItem color='primary' sx={{ display: "flex", justifyContent: "center" }} >
                            <CircularProgress />
                        </MenuItem>)
                }
                {
                    list.length === 0 && loader === false && (
                        <>
                            <MenuItem color='primary' onClick={() => handleNavigate("/deal/form")}>
                                <Typography width={"100%"}>No deal found <Link component="button" variant="body2" sx={{ fontSize: 15, float: "right" }}>Create Deal</Link></Typography>
                            </MenuItem>
                        </>
                    )
                }

            </Paper>

            <ChangePassword open={passwordModel} handleModel={handlePasswordModel} startFir={(obj) => startFir(obj)} />
            {/* <SearchBar alterSearchBar={alterSearchBar} open={searchBar} /> */}
        </Container>
    )
}