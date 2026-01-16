import myAxios from '../api';
import { DataGrid, GridColDef, } from '@mui/x-data-grid';
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { AxiosError } from 'axios';

export interface MasterTaskView {
  id: number;
  name: string;
  description: string;
  type: string;
}


export default function MasterTaskList() {
  const { setUpHeader, startLoader, startFir } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();

  const [list, setList] = useState<MasterTaskView[]>([])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'MasterTask', width: (1215 * 25 / 100) },
    {
      field: 'description', headerName: 'Description', width: (1215 * 25 / 100),
      renderCell: (params) => (
        <div>
          {params.value} {params.row.contactLastName}
        </div>
      ),

    },
    { field: 'type', headerName: 'Type', width: (1215 * 25 / 100) },

    {
      field: 'action',
      headerName: 'Action',
      width: (1215 * 22 / 100),
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {/* <Button sx={{ minWidth: 40 }} onClick={() => handleOpenDialog(`${params.row.id}`)} variant="text">👁️</Button> */}
          <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/mastertask/form/${params.row.id}`)} variant="text">✏️</Button>
          <Button sx={{ minWidth: 40, }} onClick={() => deleteMTask(`${params.row.id}`)} variant="text">🗑️</Button>
        </Stack>
      ),
    },
  ];


  const deleteMTask = useCallback(async (id: string) => {
    startLoader(true);
    try { //2024-12-20 
      const req = await myAxios.get(`/MasterTask/DeleteMtask?id=${id}&type=MTASK`);
      if (req.status === 200) {
        const { status }: Response<MasterTaskView[]> = req.data;
        if (status === "Success") {
          startFir({ msg: "Task Deleted Successfull", type: "S" })
          getData();
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
  }, []);

  const getData = async (currPage: number = 0, perPage: number = 10) => {
    startLoader(true);
    try { //2024-12-20 
      // https://localhost:7003/api/MasterTask/ShowAllMtask?id=0&type=Stethoscope
      const req = await myAxios.get(`/MasterTask/ShowAllMtask?id=0&type=&page=${currPage}&recordPerpage=${perPage}`);
      if (req.status === 200) {
        const { data, status }: Response<MasterTaskView[]> = req.data;
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
        <Typography key={1} >MasterTask</Typography>,
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
      {<Paper sx={{ p: 1 }} style={{ width: '100%' }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom component="div"> Master Task List</Typography>
          <div style={{ marginBottom: 16 }}>
            <Button variant="contained" onClick={() => handleNavigate("/mastertask/form")} style={{ marginRight: 8 }}>
              New Master Task
            </Button>
            {/* <Button variant="contained" color="error" style={{ marginRight: 8 }}>
              Mark as Unpaid
            </Button> */}
          </div>
        </Box>

        <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
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
          />
        </Box>
      </Paper >}
    </>
  );
}
