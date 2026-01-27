import dayjs from "dayjs";
import myAxios, { host } from "../api";
import React, { useEffect, useState } from "react";
import { FIRE, HEADER_FIRE, Response, START_LOADER } from "../Layout.Interface";
import {
  Link as RLink,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  Grid2 as Grid,
  Typography,
  Box,
  Paper,
  Divider,
  Link,
  Button,
  IconButton,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import {
  commentForm,
  fetchComment,
  fetchOptions
} from "../Ticket/Ticket";
import { FileTypes, IDeal, IDealDropdown } from "./Deal";
import TabelModel from "../Other/TabelModel";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";

const NA = "N/A";

const InfoField = ({
  label,
  value,
  valueProps = {},
}: {
  label: string;
  value: string | number;
  valueProps?: any;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography
      variant="body1"
      fontWeight={400}
      sx={{
        mt: 0.5,
        minHeight: 24,
        display: "flex",
        alignItems: "center",
      }}
      {...valueProps}
    >
      {value}
    </Typography>
  </Box>
);

interface DView extends IDeal {
  ownerName: string;
  dealTypeName: string;
  organizationName: string;
  billingname: string;
  productname: string;
}
const DealView: React.FC = () => {
  const { did } = useParams<{ did: string | undefined }>();
  const [isClosed, setIsClosed] = useState(false);
  const logedUser: number =
    localStorage.getItem("@Id") === null
      ? -1
      : parseInt(localStorage.getItem("@Id") ?? "-1");
  const { startFir, setUpHeader, startLoader } = useOutletContext<{
    startFir: FIRE;
    setUpHeader: HEADER_FIRE;
    startLoader: START_LOADER;
  }>();
  const [ticketData, setTicketData] = useState<DView>({
    id: 0,
    pipeline: "-1",
    orgid: "0",
    contid: "0",
    startdate: dayjs().format("YYYY-MM-DDTHH:mm"),
    enddate: dayjs().format("YYYY-MM-DDTHH:mm"),
    dealtypeid: "-1",
    userid: logedUser,
    ticketlist: [],
    name: "",
    productid: "-1",
    organizationName: "",
    contactName: "",
    ownerName: "",
    dealTypeName: "",
    billingcode: "",
    paymenttermcode: "",
    visitperyear: 0,
    previousdealid: 0,
    dealstatus: "",
    remarks: "",
    billingname: "",
    productname: "",
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
    paymentTerm: [],
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [file, setFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState<string | "">("");
  const [commentList, setCommentList] = useState<commentForm[]>([]); 

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
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
          to="/deals"
        >
          Deal
        </Link>,
        <Typography key={2}>{did}</Typography>,
      ],
    });

    const fetchDropdownOptions = async () => {
      startLoader(true);
      setDropdownOptions({
        pipelines: await fetchOptions("pipelines"),
        organizations: await fetchOptions("organizations", "&id=0"),
        contacts: await fetchOptions("contacts"),
        items: [],
        owners: await fetchOptions("owners"),
        status: dropdownOptions.status,
        filetypes: dropdownOptions.filetypes,
        dealtypes: await fetchOptions("dealtypes"),
        bilingFreqency: await fetchOptions("bilingFreqency"),
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

  useEffect(() => {
    async function rewind() {
      if (did) {
        await getData(did);
      }
    }
    rewind();
  }, [did]);

  useEffect(() => {
    if (dropdownOptions.pipelines.length > 0) {
      getData(did ?? "");
    }
  }, [dropdownOptions.pipelines]);

  const getData = async (did: string) => {
    try {
      //2024-12-20
      const req = await myAxios.get(
        `/Deal/ShowDeals?id=${did}&showdealitem=true&fromdate=&todate=&pageno=0&recordperpage=0&showall=true`
      );
      if (req.status === 200) {
        const { data, status }: Response<DView[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            const dealData = data[0];
            setTicketData(dealData);
            dealData.dealstatus === "CLO" && setIsClosed(true);
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


  const fetchUploadedFiles = async () => {
    try {
      const res = await myAxios.get(`/FileUpload/ShowFile?refid=${did}&reftype=DEAL`);
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
  }, [did]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setSelectedFile(null);
    setSelectedFileType("");
    setFile("");
    setCustomFileName("");
    setOpenDialog(false);
  };

  // Handle upload action
  const handleUpload = async () => {
    if (!selectedFile || !selectedFileType || !file || !did) {      
        startFir({
          msg: "Please choose a file, enter the file name and choose a file type.",
          type: "E",
        });
      return;
    }
    const formData = new FormData();
    formData.append("id", "0");
    formData.append("refid", did.toString());
    formData.append("reftype", "DEAL");
    formData.append("file", selectedFile);
    formData.append("filetype", selectedFileType);
    formData.append("filename", customFileName);
    formData.append("filepath", "");

    try {
      setUploading(true);
      const res = await myAxios.post("/FileUpload/SaveFileMedia", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
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
          refid: Number(did),
          uid: Number(localStorage.getItem("@Id") ?? 0),
          reftype: "DEAL", 
          isactive: true,
          userName: "You",
          createOn: new Date().toString()
        };

    try {
      const response: AxiosResponse<any> = await myAxios.post(
        `/Comment/SaveComments`,
        data
      );

      if (response.data.status === "Success") {
        startFir({ msg: "Comment saved successfully", type: "S" }); 
        if (did !== undefined) {
          const comm = await fetchComment("0", "DEAL", did);
          setCommentList(comm);
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
        const comm = await fetchComment("0", "DEAL", did);
        setCommentList(comm);
      }
    };

    load();
  }, [did]);

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
          <Box display={"flex"} alignItems={"center"}>
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 2.5,
            p: 2,
          }}
        >
          {/* Column 1 - Primary Information */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: 20,
                  bgcolor: "primary.main",
                  borderRadius: 1,
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                Primary Info
              </Typography>
            </Box>

            <InfoField label="Deal Name" value={ticketData.name ?? NA} />
            <InfoField label="Pipeline" value={ticketData.pipeline ?? NA} />
            <InfoField
              label="Deal Type"
              value={ticketData.dealTypeName ?? NA}
            />
          </Box>

          {/* Column 2 - Financial & Timeline */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: 20,
                  bgcolor: "success.main",
                  borderRadius: 1,
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                Financial & Timeline
              </Typography>
            </Box>

            <InfoField label="Start Date" value={ticketData.startdate ?? NA} />
            <InfoField label="End Date" value={ticketData.enddate ?? NA} />
            <InfoField label="Product" value={ticketData.productname ?? NA} />
          </Box>

          {/* Column 3 - Other */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: 20,
                  bgcolor: "grey",
                  borderRadius: 1,
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                Others
              </Typography>
            </Box>

            <InfoField
              label="Organization"
              value={ticketData.organizationName || NA}
            />
            <InfoField label="Contact" value={ticketData.contactName || NA} />
            <InfoField
              label="Visits Per Year"
              value={ticketData.visitperyear ?? NA}
            />
          </Box>

          {/* Row 4 - Billing Details (Full width on desktop, or could be another column) */}
          <Box
            sx={{
              gridColumn: { xs: "1", lg: "1 / span 3" },
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 4,
                  height: 20,
                  bgcolor: "warning.main",
                  borderRadius: 1,
                }}
              />
              <Typography variant="subtitle1" fontWeight={600}>
                Billing Details
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", gap: 2 },
              }}
            >
              <InfoField
                label="Billing Frequency"
                value={ticketData.billingname ?? NA}
              />
              <InfoField
                label="Payment Term"
                value={
                  ticketData.paymenttermcode === "PP"
                    ? "Prepaid"
                    : ticketData.paymenttermcode === "PO"
                    ? "Postpaid"
                    : NA
                }
                valueProps={{
                  color:
                    ticketData.paymenttermcode === "PP"
                      ? "success.main"
                      : ticketData.paymenttermcode === "PO"
                      ? "info.main"
                      : "inherit",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <TabelModel tType="TICKET" mid={did ?? "0"} />

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

      <Paper elevation={3} sx={{ p: 2 }}>
        {/* Header: Title and Action */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Deal Comment</Typography>
          {!showInput ? (
            <Button variant="outlined" disabled={isClosed} onClick={() => setShowInput(true)}>
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
              <Button
                variant="contained"
                disabled={!comment}
                onClick={handleSubmit}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setShowInput(false);
                  setComment("");
                }}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
        {commentList.length > 0 ? (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Created On</TableCell>
                  {/* <TableCell sx={{ fontWeight: 'bold' }}>File Path</TableCell> */}
                  <TableCell sx={{ fontWeight: "bold" }}>Comment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commentList.map((file: any, index: any) => (
                  <TableRow key={index} hover>
                    <TableCell>{file?.userName || "N/A"}</TableCell>
                    <TableCell>{file?.createOn}</TableCell>
                    {/* <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file?.filepath || "N/A"}
                      </TableCell> */}
                    <TableCell>{file?.comments}</TableCell>
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
    </>
  );
};

export default DealView;
