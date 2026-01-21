import myAxios from "../api";
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
  Paper,
  Divider,
  Link,
  Tabs,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import {
  commentForm,
  fetchComment,
  fetchOptions,
  Sources,
  Statuses,
  TaskForm,
} from "./Ticket";
import { StatusTypography, TicketView as TView } from "./List";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { AxiosError, AxiosResponse } from "axios";
import dayjs from "dayjs";
import { IDealDropdown } from "../Deal/Deal";

const NA = "N/A";

interface TNView extends TView {
  status: (typeof Statuses)[number]["id"];
  taskmodel: TaskForm[];
}

export const SourcesNode: Record<
  (typeof Sources)[number]["id"] | "-1",
  ReactNode
> = {
  "-1": <Typography fontWeight={"700"}>None</Typography>,
  CH: <Typography fontWeight={"700"}>Call Helpline</Typography>,
  CSP: <Typography fontWeight={"700"}>Call Service Person</Typography>,
  EMAIL: <Typography fontWeight={"700"}>Email</Typography>,
  WH: <Typography fontWeight={"700"}>Whatsapp Helpline</Typography>,
  WSP: <Typography fontWeight={"700"}>Whatsapp Service Person</Typography>,
  PM: <Typography fontWeight={"700"}>Primantive Mantainance</Typography>,
};

