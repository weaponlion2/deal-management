import  { useEffect, useState, useCallback } from "react";
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Chip,
    Grid2 as Grid,
    CircularProgress,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AxiosError } from "axios";
// Replace with your actual API setup
import { useNavigate } from "react-router-dom";
import myAxios from "./api";
import HandshakeIcon from '@mui/icons-material/Handshake';

const Dashboard = () => {
    const [list, setList] = useState<any[]>([]);
    const [loader, setLoader] = useState(false);

    const filter = { pipeline: "0", organization: "0" }; 
    const navigate = useNavigate();

    const handleSearch = useCallback(async () => {
        setLoader(true);
        try {
            const resp = await myAxios.get(
                `Deal/ShowVisit?visitid=0&dealid=0&pipelineid=${filter?.pipeline}&orgid=${filter?.organization}&pending=true&pageno=0&recordperpage=25`
            );
            if (resp.status === 200) {
                if (resp.data.status === "Success") {
                    setList(resp.data?.data);
                } else {
                    setList([]);
                }
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            } else {
                console.error("An unexpected error occurred");
            }
        } finally {
            setLoader(false);
        }
    }, []);

    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    const handleDealClick = (id: number) => {
        navigate(`/deal/${id}`);
    };

    const handleOrgClick = (id: number) => {
        navigate(`/organization/${id}`);
    };

    return (
        <Box p={2} py={0} mt={0} >
            <Box
                mb={3}
                px={2}
                py={3}
                mt={0}
                borderRadius={2}
                boxShadow="0px 4px 15px rgba(0,0,0,0.05)"
                sx={{
                    background: 'linear-gradient(to right, #395672ff, #42a5f5)',
                    color: '#fff',
                }}
            >
                <Typography variant="h5" fontWeight={600}>
                    👋 Welcome to CELECT AMS
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Here's a quick overview of your deals and organizations.
                </Typography>
            </Box>
            {loader ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2} alignItems="stretch">
                    {list.map((deal, index) => (
                        <Grid size={{ xs: 12, sm: 4 }} key={index}>
                            <Paper
                                elevation={2}
                                sx={{
                                    height: "100%", // ✨ Ensures full stretch
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    p: 2.5,
                                    borderRadius: 2,
                                    backgroundColor: "#fff",
                                    boxShadow: "0px 1px 5px rgba(0,0,0,0.1)",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    '&:hover': {
                                        transform: "translateY(-3px)",
                                        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                                    },
                                }}
                            >
                                {/* Top Row: Deal Name & Icon */}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1.2}>
                                        <HandshakeIcon fontSize="small" color='primary' />

                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={600}
                                            sx={{
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                "&:hover": { textDecoration: "underline", color: "primary.main" },
                                            }}
                                            onClick={() => handleDealClick(deal?.dealId)}
                                        >
                                            {deal?.dealname ?? "Untitled Deal"}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        sx={{ color: "grey.500" }}
                                        onClick={() => navigate('/report/visit')}
                                    >
                                        <ChevronRightIcon />
                                    </IconButton>
                                </Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Box display="flex" alignItems="center" gap={1.2}>
                                        <BusinessIcon color="primary" fontSize="small" />
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={400}
                                            sx={{
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                fontSize: '15px',
                                                "&:hover": { textDecoration: "underline", color: "primary.main" },
                                            }}
                                            onClick={() => handleOrgClick(deal?.organizationId)}
                                        >
                                            {deal?.organizationName ?? "NA"}
                                        </Typography>
                                    </Box>

                                </Box>

                                {/* Org Name */}

                                {/* <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            ml: '30px',
            cursor: "pointer",
            mb: 2,
            "&:hover": { color: "primary.main", textDecoration: "underline" },
          }}
          onClick={() => handleOrgClick(deal?.orgid)}
        >
        <BusinessIcon color="primary" fontSize="small" />  {deal?.organizationName ?? "No Organization"}
        </Typography> */}

                                {/* Bottom Row: Chips + Status */}
                                <Box display="flex" justifyContent="space-between" alignItems="flex-end" mt="auto">
                                    <Box display="flex" gap={1} flexWrap="wrap">
                                        {deal?.pipelinename && (
                                            <Chip
                                                label={deal?.pipelinename}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        )}

                                    </Box>

                                    <Chip
                                        label="Pending"
                                        size="small"
                                        color="error"
                                        variant="filled"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

            )}
        </Box>
    );
};

export default Dashboard;
