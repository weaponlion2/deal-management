import myAxios from '../api';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { Box, Button, Link, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { AxiosError } from 'axios';

export interface OrganizationView {
  id: number;
  name: string;
  industry: string;
  type: string;
  address: string;
  pincode: string;
  state: string;
  logo: string;
  city: string;
  active: string;
}

export default function OrganizationList() {
  const { setUpHeader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();

  const [list, setList] = useState<OrganizationView[]>([]);
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Organization', width: (1215 * 60 / 100) },
    // {
    //   field: 'industry', headerName: 'Industry', width: (1215 * 15 / 100),
    //   renderCell: (params) => (
    //     <div>
    //       {params.value} {params.row.contactLastName}
    //     </div>
    //   ),

    // },
    { field: 'type', headerName: 'Type', width: (1215 * 10 / 100) },
    // { field: 'state', headerName: 'State', width: (1215 * 10 / 100) },
    { field: 'city', headerName: 'City', width: (1215 * 10 / 100) },
    // { field: 'address', headerName: 'Address', width: (1215 * 10 / 100) },
    // { field: 'pincode', headerName: 'Pincode', width: (1215 * 10 / 100) },
    {
      field: 'active',
      headerName: 'Status',
      width: (1215 * 15 / 100),
      renderCell: (params: GridRenderCellParams<OrganizationView>): ReactNode => (
        <span
          style={{
            color: params.value ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {params.value ? "Active" : "In-Active"}
        </span>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: (1215 * 10 / 100),
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="">
            <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/organization/${params.row.id}`)} variant="text">👁️</Button>
          </Tooltip>
          <Tooltip title="Modify Organization">
            <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/organization/form/${params.row.id}`)} variant="text">✏️</Button>
          </Tooltip>
          <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
        </Stack>
      ),
    },
  ];


  const getData = async (currPage: number = 0, perPage: number = 25, query: string = "") => {
    setLoader(true);
    try { //2024-12-20 
      const req = await myAxios.get(`/Organization/AllOrganization?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}`);
      if (req.status === 200) {
        const { data, status, totalCount }: Response<OrganizationView[]> = req.data;
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
  };

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,
        <Typography key={1} >Organization</Typography>,
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
  const handleNavigate = useCallback((arg0: string): undefined => {
    navigate(arg0)
  }, []);
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom component="div"> Organization List</Typography>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
            <TextField
              value={query ?? ""}
              onChange={handleSearch}
              placeholder='Search Organization Name, Type, State, City'
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
            <Button variant="contained" onClick={() => handleNavigate("/organization/form")} style={{ marginRight: 8 }}>
              New Organization
            </Button>
            {/* <Button variant="contained" color="error" style={{ marginRight: 8 }}>
              Mark as Unpaid
            </Button> */}
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
                  page: 0,
                },
              },
            }}
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
    </>
  );
}
