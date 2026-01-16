import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { DropdownOption } from './Ticket';
import { AxiosError, AxiosResponse } from 'axios';
import myAxios from '../api';
import { Response, START_FIRE } from '../Layout.Interface';
import { industryList, OrganizationForm, States } from '../Organization/Organization';

interface FormErr extends Pick<OrganizationForm, 'name'> {
    state: string;
    type: string;
}
const InitialErr: FormErr = {
    name: "",
    state: "",
    type: ""
}

interface IProps {
    handleModel: (val: boolean) => void,
    startFir: (obj: START_FIRE) => void,
    open: boolean,
    callBack: (data: DropdownOption, type: "contact" | "organization") => void
}

const Initial: OrganizationForm = {
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
}

export default function OrganizationModal({ startFir, handleModel, open, callBack }: IProps) {
    const [ticketData, setTicketData] = useState<OrganizationForm>(Initial);
    const [warningList, setWarningList] = useState<FormErr>(InitialErr);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTicketData((prevData: OrganizationForm) => ({
            ...prevData,
            [name]: value,
            active: true
        }));
    };

    const handleSubmit = async () => {

        if (validateInput() === true) {
            const req: AxiosResponse = await myAxios.post(`/Organization/SaveOrganization`, { ...ticketData });
            try {
                const { status, data }: Response<DropdownOption[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        callBack(data[0], "organization");
                    }
                    startFir({
                        msg: "Organization save successfully",
                        type: "S"
                    })
                    handleModel(false);
                    setTicketData(Initial);
                } else {
                    startFir({
                        msg: "Unable to save Organization",
                        type: "W"
                    })
                }
            }
            catch (_err: unknown) {
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

        // startLoader(false)

    };

    const validateInput = (): boolean => {
        const errList: FormErr = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.name || ticketData.name === '') {
            errList.name = ("Name is required.");
            isValid = false;
        }
        if (!ticketData.state || ticketData.state === '-1') {
            errList.state = ("State is required.");
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



    function handleSelectChange(e: SelectChangeEvent<unknown>, arg1: string): void {
        setTicketData((prevData) => ({
            ...prevData,
            [arg1]: `${e.target.value}`,
        }));
    }



    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={() => handleModel(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"New Organization"}
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">
                    </DialogContentText> */}
                    <Grid container spacing={3} padding={2}>


                        <Grid size={{ xs: 12, sm: 12 }} >
                            <TextField
                                label={<>Organization Name  <span style={{ color: 'red' }} >*</span></>}
                                fullWidth
                                size='small'
                                value={ticketData.name}
                                onChange={handleInputChange}
                                name="name"
                                error={warningList.name !== "" ? true : false}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl error={warningList.type !== "" ? true : false} size='small' fullWidth>
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


                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.state !== "" ? true : false}>{<> State  <span style={{ color: 'red' }} >*</span></>}</InputLabel>
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
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleModel(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}