const TicketView: React.FC = () => {
  const { uid } = useParams<{ uid: string | undefined }>();
  const navigate = useNavigate();
  const { setUpHeader, startLoader, startFir } = useOutletContext<{
    startFir: FIRE;
    setUpHeader: HEADER_FIRE;
    startLoader: START_LOADER;
  }>();
  const [value, setValue] = React.useState(0);
  const [commentList, setCommentList] = useState<commentForm[]>([]);
  const [comment, setComment] = useState<string>("");
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
    filetypes: [],
    bilingFreqency: [],
    paymentTerm: [],
  });

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      // Simulating API calls
      startLoader(true);
      setDropdownOptions({
        pipelines: await fetchOptions("pipelines"),
        organizations: [],
        contacts: [],
        items: [],
        owners: [],
        status: [],
        filetypes: [],
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
      id: Number(uid),
      uid: Number(localStorage.getItem("@Id") ?? 0),
      type: "TICKET",
      createOn: dayjs().format("YYYY-MM-DD"),
      isactive: true,
      userName: "You",
    };
    const response: AxiosResponse<any> = await myAxios.post(
      `/Tickets/SaveComments`,
      data
    );
    try {
      if (response.data.status === "Success") {
        startFir({
          msg: "Comment save successfully",
          type: "S",
        });
        setCommentList((prev) => [data, ...prev]);
        setComment("");
      } else {
        startFir({
          msg: "Unable to save deal",
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
          to="/tickets"
        >
          Ticket
        </Link>,
        <Typography key={2}>{uid}</Typography>,
      ],
    });

    const fetchDropdownOptions = async () => {
      // Simulating API calls
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
      //2024-12-20
      const req = await myAxios.get(
        `/Ticket/ShowTicket?id=${uid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true`
      );
      if (req.status === 200) {
        const { data, status }: Response<TNView[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            setTicketData({ ...data[0] });
            getHistory(`${ticketData.id}`);
          }
        } else {
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
    const comm = await fetchComment(id, "TICKET");
    setCommentList(comm);
  }, []);

  const handleChange = (_e: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, pb: 0 }}>
      {/* Title Section */}
      <Box display="flex" justifyContent="space-between" padding={1} px={2}>
        <Typography variant="h5">Ticket</Typography>
        <Box display={"flex"} alignItems={"center"}>
          <Grid>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: "100%", textWrap: "nowrap" }}
              onClick={() => navigate("/tickets")}
            >
              Ticket List
            </Button>
          </Grid>
        </Box>
      </Box>
      <Divider />

      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab
          label="Details"
          id={`simple-tab-1`}
          aria-controls={`simple-tabpanel-1`}
        />
        <Tab
          label="Comment"
          id={`simple-tab-2`}
          aria-controls={`simple-tabpanel-2`}
        />
      </Tabs>

      {/* Ticket Details */}
      <div
        role="tabpanel"
        hidden={value !== 0}
        id={`simple-tabpanel-${0}`}
        aria-labelledby={`simple-tab-${0}`}
      >
        {value === 0 && (
          <>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              paddingX={2}
              sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
            >
              <Grid container>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ borderRight: "1px solid lightgrey", p: 1 }}
                >
                  <Grid container p={0}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Ticket Code
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.tickCode}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Organization Name
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.organizationName === ""
                          ? NA
                          : ticketData.organizationName}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ borderRight: "1px solid lightgrey", p: 1 }}
                >
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Product Name
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.productName}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Contact Name
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.contactFirstName === ""
                          ? NA
                          : ticketData.contactFirstName}{" "}
                        {ticketData.contactLastName}{" "}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ borderRight: "1px solid lightgrey", p: 1 }}
                >
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Source
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {
                          SourcesNode[
                            ticketData.source as
                              | (typeof Sources)[number]["id"]
                              | "-1"
                          ]
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Pipeline
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.pipeline}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ p: 1, borderRight: "1px solid lightgrey" }}
                >
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Status
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {
                          StatusTypography[
                            ticketData.status as
                              | (typeof Statuses)[number]["id"]
                              | "-1"
                          ]
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1 }}>
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Created On
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.createdOn}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  size={{ xs: 12, sm: 6 }}
                  sx={{ borderRight: "1px solid lightgrey", p: 1 }}
                >
                  <Grid container>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="subtitle2" fontSize={17}>
                        Start / End Date
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        fontSize={17}
                      >
                        {ticketData.openDate === "" ? NA : ticketData.openDate}{" "}
                        /{" "}
                        {ticketData.closeDate === "" || !ticketData.closeDate
                          ? NA
                          : ticketData.closeDate}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </div>

      {/* Ticket Comment   */}
      <div
        role="tabpanel"
        hidden={value !== 1}
        id={`simple-tabpanel-${1}`}
        aria-labelledby={`simple-tab-${1}`}
      >
        {value === 1 && (
          <>
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              paddingY={1}
              sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
            >
              {/* Add New Comment Section */}
              <Box display="flex" alignItems="center" paddingTop={2}>
                <TextField
                  label="Add a comment"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{ width: "85%", mx: 3 }}
                />
                <Button
                  disabled={comment ? false : true}
                  variant="contained"
                  color="primary"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </Button>
              </Box>
              {/* Comment Box */}
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                justifyContent={"center"}
                width={"100%"}
              >
                <Grid size={4}>
                  <Box sx={{ maxHeight: 450 }}>
                    <Divider />
                    <Box
                      sx={{ overflow: "auto", maxHeight: 430, px: 3, py: 2 }}
                    >
                      {commentList.length !== 0 ? (
                        <Timeline sx={{ p: 0 }}>
                          {commentList.map((v) => (
                            <TimelineItem sx={{ p: 0 }} key={v.cid}>
                              <TimelineOppositeContent
                                color="text.secondary"
                                sx={{ textAlign: "left", maxWidth: 120 }}
                              >
                                <Typography sx={{ fontSize: 13.5 }}>
                                  {v.createOn}
                                </Typography>
                                <Typography
                                  color="primary"
                                  sx={{ fontSize: 13 }}
                                >
                                  {v.userName}
                                </Typography>
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot />
                                <TimelineConnector />
                              </TimelineSeparator>
                              <TimelineContent>
                                <Typography sx={{ fontSize: 14 }}>
                                  {v.comments}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      ) : (
                        <Typography color="warning" variant="h5">
                          No comments found
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Box>
            </Box>
          </>
        )}
      </div>
    </Paper>
  );
};

export default TicketView;
