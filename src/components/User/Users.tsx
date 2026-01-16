import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import VerticalTabs from '../Ticket/Vertical';
import myAxios from '../api';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { AxiosError } from 'axios';

interface RowData {
  id: number;
  name: string;
  email: string;
  type: string;
  isactive: boolean;
}

type MODE = "simple" | "complex"
export default function UserList() {
  const { setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();

  const [mode, setMode] = useState<MODE>("simple")
  const [list, setList] = useState<RowData[]>([])

  const switchMode = useCallback((arg: MODE) => () => setMode(arg), [])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: (1215 * 15 / 100) },
    {
      field: 'email', headerName: 'Email', width: (1215 * 30 / 100),
      renderCell: (params) => (
        <div style={{ color: 'blue', cursor: 'pointer' }}>
          {params.value}
        </div>
      ),

    },
    { field: 'type', headerName: 'Type', width: (1215 * 20 / 100) },
    {
      field: 'isactive',
      headerName: 'Status',
      width: (1215 * 14 / 100),
      renderCell: (params: GridRenderCellParams<RowData, string>): ReactNode => (
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
      width: (1215 * 15 / 100),
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {/* <Button sx={{ minWidth: 40 }} variant="text" onClick={() => {
            const element = document.querySelector('[data-id="1"]');
          }}>👁️</Button> */}
          <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/user/form/${params.row.id}`)} variant="text">✏️</Button>
          <Button sx={{ minWidth: 40, display: "none" }} variant="text">🗑️</Button>
        </Stack>
      ),
    },
  ];


  const getData = async (currPage: number = 0, perPage: number = 10) => {
    startLoader(true);
    try { //2024-12-20
      const req = await myAxios.get(`/User/AllUsers?id=0&fromdate=&todate=&pageno=${currPage}&recordperpage=${perPage}&showall=true`);
      if (req.status === 200) {
        const { data, status }: Response<RowData[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            setList(data);
          }
        }
        else setList([])
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
        <Typography key={1} >User</Typography>,
      ],
    });

    getData();

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

  return (
    <>
      {mode === "simple" && <Paper sx={{ p: 1 }} style={{ width: '100%', }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom component="div">User List</Typography>
          <div style={{ marginBottom: 16 }}>
            <Button variant="contained" style={{ marginRight: 8 }} onClick={() => handleNavigate("/user/form")}>
              New User
            </Button>
          </div>
        </Box>
        <DataGrid rows={list} columns={columns} checkboxSelection disableRowSelectionOnClick
          sx={{
            maxWidth: 1210, maxHeight: 400,
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
      </Paper>}

      {mode === "complex" && <Paper sx={{ my: 1, overflow: "hidden" }}>
        <VerticalTabs switchMode={() => {
          switchMode("simple")()
        }} />
      </Paper>}
    </>
  );
}
