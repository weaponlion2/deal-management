import { useState, useEffect, useCallback, ReactNode } from 'react';
import {
    Paper,
    TextField,
    Grid2 as Grid,
    Typography,
    Link,
    Box,
    Stack,
    Button,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Divider,
    Autocomplete,
    Tooltip,
    FormControlLabel,
    // Checkbox,
    Switch,
    // Stack,
    // Tooltip,
} from '@mui/material';
import { NavigateOptions, Link as RLink, useNavigate, useOutletContext } from 'react-router-dom';
import { FIRE, HEADER_FIRE, START_LOADER } from '../Layout.Interface';
import myAxios from '../api';
import { AxiosError } from 'axios';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { TicketView } from '../Ticket/List';
import HandshakeIcon from '@mui/icons-material/Handshake';
import { fetchOptions } from '../Ticket/Ticket';
import { IDealDropdown } from '../Deal/Deal';
import BusinessIcon from '@mui/icons-material/Business';
import { handleDownloadExcel } from './DealReport';

export default function VisitReport() {
    const { setUpHeader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const navigate = useNavigate();

    const [totalCount, setTotalCount] = useState<number>(0);
    const [loader, setLoader] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [list, setList] = useState<any | []>([]);
    const [filter, setFilter] = useState({
        pipeline: '0',
        organization: '0',
        alreadyVisit: true

    });
    const [dropdownOptions, setDropdownOptions] = useState<IDealDropdown>({
        pipelines: [],
        contacts: [],
        items: [],
        itemTypes: [],
        organizations: [],
        owners: [],
        priorities: [],
        stages: [],
        dealtypes: [],
        filetypes: [],
        bilingFreqency: [],
        paymentTerm: []
    })

    const handleNavigate = (arg0: string, state?: NavigateOptions): undefined => {
        navigate(arg0, state)
        navigate(arg0, { state: state ?? {} })
    };
    const handleMainNavigate = (arg0: string, state?: NavigateOptions): undefined => {
        navigate(arg0, state)
    };
    const columns: GridColDef[] = [
        {
            field: 'dealname', headerName: 'Deal Name - Organization ', width: (1215 * 55 / 100),
            renderCell: (params: GridRenderCellParams<TicketView>): ReactNode => (
                <Stack spacing={0}>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleMainNavigate(`/deal/${params.row.dealId}`)}
                    >
                        <HandshakeIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center', mt: 1 }} /> {params.row.dealname}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: '#0ba826ff', cursor: 'pointer', textDecoration: 'underline', mb: 1 }}
                        onClick={() => handleMainNavigate(`/organization/${params.row.organizationId}`)}
                    >
                        <BusinessIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center' }} /> {params.row.organizationName}
                    </Typography>
                </Stack>
            ),
        },
        { field: 'pipelinename', headerName: 'Pipeline', width: (1215 * 10 / 100) },

        // { field: 'amount', headerName: 'Amount', width: (1215 * 8 / 100) },
        // { field: 'stagename', headerName: 'Status', width: (1215 * 16 / 100) },
        // {
        //     field: 'priority', headerName: 'Priority', width: (1215 * 10 / 100), disableColumnMenu: true,
        //     renderCell: (params: GridRenderCellParams<TicketView, typeof Priorites[number]['id']>): ReactNode => (
        //         <>
        //             {params.value && PrioriteNode[params.value]}
        //         </>
        //     ),
        // },
        { field: 'opendate', headerName: 'Open Date', width: (1215 * 15 / 100) },
        { field: 'visitdate', headerName: 'Visit Date', width: (1215 * 15 / 100) },
        {
            field: 'action',
            headerName: 'Action',
            width: (1215 * 15 / 100),
            renderCell: (params) => (
                <Stack direction="row" spacing={1}>

                    <Tooltip title="Create Ticket">
                        <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/ticket/form`, params.row)} variant="text">+</Button>
                    </Tooltip>
                </Stack >
            ),
        },

    ];



    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setDropdownOptions({
                    pipelines: await fetchOptions('pipelines'),
                    organizations: await fetchOptions('organizations'),
                    contacts: [],
                    itemTypes: [],
                    items: [],
                    owners: [],
                    priorities: dropdownOptions.priorities,
                    stages: [],
                    filetypes: [],
                    dealtypes: [],
                    bilingFreqency: [],
                    paymentTerm: []
                });
            } catch (err) {
                console.error('Failed to load dropdowns', err);
            }
        };

        loadDropdowns();
        handleSearch();
    }, [paginationModel]);

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Typography key={1} >Visit-Report</Typography>,
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

    const handleSearch = useCallback(async () => {
        setLoader(true);
        try {
            const resp = await myAxios.get(`Deal/ShowVisit?visitid=0&dealid=0&pipelineid=${filter?.pipeline}&orgid=${filter?.organization}&pending=${filter?.alreadyVisit}&pageno=${paginationModel?.page}&recordperpage=${paginationModel?.pageSize}`)
            //   console.log(resp.data.data[0]?.totalcount);
            if (resp.status === 200) {
                if (resp.data.status === "Success") {
                    setList(resp.data?.data);
                    setLoader(false);
                    setTotalCount(resp.data.data[0]?.totalcount)
                } else {
                    setList([]);
                    setLoader(false);
                }
            }
        } catch (error) {
            {
                if (error instanceof AxiosError) {
                    console.log(error.message);
                } else {
                    console.log("An unexpected error occurred");
                }

                setTotalCount(0);
            }
            setLoader(false)
        }
    }, [filter?.organization, filter?.alreadyVisit, filter?.pipeline, paginationModel?.page, paginationModel?.pageSize])
    // console.log(dropdownOptions?.organizations)

    const handleChange = (field: string, value: string) => {
        setFilter((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Pending Visit Filter</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }} >
                        <FormControl fullWidth size="small">
                            <InputLabel>Pipeline</InputLabel>
                            <Select
                                value={filter.pipeline}
                                label="Pipeline"
                                onChange={(e) => handleChange('pipeline', e.target.value)}
                            >
                                <MenuItem value={0}>
                                    {dropdownOptions.pipelines.length === 0 ? "No Pipelines" : "Choose Pipeline"}
                                </MenuItem>
                                {dropdownOptions.pipelines.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>


                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Autocomplete
                            options={dropdownOptions.organizations}
                            getOptionLabel={(option: any) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={
                                dropdownOptions.organizations.find(
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
                    <Grid size={{ xs: 12, sm: 4 }} display="flex" alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={filter.alreadyVisit}
                                    onChange={(e: any) => handleChange('alreadyVisit', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={!filter?.alreadyVisit ? "Already Visited" : "Pending"}
                        />
                    </Grid>



                </Grid>
                <Grid container justifyContent="space-between" mt={2} spacing={2}>
                    <Grid >
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={() => { handleDownloadExcel(list, false) }}
                            disabled={list.length === 0}
                        >
                            Download Excel
                        </Button>
                    </Grid>
                    <Grid sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                                setFilter({
                                    pipeline: '',
                                    organization: '',
                                    alreadyVisit: true
                                })
                            }
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                        >
                            Search
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Paper>
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
                        pagination
                        pageSizeOptions={[25, 50, 100]}
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        columns={columns}
                        rows={list}
                        getRowId={(row) => row.visitid}
                        disableRowSelectionOnClick
                        disableColumnMenu
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
            </Paper>
        </>
    );
}
