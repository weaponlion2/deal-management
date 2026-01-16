import { Fragment, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Grid2 as Grid, TextField, } from '@mui/material';
import { contactType } from '../Ticket/Ticket';
import { AxiosError, AxiosResponse } from 'axios';
import myAxios from '../api';
import { Response, START_FIRE } from '../Layout.Interface';

interface IPassword {
    email: string,
    password: string,
    nPassword: string,
}
const InitialErr: IPassword = {
    password: "",
    nPassword: "",
    email: "",
}

interface IProps {
    handleModel: (val: boolean) => void,
    startFir: (obj: START_FIRE) => void,
    open: boolean
}

const Initial: IPassword = {
    email: localStorage.getItem("@User") ?? "",
    password: "",
    nPassword: "",
}

export default function ChangePassword({ startFir, handleModel, open }: IProps) {
    const [ticketData, setTicketData] = useState<IPassword>(Initial);

    const [warningList, setWarningList] = useState<IPassword>(InitialErr);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {

        if (validateInput() === true) {
            let req: AxiosResponse = await myAxios.post(`/User/ChangePassword`, { ...ticketData });
            try {
                const { status }: Response<contactType[]> = req.data;
                if (status === "Success") {
                    startFir({
                        msg: "Password change successfully",
                        type: "S"
                    })
                    handleModel(false);
                    setTicketData(Initial);
                } else {
                    startFir({
                        msg: "Unable to change password",
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

        // startLoader(false)

    };

    const validateInput = (): boolean => {
        const errList: IPassword = { ...InitialErr };
        let isValid: boolean = true;
        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

        if (ticketData.password) {
            if (!passwordRegex.test(ticketData.password)) {
                isValid = false;
                errList.password = "Password must have 8-16 characters, including a capital letter, number, and special character.";
            } else if (ticketData.password.length < 8) {
                isValid = false;
                errList.password = "Password must be at least 8 characters long.";
            }
        }
        if (isValid) {
            if (ticketData.password !== ticketData.nPassword) {
                isValid = false;
                errList.nPassword = "Confirm Password does not match with New Password.";
            }
        }
        setWarningList({ ...errList })
        return isValid;
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
                    {"Change Password"}
                </DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">
                    </DialogContentText> */}
                    <Grid container spacing={3} paddingY={1}>

                        <Grid size={{ xs: 12, sm: 12 }} >
                            <TextField
                                label={<>New Password <span style={{ color: "red" }}>*</span></>}
                                fullWidth
                                size='small'
                                value={ticketData.password}
                                onChange={handleInputChange}
                                name="password"
                                error={warningList.password !== "" ? true : false}
                                helperText={warningList.password !== "" ? warningList.password : ""}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12 }} >
                            <TextField
                                label={<>Confirm Password <span style={{ color: "red" }}>*</span></>}
                                fullWidth
                                size='small'
                                value={ticketData.nPassword}
                                onChange={handleInputChange}
                                name="nPassword"
                                error={warningList.nPassword !== "" ? true : false}
                                helperText={warningList.nPassword !== "" ? warningList.nPassword : ""}
                            />
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