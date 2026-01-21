import myAxios, { host } from '../api';
import React, { useCallback, useEffect, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, Button, Typography, Box, Paper, Divider, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { OrganizationForm } from './Organization';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TabelModel from '../Other/TabelModel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AxiosError } from 'axios';

type industryType = "HEALTHCARE" | "LIBRARY";
export const industryList: industryType[] = ["LIBRARY", "HEALTHCARE"]
interface OrganizationView extends OrganizationForm {
    getFileDetails: null | IFileDetial[],
}

type FType = "IN" | "PO" | "SR" | "PIR" | "IR";
const FVal: Record<FType, string> = {
    IN: "Invoice",
    IR: "Installation Report",
    SR: "Service Report",
    PIR: "Primary Information Report",
    PO: "Purchase Order"
}

interface IFileDetial {
    refId: string,
    orgId: string,
    refType: "TICKET" | "DEAL",
    filePath: string,
    fileType: FType
}

const OrganizationView: React.FC = () => {
    const { orgId } = useParams<{ orgId: string | undefined }>();
    const { setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<OrganizationView>({
        id: 0,
        name: "",
        industry: "",
        type: "HEALTHCARE",
        address: "",
        city: "",
        state: "-1",
        pincode: "",
        logo: "",
        active: true,
        getFileDetails: null
    });

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Link key={1} component={RLink} underline="hover" color="inherit" to="/organizations">
                    Organization
                </Link>,
                <Typography key={2} >{orgId}</Typography>,
            ],
        });

        const fetchDropdownOptions = async () => {
            // Simulating API calls
            startLoader(true);

            if (orgId) {
                await getData(orgId);
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

    const getData = useCallback(async (orgId: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Organization/AllOrganization?id=${orgId}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&isfile=true`);
            if (req.status === 200) {
                const { data, status }: Response<OrganizationView[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        setTicketData({ ...data[0] })
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
                <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                    <Typography variant="h5" align="left" >
                        Organization
                    </Typography>
                    <Box display={"flex"} alignItems={"center"} >
                        <Grid>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ width: "100%", textWrap: "nowrap" }}
                                onClick={() => handleNavigate("/organizations")}
                            >
                                Organization List
                            </Button>
                        </Grid>
                    </Box>
                </Box>
                <Divider />

                <Grid container spacing={1} padding={2}>

                    {ticketData.logo !== "" && <Grid size={{ xs: 12, sm: 12 }} sx={{ display: "flex", justifyContent: "center", }} >
                        <Box sx={{ height: 200, border: "1px solid lightgrey", my: 1 }}>
                            <img src={ticketData.logo} width={"100%"} height={"100%"} />
                        </Box>
                    </Grid>}
                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"Organization Name"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.name}</Typography>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"Type"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.type === "-1" ? "NONE" : ticketData.type}</Typography>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"Industry"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.industry === "" ? "None" : ticketData.industry}</Typography>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"State"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.state}</Typography>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"City"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.city}</Typography>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"Pincode"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.pincode === "" ? "None" : ticketData.pincode}</Typography>
                        </Grid>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} >
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Typography variant="subtitle1" color='textSecondary' fontWeight={700}>{"Address"}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 8 }}>
                            <Typography variant="body1">{ticketData.address}</Typography>
                        </Grid>
                    </Grid>
                </Grid>

            </Paper>

            {
                ticketData.getFileDetails &&
                ticketData.getFileDetails.length > 0 && (
                    <Accordion expanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography component="span">Additional Details</Typography>
                        </AccordionSummary>
                        {
                            ticketData.getFileDetails.map((v) => {
                                return (
                                    <AccordionDetails key={v.refId}>
                                        <Link href={host + "/" + v.filePath} underline="hover" target="_blank" sx={{display: "flex", alignItems: "center"}}>
                                            {FVal[v.fileType]} <OpenInNewIcon sx={{width: "15px", height: "15px"}} />
                                        </Link>
                                    </AccordionDetails>
                                )
                            })
                        }
                    </Accordion>
                )
            }



            <TabelModel tType='DEAL' mid={orgId ?? '0'} />
            <TabelModel tType='CONTACT' mid={orgId ?? '0'} />
            <TabelModel tType='ORG-TIC' mid={orgId ?? '0'} />
            
        </>
    );
};

export default OrganizationView;

