import myAxios from '../api';
import { DataGrid, GridColDef, GridRenderCellParams, } from '@mui/x-data-grid';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid2 as Grid, InputLabel, Link, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useLocation, useOutletContext, useParams } from "react-router-dom";
import { commentForm, CommentLine, DropdownOption, fetchComment, fetchOptions, isValidDate, Statuses, TaskForm } from '../Ticket/Ticket';
import { StatusTypography, TaskDropdown, TicketView } from '../Ticket/List';
import dayjs from 'dayjs';
import { AxiosError, AxiosResponse } from 'axios';
import EmailModal, { IEmailPrep } from '../Other/Email';

export interface TaskView extends TaskForm {
  none?: string;
};

export default function TaskList() {
  const { setUpHeader, startLoader, startFir } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
  // const [taskData, setTaskData] = useState<TaskView | null>(null);
  const { tkid } = useParams<{ tkid: string | undefined }>();
  const { state } = useLocation();
  const ticketCode: string | null = state?.ticketCode ?? null;
  const [list, setList] = useState<TaskView[]>([])
  const [commentList, setCommentList] = useState<commentForm[]>([]);
  const [taskID, setTaskID] = useState<string | undefined>();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [dailogData, setDailogData] = useState<TaskView>({} as TaskView);
  const [ticketData, setTicketData] = useState<TicketView>({
    id: 0,
    createdOn: '',
    pipeline: '-1',
    description: '',
    source: 'CSP',
    contactFirstName: "",
    contactLastName: "",
    organizationName: "",
    priority: "",
    productName: "",
    status: "OPN",
    closeDate: "",
    industryName: "",
    openDate: "",
    ownerName: "",
    tickCode: "",
    serialNo: "",
    contactId: "",
    organizationId: "",
    name: "",
    contactName: "",
    orgid: "",
    dealid: "",
    dealId: "",
    orgname: "",
    dealname: '',
  });

  const [emailData, setEmailData] = useState<IEmailPrep>({
    closeDate: "",
    description: "",
    openDate: "",
    organizationLocation: "",
    contactEmail: "",
    ownerEmail: "",
    productName: "",
    organizationName: "",
    ownerName: "",
    serialNo: "",
    tickCode: "",
    type: "TICKETOPEN"
  });
  const [emailModel, setEmailModel] = useState<boolean>(false);
  const handleEmailModel = (val: boolean) => setEmailModel(val);

  const [dropdown, setDropdown] = useState<TaskDropdown>({
    pipeline: [],
    owners: [],
    statuses: [...Statuses],
    contacts: [],
    organizations: []
  })

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Task', width: (1215 * 15 / 100) },
    {
      field: 'startDate', headerName: 'Start / End Date', width: (1215 * 15 / 100),
      renderCell: (params) => (
        <>
          {dayjs(params.value).format("YYYY-MM-DD")}
          {isValidDate(params.row.endDate) && ` / ${dayjs(params.row.endDate).format("YYYY-MM-DD")}`}
        </>
      )
    },
    { field: 'username', headerName: 'Owner Name', width: (1215 * 15 / 100), editable: true },
    {
      field: 'status',
      headerName: 'Status',
      width: (1215 * 10 / 100),
      editable: true,
      renderCell: (params: GridRenderCellParams<TaskView, typeof Statuses[number]['id']>): ReactNode => (
        <>
          {params.value && StatusTypography[params.value]}
        </>
      ),
      renderEditCell: (params): ReactNode => (
        <>
          <FormControl size='medium' fullWidth>
            <Select
              value={params.row.status}
              // onChange={(e) => handleSelectChange(e, 'status')}
              size='small'
              variant='filled'
            >
              {Statuses.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )
    },
    {
      field: 'action',
      headerName: 'Action',
      width: (1215 * 8 / 100),
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Show Comment">
            <Button sx={{ minWidth: 40 }} onClick={(e) => { e.stopPropagation(); getHistory(`${params.row.id}`) }} variant="text">👁️</Button>
          </Tooltip>
          <Tooltip title="Modify Task">
            <Button sx={{ minWidth: 40, }} onClick={() => alterDailog(true, params.row)} variant="text">✏️</Button>
          </Tooltip>
          {/* <Tooltip title="Modify Task">
            <Button sx={{ minWidth: 40, }} onClick={() => deleteMTask(`${params.row.id}`)} variant="text">🗑️</Button>
          </Tooltip> */}
        </Stack>
      ),
    },
  ];

  const getDropdown = async () => {
    setDropdown({
      pipeline: await fetchOptions('pipelines'),
      owners: await fetchOptions("owners"),
      contacts: await fetchOptions("contacts"),
      organizations: [],
      statuses: dropdown.statuses
    })
  };

  const getData = async (tkid: string) => {
    startLoader(true);
    try {
      startLoader(true)
      const req = await myAxios.get(`/Task/ShowTask?tickId=${tkid}&fromdate=&todate=&pageno=0&recordperpage=0&taid=0&showcomments=false`);
      if (req.status === 200) {
        const { data, status }: Response<TaskView[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            setList(data)
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
    startLoader(false)
  };

  const getTicketData = useCallback(async (uid: string) => {
    try { //2024-12-20
      const req = await myAxios.get(`/Tickets/ShowTicket?id=${uid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=false`);
      if (req.status === 200) {
        const { data, status }: Response<TicketView[]> = req.data;
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

  const getHistory = async (id: string) => {
    const comm = await fetchComment(id, "TASK");
    setCommentList(comm);
    setTaskID(id)
  }

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/tickets">
          Ticket
        </Link>,
        <Typography key={1} >Task</Typography>,
      ],
    });
    if (tkid) {
      getData(tkid);
      getDropdown();
      getTicketData(tkid);
    }

    return () =>
      setUpHeader({
        title: "",
        sub_title: "",
        breadcrum() {
          return [];
        },
      });
  }, []);



  function alterDailog(val: boolean, option?: TaskView) {
    if (val) {
      setEditMode(true)
      if (option) setDailogData({ ...option, endDate: dayjs().format("YYYY-MM-DDTHH:mm:ss") })
    }
    else setEditMode(false)
  }


  const handleSubmit = async () => {
    startLoader(true)
    const response: AxiosResponse = await myAxios.post(`/Task/SaveTask`, [{ ...dailogData, cuid: localStorage.getItem("@Id") }]);
    try {
      if (response.data.status === "Success") {
        startFir({
          msg: "Task update successfully",
          type: "S"
        })
        // handleNavigate("/mastertask")
        if (ticketData.status === "OPN") {

          const ContactIndex = dropdown.contacts.findIndex((v, i) => v.id === ticketData.contactId && i)

          if (ContactIndex !== -1) {
            const email = dropdown.contacts[ContactIndex]['email'] ?? "";
            if (email !== "") {
              const organizationList: DropdownOption[] = await fetchOptions("organizations", `&id=${ticketData.organizationId}`)
              setEmailData((pre) => ({
                ...pre,
                closeDate: dailogData.endDate,
                description: dailogData.comment,
                openDate: ticketData.createdOn,
                serialNo: ticketData.serialNo,
                tickCode: ticketData.tickCode,
                type: ticketData.status === "OPN" ? "TICKETOPEN" : "TICKETCLOSE",

                productName: ticketData.productName,

                ownerName: localStorage.getItem("@Name") ?? "",
                ownerEmail: localStorage.getItem("@User") ?? "",

                organizationLocation: organizationList[0]['address'] ?? "",
                organizationName: ticketData.organizationName,
                contactEmail: email,

              }))

              handleEmailModel(false)
            }

          }

        }
        if (tkid) getData(tkid);
         getHistory(String(dailogData?.id))
      } else {
        startFir({
          msg: "Unable to update Task",
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
    startLoader(false)
  };



  const handleInputChange = useCallback((value: string, name: string): void => {
    setDailogData((prevData) => {
      return prevData ? { ...prevData, [name]: value } : {} as TaskView;
    })
  }, []);

  const getPipeName = (id: any) => {
    const selectedPipeline = dropdown?.pipeline.find(
      (item: any) => String(item.id) === (id)
    );

    console.log(selectedPipeline !== undefined && selectedPipeline?.name)
    return selectedPipeline?.name;
  }

  console.log("BOLO",dailogData)

  return (
    <>
      <Accordion expanded={true}>
        <AccordionSummary
          // expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{ py: 0, maxHeight: 45 }}
        >
          <Typography component="span" variant='subtitle1' fontSize={20}>Ticket Details</Typography>
        </AccordionSummary>
        <Divider />
        <AccordionDetails sx={{ p: 0, px: 2 }}>
          <Grid container>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container p={0}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Ticket Code</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.tickCode}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }} >
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Organization Name</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.organizationName}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Product Name</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.productName}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Contact Name</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.contactFirstName} {ticketData.contactLastName}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Source</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.source}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Priority</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.priority} {ticketData.contactLastName}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Pipeline</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{getPipeName(ticketData.pipeline)}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Status</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{StatusTypography[ticketData.status as typeof Statuses[number]['id'] | "-1"]}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Created On</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.createdOn}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Close Date</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.closeDate === "" ? "NONE" : ticketData.closeDate}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Serial No</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.serialNo}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, pb: 2 }}>
              <Grid container>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='subtitle2' fontSize={17}>Owner</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.ownerName}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {<Paper style={{ width: '100%', marginTop: 10, }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
          <Typography variant='h5' align="left">Task List </Typography>
          <Typography variant='h5' align="left">Ticket Code : <Typography display={"inline-block"} sx={{ px: 1, borderRadius: 1.5, fontSize: 23 }} color='white' bgcolor={"GrayText"}>{ticketCode}</Typography></Typography>
          {/* <Button variant="contained" color="error" style={{ marginRight: 8 }}>
              Mark as Unpaid
            </Button> */}
        </Box>
        <Divider />

        <Grid container gap={0}>
          <Grid size={8}>
            <Box sx={{ width: "100%", display: "flex", p: 0 }}>
              <DataGrid
                disableColumnMenu
                isRowSelectable={() => false}
                checkboxSelection={false}
                // highlight row when taskID matches
                getRowClassName={(params) =>params.id === Number(taskID) ? "Mui-active-row" : ""}
                // make sure the correct row id is used
                getRowId={(row) =>row.id} // change if your key is different (e.g., row.taskId)
                rows={list}
                paginationModel={{ page: 0, pageSize: list.length }}
                columns={columns}
                disableRowSelectionOnClick
                sx={{
                  maxWidth: 1210,
                  maxHeight: 400,
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "white",
                    fontWeight: "bold",
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiDataGrid-row.Mui-active-row": {
                    backgroundColor: "rgba(236, 236, 236, 0.99) !important",
                  },
                  borderRadius: 0,
                }}
                hideFooter
                localeText={{ noRowsLabel: "No data available" }}
              />
            </Box>
          </Grid>
          <Grid size={4} sx={{ borderLeft: "1px solid rgba(192, 192, 192, 0.6)",backgroundColor:taskID ? 'rgba(236, 236, 236, 0.99)':'' }}>
            <CommentLine id={taskID} comments={commentList} selected={taskID ? true : false} toggleDrawer={() => { }} />
          </Grid>
        </Grid>
      </Paper >}

      <Dialog
        open={editMode}
        onClose={() => alterDailog(false)}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            handleSubmit();
            alterDailog(false);
          },
        }}
      >
        <DialogTitle>Task Details</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3} padding={1}>

            {/* Owner Dropdown */}
            <Grid size={{ xs: 12, sm: 12 }} >
              <FormControl size='small' fullWidth>
                <InputLabel>Service Owner</InputLabel>
                <Select
                  value={dailogData.userid}
                  onChange={(e) => handleInputChange(e.target.value, "userid")}
                  label="Service Person"
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
            </Grid>

            {/* Opening Date */}
            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="Closing Date"
                type="datetime-local"
                size='small'
                fullWidth
                value={dailogData.endDate}
                onChange={(e) => handleInputChange(e.target.value, "endDate")}
                name="endDate"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            {/* Status Dropdown */}
            <Grid size={{ xs: 12, sm: 6 }} >
              <FormControl size='small' fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={dailogData.status}
                  onChange={(e) => handleInputChange(e.target.value, "status")}
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

            </Grid>

            <Grid size={{ xs: 12, sm: 12 }}>
              <TextField
                label="Comment"
                fullWidth
                value={dailogData.comment ?? ""}
                onChange={(e) => handleInputChange(e.target.value, "comment")}
                name="comment"
                size='small'
                rows={2}
                multiline
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => alterDailog(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </Dialog>
      {emailData.tickCode !== "" && <EmailModal data={emailData} open={emailModel} handleModel={handleEmailModel} />}

    </>
  );
}
