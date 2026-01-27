import { useState, useEffect, useCallback, ReactNode } from 'react';
import {
    Paper,
    Grid2 as Grid,
    // TextField,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
    Typography,
    Divider,
    Button,
    Link,
    Box,
    Stack,
    Autocomplete,
    TextField,
    // Stack,
    // Tooltip,
} from '@mui/material';
import { fetchOptions, Statuses } from '../Ticket/Ticket';
import { FileTypes, IDealDropdown } from '../Deal/Deal';
import { NavigateOptions, Link as RLink, useNavigate, useOutletContext } from 'react-router-dom';
import { FIRE, HEADER_FIRE, START_LOADER } from '../Layout.Interface';
import myAxios from '../api';
import { AxiosError } from 'axios';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { StatusTypography, TicketView } from '../Ticket/List';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BusinessIcon from '@mui/icons-material/Business';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { StatusText } from '../Ticket/ExportModal';

export const handleDownloadExcel = (list:any, deal:boolean) => {
    const exportData = list.map((item: any) => ({
              'Deal Name': item.name,
              'Pipeline': item.pipeline,
              'Organization Name': item.organizationName,
              'contactName Name': item.contactName,
              'Billing': item.billingname,
              'Payment Term': item.paymenttermname,
              'Deal Type': item.dealTypeName,
              'Product': item.productname,
              'Remark': item.remark,
              'Status': StatusText[item.call_status as typeof Statuses[number]['id']],
              'Valid From': item.startdate,
              'Valid Upto': item.enddate
            }));
    if (!exportData || exportData.length === 0) {
        alert("No data to download");
        return;
    }
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    XLSX.writeFile(workbook, deal ? "deal_report.xlsx": "visit.xlsx");
};

