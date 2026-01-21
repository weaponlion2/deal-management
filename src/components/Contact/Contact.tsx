import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DropdownOption, fetchOptions } from '../Ticket/Ticket';
import { FIRE, HEADER_FIRE, Response, START_FIRE, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, MenuItem, Button, Typography, Box, Paper, Divider, Link, FormControlLabel, Checkbox, IconButton, CircularProgress, Tooltip, Stack } from '@mui/material';
import { FileTypes, IDealDropdown, SType } from '../Deal/Deal';
import OrganizationModal from '../Ticket/OrganizationModal';
import { green, red } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import { CancelOutlined } from '@mui/icons-material';
// Type for the ticket form
export interface ContactForm {
    id: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    phone: string;
    mobile: string;
    extension: string;
    organizationName: string;
    email: string;
    organizationId: string;
    company: string;
    active: boolean;
}

interface FormErr extends Pick<ContactForm, 'firstName' | 'mobile' | 'email'> { }
const InitialErr: FormErr = {
    firstName: "",
    mobile: "",
    email: "",
}

const Contact: React.FC = () => {
    const { cid } = useParams<{ cid: string | undefined }>();
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<ContactForm>({
        id: 0,
        firstName: "",
        lastName: "",
        company: "",
        extension: "",
        email: "",
        jobTitle: "",
        organizationName: "",
        mobile: "",
        organizationId: "",
        phone: "",
        active: true
    });

    const [warningList, setWarningList] = useState<FormErr>(InitialErr);
    const [, setOrganizationList] = useState<DropdownOption[]>([]);

    const handleMsg = (obj: START_FIRE) => startFir(obj);
    const [loader, setLoader] = useState<boolean>(false);
    const [searchOrigan, setSearchOrigan] = useState<boolean>(false);
    const [, setSearchCont] = useState<boolean>(false);
    const [organizationModel, setOrganizationModel] = useState<boolean>(false);
    const [dropdownOptions, setDropdownOptions] = useState<IDealDropdown>({
        pipelines: [],
        contacts: [],
        items: [], 
        organizations: [],
        owners: [], 
        status: [],
        dealtypes: [],
        filetypes: [...FileTypes],
        bilingFreqency:[],
        paymentTerm:[],
    })

    const oriRef = useRef<HTMLDivElement | null>(null);


    const handleOrganizationModel = (val: boolean) => setOrganizationModel(val);

    const callManipulator = useCallback((data: DropdownOption, type: "contact" | "organization") => {
        if (type === "contact") {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.contacts] }));
            setTicketData((ticketData) => ({ ...ticketData, contactId: `${data.id}`, contactName: data.name }))
        }
        else {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.organizations] }));
            setTicketData((ticketData) => ({ ...ticketData, organizationId: `${data.id}`, organizationName: data.name }))
        }
    }, [dropdownOptions])

    function changeData(id: string, val: string, type: SType): void {
        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: val, organizationId: id }))
        }
        else {
            setTicketData((tData) => ({ ...tData, contactName: val, contactId: id }))
        }
        setSearchCont(false)
        setSearchOrigan(false)
    }


    {/* changes*/ }

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Link key={1} component={RLink} underline="hover" color="inherit" to="/contacts">
                    Contact
                </Link>,
                <Typography key={2} >{cid ? "Update" : "Create"}</Typography>,
            ],
        });

        const fetchDropdownOptions = async () => {
            // Simulating API calls
            startLoader(true);
            setOrganizationList(await fetchOptions("organizations", "&id=0"))
            if (cid) {
                await getData(cid);
            }
            startLoader(false)
        };
        fetchDropdownOptions();

        return () =>
            setUpHeader({
                title: "",
                sub_title: "",
                breadcrum() {
                    return [];
                },
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: value,
            mobile: name === "mobile" ? value.length > 10 ? prevData.mobile : value : prevData.mobile,
            phone: name === "phone" ? value.length > 10 ? prevData.phone : value : prevData.phone
        }));
    };


    const handleSubmit = async () => {
        // Handle the form submission
        startLoader(true)
        if (validateInput() === true) {
            const response: AxiosResponse = await myAxios.post(`/Contact/SaveContact`, { ...ticketData, organizationId: Number(ticketData.organizationId) });
            try {
                if (response.data.status === "Success") {
                    startFir({
                        msg: "Contact save successfully",
                        type: "S"
                    })
                    handleNavigate("/contacts")
                } else {
                    startFir({
                        msg: "Unable to save contact",
                        type: "W"
                    })
                }
            } catch (_err: unknown) {
                if (_err instanceof AxiosError) {
                    console.log(_err.message);
                } else {
                    console.log("An unexpected error occurred");
                }

                startFir({
                    msg: "Something went wrong",
                    type: "E"
                })
            }
        }

        startLoader(false)

    };

    const validateInput = (): boolean => {
        const errList: FormErr = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.firstName || ticketData.firstName === '') {
            errList.firstName = ("First name is required.");
            isValid = false;
        }
        if (!ticketData.mobile || ticketData.mobile === '') {
            errList.mobile = ("Mobile is required.");
            isValid = false;
        }
        if (!ticketData.email || ticketData.email === '') {
            errList.email = ("Email is required.");
            isValid = false;
        }

        if (!isValid) {
            startFir({
                msg: "Please fill up all required field.",
                type: "W"
            })
        }
        setWarningList({ ...errList })
        return isValid;
    }

    const getData = useCallback(async (cid: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Contact/ShowAllContacts?id=${cid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true`);
            if (req.status === 200) {
                const { data, status }: Response<ContactForm[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setTicketData(data[0])
                    }
                }
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }
        }
    }, []);



    const navigate = useNavigate();
    const handleNavigate = useCallback((arg0: string): undefined => {
        navigate(arg0)
    }, []);


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: SType) => {


        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: e.target.value }))
        }
        else {
            setTicketData((tData) => ({ ...tData, contactName: e.target.value }))
        }
        if (e.target.value.length > 2) {
            getSearch(e.target.value, type);
            if (type === "ORGANIZATION") {
                setSearchOrigan(true);
                setSearchCont(false);
            }
            else if (type === "CONTACT") {
                setSearchCont(true);
                setSearchOrigan(false);
            }
            else {
                setSearchCont(false);
                setSearchOrigan(false);
            }
        }
    };

    const getSearch = async (val: string, type: SType) => {
        setLoader(true)
        try { //2024-12-20
            const req = await myAxios.get(`/Organization/CommanSearch?type=${type}&parameter=${val}`);
            if (req.status === 200) {
                const { data, status }: Response<DropdownOption[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        if (type === "CONTACT") {
                            setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, contacts: data }));
                        }
                        else if (type === "ORGANIZATION") setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, organizations: data }));
                    }
                }
                else { throw Error("Not found") }
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }

            if (type === "CONTACT") {
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, contacts: [] }));
            }
            else if (type === "ORGANIZATION") setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, organizations: [] }));
        }
        setLoader(false)
    }

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

    const handleResetOri = (type: SType) => {
        if (type === "ORGANIZATION") {
            setTicketData((prev) => ({
                ...prev,
                organizationId: "0",
                organizationName: ""
            }))
        }
        else if (type === "CONTACT") {
            setTicketData((prev) => ({
                ...prev,
                contactId: "0",
                contactName: ""
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
        <Paper>
            <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                <Typography variant="h5" align="left" >
                    Contact Form
                </Typography>
                <Box display={"flex"} alignItems={"center"} >
                    <Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ width: "100%", textWrap: "nowrap" }}
                            onClick={() => handleNavigate("/contacts")}
                        >
                            Contact List
                        </Button>
                    </Grid>
                </Box>
            </Box>
            <Divider />
            <Grid container spacing={3} padding={2}>

                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label={<> First Name  <span style={{ color: 'red' }} >*</span></>}
                        fullWidth
                        size='small'
                        value={ticketData.firstName}
                        onChange={handleInputChange}
                        name="firstName"
                        // required
                        error={warningList.firstName !== "" ? true : false}
                    />

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label="Last Name"
                        fullWidth
                        size='small'
                        value={ticketData.lastName}
                        onChange={handleInputChange}
                        name="lastName"
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative", width: '48%' }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                {/* Organization Input */}
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
                                                    sx={{ flex: 1 }}
                                                    slotProps={{
                                                        input: {
                                                            name: `${"oiuy" + Math.random()}`
                                                        },
                                                    }}
                                                />
                
                                                {/* Buttons */}
                                                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                                                    <Tooltip title="New Organization">
                                                        <IconButton sx={{ color: green[600] }} onClick={() => handleOrganizationModel(true)} size="small" tabIndex={-1}>
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reset Organization">
                                                        <IconButton sx={{ color: red[600] }} onClick={() => handleResetOri("ORGANIZATION")} size="small" tabIndex={-1}>
                                                             <CancelOutlined fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Box>
                
                                            {/* Dropdown */}
                                            <Paper
                                                ref={oriRef}
                                                tabIndex={-1}
                                                onMouseEnter={() => setSearchOrigan(true)}
                                                sx={{
                                                    position: "absolute",
                                                    right: 0,
                                                    top: 40,
                                                    zIndex: 111,
                                                    width: "100%",
                                                    borderRadius: 1,
                                                    display: searchOrigan ? "block" : "none",
                                                    maxHeight: 200,
                                                    overflow: "auto"
                                                }}
                                            >
                                                {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" fontSize={15} p={1} px={2}>
                                                        List of Organization
                                                    </Typography>
                                                    <IconButton tabIndex={-1} onClick={() => setSearchOrigan(false)}>
                                                        <CancelOutlined />
                                                    </IconButton>
                                                </Box>
                
                                                <Divider /> */}
                
                                                {dropdownOptions.organizations.map((v) => (
                                                    <MenuItem key={v.id} onClick={() => changeData(`${v.id}`, v.name, "ORGANIZATION")}>
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                            <Typography>{v.name}</Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                
                                                {dropdownOptions.organizations.length === 0 && loader && (
                                                    <MenuItem sx={{ display: "flex", justifyContent: "center" }}>
                                                        <CircularProgress />
                                                    </MenuItem>
                                                )}
                
                                                {dropdownOptions.organizations.length === 0 && !loader && (
                                                    <MenuItem>
                                                        <Typography width="100%">No organization found</Typography>
                                                    </MenuItem>
                                                )}
                                            </Paper>
                                        </Grid>


                {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative" }} >
                    <TextField
                        label="Organization"
                        value={ticketData.organizationName ?? ""}
                        onChange={(e) => handleSearch(e, "ORGANIZATION")}
                        placeholder='Search Organization...'
                        size='small'
                        name='searhbar'
                        type='text'
                        fullWidth
                        onFocus={() => setSearchOrigan(true)}
                        slotProps={{
                            input: {
                                name: `${"oiuy" + Math.random()}`
                            },
                        }}
                    />

                    <Paper ref={oriRef} tabIndex={-1} onMouseEnter={() => setSearchOrigan(true)} sx={{ position: "absolute", right: 0, top: 40, zIndex: 111, width: "100%", borderRadius: 1, display: searchOrigan ? "block" : "none", maxHeight: 200, overflow: "auto" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant='caption' fontSize={15} p={1} px={2}>List of Organization</Typography>
                            <IconButton tabIndex={-1} onClick={() => { setSearchOrigan(false); }}><CancelOutlined /></IconButton>
                        </Box>
                        <MenuItem value={-2} sx={{ color: green[600] }} onClick={() => handleOrganizationModel(true)}>
                            {"New Organization"}
                        </MenuItem>
                        <MenuItem sx={{ color: red[600] }} value={-2} onClick={() => handleResetOri("ORGANIZATION")}>
                            {"Reset Organization"}
                        </MenuItem>
                        <Divider />
                        {
                            dropdownOptions.organizations.map((v) => (
                                <MenuItem color='primary' key={v.id} onClick={() => changeData(`${v.id}`, v.name, "ORGANIZATION")} >
                                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                        <Box sx={{ display: "flex" }}>
                                            <Typography>{v.name}</Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            ))
                        }
                        {
                            dropdownOptions.organizations.length === 0 && loader && (
                                <MenuItem color='primary' sx={{ display: "flex", justifyContent: "center" }}>
                                    <CircularProgress />
                                </MenuItem>)
                        }
                        {
                            dropdownOptions.organizations.length === 0 && loader === false && (
                                <>
                                    <MenuItem color='primary'>
                                        <Typography width={"100%"}>No organization found </Typography>
                                    </MenuItem>
                                </>
                            )
                        }

                    </Paper>
                </Grid> */}



                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        onFocus={() => { handleFocus("ORGANIZATION") }}
                        label="Job title"
                        fullWidth
                        size='small'
                        value={ticketData.jobTitle}
                        onChange={handleInputChange}
                        name="jobTitle"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label={<> Email  <span style={{ color: 'red' }} >*</span></>}
                        fullWidth
                        size='small'
                        value={ticketData.email}
                        onChange={handleInputChange}
                        name="email"
                        //required
                        error={warningList.email !== "" ? true : false}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label={<> Mobile  <span style={{ color: 'red' }} >*</span></>}
                        fullWidth
                        size='small'
                        value={ticketData.mobile}
                        onChange={handleInputChange}
                        name="mobile"
                        //required
                        error={warningList.mobile !== "" ? true : false}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label="Alternate Mobile"
                        fullWidth
                        size='small'
                        value={ticketData.phone}
                        onChange={handleInputChange}
                        name="phone"
                    />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Extension"
                        fullWidth
                        size='small'
                        value={ticketData.extension}
                        onChange={handleInputChange}
                        name="extension"
                    />
                </Grid>
                {/* Description */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                        label="Company"
                        fullWidth
                        size='small'
                        value={ticketData.company}
                        onChange={handleInputChange}
                        name="company"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} container display={"none"}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="active"
                                checked={ticketData.active}
                                onChange={handleInputChange}
                                size="small"
                            />
                        }
                        label="Active"
                    />
                </Grid>

                {/* Submit Button */}
                <Grid size={12}>
                    <Box display="flex" justifyContent="center">
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {cid ? 'Update' : 'Create'} Contact
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <OrganizationModal open={organizationModel} handleModel={handleOrganizationModel} startFir={handleMsg} callBack={callManipulator} />
        </Paper>
    );
};

export default Contact;
