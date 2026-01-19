import dayjs from 'dayjs';
import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import { CancelOutlined } from '@mui/icons-material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_FIRE, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, Select, MenuItem, InputLabel, FormControl, Button, Typography, Box, SelectChangeEvent, Paper, Divider, FormGroup, Link, IconButton, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import { TicketView } from '../Ticket/List';
import { DropdownList, DropdownOption, fetchOptions, isValidDate, NView } from '../Ticket/Ticket';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { VisuallyHiddenInput } from '../Organization/Organization';
import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import { IDealView } from './List';
import ContactModal from '../Ticket/ContactModal';
import OrganizationModal from '../Ticket/OrganizationModal';
import { green, red } from '@mui/material/colors';

export interface IDeal extends Pick<TicketView, 'pipeline' | 'id'> {
    name: string,
    dealtypeid: string,
    orgid: string,
    organizationName: string,
    contactName: string,
    contid: string,
    dealstatus: string,    
    productid: string,
    billingcode: string,
    paymenttermcode: string,
    visitperyear: number,
    remarks: string,
    startdate: string,
    enddate: string,
    userid: number,

    ticketlist: IDealItem[] | null,
    previousdealid: number,
}

export interface IDealItem {
    tempId: number,
    id: number,
    dealid: number,
    productid: number,
    pipeline: string,
    source: string,
    userid: number,
    organizationId: number,
    contactId: number,
    status: string,
    openDate: string,
    closeDate: string,
    remark: string,
}

export interface IErrorForm extends Omit<IDeal, 'id' | 'organizationName' | 'contactName' | 'userid' | "visitperyear"> { visitperyear: string }
export const InitialErr: IErrorForm = {
    name: "",
    pipeline: "",
    contid: "",
    dealtypeid: "",
    orgid: "",
    dealstatus: "",
    remarks: "",
    billingcode: "",
    paymenttermcode: "",
    visitperyear: "",
    previousdealid: 0,
    enddate: "",
    startdate: "",
    productid: "",
    ticketlist: null,

}
export type SType = "ORGANIZATION" | "CONTACT" | "TICKET";
// export const Stages: DropdownOption[] = [{ id: "IS", name: "Introduction sent" }, { id: "PD", name: "Presentation done" }, { id: "SR", name: "Services" }, { id: "SD", name: "Scope defined" }, { id: "DMB", name: "Decision maker brought in" }, { id: "FPS", name: "Final proposal sent" }, { id: "CW", name: "Closed Won" }, { id: "CL", name: "Closed Lost" }] as const;
export const FileTypes: DropdownOption[] = [{ id: "IN", name: "Invoice" }, { id: "PO", name: "Purchase Order" }] as const;
export interface IDealDropdown extends Pick<DropdownList, 'pipelines' | 'contacts' | 'organizations' | 'owners' | 'bilingFreqency' | 'paymentTerm'> {
    status: DropdownOption[],
    dealtypes: DropdownOption[],
    filetypes: DropdownOption[],
    items: DropdownOption[]
}

