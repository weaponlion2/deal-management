import myAxios from '../api';
import React, { useCallback, useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, Typography, Box, Paper, Divider, Link, Button } from '@mui/material';
import { ContactForm } from './Contact';
import TabelModel from '../Other/TabelModel';
import { AxiosError } from 'axios';

interface IContact extends ContactForm {
  organizationName: string;
}

const None = "N/A"

const ContactView: React.FC = () => {
  const { cid } = useParams<{ cid: string | undefined }>();
  const { setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
  const [ticketData, setTicketData] = useState<IContact>({
    id: 0,
    firstName: "",
    lastName: "",
    company: "",
    extension: "",
    email: "",
    jobTitle: "",
    mobile: "",
    organizationId: "",
    phone: "",
    active: true,
    organizationName: ""
  });

  useEffect(() => {
    setUpHeader({
      title: "",
      // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
      breadcrum: () => [
        <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
          Dashboard
        </Link>,
        <Link key={1} component={RLink} underline="hover" color="inherit" to="/contacts">
          Contact
        </Link>,
        <Typography key={2} >{cid}</Typography>,
      ],
    });

    const fetchDropdownOptions = async () => {
      // Simulating API calls
      startLoader(true);
      if (cid) {
        await getData(cid);
      }
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

  const getData = useCallback(async (cid: string) => {
    try { //2024-12-20
      const req = await myAxios.get(`/Contact/ShowAllContacts?id=${cid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true`);
      if (req.status === 200) {
        const { data, status }: Response<IContact[]> = req.data;
        if (status === "Success") {
          if (typeof data !== "undefined") {
            setTicketData(data[0])
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
  }, []);

  const navigate = useNavigate();
  const handleNavigate = useCallback((arg0: string): undefined => {
    navigate(arg0)
  }, []);

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
            Contact
          </Typography>
          <Box display={"flex"} alignItems={"center"} >
            <Grid>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{ width: "100%", textWrap: "nowrap" }}
                onClick={() => handleNavigate("/contacts")}
              >
                Contact List
              </Button>
            </Grid>
          </Box>
        </Box>
        <Divider />
        <Grid container spacing={0} padding={0}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>First Name :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.firstName === "" || !ticketData.firstName) ? None : ticketData.firstName}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Last Name :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.lastName === "" || !ticketData.lastName) ? None : ticketData.lastName}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Organization :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.organizationName === "" || !ticketData.organizationName) ? None : ticketData.organizationName}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Job title :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.jobTitle === "" || !ticketData.jobTitle) ? None : ticketData.jobTitle}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Mobile :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.mobile === "" || !ticketData.mobile) ? None : ticketData.mobile}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Alternate Mobile :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.phone === "" || !ticketData.phone) ? None : ticketData.phone}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Email :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.email === "" || !ticketData.email) ? None : ticketData.email}</Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Extension :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.extension === "" || !ticketData.extension) ? None : ticketData.extension}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ borderRight: "1px solid lightgrey", p: 1, px: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant='subtitle2' fontSize={17}>Company :</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.company === "" || !ticketData.company) ? None : ticketData.company}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 1, px: 2, pb: 2 }}>
            <Grid container p={0}>
              <Grid size={{ xs: 12, sm: 4 }}>
                {/* <Typography variant='subtitle2' fontSize={17}>Company :</Typography> */}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* <Typography variant='caption' color='textSecondary' fontSize={17}>{(ticketData.company === "" || !ticketData.company) ? None : ticketData.company}</Typography> */}
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </Paper>

      <TabelModel tType='CONTACT-DEAL' mid={cid ?? '0'} />
      <TabelModel tType='CONTACT-TICKET' mid={cid ?? '0'} />

    </>
  );
};

export default ContactView;