export default function DealReport() {
    const { setUpHeader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [filter, setFilter] = useState({
        pipeline: '0',
        dealType: '0',
        dealstatus: '0',
        priority: '0',
        status: 'ExpiringIn',
        organization: '0',
        days: '60'
    });
    const navigate = useNavigate();
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
    })
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loader, setLoader] = useState<boolean>(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 25,
    });
    const [list, setList] = useState<any | []>([]);
    const handleNavigate = (arg0: string, state?: NavigateOptions): undefined => {
        navigate(arg0, state)
    };
    const columns: GridColDef[] = [
        {
            field: 'name', headerName: 'Deal Name - Organization', width: (1215 * 44 / 100),
            renderCell: (params: GridRenderCellParams<TicketView>): ReactNode => (
                <Stack spacing={0}>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleNavigate(`/deal/${params.row.id}`)}
                    >
                        <HandshakeIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center', mt: 1 }} /> {params.row.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: '#0ba826ff', cursor: 'pointer', textDecoration: 'underline', mb: 1 }}
                        onClick={() => handleNavigate(`/organization/${params.row.orgid}`)}
                    >
                        <BusinessIcon fontSize="small" sx={{ fontSize: '15px', textAlign: 'center' }} /> {params.row.organizationName}
                    </Typography>
                </Stack>
            ),
        },
        { field: 'pipeline', headerName: 'Pipeline', width: (1215 * 10 / 100) },
        { field: 'dealTypeName', headerName: 'Deal Type', width: (1215 * 10 / 100) }, 
        { field: 'productname', headerName: 'Product', width: (1215 * 10 / 100) }, 
        { field: 'dealstatus', headerName: 'Status', width: (1215 * 10 / 100),
            renderCell: (params: GridRenderCellParams<TicketView, typeof Statuses[number]['id']>): ReactNode => (
                            <>
                              {params.value && StatusTypography[params.value]}
                            </>
                          ),
                          disableColumnMenu: true
         },
        {
            field: 'startdate',
            headerName: 'Valid From',
            width: (1215 * 10) / 100,
            valueFormatter: (params: any) => {
                return params ? dayjs(params).format('DD-MM-YYYY') : '';
            },
        },
        {
            field: 'enddate',
            headerName: 'Valid Upto',
            width: (1215 * 10) / 100,
            valueFormatter: (params: any) => {
                return params ? dayjs(params).format('DD-MM-YYYY') : '';
            },
        }

    ];

    const handleChange = (field: string, value: string) => {
        setFilter((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const loadDropdowns = async () => {
            try {
                setDropdownOptions({
                    pipelines: await fetchOptions('pipelines'),
                    organizations: await fetchOptions('organizations'),
                    contacts: [], 
                    items: [],
                    owners: [],  
                    filetypes: [],
                    dealtypes: await fetchOptions("dealtypes"),
                    bilingFreqency: [],
                    paymentTerm: [],
                    status: await fetchOptions('statuses'),
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
                <Typography key={1} >Deal-Report</Typography>,
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
            const resp = await myAxios.get(`Deal/SearchDeals?orgid=${filter.organization}&dealstatus=${filter?.dealstatus === "0" ? '' : filter?.dealstatus}&pipeline=${filter.pipeline}&dealtypeid=${filter.dealType}&status=${filter.status === "0" ? "" :filter.status }&days=${filter.status === "ExpiringIn" ? filter.days : 0}&pageno=${paginationModel?.page}&recordperpage=${paginationModel?.pageSize}`)
            if (resp.status === 200) {
                if (resp.data.status === "Success") {
                    setList(resp.data?.data);
                    setLoader(false);
                    setTotalCount(resp.data.totalCount)
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
                setList([]);
                setTotalCount(0);
            }
            setLoader(false)
        }
    }, [filter])


    return (
        <>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filter Deals</Typography>
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
                        <FormControl fullWidth size="small">
                            <InputLabel>Deal Type</InputLabel>
                            <Select
                                value={filter.dealType}
                                label="Deal Type"
                                onChange={(e) => handleChange('dealType', e.target.value)}
                            >
                                <MenuItem value={0}>
                                    {dropdownOptions.dealtypes.length === 0 ? "No Types" : "Choose Type"}
                                </MenuItem>
                                {dropdownOptions.dealtypes.map((option) => (
                                    <MenuItem key={option.id} value={option.id}>
                                        {option.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Deal Status</InputLabel>
                            <Select
                                value={filter.dealstatus}
                                label="Deal Status"
                                onChange={(e) => handleChange('stage', e.target.value)}
                            >
                                <MenuItem value="0">
                                    {dropdownOptions.status.length === 0 ? "No Deal Status" : "Choose Deal Status"}
                                </MenuItem>
                                {dropdownOptions.status.map((option, i) => (
                                    <MenuItem key={i} value={option.statuscode}>
                                        {option.statusname}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>


                    <Grid container spacing={1} size={{ xs: 12, sm: 4 }}>
                        {/* Status Dropdown */}
                        <Grid size={{ xs: filter.status === 'ExpiringIn' ? 6 : 12 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filter.status}
                                    label="Status"
                                    onChange={(e) => handleChange('status', e.target.value)}
                                >
                                    <MenuItem value="0">Choose Status</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Expired">Expired</MenuItem>
                                    <MenuItem value="ExpiringIn">Expiring In</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Days Dropdown (only when "expiring" selected) */}
                        {filter.status === 'ExpiringIn' && (
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Days</InputLabel>
                                    <Select
                                        value={filter.days || ''}
                                        label="Days"
                                        onChange={(e) => handleChange('days', e.target.value)}
                                    >
                                        <MenuItem value={0}>Choose Days</MenuItem>
                                        <MenuItem value={15}>15 Days</MenuItem>
                                        <MenuItem value={30}>30 Days</MenuItem>
                                        <MenuItem value={60}>60 Days</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Autocomplete
                            options={dropdownOptions.organizations}
                            getOptionLabel={(option) => option.name || ''}
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



                </Grid>
                <Grid container justifyContent="space-between" mt={2} spacing={2}>
                    <Grid >
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={()=>{handleDownloadExcel(list,true)}}
                            disabled={list.length === 0}
                        >
                            Download Excel
                        </Button>
                    </Grid>
                    <Grid  sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                                setFilter({
                                    pipeline: '',
                                    dealType: '',
                                    dealstatus: '',
                                    priority: '',
                                    status: '',
                                    organization: '',
                                    days: '',
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
