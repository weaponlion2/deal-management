import myAxios from '../api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useCallback, useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { Box, Button, Link, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { AxiosError } from 'axios';

export interface ContactView {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  mobile: string;
  email: string;
  extension: string;
  company: string;
  phone: string;
  organizationId: number;
}


export default function OrganizationList() {
  const { setUpHeader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
  const [list, setList] = useState<ContactView[]>([])

  const columns: GridColDef[] = [
    {
      field: 'name', headerName: 'Name', width: (1215 * 25 / 100),
      renderCell: (params) => (
        <div>
          {params.row.firstName} {params.row.lastName}
        </div>
      ),
    },
    // {
    //   field: 'jobTitle', headerName: 'Job Title', width: (1215 * 15 / 100),
    //   renderCell: (params) => (
    //     <div>
    //       {params.value}
    //     </div>
    //   ),

    // },
    { field: 'company', headerName: 'Company', width: (1215 * 30 / 100) },
    { field: 'email', headerName: 'Email', width: (1215 * 25 / 100) },
    { field: 'mobile', headerName: 'Mobile', width: (1215 * 15 / 100) },
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


  const getData = async (currPage: number = 0, perPage: number = 25, query: string = "") => {
    setLoader(true);
    try { //2024-12-20 
      const req = await myAxios.get(`/Contact/ShowAllContacts?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=false&query=${query}`);
      if (req.status === 200) {
        const { data, status, totalCount }: Response<ContactView[]> = req.data;
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
        <Typography key={1}>Contact</Typography>,
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
          <Typography variant="h6" gutterBottom component="div"> Contact List</Typography>
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
            <TextField
              value={query ?? ""}
              onChange={handleSearch}
              placeholder='Search Name, Mobile'
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
            <Button variant="contained" onClick={() => handleNavigate("/contact/form")} style={{ marginRight: 8 }}>
              New Contact
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
                },
              },
            }}
            pageSizeOptions={[25, 50,100]}
            pagination
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}

            columns={columns}
            rows={list}
            disableRowSelectionOnClick
            disableColumnMenu
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
      </Paper >}
    </>
  );
}
