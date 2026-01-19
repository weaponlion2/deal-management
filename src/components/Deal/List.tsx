import myAxios from '../api';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { NavigateOptions, Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { Box, Button, Link, MenuItem, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { PrioriteNode, StatusTypography, TicketView } from '../Ticket/List';
import { fetchOptions, Priorites, Statuses } from '../Ticket/Ticket';
import { FileTypes, IDeal, IDealDropdown } from './Deal';
import { AxiosError } from 'axios';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';

export interface IDealView extends IDeal {
    contactName: string,
    ownerName: string,
    dealTypeName: string,
    dealId: string,
    phone: string,
    itemName: string,
    serialno: string
}

export const useStageMap = () => {
    const [stageMap, setStageMap] = useState<Record<string, JSX.Element>>({});

    useEffect(() => {
        const loadStages = async () => {
            const stages = await fetchOptions("stages");
            const map: Record<string, JSX.Element> = {};

            stages?.forEach(({ stagecode, stagename }) => {
                if (!stagecode || !stagename) return;

                map[stagecode] = (
                    <Typography fontWeight="700" color={stagename === 'Closed Lost' ? 'error' : 'primary'}>
                        {stagename}
                    </Typography>
                );
            });

            setStageMap(map);
        };

        loadStages();
    }, []);

    return stageMap;
};


// export const StageNode: Record<typeof Stages[number]['id'] | "-1", ReactNode> =
// {
//     "-1": <Typography fontWeight={"700"} color="warning" >None</Typography>,
//     "IS": <Typography fontWeight={"700"} color='info'>Introduction sent</Typography>,
//     "PD": <Typography fontWeight={"700"} color="info">Presentation done</Typography>,
//     "SR": <Typography fontWeight={"700"} color="info">Services</Typography>,
//     "SD": <Typography fontWeight={"700"} color="primary">Scope defined</Typography>,
//     "DMB": <Typography fontWeight={"700"} color="warning">Decision maker brought in</Typography>,
//     "FPS": <Typography fontWeight={"700"} color="primary">Final proposal sent</Typography>,
//     "CW": <Typography fontWeight={"700"} color="success">Closed Won</Typography>,
//     "CL": <Typography fontWeight={"700"} color="error">Closed Lost</Typography>,
// };


export default function DealList() {
    const { setUpHeader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [list, setList] = useState<IDealView[]>([]) 
    const [dropdownOptions, setDropdownOptions] = useState<IDealDropdown>({
        pipelines: [],
        contacts: [],
        items: [], 
        organizations: [],
        owners: [], 
        status: [],
        dealtypes: [],
        filetypes: [...FileTypes],
        bilingFreqency: [],
        paymentTerm: []
    });
    const [filters, setFilters] = useState({
        status: '0',
        dealtypeid: '0',
        ownername: '',
    });

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setDropdownOptions({
                    pipelines: [],
                    organizations: [],
                    contacts: [],
                    items: [],
                    owners: [],
                    filetypes: [],
                    dealtypes: await fetchOptions("dealtypes"),
                    bilingFreqency: [],
                    paymentTerm: [],
                    status: await fetchOptions("statuses"),
                });
            } catch (err) {
                console.error('Failed to load dropdowns', err);
            }
        };

        loadDropdowns();
    }, []);


    const columns: GridColDef[] = [
        {
            field: 'nameOrgContact',
            headerName: 'Name - Organization',
            width: (1215 * 50 / 100),
            renderCell: (params: GridRenderCellParams<TicketView>): ReactNode => (
                <Stack spacing={0}>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleNavigate(`/deal/${params.row.id}`)}
                    >
                        <HandshakeIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center' }} /> {params.row.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: '#0ba826ff', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleNavigate(`/organization/${params.row.orgid}`)}
                    >
                        <BusinessIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center' }} /> {params.row.organizationName}
                    </Typography>
                </Stack>
            ),
        },
        { field: 'pipeline', headerName: 'Pipeline', width: (1215 * 15 / 100) },
        // { field: 'organizationName', headerName: 'Organization Name', width: (1215 * 33 / 100) },
        // { field: 'contactName', headerName: 'Contact Name', width: (1215 * 15 / 100) },
        // { field: 'ownerName', headerName: 'Owner Name', width: (1215 * 15 / 100) },
        { field: 'dealTypeName', headerName: 'Deal Type', width: (1215 * 10 / 100) },
        {
              field: 'dealstatus',
              headerName: 'Status',
              width: (1215 * 15/ 100),
              renderCell: (params: GridRenderCellParams<TicketView, typeof Statuses[number]['id']>): ReactNode => (
                <>
                  {params.value && StatusTypography[params.value]}
                </>
              ),
              disableColumnMenu: true
            },
        // { field: 'amount', headerName: 'Amount', width: (1215 * 10 / 100) },
        // {
        //     field: 'priority', headerName: 'Priority', width: (1215 * 10 / 100),
        //     renderCell: (params: GridRenderCellParams<TicketView, typeof Priorites[number]['id']>): ReactNode => (
        //         <>
        //             {params.value && PrioriteNode[params.value]}
        //         </>
        //     ),
        // },
        {
            field: 'action',
            headerName: 'Action',
            width: (1215 * 15 / 100),
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Show Deal">
                        <Button sx={{ minWidth: 20 }} onClick={() => handleNavigate(`/deal/${params.row.id}`)} variant="text">👁️</Button>
                    </Tooltip>
                    <Tooltip title="Modify Deal">
                        <Button sx={{ minWidth: 20 }} onClick={() => handleNavigate(`/deal/form/${params.row.id}`)} variant="text">✏️</Button>
                    </Tooltip>
                    <Tooltip title="Renew Deal">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/deal/form/${params.row.id}`, { state: { renew: true } })} variant="text">🔁</Button>
                    </Tooltip>
                    <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
                </Stack>
            ),
        },
    ];

    // const getData = useCallback(async (currPage: number = 0, perPage: number = 20, query: string = "") => {
    //     setLoader(true);
    //     try { //2024-12-20
    //         const req = await myAxios.get(`/Deal/ShowDeals?id=0&showdealitem=false&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}`);
    //         if (req.status === 200) {
    //             const { data, status, totalCount }: Response<IDealView[]> = req.data;
    //             if (status === "Success") {
    //                 if (typeof data !== "undefined") {
    //                     setList(data);
    //                 }
    //                 if (typeof totalCount !== "undefined") {
    //                     setTotalCount(totalCount);
    //                 }
    //             }
    //             else {
    //                 setList([])
    //                 setTotalCount(0);
    //             }
    //         }
    //     } catch (_err: unknown) {
    //         if (_err instanceof AxiosError) {
    //             console.log(_err.message);
    //         } else {
    //             console.log("An unexpected error occurred");
    //         }

    //         setTotalCount(0);
    //     }
    //     setLoader(false)
    // }, []);

    const getData = useCallback(
        async (
            currPage: number = 0,
            perPage: number = 25,
            query: string = "",
            filterValues = filters
        ) => {
            setLoader(true);
            try {
                const { status, dealtypeid, ownername } = filterValues;
                const req = await myAxios.get(`/Deal/ShowDeals`, {
                    params: {
                        id: 0,
                        showdealitem: false,
                        fromdate: "",
                        todate: "",
                        pageno: currPage,
                        recordperpage: perPage,
                        showall: false,
                        query,
                        status: status === '0' ? '' : status,
                        dealtypeid,
                        ownername,
                    },
                });

                if (req.status === 200) {
                    const { data, status, totalCount }: Response<IDealView[]> = req.data;
                    if (status === "Success") {
                        setList(data ?? []);
                        setTotalCount(totalCount ?? 0);
                    } else {
                        setList([]);
                        setTotalCount(0);
                    }
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
        },
        [filters]
    );


    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Typography key={1} >Deal</Typography>,
            ],
        });

        return () =>
            setUpHeader({
                title: "",
                sub_title: "",
                breadcrum() {
                    return [];
                },
            });
    }, []);

    const navigate = useNavigate();
    const handleNavigate = (arg0: string, state?: NavigateOptions): undefined => {
        navigate(arg0, state)
    };

    const [totalCount, setTotalCount] = useState<number>(0);
    const [loader, setLoader] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    useEffect(() => {
        getData(paginationModel.page, paginationModel.pageSize)
    }, [paginationModel])
    const [query, setQuery] = useState<string | null>(null);
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setQuery(e.target.value);
        if (e.target.value.length > 2) {
            getData(paginationModel.page, paginationModel.pageSize, e.target.value);
        }
        if (e.target.value === "") {
            getData(paginationModel.page, paginationModel.pageSize, "");
        }
    };



    return (
        <>
            {<Paper sx={{ p: 1 }} style={{ width: '100%' }}>
                <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                >

                    <Typography variant="h6" gutterBottom component="div"> Deal List</Typography>

                    <Box sx={{display: "flex", gap: 1}}>
                    {/* Deal Type Filter */}
                    <TextField
                        select
                        label="Status"
                        size="small"
                        value={filters.status}
                        onChange={(e) => {
                            const updated = { ...filters, status: e.target.value };
                            setFilters(updated);
                            getData(paginationModel.page, paginationModel.pageSize, query ?? "", updated);
                        }}
                        sx={{ width: 180 }}
                    >
                        <MenuItem value="0">All</MenuItem>
                        {dropdownOptions.status.map((v) => (
                            <MenuItem key={v.statuscode} value={v.statuscode}>
                                {v.statusname}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Deal Type"
                        size="small"
                        value={filters.dealtypeid}
                        onChange={(e) => {
                            const updated = { ...filters, dealtypeid: e.target.value };
                            setFilters(updated);
                            getData(paginationModel.page, paginationModel.pageSize, query ?? "", updated);
                        }}
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="0">All</MenuItem>
                        {dropdownOptions.dealtypes.map((dt) => (
                            <MenuItem key={dt.id} value={dt.id}>
                                {dt.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Owner"
                        size="small"
                        value={filters.ownername ?? ""}
                        onChange={(e) => {
                            const updated = { ...filters, ownername: e.target.value };
                            setFilters(updated);
                            getData(paginationModel.page, paginationModel.pageSize, query ?? "", updated);
                        }}
                        sx={{ width: 200 }}
                        placeholder="Enter owner name"
                    />
                    </Box>

                    <div style={{ marginTop: 7, marginBottom: 7, display: "flex", alignItems: "center" }}>
                        <TextField
                            value={query ?? ""}
                            onChange={handleSearch}
                            placeholder='Search Deal Name, Organization, Contact'
                            size='small'
                            name='searhbar'
                            type='text'
                            sx={{ width: 450, mr: 1 }}
                            slotProps={{
                                input: {
                                    name: `${"poiuyt" + Math.random()}`
                                },
                            }}
                        />
                        <Button variant="contained" onClick={() => handleNavigate("/deal/form")} style={{ marginRight: 8 }}>
                            New Deal
                        </Button>
                    </div>
                </Stack>

                <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
                    <DataGrid
                        rowCount={totalCount}
                        loading={loader}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 25,
                                },
                            },
                        }}
                        pageSizeOptions={[25, 50, 100]}
                        pagination
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        disableColumnMenu
                        columns={columns}
                        rows={list}
                        disableRowSelectionOnClick
                        sx={{
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
            </Paper >}
        </>
    );
}
