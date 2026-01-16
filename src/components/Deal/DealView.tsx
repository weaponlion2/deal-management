import dayjs from 'dayjs';
import myAxios, { host } from '../api';
import React, { useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, Typography, Box, Paper, Divider, FormGroup, Link, Button, Tooltip, IconButton, CardContent, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, } from '@mui/material';
import { DropdownOption, fetchComment, fetchOptions, NView, Priorites } from '../Ticket/Ticket';
import LabelIcon from '@mui/icons-material/Label';
import { FileTypes, IDeal, IDealDropdown, IDealItem } from './Deal';
import { useStageMap } from './List';
import { AddCircle } from '@mui/icons-material';
import TabelModel from '../Other/TabelModel';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Card, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

const NA = "N/A"

interface DView extends IDeal {
  ownerName: string,
  dealTypeName: string
  organizationName: string
}
interface commentForm {
  comments: string;
  cid: number;
  id: number;
  uid: number;
  type: string;
  createOn: string;
  isactive: boolean;
  userName: string;
}
const DealView: React.FC = () => {
  const { did } = useParams<{ did: string | undefined }>();
  let logedUser: string | null = localStorage.getItem("@Id");
  const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
  const [ticketData, setTicketData] = useState<DView>({
    id: 0,
    pipeline: '-1',
    orgid: '0',
    contid: '0',
    itemType: '-1',
    priority: 'MEDIUM',
    opendate: dayjs().format("YYYY-MM-DDTHH:mm"),
    closedate: dayjs().format("YYYY-MM-DDTHH:mm"),
    dealtypeid: "-1",
    stage: "IS",
    amount: "",
    userid: logedUser ?? "-1",
    ditems: [],
    name: "",
    itemId: "-1",
    type: "-1",
    file: "",
    refId: 0,
    organizationName: "",
    contactName: "",
    ownerName: "",
    dealTypeName: "",
    billingcode: "",
    paymenttermcode: "",
    visitperyear: 0,
    previousdealid: 0,
  });
  const [itemData, setItemData] = useState<IDealItem[]>([]);
  const [pip ,setPip] = useState<any>(null);
  const navigate = useNavigate();
  const [dropdownOptions, setDropdownOptions] = useState<IDealDropdown>({
    pipelines: [],
    contacts: [],
    items: [],
    itemTypes: [],
    organizations: [],
    owners: [],
    priorities: [...Priorites],
    stages: [],
    dealtypes: [],
    filetypes: [...FileTypes],
    bilingFreqency: [],
    paymentTerm: [],
  })
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState<string | ''>('');
  const [commentList, setCommentList] = useState<commentForm[]>([]);

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,
        <Link key={1} component={RLink} underline="hover" color="inherit" to="/deals">
          Deal
        </Link>,
        <Typography key={2} >{did}</Typography>,
      ],
    });

    const fetchDropdownOptions = async () => {
      // Simulating API calls
      startLoader(true);
      setDropdownOptions({
        pipelines: await fetchOptions('pipelines'),
        organizations: await fetchOptions('organizations', "&id=0"),
        contacts: await fetchOptions('contacts'),
        itemTypes: await fetchOptions('itemtypes'),
        items: [],
        owners: await fetchOptions('owners'),
        priorities: dropdownOptions.priorities,
        stages: dropdownOptions.stages,
        filetypes: dropdownOptions.filetypes,
        dealtypes: await fetchOptions("dealtypes"),
        bilingFreqency: await fetchOptions('bilingFreqency'),
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

  useEffect(() => {
    async function rewind() {
      if (did) {
        await getData(did);
      }
    }
    rewind()
  }, [did])


  const handleNavigate = (arg0: string, state: IDealItem): undefined => {
    const data: NView = {
      amount: "",
      contactId: Number(ticketData.contid),
      contactName: ticketData.contactName,
      dealId: Number(did) ?? 0,
      dealItemId: 0,
      dealName: "",
      itemType: ticketData.itemType,
      organizationName: ticketData.organizationName,
      organizationId: Number(ticketData.orgid),
      phone: "",
      pId: state?.itemId,
      pipeline: pip,
      priority: "",
      serialno: state.serialno,
      vindustry: "",
      userid: `${ticketData.userid}`
    };
    navigate(arg0, { state: data })
  };

  useEffect(() => {
    if (dropdownOptions.pipelines.length > 0) {
      getData(did ?? "");
    }
  }, [dropdownOptions.pipelines]);


  const getData = async (did: string) => {
    try { //2024-12-20
      const req = await myAxios.get(`/Deal/ShowDeals?id=${did}&showdealitem=true&fromdate=&todate=&pageno=0&recordperpage=0&showall=true`);
      if (req.status === 200) {
        const { data, status }: Response<DView[]> = req.data;


        //console.log(dropdownOptions.pipelines,selectedPipeline)
        if (status === "Success") {
          if (typeof data !== "undefined") {
            const selectedPipeline = dropdownOptions?.pipelines.find(
              (item) => String(item.id) === (data[0].pipeline)
            );
            const selectedBilling = dropdownOptions?.bilingFreqency.find(
              (item) => String(item?.code) === (data[0].billingcode)
            );
            setPip(data[0]?.pipeline)
            const items: DropdownOption[] = data[0]['itemType'] ? await fetchOptions("items", data[0]['itemType']) : [];
            setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items }));
            setTicketData({ ...data[0], itemType: `${data[0]['itemType'] === "" ? "-1" : data[0]['itemType']}`, itemId: "-1", closedate: data[0]['closedate'] !== "" ? data[0]['closedate'] : "", type: "-1", file: "", pipeline: selectedPipeline ? `${selectedPipeline.name}` : "-1", billingcode: selectedBilling ? `${selectedBilling?.name}` : '' })
            if (data[0]['ditems']) {
              setItemData(data[0]['ditems']);
            }
          }
        }
        else { }
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
    }
  }

  const stageStyledMap = useStageMap();

  const fetchUploadedFiles = async () => {
    try {
      const res = await myAxios.get(`/Deal/ShowFile?refid=${did}`);
      // console.log("res", res);
      if (res.status === 200) {
        if (res.data.status === "Success") {
          setUploadedFiles(res.data.data || []);
        } else {
          setUploadedFiles([]);
        }
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, [did])

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setSelectedFile(null);
    setSelectedFileType('');
    setFile('');
    setCustomFileName('')
    setOpenDialog(false);
  };

  // Handle upload action
  const handleUpload = async () => {
    if (!selectedFile || !selectedFileType || !file) {
      // toast.error("Please select a file and type");
      return;
    }

    const payload = {
      id: did ?? "0",
      file: file,
      type: selectedFileType,
      orgid: ticketData?.orgid,
      filename: customFileName
    };

    try {
      setUploading(true);
      const res = await myAxios.post("/Deal/SaveFile", payload);
      if (res.status === 200) {
        startFir({
          msg: "File Save SuccessFull",
          type: "S"
        })
        handleCloseDialog();
        await fetchUploadedFiles()
      } else {
        startFir({
          msg: 'Failed to Save File',
          type: 'W'
        })
      }
    } catch (error) {
      console.error(error);
      startFir({
        msg: 'An error occurred during upload.',
        type: 'E'
      })
      // toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Result = reader.result as string;

      setFile(base64Result.split(",")[1])
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (data: any) => {
    try {
      const response = await axios.get(`${host}/${data.filepath}`, {
        responseType: "blob",
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const ext = data.filepath?.split(".").pop(); // e.g., "pdf"
      link.download = `${data.dealname || "download"}.${ext}`;
      // link.download = data.dealname || "download"; // Optional: add extension if known
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url); // cleanup
    } catch (error) {
      console.error("Download failed:", error);
    }
  };


  const [comment, setComment] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async () => {
    startLoader(true);

    const data: commentForm = {
      comments: comment,
      cid: 0,
      id: Number(did),
      uid: Number(localStorage.getItem("@Id") ?? 0),
      type: "DEALS",
      createOn: dayjs().format("YYYY-MM-DD"),
      isactive: true,
      userName: "You",
    };

    try {
      const response: AxiosResponse<any> = await myAxios.post(`/Tickets/SaveComments`, data);

      if (response.data.status === "Success") {
        startFir({ msg: "Comment saved successfully", type: "S" });
        // setCommentList((prev: commentForm[]) => [data, ...prev]);
          if (did !== undefined) {
        const comm = await fetchComment(did, "DEALS");
        setCommentList(comm)
      }
        setComment("");
        setShowInput(false);
      } else {
        startFir({ msg: "Unable to save comment", type: "W" });
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.error(_err.message);
      } else {
        console.error("An unexpected error occurred");
      }
      startFir({ msg: "Something went wrong", type: "E" });
    }

    startLoader(false);
  };


  useEffect(() => {
    const load = async () => {
      if (did !== undefined) {
        const comm = await fetchComment(did, "DEALS");
        setCommentList(comm)
      }
    }

    load()
  }, [did])



  console.log(ticketData.pipeline)


  return (
    <>
      <Paper sx={{ mb: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          paddingY={1}
          paddingX={2}
        >
          <Typography variant="h5" align="left">
            Deal
          </Typography>
          <Box display={"flex"} alignItems={"center"} >
            <Grid>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{ width: "100%", textWrap: "nowrap" }}
                onClick={() => navigate("/deals")}
              >
                Deal List
              </Button>
            </Grid>
          </Box>
        </Box>
        <Divider />
        <Grid container>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={1} padding={1}>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Deal Name :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.name ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Pipeline :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.pipeline ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Deal Type :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.dealTypeName ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Owner :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.ownerName ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>


              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Stage :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{stageStyledMap[ticketData.stage]}</Typography>
                  </Grid>
                </Grid>
              </Grid>


              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Priority :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.priority ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>


              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Organization :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.organizationName === "" ? NA : ticketData.organizationName}</Typography>
                  </Grid>
                </Grid>
              </Grid>


              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Contact :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.contactName === "" ? NA : ticketData.contactName}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Amount :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.amount ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Opening Date :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.opendate ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Closing Date :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.closedate ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2, pb: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Item Type :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.itemType ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2, pb: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Typography variant='subtitle2' fontSize={17}>Billing Frequency :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.billingcode ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2, pb: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Visit Per Year :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.visitperyear ?? NA}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2, pb: 2 }}>
                <Grid container p={0}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant='subtitle2' fontSize={17}>Payment Term :</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant='caption' color='textSecondary' fontSize={17}>{ticketData.paymenttermcode == "PP" ? "PREPAID" : ticketData.paymenttermcode == "PO" ? "POSTPAID" : "NA"}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }} sx={{ borderLeft: "1px solid rgba(192, 192, 192, 0.6)" }} >
            <Box sx={{ height: 400, maxHeight: 400 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems={"center"}
                paddingY={1}
                paddingX={1}
              >
                <Typography variant="h5" align="left">
                  Associated Products ({itemData.length})
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ overflow: "auto", maxHeight: 390 }}>
                <FormGroup
                  sx={{
                    py: 1,
                    gap: 1,
                    flexDirection: "column",
                    minWidth: "100%",
                  }}
                >
                  {itemData.map((v) => (
                    <React.Fragment key={v.itemId}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          pt: 1,
                          px: 0.5,
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", pb: 1, gap: 1 }}>
                          <LabelIcon color="success" />
                          <Typography> {v.name}</Typography>
                        </Box>

                        <Box sx={{ display: "flex" }}>
                          <Tooltip title={"Create Ticket"}>
                            <IconButton onClick={() => handleNavigate(`/ticket/form`, v)}>
                              <AddCircle />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      <Grid container gap={1}>
                        <Grid size={12}>
                          <Box display={'flex'} gap={2} px={1} >
                            <Typography>S.N. : {v.serialno === "" ? NA : v.serialno}</Typography>
                            <Typography>Warranty: {v.waranty}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Divider />
                    </React.Fragment>
                  ))}
                </FormGroup>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>


      <TabelModel tType='TICKET' mid={did ?? '0'} />
      <Card sx={{ my: 2 }}>
        <CardHeader
          title={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                File For This Deal
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadFileIcon />}
                onClick={handleOpenDialog}
              >
                Upload File
              </Button>
            </Box>
          }
        />
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    {/* <TableCell sx={{ fontWeight: 'bold' }}>File Path</TableCell> */}
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedFiles.map((file: any, index: any) => (
                    <TableRow key={index} hover>
                      <TableCell>{file?.filename || "N/A"}</TableCell>
                      <TableCell>
                        {file?.type
                          ? file.type === "IN"
                            ? "Invoice"
                            : "Purchase Order"
                          : "N/A"}
                      </TableCell>
                      {/* <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file?.filepath || "N/A"}
                      </TableCell> */}
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleDownload(file)}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No files uploaded yet.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Paper elevation={3} sx={{ p: 2 }}>
        {/* Header: Title and Action */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Deal Comment</Typography>
          {!showInput ? (
            <Button variant="outlined" onClick={() => setShowInput(true)}>
              Add Comment
            </Button>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                placeholder="Type your comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ width: 300 }}
              />
              <Button variant="contained" disabled={!comment} onClick={handleSubmit}>
                Submit
              </Button>
              <Button variant="outlined" color="error" onClick={() => {
                setShowInput(false);
                setComment("");
              }}>
                Close
              </Button>
            </Box>
          )}
        </Box>
        {commentList.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Created On</TableCell>
                  {/* <TableCell sx={{ fontWeight: 'bold' }}>File Path</TableCell> */}
                  <TableCell sx={{ fontWeight: 'bold' }} >Comment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commentList.map((file: any, index: any) => (
                  <TableRow key={index} hover>
                    <TableCell>{file?.userName || "N/A"}</TableCell>
                    <TableCell>
                      {file?.createOn}
                    </TableCell>
                    {/* <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file?.filepath || "N/A"}
                      </TableCell> */}
                    <TableCell>
                      {file?.comments}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No files uploaded yet.
          </Typography>
        )}
      </Paper>



      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Upload Deal File</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
          {/* File Type Dropdown */}
          <TextField
            select
            label="Select File Type"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            fullWidth
            variant="outlined"
            size='small'
            sx={{ mt: 2 }}
          >
            {dropdownOptions.filetypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="File Name"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            inputProps={{ maxLength: 100 }}
          />

          {/* Drag-and-Drop Upload Area */}
          <Paper
            variant="outlined"
            sx={{
              border: '2px dashed #1976d2',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: '#e3f2fd',
                borderColor: '#1565c0',
              },
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e: any) => handleFileDrop(e)}
            component="label"
          >
            <UploadFileIcon sx={{ fontSize: 40, color: '#1976d2' }} />
            <Typography variant="body1" mt={1}>
              Drag & Drop or Click to Upload File
            </Typography>
            <input
              type="file"
              hidden
              onChange={(e) => handleFileChange(e)}
            />
          </Paper>

          {/* File Name Display */}
          {selectedFile && (
            <Typography
              variant="body2"
              sx={{
                color: '#555',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              Selected file: <strong>{selectedFile.name}</strong>
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFileType || !selectedFile || !customFileName}
            variant="contained"
            color="primary"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>



    </>
  );
};

export default DealView;
