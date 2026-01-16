import { Box, Button, FormControl, MenuItem, Paper, Select, Stack, Tooltip, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { ReactNode, useEffect, useState } from 'react'
import { PrioriteNode, StatusTypography, TicketView } from '../Ticket/List'
import { IDealView, useStageMap } from '../Deal/List'
import { ContactView } from '../Contact/List'
import myAxios from '../api'
import { Response } from '../Layout.Interface'
import dayjs from 'dayjs'
import { isValidDate, Priorites, Statuses, TicketForm } from '../Ticket/Ticket'
// import { Stages } from '../Deal/Deal'
import ListAltIcon from '@mui/icons-material/ListAlt';
import { NavigateOptions, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { TaskView } from '../Task/TaskList'
// import BusinessIcon from '@mui/icons-material/Business';

type ItType = "TICKET" | "DEAL" | "CONTACT" | "CONTACT-DEAL" | "CONTACT-TICKET" | "ORG-TIC" | "ORG-TASK"

type Props = {
    tType: ItType,
    mid: string,
}

const TabelModel = ({ mid, tType }: Props) => {
    const [list, setList] = useState<TicketView[]>([]);
    const [list2, setList2] = useState<IDealView[]>([]);
    const [list3, setList3] = useState<ContactView[]>([]);
    const [list4, setList4] = useState<any>([]);

    const [totalCount, setTotalCount] = useState<number>(0);
    const [loader, setLoader] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const stageStyledMap = useStageMap();

    useEffect(() => {
        if (mid !== '0') {
            getData(paginationModel.page, paginationModel.pageSize)
        }
    }, [paginationModel])

    const navigate = useNavigate();
    const handleNavigate = (arg0: string, state?: NavigateOptions): undefined => {
        navigate(arg0, state)
    };

    const columnOrgTask: GridColDef[] = [
        { field: 'taskname', headerName: 'Task', width: (1215 * 25 / 100) },
        {
            field: 'startDate', headerName: 'Start / End Date', width: (1215 * 20 / 100),
            renderCell: (params) => (
                <>
                    {dayjs(params.value).format("YYYY-MM-DD")}
                    {isValidDate(params.row.endDate) && ` / ${dayjs(params.row.endDate).format("YYYY-MM-DD")}`}
                </>
            )
        },
        { field: 'ownername', headerName: 'Owner', width: (1215 * 20 / 100), editable: true },
        {
            field: 'taskstatus',
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
                        <Button sx={{ minWidth: 40 }} onClick={() => navigate(`/ticket/task/${params.row.ticketid}`, { state: { ticketCode: params.row.ticketcode } })} variant="text">⏭</Button>
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


    const columnsTicket: GridColDef[] = [
        { field: 'tickCode', headerName: 'Ticket Code', width: (1215 * 10 / 100) },
        { field: 'organizationName', headerName: 'Organization', width: (1215 * 25 / 100) },
        {
            field: 'contactFirstName', headerName: 'Contact', width: (1215 * 12 / 100), disableColumnMenu: true,
            renderCell: (params) => (
                <div>
                    {params.value} {params.row.contactLastName}
                </div>
            ),

        },
        // { field: 'pipeline', headerName: 'Pipeline', width: (1215 * 8 / 100), disableColumnMenu: true },
        {
            field: 'createdOn', headerName: 'CreatedOn', width: (1215 * 10 / 100), disableColumnMenu: true,
            renderCell: (params) => dayjs(params.value).format("YYYY-MM-DD")
        },
        {
            field: 'priority', headerName: 'Priority', width: (1215 * 10 / 100), disableColumnMenu: true,
            renderCell: (params: GridRenderCellParams<TicketView, typeof Priorites[number]['id']>): ReactNode => (
                <>
                    {params.value && PrioriteNode[params.value]}
                </>
            ),
        },
        { field: 'productName', headerName: 'Product', width: (1215 * 12 / 100), disableColumnMenu: true },
        {
            field: 'status',
            headerName: 'Status',
            width: (1215 * 10 / 100),
            renderCell: (params: GridRenderCellParams<TicketForm, typeof Statuses[number]['id']>): ReactNode => (
                <>
                    {params.value && StatusTypography[params.value]}
                </>
            ),
            disableColumnMenu: true
        },
        {
            field: 'action',
            headerName: 'Action',
            width: (1215 * 10 / 100), disableColumnMenu: true,
            renderCell: (params) => (
                <Stack direction="row" spacing={0}>
                    <Tooltip title="Show Task">
                        <Button sx={{ minWidth: 40 }} onClick={() => navigate(`/ticket/task/${params.row.id}`, { state: { ticketCode: params.row.tickCode } })} variant="text"><ListAltIcon /></Button>
                    </Tooltip>
                    <Tooltip title="Show Ticket">
                        <Button sx={{ minWidth: 40 }} onClick={() => navigate(`/ticket/${params.row.id}`, { state: { ticketCode: params.row.tickCode } })} variant="text">
                            👁️
                        </Button>
                    </Tooltip>
                    <Tooltip title="Modify Ticket">
                        <Button sx={{ minWidth: 40 }} onClick={() => navigate(`/ticket/form/${params.row.id}`)} variant="text">✏️</Button>
                    </Tooltip>
                    <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
                </Stack>
            ),
        },
    ];

    const columnsDeal: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: (1215 * 15 / 100) },
        // { field: 'pipeline', headerName: 'Pipeline', width: (1215 * 10 / 100) },
        { field: 'organizationName', headerName: 'Organization Name', width: (1215 * 18 / 100) },
        { field: 'contactName', headerName: 'Contact Name', width: (1215 * 10 / 100) },
        { field: 'ownerName', headerName: 'Owner Name', width: (1215 * 10 / 100) },
        { field: 'dealTypeName', headerName: 'Deal Type', width: (1215 * 10 / 100) },
        {
            field: 'stage', headerName: 'Stages', width: (1215 * 18 / 100),
            renderCell: (params: GridRenderCellParams<TicketView, string>): ReactNode => (
                <>
                    {stageStyledMap[params.value ?? '']}
                </>
            )
        },
        {
            field: 'priority', headerName: 'Priority', width: (1215 * 10 / 100),
            renderCell: (params: GridRenderCellParams<TicketView, typeof Priorites[number]['id']>): ReactNode => (
                <>
                    {params.value && PrioriteNode[params.value]}
                </>
            ),
        },
        {
            field: 'action',
            headerName: 'Action',
            width: (1215 * 10 / 100),
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Show Deal">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/deal/${params.row.id}`)} variant="text">👁️</Button>
                    </Tooltip>
                    <Tooltip title="Modify Deal">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/deal/form/${params.row.id}`)} variant="text">✏️</Button>
                    </Tooltip>
                    <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
                </Stack>
            ),
        },
    ];

    const columnsContact: GridColDef[] = [
        {
            field: 'name', headerName: 'Name', width: (1215 * 15 / 100),
            renderCell: (params) => (
                <div>
                    {params.row.firstName} {params.row.lastName}
                </div>
            ),
        },
        {
            field: 'jobTitle', headerName: 'Job Title', width: (1215 * 15 / 100),
            renderCell: (params) => (
                <div>
                    {params.value}
                </div>
            ),

        },
        { field: 'company', headerName: 'Company', width: (1215 * 15 / 100) },
        { field: 'email', headerName: 'Email', width: (1215 * 20 / 100) },
        { field: 'mobile', headerName: 'Mobile', width: (1215 * 20 / 100) },
        {
            field: 'action',
            headerName: 'Action',
            width: (1215 * 15 / 100),
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Show Contact">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/contact/${params.row.id}`)} variant="text">👁️</Button>
                    </Tooltip>
                    <Tooltip title="Modify Contact">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/contact/form/${params.row.id}`)} variant="text">✏️</Button>
                    </Tooltip>
                    <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
                </Stack >
            ),
        },
    ];

    const getData = async (currPage: number = 0, perPage: number = 10, query: string = "") => {
        setLoader(true);
        let url = "";
        try { //2024-12-20
            if (tType === "CONTACT") {
                url += `/Contact/ShowAllContacts?id=0&pageno=${currPage}&recordperpage=${perPage}&showall=false&orgid=${mid}`
            }
            else if (tType === "DEAL") {
                url += `/Deal/ShowDeals?id=0&showdealitem=false&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}&orgid=${mid}&cid=${0}`
            }
            else if (tType === "TICKET") {
                url += `/Tickets/ShowTicket?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}&dealid=${mid}&cid=${0}`
            }
            else if (tType === "ORG-TIC") {
                url += `/Tickets/ShowTicket?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}&dealid=${0}&orgid=${mid}&cid=${0}`
            }
            else if (tType === "CONTACT-DEAL") {
                url += `/Deal/ShowDeals?id=0&showdealitem=false&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}&orgid=${0}&cid=${mid}`
            }
            else if (tType === "CONTACT-TICKET") {
                url += `/Tickets/ShowTicket?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}&dealid=${0}&cid=${mid}`
            }
            else if (tType === "ORG-TASK") {
                url += `/Task/ShowOrgTask?orgid=${mid}&pageno=${currPage}&recordperpage=${perPage}`
            }
            const req = await myAxios.get(url);
            if (req.status === 200) {
                console.log(req)
                if (tType === "CONTACT") {
                    const { status, data, totalCount }: Response<ContactView[]> = req.data;
                    if (status === "Success") {
                        if (typeof data !== "undefined") {
                            setList3(data);
                        }
                        if (typeof totalCount !== "undefined") {
                            setTotalCount(totalCount);
                        }
                    }
                    else {
                        setList3([])
                        setTotalCount(0);
                    }
                }
                else if (tType === "DEAL" || tType === "CONTACT-DEAL") {
                    const { status, data, totalCount }: Response<IDealView[]> = req.data;
                    if (status === "Success") {
                        if (typeof data !== "undefined") {
                            setList2(data);
                        }
                        if (typeof totalCount !== "undefined") {
                            setTotalCount(totalCount);
                        }
                    }
                    else {
                        setList2([])
                        setTotalCount(0);
                    }
                } else if (tType === "ORG-TASK") {
                    console.log(req.data)
                    const { status, data, totalCount } = req.data;
                    console.log(status, data, totalCount)
                    if (status === "Success") {
                        if (typeof data !== "undefined") {
                            setList4(data);
                        }
                        if (typeof totalCount !== "undefined") {
                            setTotalCount(totalCount);
                        }
                    }
                    else {
                        setList4([])
                        setTotalCount(0);
                    }
                } else if (tType === "TICKET" || tType === "CONTACT-TICKET" || tType === "ORG-TIC") {
                    const { status, data, totalCount }: Response<TicketView[]> = req.data;
                    if (status === "Success") {
                        if (typeof data !== "undefined") {
                            setList(data);
                        }
                        if (typeof totalCount !== "undefined") {
                            setTotalCount(totalCount);
                        }
                    }
                    else {
                        setList([])
                        setTotalCount(0);
                    }
                }
            }
            else {
                setList([]);
                setList2([]);
                setList3([]);
                setTotalCount(0);
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }

            setTotalCount(0);
        }
        setLoader(false)
    };

    return (
        <Paper sx={{ p: 1, mb: 2 }} style={{ width: '100%' }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" gutterBottom component="div"> Associated {
                    tType === "CONTACT" ? "Contacts" :
                        (tType === "CONTACT-DEAL" || tType === "DEAL") ? "Deals" :
                            (tType === "CONTACT-TICKET" || tType === "TICKET") ? "Tickets" :
                                (tType === "ORG-TIC") ? "Tickets" :
                                    (tType === "ORG-TASK") ? "Task" :
                                        tType === "TICKET" ? "Tickets" : ""
                }
                </Typography>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
                </div>
            </Box>

            <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
                <DataGrid
                    rowCount={totalCount}
                    getRowId={(row) =>
                        tType === "ORG-TASK"
                            ? `${row.taskId}`  
                            : row.id 
                    }
                    loading={loader}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: tType === "ORG-TIC" ? 10 : 5,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                    pagination
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    disableColumnMenu
                    columns={(tType === "TICKET" || tType === "CONTACT-TICKET" || tType === "ORG-TIC") ? columnsTicket : (tType === "DEAL" || tType === "CONTACT-DEAL") ? columnsDeal : (tType === "ORG-TASK") ? columnOrgTask : columnsContact}
                    rows={(tType === "TICKET" || tType === "CONTACT-TICKET" || tType === "ORG-TIC") ? list : (tType === "DEAL" || tType === "CONTACT-DEAL") ? list2 : (tType === "ORG-TASK") ? list4 : list3}
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
                    }}
                    localeText={{ noRowsLabel: "No data available" }}
                />
            </Box>
        </Paper >
    )
}
export default TabelModel;