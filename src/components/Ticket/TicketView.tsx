import myAxios, { host } from "../api";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { FIRE, HEADER_FIRE, Response, START_LOADER } from "../Layout.Interface";
import {
  Link as RLink,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  Grid2 as Grid,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  CardHeader,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  MenuItem,
  DialogActions,
  Badge,
} from "@mui/material";
import {
  commentForm,
  fetchComment,
  fetchOptions, 
  Sources,
  Statuses,
  TaskForm,
} from "./Ticket";
import { TicketView as TView } from "./List";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import axios, { AxiosError, AxiosResponse } from "axios"; 
import { IDealDropdown, FileTypes } from "../Deal/Deal";
import {
  ArrowBack,
  Send,
  Person,
  Business,
  Description,
  Timeline as TimelineIcon,
  Flag,
  Schedule,
  Phone,
  AddComment,
} from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import dayjs from "dayjs";

const NA = "N/A";

interface TNView extends TView {
  status: (typeof Statuses)[number]["id"];
  taskmodel: TaskForm[];
}

export const StatusChip: Record<
  (typeof Statuses)[number]["id"] | "-1",
  ReactNode
> = {
  "-1": (
    <Chip color="warning" label="NONE" size="small" sx={{ fontWeight: 500 }} />
  ),
  OPN: (
    <Chip color="primary" label="OPEN" size="small" sx={{ fontWeight: 500 }} />
  ),
  INP: (
    <Chip
      color="info"
      label="IN PROGRESS"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
  "PEN-US": (
    <Chip
      color="warning"
      label="Pending (on us)"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
  "PEN-CS": (
    <Chip
      color="warning"
      label="Pending (on customer)"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
  CAN: (
    <Chip
      color="error"
      label="CANCELLED"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
  CLO: (
    <Chip
      color="success"
      label="CLOSED"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
  SR: (
    <Chip color="info" label="SERVICES" size="small" sx={{ fontWeight: 500 }} />
  ),
  RE: (
    <Chip color="info" label="RENEWED" size="small" sx={{ fontWeight: 500 }} />
  ),
  WI: (
    <Chip
      color="info"
      label="WITHdRAWN"
      size="small"
      sx={{ fontWeight: 500 }}
    />
  ),
};

export const SourcesNode: Record<
  (typeof Sources)[number]["id"] | "-1",
  ReactNode
> = {
  "-1": <Typography variant="caption">None</Typography>,
  CH: <Typography variant="caption">Call Helpline</Typography>,
  CSP: <Typography variant="caption">Call Service Person</Typography>,
  EMAIL: <Typography variant="caption">Email</Typography>,
  WH: <Typography variant="caption">Whatsapp Helpline</Typography>,
  WSP: <Typography variant="caption">Whatsapp Service Person</Typography>,
  PM: <Typography variant="caption">Primantive Mantainance</Typography>,
};

const TicketView: React.FC = () => {
  const { uid } = useParams<{ uid: string | undefined }>();
  const navigate = useNavigate();
  const [isClosed, setIsClosed] = useState(false);
  const { setUpHeader, startLoader, startFir } = useOutletContext<{
    startFir: FIRE;
    setUpHeader: HEADER_FIRE;
    startLoader: START_LOADER;
  }>();
  const [value, setValue] = React.useState(0);
  const [commentList, setCommentList] = useState<commentForm[]>([]);
  const [comment, setComment] = useState<string>("");
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState<string | "">("");
  const [ticketData, setTicketData] = useState<TNView>({
    id: 0,
    createdOn: "",
    pipeline: "-1",
    description: "",
    source: "CSP",
    contactFirstName: "",
    contactLastName: "",
    organizationName: "",
    priority: "",
    productName: "",
    status: "OPN",
    closeDate: "",
    industryName: "",
    openDate: "",
    ownerName: "",
    tickCode: "",
    serialNo: "",
    taskmodel: [],
    contactId: "",
    organizationId: "",
    name: "",
    contactName: "",
    orgid: "",
    dealid: "",
    dealId: "",
    orgname: "",
    dealname: "",
  });

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
    paymentTerm: [],
  });

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      startLoader(true);
      setDropdownOptions({
        pipelines: await fetchOptions("pipelines"),
        organizations: [],
        contacts: [],
        items: [],
        owners: [],
        status: [],
        filetypes: dropdownOptions.filetypes,
        dealtypes: [],
        bilingFreqency: [],
        paymentTerm: [],
      });
      startLoader(false);
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

  const handleSubmit = async () => {
    startLoader(true);
    const data: commentForm = {
      comments: comment,
      cid: 0,
      refid: Number(uid),
      uid: Number(localStorage.getItem("@Id") ?? 0),
      reftype: "TICKET", 
      isactive: true,
      userName: "You",
      createOn: new Date().toString()
    };
    const response: AxiosResponse<any> = await myAxios.post(
      `/Comment/SaveComments`,
      data
    );
    try {
      if (response.data.status === "Success") {
        startFir({
          msg: "Comment saved successfully",
          type: "S",
        });
        setCommentList((prev) => [data, ...prev]);
        setComment("");
      } else {
        startFir({
          msg: "Unable to save comment",
          type: "W",
        });
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
      startFir({
        msg: "Something went wrong",
        type: "E",
      });
    }
    startLoader(false);
  };

  useEffect(() => {
    setUpHeader({
      title: "",
      breadcrum: () => [
        <Link
          key={0}
          component={RLink}
          underline="hover"
          color="inherit"
          to="/"
        >
          Dashboard
        </Link>,
        <Link
          key={1}
          component={RLink}
          underline="hover"
          color="inherit"
          to="/tickets"
        >
          Tickets
        </Link>,
        <Typography key={2} color="text.primary">
          {uid}
        </Typography>,
      ],
    });

    const fetchDropdownOptions = async () => {
      startLoader(true);
      if (uid) {
        await getData(uid);
      }
      startLoader(false);
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
  }, [dropdownOptions?.pipelines]);

  const getData = async (uid: string) => {
    try {
      const req = await myAxios.get(
          `/Ticket/ShowTicket?id=${uid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true&isopen=false`
      );
      if (req.status === 200) {
        const { data, status }: Response<TNView[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            const ticketData = data[0];
            setTicketData(ticketData);
            getHistory(uid);
            ticketData.status === "CLO" && setIsClosed(true);
          }
        }
      }
    } catch (_err: unknown) {
      if (_err instanceof AxiosError) {
        console.log(_err.message);
      } else {
        console.log("An unexpected error occurred");
      }
    }
  };

  const getHistory = useCallback(async (id: string) => {
    const comm = await fetchComment("0", "TICKET", id);
    setCommentList(comm);
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const res = await myAxios.get(
        `/FileUpload/ShowFile?refid=${uid}&reftype=TICKET`
      );
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
  }, [uid]);

  const handleChange = (_e: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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

      setFile(base64Result.split(",")[1]);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload action
  const handleUpload = async () => {
    if (!selectedFile || !selectedFileType || !file || !uid) {
      startFir({
        msg: "Please choose a file, enter the file name and choose a file type.",
        type: "E",
      });
      return;
    }
    const formData = new FormData();
    formData.append("id", "0");
    formData.append("refid", uid.toString());
    formData.append("reftype", "TICKET");
    formData.append("file", selectedFile);
    formData.append("filetype", selectedFileType);
    formData.append("filename", customFileName);
    formData.append("filepath", "");

    try {
      setUploading(true);
      const res = await myAxios.post("/FileUpload/SaveFileMedia", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const status = res.data.status;
      if (res.status === 200 && status == "Success") {
        startFir({
          msg: "File Saved",
          type: "S",
        });
        handleCloseDialog();
        await fetchUploadedFiles();
      } else {
        startFir({
          msg: "Failed to Save File",
          type: "W",
        });
      }
    } catch (error) {
      console.error(error);
      startFir({
        msg: "An error occurred during upload.",
        type: "E",
      });
      // toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
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
      link.download = `${data.filename || "download"}.${ext}`;
      // link.download = data.dealname || "download"; // Optional: add extension if known
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url); // cleanup
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setSelectedFile(null);
    setSelectedFileType("");
    setFile("");
    setCustomFileName("");
    setOpenDialog(false);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate("/tickets")} size="small">
          <ArrowBack />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Ticket #{ticketData.tickCode || uid}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created on {ticketData.createdOn || "N/A"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />           
        {StatusChip[ticketData.status || "-1"]}
      </Stack>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Ticket Details */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  px: 2,
                  pt: 2,
                }}
              >
                <Tab label="Details" />
              </Tabs>

              {
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Ticket Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        TICKET INFORMATION
                      </Typography>
                      <Stack spacing={2.5}>
                        <InfoRow
                          icon={<Description fontSize="small" />}
                          label="Product Name"
                          value={ticketData.productName || NA}
                        />
                        <InfoRow
                          icon={<TimelineIcon fontSize="small" />}
                          label="Pipeline"
                          value={ticketData.pipeline || NA}
                        />
                        <InfoRow
                          icon={<Flag fontSize="small" />}
                          label="Source"
                          value={
                            SourcesNode[
                              ticketData.source as keyof typeof SourcesNode
                            ]
                          }
                        />
                      </Stack>
                    </Grid>

                    {/* Contact Information */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        CONTACT INFORMATION
                      </Typography>
                      <Stack spacing={2.5}>
                        <InfoRow
                          icon={<Business fontSize="small" />}
                          label="Organization"
                          value={ticketData.organizationName || NA}
                        />
                        <InfoRow
                          icon={<Person fontSize="small" />}
                          label="Contact Name"
                          value={
                            `${ticketData.contactFirstName || ""} ${
                              ticketData.contactLastName || ""
                            }`.trim() || NA
                          }
                        />
                        <InfoRow
                          icon={<Phone fontSize="small" />}
                          label="Contact ID"
                          value={ticketData.contactId || NA}
                        />
                      </Stack>
                    </Grid>

                    {/* Timeline Information */}
                    <Grid size={{ xs: 12 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        TIMELINE
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoRow
                            icon={<Schedule fontSize="small" />}
                            label="Opening Date"
                            value={ticketData.openDate || NA}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <InfoRow
                            icon={<Schedule fontSize="small" />}
                            label="Closing Date"
                            value={ticketData.closeDate || NA}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Description */}
                    {ticketData.description && (
                      <Grid size={{ xs: 12 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          DESCRIPTION
                        </Typography>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="body2">
                            {ticketData.description}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Activity Timeline with Comment Input */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3 }}
            >
              {/* Activity Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                  Activity Timeline
                </Typography>
                {/* <AddComment color="primary" /> */}
              </Box>

              {/* Activity Timeline */}
              <Box sx={{ flex: 1, overflow: "scroll", mb: 3, maxHeight: 300 }}>
                {commentList.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No activity yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Start by adding a comment
                    </Typography>
                  </Box>
                ) : (
                  <Timeline sx={{ p: 0, m: 0 }}>
                    {commentList.map((item, index) => (
                      <TimelineItem
                        key={item.cid}
                        sx={{
                          minHeight: 60,
                          "&:before": { flex: 0, padding: 0 },
                        }}
                      >
                        <TimelineSeparator>
                          <TimelineDot color="primary" sx={{  }} />
                          {index < commentList.length - 1 && (
                            <TimelineConnector />
                          )}
                        </TimelineSeparator>
                        <TimelineContent sx={{ px: 2 }}>                          
                          <Box sx={{gap: 2}}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                              <Chip label={item.userName} size="small"/>
                              <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {(dayjs(item.createOn).format("YYYY-MM-YY HH:MM:ss"))}
                            </Typography>
                            </Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {item.comments}
                          </Typography>
                          </Box>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                )}
              </Box>

              {/* Add Comment Section */}
              <Box
                sx={{
                  mt: "auto",
                  pt: 3,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Add New Comment
                </Typography>
                <TextField
                  placeholder="Type your comment here..."
                  fullWidth
                  multiline
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }} 
                  disabled={isClosed}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isClosed}
                  fullWidth
                  startIcon={<Send />}
                >
                  Post Comment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ my: 2 }}>
        <CardHeader
          title={
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight="bold">
                Uploaded files
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<UploadFileIcon />}
                onClick={handleOpenDialog}
                disabled={isClosed}
              >
                Upload File
              </Button>
            </Box>
          }
        />
        <CardContent>
          {uploadedFiles.length > 0 ? (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              <Table size="small">
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                    {/* <TableCell sx={{ fontWeight: 'bold' }}>File Path</TableCell> */}
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedFiles.map((file: any, index: any) => (
                    <TableRow key={index} hover>
                      <TableCell>{file?.filename || "N/A"}</TableCell>
                      <TableCell>
                        {file?.filetype
                          ? file.filetype === "IN"
                            ? "Invoice"
                            : "Purchase Order"
                          : "N/A"}
                      </TableCell>
                      {/* <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {file?.filepath || "N/A"}
                            </TableCell> */}
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(file)}
                        >
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

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload File</DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}
        >
          {/* File Type Dropdown */}
          <TextField
            select
            label="Select File Type"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
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
              border: "2px dashed #1976d2",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              backgroundColor: "#f9f9f9",
              transition: "0.3s",
              "&:hover": {
                backgroundColor: "#e3f2fd",
                borderColor: "#1565c0",
              },
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e: any) => handleFileDrop(e)}
            component="label"
          >
            <UploadFileIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            <Typography variant="body1" mt={1}>
              Drag & Drop or Click to Upload File
            </Typography>
            <input type="file" hidden onChange={(e) => handleFileChange(e)} />
          </Paper>

          {/* File Name Display */}
          {selectedFile && (
            <Typography
              variant="body2"
              sx={{
                color: "#555",
                fontStyle: "italic",
                textAlign: "center",
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
            disabled={
              uploading || !selectedFileType || !selectedFile || !customFileName
            }
            variant="contained"
            color="primary"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Reusable InfoRow Component
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <Stack direction="row" spacing={2} alignItems="flex-start">
    <Box sx={{ color: "primary.main", mt: 0.5 }}>{icon}</Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

export default TicketView;
