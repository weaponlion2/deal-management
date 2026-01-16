import myAxios from '../api';
import { DataGrid, GridColDef, GridRenderCellParams, } from '@mui/x-data-grid';
import { ReactNode, useEffect, useState } from 'react';
import { Autocomplete, Box, Button, Divider, FormControl, Grid2 as Grid, InputLabel, Link, MenuItem, Paper, Select, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { fetchOptions, isValidDate, Statuses, TaskForm } from '../Ticket/Ticket';
import { StatusTypography, TaskDropdown, TicketView } from '../Ticket/List';
import BusinessIcon from '@mui/icons-material/Business';
import dayjs from 'dayjs';
import { AxiosError } from 'axios';
;

export interface TaskView extends TaskForm {
    none?: string;
};

export default function TaskViewList() {
    const { setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const navigate = useNavigate();
    const [list, setList] = useState<TaskView[]>([])

    const [filter, setFilter] = useState({
        status: '',
        organization: '0',
        owner: '0'
    });




    const [dropdown, setDropdown] = useState<TaskDropdown>({
        pipeline:[],
        owners: [],
        statuses: [...Statuses],
        contacts: [],
        organizations: []
    })

    const columns: GridColDef[] = [
        {
            field: 'orgname', headerName: 'Organization', width: (1215 * 30 / 100),
            renderCell: (params: GridRenderCellParams<TicketView>): ReactNode => (
                <Stack spacing={0}>
                 
                    <Typography
                        variant="caption"
                        sx={{ color: '#0ba826ff', cursor: 'pointer', textDecoration: 'underline', mb: 1 }}
                        onClick={() => navigate(`/organization/${params.row.orgid}`)}
                    >
                        <BusinessIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center' }} /> {params.row.orgname}
                    </Typography>
                </Stack>
            ),
        },
        { field: 'name', headerName: 'Task', width: (1215 * 15 / 100) },
        {
            field: 'startDate', headerName: 'Start / End Date', width: (1215 * 20 / 100),
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
            width: (1215 * 20 / 100),
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
                    <Tooltip title="Task View">
                        <Button sx={{ minWidth: 40 }} onClick={() => navigate(`/ticket/task/${params.row.ticketId}`, { state: { ticketCode: params.row.tickCode } })} variant="text">⏭</Button>
                    </Tooltip>
                    {/* <Tooltip title="Modify Task">
            <Button sx={{ minWidth: 40, }} onClick={() => alterDailog(true, params.row)} variant="text">✏️</Button>
          </Tooltip> */}
                    {/* <Tooltip title="Modify Task">
            <Button sx={{ minWidth: 40, }} onClick={() => deleteMTask(`${params.row.id}`)} variant="text">🗑️</Button>
          </Tooltip> */}
                </Stack>
            ),
        },
    ];

    const getDropdown = async () => {
        setDropdown({
            pipeline:[],
            owners: await fetchOptions("owners"),
            contacts: await fetchOptions("contacts"),
            organizations: await fetchOptions('organizations'),
            statuses: dropdown.statuses
        })
    };

    const getData = async (tkid: any) => {
        startLoader(true);
        try {
            startLoader(true)
            const req = await myAxios.get(`/Task/ShowTask?tickId=${tkid}&fromdate=&todate=&orgid=${filter?.organization}&status=${filter?.status == "-1" ? "" : filter?.status}&userid=${filter?.owner === "-1" ? 0 : filter?.owner}&pageno=0&recordperpage=0&taid=0&showcomments=false&closed=true`);
            if (req.status === 200) {
                const { data, status }: Response<TaskView[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setList(data)
                    }
                }else if(status === "Fail"){
                    setList([]);
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

        getData(0);
        getDropdown();
        //   getTicketData(tkid);


        return () =>
            setUpHeader({
                title: "",
                sub_title: "",
                breadcrum() {
                    return [];
                },
            });
    }, []);

    const handleChange = (field: string, value: string) => {
        setFilter((prev) => ({ ...prev, [field]: value }));
    };






    return (
        <>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filter Deals</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Autocomplete
                            options={dropdown.organizations}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={
                                dropdown.organizations.find(
                                    (org) => org.id === filter.organization
                                ) || null
                            }
                            onChange={(event, newValue) => {
                                console.log(event)
                                handleChange('organization', newValue ? newValue.id : '0');
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Organization" size="small" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }} >
                        <FormControl size='small' fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filter.status}
                                onChange={(e) => handleChange("status", e.target.value,)}
                                label="Status"
                                size='small'
                            >
                                <MenuItem value=''>
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

                    <Grid size={{ xs: 12, sm: 4 }} >
                        <FormControl size='small' fullWidth>
                            <InputLabel>Service Owner</InputLabel>
                            <Select
                                value={filter.owner}
                                onChange={(e) => handleChange("owner", e.target.value)}
                                label="Service Person"
                                size='small'
                            >
                                <MenuItem value={0}>
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



                </Grid>
                <Grid container justifyContent="end" mt={2} spacing={2}>
                    <Grid sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                                setFilter({
                                    status: '',
                                    organization: '0',
                                    owner: ''
                                })
                            }
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => getData(0)}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>

            </Paper>

            {<Paper style={{ width: '100%', marginTop: 10, }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
                    <Typography variant='h5' align="left">Task List </Typography>
                    {/* <Typography variant='h5' align="left">Ticket Code : <Typography display={"inline-block"} sx={{ px: 1, borderRadius: 1.5, fontSize: 23 }} color='white' bgcolor={"GrayText"}>{ticketCode}</Typography></Typography> */}
                    {/* <Button variant="contained" color="error" style={{ marginRight: 8 }}>
              Mark as Unpaid
            </Button> */}
                </Box>
                <Divider />

                <Grid container gap={0}>
                    <Grid size={12}>
                        <Box sx={{ width: "100%", display: "flex", p: 0 }}>
                            <DataGrid
                                disableColumnMenu
                                checkboxSelection={false}
                                rows={list}
                                paginationModel={{ page: 0, pageSize: list.length }} columns={columns}
                                disableRowSelectionOnClick
                                sx={{
                                    maxHeight: 400,
                                    "& .MuiDataGrid-columnHeaders": {
                                        backgroundColor: "white",
                                        fontWeight: "bold",
                                    },
                                    "& .MuiDataGrid-cell": {
                                        display: "flex",
                                        alignItems: "center",
                                    },
                                    borderRadius: 0
                                }}
                                hideFooter={true}
                                localeText={{ noRowsLabel: "No data available" }}
                            />
                        </Box>
                    </Grid>
                    {/* <Grid size={4} sx={{ borderLeft: "1px solid rgba(192, 192, 192, 0.6)" }}>
            <CommentLine id={taskID} comments={commentList} selected={taskID ? true : false} toggleDrawer={() => { }} />
          </Grid> */}
                </Grid>
            </Paper >}



        </>
    );
}
