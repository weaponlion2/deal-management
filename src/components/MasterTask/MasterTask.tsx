import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import { DropdownOption, fetchOptions } from '../Ticket/Ticket';
import React, { useCallback, useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, Select, MenuItem, InputLabel, FormControl, Button, Typography, Box, SelectChangeEvent, Paper, Divider, Link } from '@mui/material';

// Type for the ticket form
export interface Form {
    id: number;
    name: string;
    description: string;
    type: string;
}

interface FormErr extends Pick<Form, 'name' | 'type' | 'description'> { }
const InitialErr: FormErr = {
    name: "",
    description: "",
    type: ""
}


const NewMasterTask: React.FC = () => {
    const { mid } = useParams<{ mid: string | undefined }>();
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<Form>({
        id: 0,
        name: "",
        description: "",
        type: "-1",
    });

    const [warningList, setWarningList] = useState<FormErr>(InitialErr);
    const [typeList, setTypeList] = useState<DropdownOption[]>([]);

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Link key={1} component={RLink} underline="hover" color="inherit" to="/mastertask">
                    Master Task
                </Link>,
                <Typography key={2} >{mid ? "Update" : "Create"}</Typography>,
            ],
        });

        const fetchDropdownOptions = async () => {
            // Simulating API calls
            startLoader(true);
            setTypeList(await fetchOptions("itemtypes"))

            if (mid) {
                await getData(mid);
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
            // active: name === "active" ? !prevData.active : prevData.active
        }));
    };


    const handleSubmit = async () => {
        // Handle the form submission
        startLoader(true)
        if (validateInput() === true) {
            let response: AxiosResponse<any> = await myAxios.post(`/MasterTask/SaveMtask`, { ...ticketData });
            try {
                if (response.data.status === "Success") {
                    startFir({
                        msg: "Master Task save successfully",
                        type: "S"
                    })
                    handleNavigate("/mastertask")
                } else {
                    startFir({
                        msg: "Unable to save Master Task",
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
            errList.name = ("Master Task name is required.");
            isValid = false;
        }
        if (!ticketData.description || ticketData.description === '') {
            errList.description = ("Master Task description is required.");
            isValid = false;
        }
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

    const getData = useCallback(async (mid: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/MasterTask/ShowAllMtask?id=${mid}&type`);
            if (req.status === 200) {
                const { data, status }: Response<Form[]> = req.data;
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

    function handleSelectChange(e: SelectChangeEvent<string>, arg1: string): void {
        setTicketData((prevData) => ({
            ...prevData,
            [arg1]: `${e.target.value}`,
        }));
    }

    return (
        <Paper>
            <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                <Typography variant="h5" align="left" >
                    Master Task Form
                </Typography>
                <Box display={"flex"} alignItems={"center"} >
                    <Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ width: "100%", textWrap: "nowrap" }}
                            onClick={() => handleNavigate("/mastertask")}
                        >
                            Master Task List
                        </Button>
                    </Grid>
                </Box>
            </Box>
            <Divider />
            <Grid container spacing={3} padding={2}>

                <Grid size={{ xs: 12, sm: 6 }} >
                    <TextField
                        label="Master Task Name "
                        fullWidth
                        size='small'
                        value={ticketData.name}
                        onChange={handleInputChange}
                        name="name"
                        required
                    />
                    {warningList.name && (
                        <Typography
                            variant="button"
                            sx={{ display: "block", textAlign: "right", color: "red" }}
                        >
                            {warningList.name}
                        </Typography>
                    )}
                </Grid>


                <Grid size={{ xs: 12, sm: 6 }} >
                    <FormControl size='small' fullWidth>
                        <InputLabel>Type *</InputLabel>
                        <Select
                            value={ticketData.type}
                            onChange={(e) => handleSelectChange(e, 'type')}
                            label="Type * "
                            size='small'
                        >
                            <MenuItem value={-1}>
                                {"Choose Type"}
                            </MenuItem>
                            {typeList.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {warningList.type && (
                        <Typography
                            variant="button"
                            sx={{ display: "block", textAlign: "right", color: "red" }}
                        >
                            {warningList.type}
                        </Typography>
                    )}
                </Grid>

                <Grid size={{ xs: 12, sm: 12 }} >
                    <TextField
                        label="Master Task Description "
                        fullWidth
                        size='small'
                        value={ticketData.description}
                        onChange={handleInputChange}
                        name="description"
                        required
                        multiline
                        rows={4}
                    />
                    {warningList.description && (
                        <Typography
                            variant="button"
                            sx={{ display: "block", textAlign: "right", color: "red" }}
                        >
                            {warningList.description}
                        </Typography>
                    )}
                </Grid>

                {/* Submit Button */}
                <Grid size={12}>
                    <Box display="flex" justifyContent="center">
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            {mid ? 'Update' : 'Create'} Master Task
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default NewMasterTask;
