import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import { DropdownOption } from '../Ticket/Ticket';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import React, { useCallback, useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, Select, MenuItem, InputLabel, FormControl, Button, Typography, Box, SelectChangeEvent, Paper, Divider, Link, styled, FormControlLabel, Checkbox, Modal, IconButton } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    height: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
};


export const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

// Type for the ticket form
export interface OrganizationForm {
    id: number;
    name: string;
    industry: string;
    type: industryType | "-1";
    address: string;
    city: string;
    state: typeof States[number]['id'] | "-1";
    pincode: string;
    logo: string;
    active: boolean;
}

export const States: DropdownOption[] = [
    { id: "AN", name: "Andaman and Nicobar Islands" },
    { id: "AP", name: "Andhra Pradesh" },
    { id: "AR", name: "Arunachal Pradesh" },
    { id: "AS", name: "Assam" },
    { id: "BR", name: "Bihar" },
    { id: "CH", name: "Chandigarh" },
    { id: "CT", name: "Chhattisgarh" },
    { id: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
    { id: "DL", name: "Delhi" },
    { id: "GA", name: "Goa" },
    { id: "GJ", name: "Gujarat" },
    { id: "HR", name: "Haryana" },
    { id: "HP", name: "Himachal Pradesh" },
    { id: "JK", name: "Jammu and Kashmir" },
    { id: "JH", name: "Jharkhand" },
    { id: "KA", name: "Karnataka" },
    { id: "KL", name: "Kerala" },
    { id: "LA", name: "Ladakh" },
    { id: "LD", name: "Lakshadweep" },
    { id: "MP", name: "Madhya Pradesh" },
    { id: "MH", name: "Maharashtra" },
    { id: "MN", name: "Manipur" },
    { id: "ML", name: "Meghalaya" },
    { id: "MZ", name: "Mizoram" },
    { id: "NL", name: "Nagaland" },
    { id: "OD", name: "Odisha" },
    { id: "PB", name: "Punjab" },
    { id: "RJ", name: "Rajasthan" },
    { id: "SK", name: "Sikkim" },
    { id: "TN", name: "Tamil Nadu" },
    { id: "TG", name: "Telangana" },
    { id: "TR", name: "Tripura" },
    { id: "UP", name: "Uttar Pradesh" },
    { id: "UK", name: "Uttarakhand" },
    { id: "WB", name: "West Bengal" }
] as const;


interface FormErr extends Pick<OrganizationForm, 'name'> {
    state: string;
    type: string;
 }
const InitialErr: FormErr = {
    name: "",
    state: "",
    type: ""
}

type industryType = "HEALTHCARE" | "LIBRARY";
export const industryList: industryType[] = ["LIBRARY", "HEALTHCARE"]

const Organization: React.FC = () => {
    const { orgId } = useParams<{ orgId: string | undefined }>();
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<OrganizationForm>({
        id: 0,
        name: "",
        industry: "",
        type: "HEALTHCARE",
        address: "",
        city: "",
        state: "-1",
        pincode: "",
        logo: "",
        active: true
    });

    const [warningList, setWarningList] = useState<FormErr>(InitialErr);

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Link key={1} component={RLink} underline="hover" color="inherit" to="/organizations">
                    Organization
                </Link>,
                <Typography key={2} >{orgId ? "Update" : "Create"}</Typography>,
            ],
        });

        const fetchDropdownOptions = async () => {
            // Simulating API calls
            startLoader(true);

            if (orgId) {
                await getData(orgId);
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
            active: name === "active" ? !prevData.active : prevData.active
        }));
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = (e.target as HTMLInputElement).files;
        const file = files && files.length > 0 ? files[0] : null
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Result = reader.result as string;

                setTicketData((prevData) => ({
                    ...prevData,
                    logo: base64Result
                }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = async () => {
        // Handle the form submission
        startLoader(true)
        if (validateInput() === true) {
            let response: AxiosResponse<any> = await myAxios.post(`/Organization/SaveOrganization`, { ...ticketData });
            try {
                if (response.data.status === "Success") {
                    startFir({
                        msg: "Organization save successfully",
                        type: "S"
                    })
                    handleNavigate("/organizations")
                } else {
                    startFir({
                        msg: "Unable to save organization",
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

        if (!ticketData.name || ticketData.name === '') {
            errList.name = ("Organization name is required.");
            isValid = false;
        }
        // if (!ticketData.city || ticketData.city === '') {
        //     errList.city = ("City is required.");
        //     isValid = false;
        // }
        if (!ticketData.state || ticketData.state === '-1') {
            errList.state = ("State is required.");
            isValid = false;
        }
        // if (!ticketData.pincode || ticketData.city === '') {
        //     errList.pincode = ("Pincode is required.");
        //     isValid = false;
        // }
        if (!ticketData.type || ticketData.type === '-1') {
            errList.type = ("Type is required.");
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


    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    const getData = useCallback(async (orgId: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Organization/AllOrganization?id=${orgId}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true`);
            if (req.status === 200) {
                const { data, status }: Response<OrganizationForm[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setTicketData({ ...data[0] })
                    }
                }
                else { }
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

    function handleSelectChange(e: SelectChangeEvent<unknown>, arg1: string): void {
        setTicketData((prevData) => ({
            ...prevData,
            [arg1]: `${e.target.value}`,
        }));
    }

    return (
        <Paper>
            <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                <Typography variant="h5" align="left" >
                    Organization Form
                </Typography>
                <Box display={"flex"} alignItems={"center"} >
                    <Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ width: "100%", textWrap: "nowrap" }}
                            onClick={() => handleNavigate("/organizations")}
                        >
                            Organization List
                        </Button>
                    </Grid>
                </Box>
            </Box>
            <Divider />
            <Grid container spacing={3} padding={2}>
                {/* Name  */}
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label={<> Organization Name  <span style={{ color: 'red' }} >*</span></>}
                        fullWidth
                        size='small'
                        value={ticketData.name}
                        onChange={handleInputChange}
                        name="name"
                        error={warningList.name !== "" ? true : false} 
                    />
                   
                </Grid>

                {/* Type  */}
                <Grid size={{ xs: 12, sm: 3 }} >
                    <FormControl size='small' fullWidth>
                        <InputLabel>{<> Type  <span style={{ color: 'red' }} >*</span></>}</InputLabel>
                        <Select
                            value={ticketData.type}
                            onChange={(e) => handleSelectChange(e, 'type')}
                            label="Type *"
                            size='small'
                            error={warningList.type !== "" ? true : false} 
                        >
                            <MenuItem value={-1}>
                                {"Choose Type"}
                            </MenuItem>
                            {industryList.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                </Grid>
                
                {/* State  */}
                <Grid size={{ xs: 12, sm: 3 }} >
                    <FormControl size='small' fullWidth>
                        <InputLabel>{<> State  <span style={{ color: 'red' }} >*</span></>}</InputLabel>
                        <Select
                            value={ticketData.state}
                            onChange={(e) => handleSelectChange(e, 'state')}
                            label="State *"
                            size='small'
                            error={warningList.state !== "" ? true : false} 
                        >
                            <MenuItem value={-1}>
                                {"Choose State"}
                            </MenuItem>
                            {States.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                   
                </Grid>

                {/* Industry  */}
                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label="Industry"
                        fullWidth
                        size='small'
                        value={ticketData.industry}
                        onChange={handleInputChange}
                        name="industry"
                    />
                </Grid>

                {/* City  */}
                <Grid size={{ xs: 12, sm: 3 }} >
                    <TextField
                        label="City"
                        fullWidth
                        size='small'
                        value={ticketData.city}
                        onChange={handleInputChange}
                        name="city"
                    />
                   
                </Grid>


                {/* Pincode  */}
                <Grid size={{ xs: 12, sm: 3 }} >
                    <TextField
                        label="Pincode"
                        fullWidth
                        size='small'
                        value={ticketData.pincode}
                        onChange={handleInputChange}
                        name="pincode"
                    />
                    
                </Grid>

                {/* Address  */}
                <Grid size={12}>
                    <TextField
                        label="Address"
                        fullWidth
                        size='small'
                        multiline
                        rows={3}
                        value={ticketData.address}
                        onChange={handleInputChange}
                        name="address"
                    />
                </Grid>

                {/* Active  */}
                <Grid size={{ xs: 12, md: 6 }} container>
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

                {/* Image  */}
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", gap: 2, alignItems: "center", flexDirection: "row-reverse" }} >
                    <Box sx={{ width: 250, p: 0, m: 0 }}>
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                        >
                            {ticketData.logo ? "Change" : "Upload"} Image
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleFile}
                                accept='image/*'
                            />
                        </Button>
                    </Box>
                    {ticketData.logo && <Box sx={{ width: 150, p: 0, m: 0 }}>
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<FullscreenIcon />}
                            fullWidth
                            color='info'
                            onClick={() => setOpen(true)}
                        >
                            View Image
                        </Button>
                    </Box>}
                    <Typography variant='overline' fontSize={13} >{ticketData.logo && "Image selected.."}</Typography>
                </Grid>


                {/* Submit Button */}
                <Grid size={12}>
                    <Box display="flex" justifyContent="center">
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {orgId ? 'Update' : 'Create'} Organization
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"

            >
                <Paper sx={style}>
                    <Box sx={{ width: "100%", height: "100%" }}>
                        <IconButton
                            edge="end"
                            color="error"
                            onClick={handleClose}
                            aria-label="close"
                            sx={{
                                position: 'absolute',
                                right: 15,
                                top: 1,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <img src={ticketData.logo} width={"100%"} height={"100%"} />
                    </Box>
                </Paper>
            </Modal>
        </Paper>
    );
};

export default Organization;

