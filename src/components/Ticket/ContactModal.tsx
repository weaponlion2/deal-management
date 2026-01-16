import { Fragment, useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Box, CircularProgress, Divider, Grid2 as Grid, IconButton, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { ContactForm } from "../Contact/Contact";
import { contactType, DropdownOption } from "./Ticket";
import { AxiosError, AxiosResponse } from "axios";
import myAxios from "../api";
import { Response, START_FIRE } from "../Layout.Interface";
import { SType } from "../Deal/Deal";
import { CancelOutlined } from "@mui/icons-material";
import { red } from "@mui/material/colors";

interface FormErr extends Pick<ContactForm, "firstName" | "mobile"> { }
const InitialErr: FormErr = {
    firstName: "",
    mobile: "",
};

interface IProps {
    organizationList: DropdownOption[];
    handleModel: (val: boolean) => void;
    startFir: (obj: START_FIRE) => void;
    open: boolean;
    callBack: (data: DropdownOption, type: "contact" | "organization") => void;
}

const Initial: ContactForm = {
    id: 0,
    firstName: "",
    lastName: "",
    company: "",
    extension: "",
    email: "",
    jobTitle: "",
    mobile: "",
    organizationId: "",
    organizationName: "",
    phone: "",
    active: true,
};

export default function ContactModal({
    startFir,
    handleModel,
    open,
    callBack,
}: IProps) {
    const [ticketData, setTicketData] = useState<ContactForm>(Initial);
    const [warningList, setWarningList] = useState<FormErr>(InitialErr);
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: value,
            mobile:
                name === "mobile"
                    ? value.length > 10
                        ? prevData.mobile
                        : value
                    : prevData.mobile,
            phone:
                name === "phone"
                    ? value.length > 10
                        ? prevData.phone
                        : value
                    : prevData.phone,
        }));
    };

    const handleSubmit = async () => {
        if (validateInput() === true) {
            let req: AxiosResponse = await myAxios.post(`/Contact/SaveContact`, {
                ...ticketData,
                organizationId: Number(ticketData.organizationId),
            });
            try {
                const { status, data }: Response<contactType[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        const res: DropdownOption[] = data.map((it) => {
                            const item = it as contactType;
                            return {
                                id: item.id,
                                name: `${item.firstName} ${item.lastName}`,
                            };
                        });
                        callBack(res[0], "contact");
                    }
                    startFir({
                        msg: "Contact save successfully",
                        type: "S",
                    });
                    handleModel(false);
                    setTicketData(Initial);
                } else {
                    startFir({
                        msg: "Unable to save contact",
                        type: "W",
                    });
                }
            } catch (_err: unknown) {
                if (_err instanceof AxiosError) {
                    console.log(_err.message);
                } else {
                    console.log("An unexpected error occurred");
                }
                startFir({
                    msg: "Something went wrong",
                    type: "E",
                });
            }
        }

        // startLoader(false)
    };

    const validateInput = (): boolean => {
        const errList: FormErr = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.firstName || ticketData.firstName === "") {
            errList.firstName = "First name is required.";
            isValid = false;
        }
        if (!ticketData.mobile || ticketData.mobile === "") {
            errList.mobile = "Mobile is required.";
            isValid = false;
        }

        if (!isValid) {
            startFir({
                msg: "Please fill up all required field.",
                type: "W",
            });
        }
        setWarningList({ ...errList });
        return isValid;
    };

    const oriRef = useRef<HTMLDivElement | null>(null);
    const [searchOrigan, setSearchOrigan] = useState<boolean>(false);
    const [loader, setLoader] = useState<boolean>(false);
    const [dropdownOptions, setDropdownOptions] = useState<{ organizations: DropdownOption[] }>({
        organizations: []
    })

    const handleClickOutside = (event: MouseEvent) => {
        if (event.target !== null) {
            if (oriRef.current && !oriRef.current.contains(event.target as Node)) {
                setSearchOrigan(false);
            }
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getSearch = async (val: string, type: SType) => {
        setLoader(true);
        try {
            //2024-12-20
            const req = await myAxios.get(
                `/Organization/CommanSearch?type=${type}&parameter=${val}`
            );
            if (req.status === 200) {
                const { data, status }: Response<DropdownOption[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        if (type === "CONTACT") {
                            setDropdownOptions((dropdownOptions) => ({
                                ...dropdownOptions,
                                contacts: data,
                            }));
                        } else if (type === "ORGANIZATION")
                            setDropdownOptions((dropdownOptions) => ({
                                ...dropdownOptions,
                                organizations: data,
                            }));
                    }
                } else {
                    throw Error("Not found");
                }
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }
            if (type === "ORGANIZATION")
                setDropdownOptions((dropdownOptions) => ({
                    ...dropdownOptions,
                    organizations: [],
                }));
        }
        setLoader(false);
    };


    const handleSearch = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        type: SType
    ) => {
        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({
                ...tData,
                organizationName: e.target.value,
            }));
        }
        if (e.target.value.length > 2) {
            getSearch(e.target.value, type);
            if (type === "ORGANIZATION") {
                setSearchOrigan(true);
            }
        } else {
            setSearchOrigan(false);
        }
    };


    function changeData(id: string, val: string, type: SType): void {
        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: val, organizationId: id }))
        }
        setSearchOrigan(false)
    }

    const handleResetOri = (type: SType) => {
        if (type === "ORGANIZATION") {
            setTicketData((prev) => ({
                ...prev,
                organizationId: "0",
                organizationName: ""
            }))
        }
    }

    const handleFocus = (type: SType) => {
        if (type === "ORGANIZATION") {
            const Index = dropdownOptions.organizations.findIndex((v) => v.id == ticketData.organizationId)
            setTicketData((prev) => ({
                ...prev, 
                organizationName: (dropdownOptions.organizations.length == 0) ? ticketData.organizationName : (Index !== -1) ? dropdownOptions.organizations[Index].name : ""            
            }))
            setSearchOrigan(false)
        }
    }
    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={() => handleModel(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"New Contact"}</DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">
                    </DialogContentText> */}
                    <Grid container spacing={3} padding={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={
                                    <>
                                        First Name <span style={{ color: "red" }}>*</span>
                                    </>
                                }
                                fullWidth
                                size="small"
                                value={ticketData.firstName}
                                onChange={handleInputChange}
                                name="firstName"
                                error={warningList.firstName !== "" ? true : false}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={
                                    <>
                                        Mobile <span style={{ color: "red" }}>*</span>
                                    </>
                                }
                                fullWidth
                                size="small"
                                value={ticketData.mobile}
                                onChange={handleInputChange}
                                name="mobile"
                                error={warningList.mobile !== "" ? true : false}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={<>Email </>}
                                fullWidth
                                size="small"
                                value={ticketData.email}
                                onChange={handleInputChange}
                                name="email"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative" }}>
                            <TextField
                                label="Organization"
                                value={ticketData.organizationName ?? ""}
                                onChange={(e) => handleSearch(e, "ORGANIZATION")}
                                placeholder="Search Organization..."
                                size="small"
                                name="searhbar"
                                type="text"
                                fullWidth
                                onFocus={() => setSearchOrigan(true)}
                                slotProps={{
                                    input: {
                                        name: `${"oiuy" + Math.random()}`,
                                    },
                                }}
                            />
                            <Paper
                                ref={oriRef}
                                onMouseEnter={() => setSearchOrigan(true)}
                                sx={{
                                    // position: "absolute",
                                    right: 0,
                                    top: 40,
                                    zIndex: 2000,
                                    width: "100%",
                                    borderRadius: 1,
                                    display: searchOrigan ? "block" : "none",
                                    maxHeight: 200,
                                    overflow: "auto",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="caption" fontSize={15} p={1} px={2}>
                                        List of Organization
                                    </Typography>
                                    <IconButton
                                        tabIndex={-1}
                                        onClick={() => {
                                            setSearchOrigan(false);
                                        }}
                                    >
                                        <CancelOutlined />
                                    </IconButton>
                                </Box>
                                <MenuItem sx={{ color: red[600] }} value={-2} onClick={() => handleResetOri("ORGANIZATION")}>
                                    {"Reset Organization"}
                                </MenuItem>
                                <Divider />
                                {dropdownOptions.organizations.map((v) => (
                                    <MenuItem
                                        color="primary"
                                        key={v.id}
                                        onClick={() =>
                                            changeData(`${v.id}`, v.name, "ORGANIZATION")
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                width: "100%",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box sx={{ display: "flex" }}>
                                                <Typography>{v.name}</Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                                {dropdownOptions.organizations.length === 0 && loader && (
                                    <MenuItem
                                        color="primary"
                                        sx={{ display: "flex", justifyContent: "center" }}
                                    >
                                        <CircularProgress />
                                    </MenuItem>
                                )}
                                {dropdownOptions.organizations.length === 0 &&
                                    loader === false && (
                                        <>
                                            <MenuItem color="primary">
                                                <Typography width={"100%"}>
                                                    No organization found{" "}
                                                </Typography>
                                            </MenuItem>
                                        </>
                                    )}
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onFocus={() => handleFocus("ORGANIZATION")} onClick={() => handleModel(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            
        </Fragment>
    )
}
