import dayjs from 'dayjs';
import myAxios from '../api';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { StatusNode, TaskDropdown } from './List';
import { isValidDate, TicketForm } from './Ticket';
import DialogTitle from '@mui/material/DialogTitle';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useCallback, useEffect, useState } from 'react';
import { Response, START_LOADER } from '../Layout.Interface';
import { Accordion, AccordionDetails, AccordionSummary, Box, MenuList, Typography } from '@mui/material';
import { CircularProgress, Divider, FormControl, Grid2 as Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AxiosError } from 'axios';

export interface ITicketForm extends TicketForm { ownerName: string }

const TicketDialog = ({ tid, onClose, startLoader, dropdown, handleSubmit }: { tid: string | null; onClose: () => void; startLoader: START_LOADER, dropdown: TaskDropdown, handleSubmit: (data: TicketForm) => Promise<boolean> }) => {
    const [ticketData, setTicketData] = useState<ITicketForm | null>(null);
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        if (tid) {
            getData(tid);
        }
    }, [tid])

    const getData = async (tid: string) => {
        try { //2024-12-20
            startLoader(true)
            const req = await myAxios.get(`/Tickets/ShowTicket?id=${tid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true&showComment=false`);
            if (req.status === 200) {
                const { data, status }: Response<ITicketForm[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setTicketData({ ...data[0], openDate: dayjs(data[0]['openDate']).format("YYYY-MM-DDTHH:mm"), itemType: `${data[0]['itemType']}+${data[0]['itemType']}`, task: "-1", closeDate: isValidDate(data[0]['closeDate']) ? dayjs(data[0]['closeDate']).format("YYYY-MM-DDTHH:mm") : "" })
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
        startLoader(false)
    };

    const closeModel = () => {
        setTicketData(null)
        onClose()
    }

    const handleInputChange = useCallback((value: string, index: number, name: string): void => {
        setTicketData((prevData) => {
            const tasks = prevData?.taskmodel;
            if (tasks) {
                tasks[index] = { ...tasks[index], [name]: value }
                return { ...prevData, taskmodel: [...tasks] }
            }
            return prevData ? prevData : null;
        })
    }, []);

    const updateTicket = async () => {
        if (ticketData) {
            setLoading(true)
            handleSubmit(ticketData)
                .then(() => {
                    setLoading(false)
                    closeModel();
                })
        }
    }

    return (
        <Dialog open={(tid && ticketData) ? true : false} onClose={closeModel} maxWidth="md" fullWidth>
            <DialogTitle sx={{ position: 'relative', paddingRight: 2, fontWeight: 500, fontSize: '1.25rem' }}>
                Ticket Details
                <IconButton
                    edge="end"
                    color="error"
                    onClick={closeModel}
                    aria-label="close"
                    sx={{
                        position: 'absolute',
                        right: 15,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ paddingBottom: 3 }}>
                {/* Table to Display Data in Vertical Format */}
                <Table sx={{ minWidth: 650 }}>
                    <TableBody>

                        {/* Row 3: Pipeline */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Pipeline:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.pipeline}</TableCell>
                        </TableRow>

                        {/* Row 4: Description */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Description:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.description}</TableCell>
                        </TableRow>

                        {/* Row 5: Source */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Source:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.source}</TableCell>
                        </TableRow>

                        {/* Row 6: Priority (with border) */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Priority:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.priority}</TableCell>
                        </TableRow>

                        {/* Row 2: Created On */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Created On:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.createdOn}</TableCell>
                        </TableRow>

                        {/* Row 7: Open Date */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Open Date:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.openDate}</TableCell>
                        </TableRow>

                        {/* Row 8: Close Date */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Close Date:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.closeDate}</TableCell>
                        </TableRow>

                        {/* Row 9: Status (with border) */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Status:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.status && StatusNode[ticketData?.status]}</TableCell>
                        </TableRow>

                        {/* Row 10: Owner (with border) */}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: 'textSecondary', border: "1px solid rgba(224, 224, 224, 1)" }}>Owner:</TableCell>
                            <TableCell sx={{ border: '1px solid #ccc', padding: 1 }}>{ticketData?.ownerName}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Box sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                    <Box sx={{ fontWeight: 600, color: 'textSecondary', px: 2, pt: 1 }}>List of Tasks:</Box>
                    <Box sx={{}}>
                        <MenuList>
                            {ticketData?.taskmodel?.map((v, i) =>
                                <Accordion defaultExpanded>
                                    <AccordionSummary
                                        expandIcon={<GridExpandMoreIcon />}
                                        aria-controls="panel3-content"
                                        id="panel3-header"
                                    >
                                        <Typography component="span">⌘ {v.name}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={3} padding={1}>

                                            {/* Opening Date */}
                                            <Grid size={{ xs: 12, sm: 6 }} >
                                                <TextField
                                                    label="Closing Date"
                                                    type="datetime-local"
                                                    size='small'
                                                    fullWidth
                                                    value={v.endDate}
                                                    onChange={(e) => handleInputChange(e.target.value, i, "endDate")}
                                                    name="endDate"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                                {/* {warningList.openDate && (
                                                    <Typography
                                                        variant="button"
                                                        sx={{ display: "block", textAlign: "right", color: "red" }}
                                                    >
                                                        {warningList.openDate}
                                                    </Typography>
                                                )} */}
                                            </Grid>

                                            {/* Owner Dropdown */}
                                            <Grid size={{ xs: 12, sm: 6 }} >
                                                <FormControl size='small' fullWidth>
                                                    <InputLabel>Owner</InputLabel>
                                                    <Select
                                                        value={v.userid}
                                                        onChange={(e) => handleInputChange(e.target.value, i, "userid")}
                                                        label="Owner"
                                                        size='small'
                                                    >
                                                        <MenuItem value={-1}>
                                                            {/* {owners.length === 0 ? "No Owners" : "Choose Owner"} */}
                                                            Choose Owner
                                                        </MenuItem>
                                                        {dropdown.owners.map((option) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                {/* {warningList.owner && (
                                                <Typography
                                                    variant="button"
                                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                                >
                                                    {warningList.owner}
                                                </Typography>
                                            )} */}
                                            </Grid>

                                            {/* Status Dropdown */}
                                            <Grid size={{ xs: 12, sm: 6 }} >
                                                <FormControl size='small' fullWidth>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={v.status}
                                                        onChange={(e) => handleInputChange(e.target.value, i, "status")}
                                                        label="Status"
                                                        size='small'
                                                    >
                                                        <MenuItem value={-1}>
                                                            Choose Status
                                                        </MenuItem>
                                                        {dropdown.statuses.map((option) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                {/* {warningList.owner && (
                                                <Typography
                                                    variant="button"
                                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                                >
                                                    {warningList.owner}
                                                </Typography>
                                            )} */}
                                            </Grid>

                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    label="Comment"
                                                    fullWidth
                                                    value={v.comment ?? ""}
                                                    onChange={(e) => handleInputChange(e.target.value, i, "comment")}
                                                    name="comment"
                                                    size='small'
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                    {/* <AccordionActions>
                                        <Button>Cancel</Button>
                                        <Button>Agree</Button>
                                    </AccordionActions> */}
                                </Accordion>
                            )}
                        </MenuList>
                    </Box>
                </Box>
                {/* Divider */}
            </DialogContent>
            <Divider sx={{ my: 0 }} />
            {/* Action Buttons */}
            <DialogActions sx={{ paddingX: 2, paddingY: 1.5 }}>
                <Button onClick={closeModel} color="error" variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 600, width: 100 }}>
                    Close
                </Button>

                <Button onClick={updateTicket} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 600, width: 100 }}>
                    {!loading ? "Update" : <CircularProgress />}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TicketDialog;

