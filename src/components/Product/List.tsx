import myAxios from '../api';
import { Frequency } from './Product';
import { DataGrid, GridColDef,  } from '@mui/x-data-grid';
import {  ReactNode, useCallback, useEffect, useState } from 'react';
import { Box, Button, Link, Paper,  Stack,  Typography } from '@mui/material';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext } from "react-router-dom";
import { AxiosError } from 'axios';

export interface ProductView {
  id: number;
  name: string;
  description: string;
  type: string;  
  billingfrequency: typeof Frequency[number]['id'] | "-1";
  sku: string;
}
export const FrequencyView: Record<typeof Frequency[number]['id'], string> = Frequency.reduce((acc, { id, name }) => {
  acc[id] = name;
  return acc;
}, {} as Record<string, string>);

export const FrequencyNode: Record<typeof Frequency[number]['id'] | "-1", ReactNode> =
{
  "-1": <Typography fontWeight={"700"} color="warning">None</Typography>,
  "3M": <Typography fontWeight={"700"} >3 Months</Typography>,
  "6M": <Typography fontWeight={"700"} >6 Months</Typography>,
  "9M": <Typography fontWeight={"700"} >9 Months</Typography>,
  "12M": <Typography fontWeight={"700"} >12 Months</Typography>,  
};


export default function ProductList() {
  const { setUpHeader, startLoader, startFir } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();

  const [list, setList] = useState<ProductView[]>([]) 

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Product Name', width: (1215 * 15 / 100) },
    {
      field: 'description', headerName: 'Description', width: (1215 * 20 / 100),
      renderCell: (params) => (
        <div>
          {params.value}
        </div>
      ),

    },
    {
      field: 'billingfrequency', headerName: 'Billing Frequency', width: (1215 * 20 / 100),
      renderCell: (params) => (
        <div>
          {FrequencyNode[params.value]}
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
          <Button sx={{ minWidth: 40 }} onClick={() => handleNavigate(`/product/form/${params.row.id}`)} variant="text">✏️</Button>
          <Button sx={{ minWidth: 40,  }}  onClick={() =>deleteMTask(`${params.row.id}`) } variant="text">🗑️</Button>
        </Stack>
      ),
    },    
  ];

  
  const deleteMTask = useCallback(async(id:string) => {
    startLoader(true);
    try { //2024-12-20 
      const req = await myAxios.get(`/Product/DeleteProduct?id=${id}&type=PRODUCT`);
      if (req.status === 200) {
        const { status }: Response<ProductView[]> = req.data;
        if (status === "Success") {
          startFir({msg:"Task Deleted Successfull",type:"S"})
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
      const req = await myAxios.get(`/Product/ShowProduct?id=0&page=${currPage}&recordPerpage=${perPage}`);
      if (req.status === 200) {
        const { data, status }: Response<ProductView[]> = req.data;
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
        <Typography key={1} >Product</Typography>,
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
          <Typography variant="h6" gutterBottom component="div"> Product List</Typography>
          <div style={{ marginBottom: 16 }}>
            <Button variant="contained" onClick={() => handleNavigate("/product/form")} style={{ marginRight: 8 }}>
              New Product
            </Button>
            {/* <Button variant="contained" color="error" style={{ marginRight: 8 }}>
              Mark as Unpaid
            </Button> */}
          </div>
        </Box>

        <Box sx={{ width: "100%", display: "flex", gap: 1 }}>
          <DataGrid rows={list} paginationModel={{ page: 0, pageSize: 25 }} pageSizeOptions={[10, 25, 100, { value: -1, label: 'All' }]} columns={columns} checkboxSelection disableRowSelectionOnClick
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