const DealPage: React.FC = () => {
    const { did } = useParams<{ did: string | undefined }>();
    const location = useLocation();
    const renew = location.state?.renew;
    const logedUser: number = localStorage.getItem("@Id") === null ? -1 : parseInt(localStorage.getItem("@Id") ?? "-1"); 
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<IDeal>({
        id: 0,
        pipeline: '-1',
        orgid: '0',
        contid: '0',
        startdate: dayjs().format("YYYY-MM-DDTHH:mm"),
        enddate: "",
        dealtypeid: "-1",
        dealstatus: "-1",
        remarks: "",
        userid: logedUser,
        ticketlist: [],
        name: "",
        organizationName: "",
        contactName: "",
        billingcode: "-1",
        paymenttermcode: "-1",
        visitperyear: 0,
        previousdealid: 0,
        productid: "-1",
    });
    const [itemData, setItemData] = useState<IDealItem[]>([]);
    const [warningList, setWarningList] = useState<IErrorForm>(InitialErr); 

    const navigate = useNavigate();
    const oriRef = useRef<HTMLDivElement | null>(null);
    const conRef = useRef<HTMLDivElement | null>(null);
    const [loader, setLoader] = useState<boolean>(false);
    const [searchOrigan, setSearchOrigan] = useState<boolean>(false);
    const [searchCont, setSearchCont] = useState<boolean>(false);
    const handleMsg = (obj: START_FIRE) => startFir(obj);
    const [contactModel, setContactModel] = useState<boolean>(false);
    const [organizationModel, setOrganizationModel] = useState<boolean>(false);
    const handleContactModel = (val: boolean) => setContactModel(val);
    const handleOrganizationModel = (val: boolean) => setOrganizationModel(val);

    const [productList, setProductList] = useState<NView[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
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
        paymentTerm: []
    });

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
                <Typography key={2}>{did ? "Update" : "Create"}</Typography>,
            ],
        });

        const fetchDropdownOptions = async () => {
            // Simulating API calls
            startLoader(true);
            setDropdownOptions({
                pipelines: await fetchOptions('pipelines'),
                organizations: [],
                contacts: [],
                // itemTypes: await fetchOptions('itemtypes'),
                items: [],
                owners: await fetchOptions('owners'), 
                status: await fetchOptions('statuses'),
                // stages: await fetchOptions('stages'),
                filetypes: dropdownOptions.filetypes,
                dealtypes: await fetchOptions("dealtypes"),
                bilingFreqency: await fetchOptions('bilingFreqency'),
                paymentTerm: await fetchOptions('paymentTerm')
            });
            startLoader(false)
            setTicketData((prev) => ({ ...prev, userid: logedUser }));
            if (did) {
                await getData(did);
            }
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
    }, [did]);  

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // setWarningList((prev) => ({ ...prev, [name]: value }));

        if (name === "visitperyear") {
            const visitperyear = Number(value);
            if (visitperyear > 15) {
                setWarningList((prev) => ({ ...prev, visitperyear: "Visit per year cannot exceed 15." }));
                return;
            }
            else {
                if (visitperyear === 0) {                    
                    setWarningList((prev) => ({ ...prev, visitperyear: "Visit per year is required and must be a greater than 0." }));
                }
                else setWarningList((prev) => ({ ...prev, visitperyear: "" }));
                let itemIndex = 1;
                const initialValue: IDealItem[] = Array.from({length: visitperyear}, 
                    () => ({ 
                        dealid: 0, 
                        id: 0,
                        productid: ticketData.productid !== "" ? parseInt(ticketData.productid) : 0,
                        pipeline: ticketData.pipeline,
                        source: "PM",
                        userid: logedUser,
                        tempId: itemIndex++,
                        organizationId: ticketData.orgid !== "" ? parseInt(ticketData.orgid) : 0,
                        contactId: ticketData.contid !== "" ? parseInt(ticketData.contid) : 0,
                        status: ticketData.dealstatus,
                        remark: "",
                        closeDate: dayjs().format("YYYY-MM-DD"),
                        openDate: dayjs().format("YYYY-MM-DD")
                    }));
                setItemData(visitperyear === 0 ? [] : initialValue);        
                setTicketData((prevData) => ({
                    ...prevData,
                    visitperyear: visitperyear
                }) );
            }
        }
        else {
            setTicketData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSelectChange = async (e: SelectChangeEvent<string>, field: string) => {
        const val: string = `${e.target.value}`;
        
        if (field === "pipeline") {
            setTicketData((ticketData) => ({ ...ticketData, itemId: '-1', itemType: val, pipeline: val }))
            if (val === "-1") {
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: [], tasks: [] }));
            }
            else {
                const items: DropdownOption[] = await fetchOptions("items", val);
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items }));
            }
        }
        else {
            setTicketData((prevData) => ({
                ...prevData,
                [field]: val,
            }));
        }
    };

    const handleSubmit = async (senderRoute?: string) => {
        // Handle the form submission
        const ticketList = itemData.map((item) => ({...item, productid: ticketData.productid, pipeline: ticketData.pipeline, organizationId: parseInt(ticketData.orgid), contactId: parseInt(ticketData.contid), status: item.status != "" ? item.status : "OPN", dealid: ticketData.id, userid: logedUser, source: item.source != "" ? item.source : "PM"}));

        startLoader(true)
        if (validateInput() === true && isValidDate(ticketData.startdate) && isValidDate(ticketData.enddate)) {
            let response: AxiosResponse<Response<IDealView[]>>;
            if (renew) {
                response = await myAxios.post(`/Deal/SaveDeal`, { ...ticketData, id: 0, ticketlist: ticketList });
            } else {
                response = await myAxios.post(`/Deal/SaveDeal`, { ...ticketData, ticketlist: ticketList });
            }
            const { status, data } = response.data;
            try {
                if (status === "Success") {
                    startFir({
                        msg: "Deal save successfully",
                        type: "S"
                    })
                    if (senderRoute) {
                        if (data && data.length > 0) {
                            // handleNavigate(senderRoute, data[0] as IDealView)
                            // setEditMode(true)
                        }
                    }
                    // else handleNavigate("/deals")
                } else {
                    startFir({
                        msg: "Unable to save deal",
                        type: "W"
                    })
                }
            } catch (_err: unknown) {
                if (_err instanceof AxiosError) {
                    console.log(_err.message);
                } else {
                    console.log("An unexpected error occurred");
                }
                startFir({
                    msg: "Something went wrong",
                    type: "E"
                })
            }
        }
        startLoader(false)
    };

    const validateInput = (): boolean => {
        const errList: IErrorForm = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.name || ticketData.name === '-1') {
            errList.name = "Name is required."
            isValid = false;
        }
        if (!ticketData.pipeline || ticketData.pipeline === '-1') {
            errList.pipeline = "Pipeline is required."
            isValid = false;
        }
        if (!ticketData.dealtypeid || ticketData.dealtypeid === '-1') {
            errList.dealtypeid = "Deal type is required."
            isValid = false;
        }
        if (!ticketData.dealstatus || ticketData.dealstatus === '-1') {
            errList.dealstatus = "Status is required."
            isValid = false;
        }
        if (!ticketData.billingcode || ticketData.billingcode === "") {
            errList.billingcode = "Billing Frequency is required."
            isValid = false;
        }
        if (!ticketData.paymenttermcode || ticketData.paymenttermcode === "-1") {
            errList.paymenttermcode = "Payment Term is required."
            isValid = false;
        }
        if (!ticketData.enddate || ticketData.enddate === "") {
            errList.enddate = "End Date is required."
            isValid = false;
        }
        if (!ticketData.startdate || ticketData.startdate === "") {
            errList.startdate = "Start Date is required."
            isValid = false;
        }
        if (!ticketData.productid || ticketData.productid === "-1") {
            errList.productid = "Product is required."
            isValid = false;
        }
        if (!ticketData.billingcode || ticketData.billingcode === "-1") {
            errList.billingcode = "Billing Frequency is required."
            isValid = false;
        }
        if (ticketData.visitperyear === 0) {
            errList.visitperyear = "Visit per year is required and must be a greater than 0."
            isValid = false;
        }
        else if (ticketData.visitperyear > 15) {
            errList.visitperyear = "Visit per year must be less than or equal to 15."
            isValid = false;
        }
        else {
            errList.visitperyear = ""
        }
        if (!isValid) {
            startFir({
                msg: "Please fill up all required field.",
                type: "W"
            })
        }
        setWarningList({ ...errList })
        return isValid;
    };

    const getData = async (did: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Deal/ShowDeals?id=${did}&showdealitem=true&fromdate=&todate=&pageno=0&recordperpage=0&showall=true`);
            if (req.status === 200) {
                const { data, status }: Response<IDeal[]> = req.data;
                if (status === "Success") {
                    const dealData = data && data.length > 0 ? data[0] : null;
                    if (dealData !== null) {
                        const items: DropdownOption[] = dealData['pipeline'] !== "" ? await fetchOptions("items", dealData['pipeline']) : [];
                        setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: [...items] }));
                        setTicketData({ ...dealData, startdate: dayjs(dealData['startdate']).format("YYYY-MM-DDTHH:mm"), enddate: dealData['enddate'] !== "" ? dayjs(dealData['enddate']).format("YYYY-MM-DDTHH:mm") : "" });
                        getTicketData(dealData.id);
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
    
    const getTicketData = async (did: number) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Ticket/ShowTicket?dealid=${did}&pageno=0&recordperpage=1&showall=true`);
            if (req.status === 200) {
                const { data, status }: Response<IDealItem[]> = req.data;
                if (status === "Success") {
                    const ticketData = data ?? [];
                    if (ticketData !== null) {
                        setItemData(ticketData);
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

    const handleNavigate = useCallback((arg0: string, state?: Record<any, any>): undefined => {
        navigate(arg0, { state: state ?? {} })
    }, []);

    function handleSerialInput(index: number, value: string, name: string): void {
        setItemData((prev) => {
            const newData = [...prev];
            
            newData[index] = { ...newData[index], [name]: value };
            return newData;
        });
    }

    const getSearch = async (val: string, type: SType) => {
        setLoader(true)
        try { //2024-12-20
            const req = await myAxios.get(`/Organization/CommanSearch?type=${type}&parameter=${val}`);
            if (req.status === 200) {
                const { data, status }: Response<DropdownOption[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        if (type === "CONTACT") {
                            setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, contacts: data }));
                        }
                        else if (type === "ORGANIZATION") setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, organizations: data }));
                    }
                }
                else { throw Error("Not found") }
            }
        } catch (_err: unknown) {
            if (_err instanceof AxiosError) {
                console.log(_err.message);
            } else {
                console.log("An unexpected error occurred");
            }
            if (type === "CONTACT") {
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, contacts: [] }));
            }
            else if (type === "ORGANIZATION") setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, organizations: [] }));
        }
        setLoader(false)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: SType) => {

        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: e.target.value }))
        }
        else {
            setTicketData((tData) => ({ ...tData, contactName: e.target.value }))
        }
        if (e.target.value.length > 2) {
            getSearch(e.target.value, type);
            if (type === "ORGANIZATION") {
                setSearchOrigan(true);
                setSearchCont(false);
            }
            else if (type === "CONTACT") {
                setSearchCont(true);
                setSearchOrigan(false);
            }
            else {
                setSearchCont(false);
                setSearchOrigan(false);
            }
        }
    };

    function changeData(id: string, val: string, type: SType): void {
        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: val, orgid: id }))
        }
        else {
            setTicketData((tData) => ({ ...tData, contactName: val, contid: id }))
        }
        setSearchCont(false)
        setSearchOrigan(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (event.target !== null) {
            if (oriRef.current && !oriRef.current.contains(event.target as Node)) {
                setSearchOrigan(false);
            }
            if (conRef.current && !conRef.current.contains(event.target as Node)) {
                setSearchCont(false);
            }
        }

    };

    const callManipulator = useCallback((data: DropdownOption, type: "contact" | "organization") => {
        if (type === "contact") {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.contacts] }));
            setTicketData((ticketData) => ({ ...ticketData, contid: data.id, contactName: data.name }))
        }
        else {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.organizations] }));
            setTicketData((ticketData) => ({ ...ticketData, orgid: data.id, organizationName: data.name }))
        }
    }, [dropdownOptions])


    const handleResetOri = (type: SType) => {
        if (type === "ORGANIZATION") {
            setTicketData((prev) => ({
                ...prev,
                orgid: "0",
                organizationName: ""
            }))
        }
        else if (type === "CONTACT") {
            setTicketData((prev) => ({
                ...prev,
                contid: "0",
                contactName: ""
            }))
        }
    }

    const handleFocus = (type: SType) => {
        if (type === "ORGANIZATION") {
            const Index = dropdownOptions.organizations.findIndex((v) => v.id == ticketData.orgid);
            setTicketData((prev) => ({
                ...prev,
                organizationName: (dropdownOptions.organizations.length == 0) ? ticketData.organizationName : (Index !== -1) ? dropdownOptions.organizations[Index].name : ""
            }));
            setSearchOrigan(false);
        }
        else if (type === "CONTACT") {
            const Index = dropdownOptions.contacts.findIndex((v) => v.id == ticketData.contid);
            setTicketData((prev) => ({
                ...prev,
                contactName: (dropdownOptions.contacts.length == 0) ? ticketData.contactName : (Index !== -1) ? dropdownOptions.contacts[Index].name : ""
            }));
            setSearchCont(false);
        }
    }

    // const replicateToAll = () => {
    //     setItemData((prev) =>
    //         prev.map((item) => ({
    //             ...item,
    //             waranty: item.waranty || replicateValue, // only update if empty
    //         }))
    //     );
    //     setReplicateIndex(null); // hide replicate message
    // };

    return (
        <Paper>
            <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                {ticketData.id ? (<>
                    <Typography variant='h5' align="left">Deal Id : <Typography display={"inline-block"} sx={{ px: 1, borderRadius: 1.5, fontSize: 23 }} color='white' bgcolor={"GrayText"}>{ticketData.id}</Typography></Typography>
                </>) : <Typography variant="h5" align="left" >Deal Form</Typography>}

                <Box display={"flex"} alignItems={"center"} >
                    <Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ width: "100%", textWrap: "nowrap" }}
                            onClick={() => handleNavigate("/deals")}
                        >
                            Deal List
                        </Button>
                    </Grid>
                </Box>
            </Box>
            <Divider />
            <Grid container>
                <Grid size={{ xs: 12, md: 12 }}>
                    <Grid container spacing={3} padding={2}>

                        {/* Name */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <TextField
                                label={<> Name  <span style={{ color: 'red' }} >*</span></>}
                                fullWidth
                                name="name"
                                onChange={handleInputChange}
                                size='small'
                                //required
                                value={ticketData.name}
                                error={warningList.name !== "" ? true : false}
                            />

                        </Grid>

                        {/* Pipeline Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel> {<> Pipeline <span style={{ color: 'red' }} >*</span></>} </InputLabel>
                                <Select
                                    value={ticketData.pipeline}
                                    onChange={(e) => handleSelectChange(e, 'pipeline')}
                                    label="Pipeline *"
                                    size='small'
                                    error={warningList.pipeline !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.pipelines.length === 0 ? "No Pipelines" : "Choose Pipeline"}
                                    </MenuItem>
                                    {dropdownOptions.pipelines.map((option) => (
                                        <MenuItem key={option.id} value={option.name}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        {/* DealType Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Deal Type {<><span style={{ color: 'red' }} >*</span></>}</InputLabel>
                                <Select
                                    value={ticketData.dealtypeid}
                                    onChange={(e) => handleSelectChange(e, 'dealtypeid')}
                                    label="Deal Type *"
                                    size='small'
                                    error={warningList.dealtypeid !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.dealtypes.length === 0 ? "No Types" : "Choose Type"}
                                    </MenuItem>
                                    {dropdownOptions.dealtypes.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        {/* Status Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Status {<><span style={{ color: 'red' }} >*</span></>}</InputLabel>
                                <Select
                                    value={ticketData.dealstatus}
                                    onChange={(e) => handleSelectChange(e, 'dealstatus')}
                                    label="Status *"
                                    size='small'
                                    error={warningList.dealstatus !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.status.length === 0 ? "No Status" : "Choose Status"}
                                    </MenuItem>
                                    {dropdownOptions?.status.map((option) => (
                                        <MenuItem key={option.statuscode} value={option.statuscode}>
                                            {option.statusname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* {warningList.status && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.status}
                                </Typography>
                            )} */}
                        </Grid>

                        {/* Organization Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative", width: '48%' }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                {/* Organization Input */}
                                <TextField
                                    label="Organization"
                                    value={ticketData.organizationName ?? ""}
                                    onChange={(e) => handleSearch(e, "ORGANIZATION")}
                                    placeholder="Search Organization..."
                                    size="small"
                                    name="searhbar"
                                    type="text"
                                    fullWidth
                                    onFocus={() => setSearchOrigan(true)}
                                    sx={{ flex: 1 }}
                                    slotProps={{
                                        input: {
                                            name: `${"oiuy" + Math.random()}`
                                        },
                                    }}
                                />

                                {/* Buttons */}
                                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                                    <Tooltip title="New Organization">
                                        <IconButton sx={{ color: green[600] }} onClick={() => handleOrganizationModel(true)} size="small" tabIndex={-1}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reset Organization">
                                        <IconButton sx={{ color: red[600] }} onClick={() => handleResetOri("ORGANIZATION")} size="small" tabIndex={-1}>
                                            <CancelOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>

                            {/* Dropdown */}
                            <Paper
                                ref={oriRef}
                                tabIndex={-1}
                                onMouseEnter={() => setSearchOrigan(true)}
                                sx={{
                                    position: "absolute",
                                    right: 0,
                                    top: 40,
                                    zIndex: 111,
                                    width: "100%",
                                    borderRadius: 1,
                                    display: searchOrigan ? "block" : "none",
                                    maxHeight: 200,
                                    overflow: "auto"
                                }}
                            >
                                {/* <Divider /> */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" fontSize={15} p={1} px={2}>
                                        List of Organization
                                    </Typography>
                                    <IconButton tabIndex={-1} onClick={() => setSearchCont(false)}>
                                        <CancelOutlined />
                                    </IconButton>
                                </Box>
                                <Divider />

                                {dropdownOptions.organizations.map((v) => (
                                    <MenuItem key={v.id} onClick={() => changeData(`${v.id}`, v.name, "ORGANIZATION")}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                            <Typography>{v.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}

                                {dropdownOptions.organizations.length === 0 && loader && (
                                    <MenuItem sx={{ display: "flex", justifyContent: "center" }}>
                                        <CircularProgress />
                                    </MenuItem>
                                )}

                                {dropdownOptions.organizations.length === 0 && !loader && (
                                    <MenuItem>
                                        <Typography width="100%">No organization found</Typography>
                                    </MenuItem>
                                )}
                            </Paper>
                        </Grid>

                        {/* Contact Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative", width: '48%' }} >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                {/* Input takes full width minus button space */}
                                <TextField
                                    label="Contact"
                                    value={ticketData.contactName ?? ""}
                                    onChange={(e) => handleSearch(e, "CONTACT")}
                                    placeholder="Search Organization..."
                                    size="small"
                                    name="searhbar"
                                    type="text"
                                    fullWidth
                                    onFocus={() => {
                                        setSearchCont(true);
                                        handleFocus("ORGANIZATION");
                                    }}
                                    sx={{ flex: 1 }}
                                    slotProps={{
                                        input: {
                                            name: `${"oidf" + Math.random()}`,
                                        },
                                    }}
                                />

                                {/* Buttons */}
                                <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                                    <Tooltip title="New Contact">
                                        <IconButton sx={{ color: green[600] }} onClick={() => handleContactModel(true)} size="small" tabIndex={-1}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Reset Contact">
                                        <IconButton sx={{ color: red[600] }} onClick={() => handleResetOri("CONTACT")} size="small" tabIndex={-1}>
                                            <CancelOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>

                            {/* Dropdown (unchanged) */}
                            <Paper
                                ref={conRef}
                                tabIndex={-1}
                                onMouseEnter={() => setSearchCont(true)}
                                sx={{
                                    position: "absolute",
                                    right: 0,
                                    top: 40,
                                    zIndex: 111,
                                    width: "100%",
                                    borderRadius: 1,
                                    display: searchCont ? "block" : "none",
                                    maxHeight: 200,
                                    overflow: "auto",
                                }}
                            >
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" fontSize={15} p={1} px={2}>
                                        List of Contact
                                    </Typography>
                                    <IconButton tabIndex={-1} onClick={() => setSearchCont(false)}>
                                        <CancelOutlined />
                                    </IconButton>
                                </Box>
                                {/* <MenuItem sx={{ color: green[600] }} value={-2} onClick={() => handleContactModel(true)}>
                                    New Contact
                                </MenuItem>
                                <MenuItem sx={{ color: red[600] }} value={-2} onClick={() => handleResetOri("CONTACT")}>
                                    Reset Contact
                                </MenuItem> */}
                                <Divider />
                                {dropdownOptions.contacts.map((v) => (
                                    <MenuItem key={v.id} onClick={() => changeData(`${v.id}`, v.name, "CONTACT")}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                            <Typography>{v.name}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                                {dropdownOptions.contacts.length === 0 && loader && (
                                    <MenuItem sx={{ display: "flex", justifyContent: "center" }}>
                                        <CircularProgress />
                                    </MenuItem>
                                )}
                                {dropdownOptions.contacts.length === 0 && !loader && (
                                    <MenuItem>
                                        <Typography width="100%">No contact found</Typography>
                                    </MenuItem>
                                )}
                            </Paper>
                        </Grid>

                        {/* Opening Date */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <TextField
                                // disabled
                                label="Start Date"
                                type="datetime-local"
                                size='small'
                                fullWidth
                                required
                                onFocus={() => handleFocus('CONTACT')}
                                value={ticketData.startdate}
                                onChange={handleInputChange}
                                name="startdate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                error={warningList.startdate !== "" ? true : false}
                            />
                        </Grid>

                        {/* Closing Date */}
                        {<Grid size={{ xs: 12, sm: 6 }} sx={{ visibility: "visible" }} >
                            <TextField
                                label="End Date"
                                placeholder='End Date'
                                size='small'
                                fullWidth
                                required
                                type='datetime-local'
                                value={ticketData.enddate}
                                onChange={handleInputChange}
                                name="enddate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    "& .MuiFormLabel-root.Mui-disabled": {
                                        color: "black",
                                    },
                                }}
                                error={warningList.enddate !== "" ? true : false}
                            />
                        </Grid>}

                        {/* Item Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Product {<><span style={{ color: 'red' }} >*</span></>}</InputLabel>
                                <Select
                                    value={ticketData.productid}
                                    onChange={(e) => handleSelectChange(e as SelectChangeEvent<string>, 'productId')}
                                    label="Product"
                                    size='small'
                                    required
                                    error={warningList.productid !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {(parseInt(ticketData.pipeline) === -1 ? "Choose Pipeline First" : (dropdownOptions.items.length === 0 ? "No Product" : "Choose Product"))}
                                    </MenuItem>
                                    {dropdownOptions.items.map((option) => (
                                        <MenuItem sx={{ justifyContent: "space-between" }} key={option.id} value={`${option.id}`}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Billing Frequency */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Billing Frequency {<> <span style={{ color: 'red' }} >*</span> </>} </InputLabel>
                                <Select
                                    value={ticketData.billingcode}
                                    onChange={(e) => handleSelectChange(e, 'billingcode')}
                                    label="Billing Frequency *"
                                    size='small'
                                    error={warningList.billingcode !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.bilingFreqency.length === 0 ? "No Billing Frequency" : "Choose Billing Frequency"}
                                    </MenuItem>
                                    {dropdownOptions.bilingFreqency.map((option) => (
                                        <MenuItem key={option.code} value={`${option.code}`}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                        </Grid>

                        {/* Payment Term */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Payment Term {<> <span style={{ color: 'red' }} >*</span> </>} </InputLabel>
                                <Select
                                    value={ticketData.paymenttermcode}
                                    onChange={(e) => handleSelectChange(e, 'paymenttermcode')}
                                    label="Payment Term *"
                                    size='small'
                                    error={warningList.paymenttermcode !== "" ? true : false}
                                >
                                    <MenuItem value={"-1"}>
                                        {dropdownOptions?.paymentTerm.length === 0 ? "No Payment Term" : "Choose Payment Term"}
                                    </MenuItem>
                                    {dropdownOptions?.paymentTerm.map((option) => (
                                        <MenuItem key={option.paymenttermcode} value={`${option.paymenttermcode}`}>
                                            {option.paymenttermname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={<> Visit per year  <span style={{ color: 'red' }} >*</span></>}
                                fullWidth
                                name="visitperyear"
                                onChange={handleInputChange}
                                size='small'
                                onFocus={() => { setSearchCont(false); setSearchOrigan(false) }}
                                value={ticketData.visitperyear}
                                error={warningList.visitperyear !== "" ? true : false}
                                helperText={ warningList.visitperyear !== "" ? "Visit per year is required & its max value is 15" : ""}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12 }}>
                            <TextField
                                label={<> Remarks</>}
                                fullWidth
                                name="remarks"
                                onChange={handleInputChange}
                                size='small'
                                onFocus={() => { setSearchCont(false); setSearchOrigan(false) }}
                                value={ticketData.remarks}
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {itemData && itemData.length > 0 && (
                            <Grid size={{ xs: 12, sm: 12 }}>     
                            <Typography variant="h6" align="left" >
                                Ticket List
                            </Typography>
                            <Box sx={{ overflow: "auto", maxHeight: 390 }}>
                                <FormGroup sx={{  gap: 1, flexDirection: "column", minWidth: "100%" }}>
                                    {itemData.map((v, i) => (
                                        <React.Fragment key={v.tempId}>
                                            <Box sx={{ justifyContent: "space-between", pt: 1, px: 0.5, alignItems: "center" }}>
                                                <Grid container gap={1} >
                                                    <Grid size={5.8} >
                                                        <TextField
                                                            label="Open Date"
                                                            type="date"
                                                            size="small"
                                                            fullWidth
                                                            required
                                                            value={v.openDate || ""}
                                                            onChange={(e) => handleSerialInput(i, e.target.value, "openDate")}
                                                            name="openDate"
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            inputProps={{
                                                                min: "2000-01-01",
                                                            }}
                                                            placeholder="YYYY-MM-DD"
                                                            error={!v.openDate}
                                                            helperText={
                                                                !v.openDate
                                                                    ? "Open date is required": ""
                                                            }
                                                        />
                                                    </Grid>
                                                    
                                                    <Grid size={5.8} >
                                                        <TextField
                                                            label="Close Date"
                                                            type="date"
                                                            size="small"
                                                            fullWidth
                                                            required
                                                            value={v.closeDate || ""}
                                                            onChange={(e) => handleSerialInput(i, e.target.value, "closeDate")}
                                                            name="closeDate"
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            inputProps={{
                                                                min: "2000-01-01",
                                                            }}
                                                            placeholder="YYYY-MM-DD"
                                                            error={!v.closeDate}
                                                            helperText={
                                                                !v.closeDate
                                                                    ? "Close date is required" : ""
                                                            }
                                                        />

                                                    </Grid>
                                                </Grid>

                                            </Box>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </FormGroup>
                            </Box>
                        </Grid>)}
                        <Divider />


                        {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", gap: 2, alignItems: "center" }} >
                            <Box sx={{ p: 0, m: 0 }}>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="contained"
                                    tabIndex={-1}
                                    startIcon={<CloudUploadIcon />}
                                    fullWidth
                                >
                                    {"Upload"} File
                                    <VisuallyHiddenInput
                                        type="file"
                                        onChange={handleFile}
                                        accept='application/pdf, image/*'
                                    />
                                </Button>
                            </Box>
                            <Typography variant='overline' fontSize={13} >{ticketData.file !== "" && "File selected..."}</Typography>
                            <Typography variant='overline' color='error' sx={{ cursor: "pointer", fontSize: 13, fontWeight: "700" }} onClick={handleReset} >{ticketData.file !== "" && "Reset File"}</Typography>
                        </Grid> */}


                        {/* Submit Button */}
                        <Grid size={12} sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                            <Box display="flex" justifyContent="center">
                                <Button variant="contained" color="primary" onClick={() => handleSubmit()}>
                                    {did ? 'Update' : 'Create'} Deal
                                </Button>
                            </Box>
                            <Box display="flex" justifyContent="center">
                                <Button variant="contained" color="info" onClick={() => handleSubmit("/ticket/form")}>
                                    {did ? 'Update' : 'Create'} Deal & Go to Ticket
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>
                </Grid> 
            </Grid>


            <Dialog
                open={editMode}
                onClose={() => { setEditMode(false); handleNavigate("/deals") }}
            >
                <DialogTitle>Select a product</DialogTitle>
                <Divider />
                <DialogContent sx={{ p: 0, m: 0 }}>
                    <Box sx={{ height: 400, maxHeight: 400, minWidth: 400 }}>
                        <Box sx={{ overflow: "auto", maxHeight: 390 }}>
                            <FormGroup sx={{ flexDirection: "column", minWidth: "100%" }}>
                                {productList.map((v) => (
                                    <MenuItem key={v.pId} onClick={() => handleNavigate("/ticket/form", v)}>
                                        <Box sx={{ pt: 1 }}>
                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                <LabelIcon color='success' />
                                                <Typography variant='overline'> {v.dealName}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant='overline'>Serial No : {v.serialno}</Typography>
                                            </Box>
                                        </Box>
                                        <Divider />
                                    </MenuItem>
                                ))}
                            </FormGroup>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>


            <ContactModal open={contactModel} organizationList={dropdownOptions.organizations} handleModel={handleContactModel} startFir={handleMsg} callBack={callManipulator} />
            <OrganizationModal open={organizationModel} handleModel={handleOrganizationModel} startFir={handleMsg} callBack={callManipulator} />
        </Paper>
    );
};

export default DealPage;
