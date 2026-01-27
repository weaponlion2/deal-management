import { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { Grid2 as Grid, TextField } from "@mui/material";
import { Statuses } from "./Ticket";
import { AxiosError, AxiosResponse } from "axios";
import myAxios from "../api";
import { Response, START_FIRE } from "../Layout.Interface";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";

export const StatusText: Record<typeof Statuses[number]['id'] | "-1", string> =
{
  "-1": "None",
  "OPN": "OPEN",
  "INP": "IN-PROGRESS",
  "PEN-US": "PENDING (on us)",
  "PEN-CS": "PENDING (on customer)",
  "CAN": "CANCELLED",
  "CLO": "CLOSED",
  "RE": "RENEWED",
  "SR": "SERVICES",
  "WI": "WITHDRAW"
};

interface ExportForm {
    formdate: string;
    todate: string;
    productId: string;
    productTypeId: string;
}

interface FormErr {
    formdate: string;
    todate: string;
    product: string;
}
const InitialErr: FormErr = {
    formdate: "",
    todate: "",
    product: "",
};

interface IProps {
    handleModel: (val: boolean) => void;
    startFir: (obj: START_FIRE) => void;
    open: boolean;
    startLoader: (val: boolean) => void
}

interface IExcelData {
    customerName: string,
    city: string,
    mobile : string, 
    model: string,
    openingdate : string,
    closingdate: string,
    natureOfproblem: string, 
    call_status: string
}

const Initial: ExportForm = {
    formdate: dayjs().format("YYYY-MM-DD"),
    productId: "",
    productTypeId: "",
    todate: dayjs().format("YYYY-MM-DD")
};

export default function ExportModal({
    startFir,
    handleModel,
    open,
    startLoader
}: IProps) {
    const [ticketData, setTicketData] = useState<ExportForm>(Initial);
    const [warningList, setWarningList] = useState<FormErr>(InitialErr);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (validateInput() === true) {
            startLoader(true)
            handleModel(false)
            let req: AxiosResponse = await myAxios.get(`/Ticket/ShowExecelExportData?fromdate=${ticketData.formdate}&todate=${ticketData.todate}`);
            try {
                const { status, data }: Response<IExcelData[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        exportToExcel(data);
                    }
                    startFir({
                        msg: "Export data successfully",
                        type: "S",
                    });
                    handleModel(false);
                    setTicketData(Initial);
                } else {
                    startFir({
                        msg: "Unable to export data",
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

        startLoader(false)
    };

    const validateInput = (): boolean => {
        const errList: FormErr = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.formdate || ticketData.formdate === "") {
            errList.formdate = "First name is required.";
            isValid = false;
        }
        if (!ticketData.todate || ticketData.todate === "") {
            errList.todate = "Mobile is required.";
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


    const exportToExcel = (data: IExcelData[]) => {
        
        const exportData = data.map((item: IExcelData) => ({
          'Customer Name': item.customerName,
          'City': item.city,
          'Mobile Number': item.mobile,
          'Product': item.model,
          'Opening Date': item.openingdate,
          'Closing Date': item.closingdate,
          'Remark': item.natureOfproblem,
          'Status': StatusText[item.call_status as typeof Statuses[number]['id']]
        }));
      
        // Create a new workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
      
        // Add the sheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
        // Export the workbook as a file
        XLSX.writeFile(wb, 'exported_data.xlsx');
      };
    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={() => handleModel(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Export Ticket"}</DialogTitle>
                <DialogContent>
                    {/* <DialogContentText id="alert-dialog-description">
                    </DialogContentText> */}
                    <Grid container spacing={3} padding={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={
                                    <>
                                        From date <span style={{ color: "red" }}>*</span>
                                    </>
                                }
                                fullWidth
                                size="small"
                                value={ticketData.formdate}
                                onChange={handleInputChange}
                                name="formdate"
                                error={warningList.formdate !== "" ? true : false}
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={
                                    <>
                                        To date <span style={{ color: "red" }}>*</span>
                                    </>
                                }
                                fullWidth
                                size="small"
                                value={ticketData.todate}
                                onChange={handleInputChange}
                                name="todate"
                                error={warningList.todate !== "" ? true : false}
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleModel(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} autoFocus> Download </Button>
                </DialogActions>
            </Dialog>

        </Fragment>
    )
}
