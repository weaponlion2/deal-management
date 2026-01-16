import myAxios from '../api'; 
import { Fragment } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { TicketView } from '../Ticket/List';
import { DialogContentText } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

export interface IEmailPrep extends Pick<TicketView, "organizationName" | "productName" | "serialNo" | "ownerName" | "openDate" | "tickCode" | "closeDate" | "description"> {
    ownerEmail: string,
    contactEmail: string,
    organizationLocation: string,
    type: IEmailType,
}

export interface IEmailForm {
    recipientEmail: string,
    customerName: string,
    product: string,
    serialNo: string,
    serviceCallDescription: string,
    callCompletedBy: string,
    engineerContact: string,
    serviceClosureDate: string,
    feedbackLink: string,
    customerLocation: string,
    serviceContractEndDate: string,
    serviceAppointmentDate: string,
    assignedTo: string,
    ticketNo: string,
    type: IEmailType,
}

type IEmailType = "TICKETOPEN" | "TICKETCLOSE"
interface IProps {
    handleModel: (val: boolean) => void,
    // startFir: (obj: START_FIRE) => void,
    open: boolean,
    data: IEmailPrep | undefined
}


export default function EmailModal({ data, handleModel, open }: IProps) {
    const handleSubmit = async () => {
        myAxios.post(`/Email/SendEmail`, {
            assignedTo: (data && data.ownerName) ?? "",
            callCompletedBy: (data && data.ownerName) ?? "",
            customerLocation: (data && data.organizationLocation) ?? "",
            customerName: (data && data.organizationName) ?? "",
            engineerContact: (data && data.ownerEmail) ?? "",
            feedbackLink: "",
            product: (data && data.productName) ?? "",
            recipientEmail: (data && data.contactEmail) ?? "",
            serialNo: (data && data.serialNo) ?? "",
            serviceAppointmentDate: (data && data.openDate) ?? "",
            serviceCallDescription: (data && data.description) ?? "",
            serviceClosureDate: (data && data.closeDate) ?? "",
            serviceContractEndDate: "",
            ticketNo: (data && data.tickCode) ?? "",
            type: (data && data.type) ?? "TICKETOPEN"
        });
        handleModel(false); 
        // try {
        //     const { status }: Response<contactType[]> = req.data;
        //     if (status === "Success") {
        //         startFir({
        //             msg: "Email sent successfully",
        //             type: "S"
        //         })
        //         handleModel(false); 
        //     }
        // } catch (error: any) { 

        //     startFir({
        //         msg: "Something went wrong",
        //         type: "E"
        //     })
        // }
    };


    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={() => handleModel(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Email Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do you want send email to a contact?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleModel(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus>
                        Send
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}