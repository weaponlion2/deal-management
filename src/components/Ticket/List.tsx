import myAxios from '../api';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { FIRE, HEADER_FIRE, Response, START_FIRE, START_LOADER } from '../Layout.Interface';
import { NavigateOptions, Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { DropdownOption, fetchOptions, Priorites, Statuses, TicketForm } from './Ticket';
import { Box, Button, Chip, Link, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { AxiosError } from 'axios';
import ExportModal from './ExportModal';
import { IDealDropdown } from '../Deal/Deal';

export interface TicketView {
  id: number;
  organizationName: string;
  organizationId: string;
  contactId: string;
  contactFirstName: string;
  contactLastName: string;
  pipeline: string;
  source: string;
  createdOn: string;
  priority: string;
  productName: string;
  status: string;
  description: string;
  ownerName: string;
  openDate: string;
  closeDate: string;
  industryName: string;
  tickCode: string;
  serialNo: string;
  name: string;
  contactName: string;
  orgid: string;
  dealid: string;
  dealId: string;
  dealname: string;
  orgname: string;
}

export const StatusNode: Record<typeof Statuses[number]['id'] | "-1", ReactNode> =
{
  "-1": <Chip label={"None"} color="warning" />,
  "OPN": <Chip label={"OPEN"} color='warning' />,
  "INP": <Chip label={"IN-PROGRESS"} color="info" />,
  "PEN-US": <Chip label={"PENDING"} color="error" />,
  "PEN-CS": <Chip label={"PENDING"} color="warning" />,
  "CAN": <Chip label={"CANCELLED"} color="secondary" />,
  "CLO": <Chip label={"CLOSED"} color="success" />,
  "SR": <Chip label={"Services"} color="info" />,
  "RE": <Chip label={"Renewed"} color="info" />,
  "WI": <Chip label={"Withdrawn"} color="info" />,
};

export const StatusTypography: Record<typeof Statuses[number]['id'] | "-1", ReactNode> =
{
  "-1": <Typography color="warning" >{"None"}</Typography>,
  "OPN": <Typography color='warning' >{"OPEN"}</Typography>,
  "INP": <Typography color="info" >{"IN-PROGRESS"}</Typography>,
  "PEN-US": <Typography color="warning" >{"PENDING (on us)"}</Typography>,
  "PEN-CS": <Typography color="warning" >{"PENDING (on customer)"}</Typography>,
  "CAN": <Typography color="error" >{"CANCELLED"}</Typography>,
  "CLO": <Typography color="success" >{"CLOSED"}</Typography>,
  "SR": <Typography color="info" >{"Services"}</Typography>,
  "RE": <Typography color="info" >{"Renewed"}</Typography>,
  "WI": <Typography color="info" >{"Withdrawn"}</Typography>,
};

export const PrioriteNode: Record<typeof Priorites[number]['id'] | "-1", ReactNode> =
{
  "-1": <Typography fontWeight="700" color="text.secondary">None</Typography>,
  "LOW": <Typography fontWeight="700" sx={{ color: '#0288d1' }}>LOW</Typography>,
  "MEDIUM": <Typography fontWeight="700" sx={{ color: '#fbc02d' }}>MEDIUM</Typography>,
  "HIGH": <Typography fontWeight="700" sx={{ color: '#e25c0eff' }}>HIGH</Typography>,
  "URGENT": <Typography fontWeight="700" sx={{ color: '#d32f2f' }}>URGENT</Typography>,
  "CRITICAL": <Typography fontWeight="700" sx={{ color: '#b71c1c' }}>CRITICAL</Typography>,
}


export interface TaskDropdown { owners: DropdownOption[], statuses: DropdownOption[], organizations: DropdownOption[], contacts: DropdownOption[],pipeline:DropdownOption[] }


export default function TiketList() {
  const { setUpHeader, startFir, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
  const [list, setList] = useState<TicketView[]>([])

  const columns: GridColDef[] = [
    { field: 'tickCode', headerName: 'Ticket Code', width: (1215 * 10 / 100) },
    { field: 'organizationName', headerName: 'Organization', width: (1215 * 27 / 100) },
    {
      field: 'contactFirstName', headerName: 'Contact', width: (1215 * 12 / 100), disableColumnMenu: true,
      renderCell: (params) => (
        <div>
          {params.value} {params.row.contactLastName}
        </div>
      ),

    },
    {
      field: 'pipeline',
      headerName: 'Pipeline',
      width: (1215 * 8) / 100,
      disableColumnMenu: true,
      renderCell: (params) => {
        return <div>{params.value ?? '-'}</div>;
      }
    },
    // { field: 'source', headerName: 'Source', width: (1215 * 10 / 100) },
    {
      field: 'createdOn', headerName: 'CreatedOn', width: (1215 * 8 / 100), disableColumnMenu: true,
      renderCell: (params) => dayjs(params.value).format("YYYY-MM-DD")
    },
    // {
    //   field: 'priority', headerName: 'Priority', width: (1215 * 10 / 100), disableColumnMenu: true,
    //   renderCell: (params: GridRenderCellParams<TicketView, typeof Priorites[number]['id']>): ReactNode => (
    //     <>
    //       {params.value && PrioriteNode[params.value]}
    //     </>
    //   ),
    // },
    { field: 'productName', headerName: 'Product', width: (1215 * 18 / 100), disableColumnMenu: true },
    {
      field: 'status',
      headerName: 'Status',
      width: (1215 * 8/ 100),
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
            <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/ticket/task/${params.row.id}`, { state: { ticketCode: params.row.tickCode } })} variant="text"><ListAltIcon /></Button>
          </Tooltip>
          <Tooltip title="Show Ticket">
            <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/ticket/${params.row.id}`, { state: { ticketCode: params.row.tickCode } })} variant="text">
              👁️
            </Button>
          </Tooltip>
          <Tooltip title="Modify Ticket">
            <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/ticket/form/${params.row.id}`)} variant="text">✏️</Button>
          </Tooltip>
          <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
        </Stack>
      ),
    },
  ];


  const getData = useCallback(async (currPage: number = 0, perPage: number = 25, query: string = "") => {
    setLoader(true);
    try { //2024-12-20
      const req = await myAxios.get(`/Ticket/ShowTicket?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}`);
      if (req.status === 200) {
        const { data, status, totalCount }: Response<TicketView[]> = req.data;
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
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }

      setTotalCount(0);
    }
    setLoader(false)
  }, []);

    const [dropdownOptions, setDropdownOptions] = useState<IDealDropdown>({
      pipelines: [],
      contacts: [],
      items: [],
      organizations: [],
      owners: [],
      status: [],
      dealtypes: [],
      filetypes: [],
      bilingFreqency: [],
      paymentTerm: [],
    })

    

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,
        <Typography key={1} >Ticket</Typography>,
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

  const [exportModel, setExportModel] = useState<boolean>(false);
  const handleExportModel = (val: boolean) => setExportModel(val);
  const handleMsg = (obj: START_FIRE) => startFir(obj);

useEffect (() =>{
  const fetchDropdownOptions = async () => {
        // Simulating API calls
        startLoader(true);
        setDropdownOptions({
          pipelines: await fetchOptions('pipelines'),
          organizations:[] ,
          contacts: [],
          items: [],
          owners: [],
          status: [],
          filetypes: [],
          dealtypes: [],
          bilingFreqency: [],
          paymentTerm: [],
        });
        startLoader(false)
      };
      fetchDropdownOptions();
  
      return () =>
        setUpHeader({
          title: "",
          sub_title: "",
          breadcrum() {
            return [];
          },
        });
    }, []);
  return (
    <>
      {<Paper sx={{ p: 1 }} style={{ width: '100%' }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom component="div"> Ticket List</Typography>
          <div style={{ marginBottom: 8, display: "flex" }}>
            <div>
              <TextField
                value={query ?? ""}
                onChange={handleSearch}
                placeholder='Search Contact, Organization, Product'
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
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ textWrap: "nowrap" }}
              onClick={() => handleExportModel(true)}
            >
              Export Ticket
            </Button>
          </div>
        </Box>

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
      </Paper >}
      <ExportModal handleModel={handleExportModel} open={exportModel} startFir={handleMsg} startLoader={(val: boolean) => startLoader(val)} />
    </>
  );
}
