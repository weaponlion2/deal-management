import dayjs from 'dayjs';
import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import { CancelOutlined, Check } from '@mui/icons-material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_FIRE, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, Select, MenuItem, InputLabel, FormControl, Button, Typography, Box, SelectChangeEvent, Paper, Divider, FormGroup, Link, ListItemIcon, IconButton, Tooltip, CircularProgress, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import { TicketView } from '../Ticket/List';
import { DropdownList, DropdownOption, fetchOptions, isValidDate, NView, Priorites } from '../Ticket/Ticket';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { VisuallyHiddenInput } from '../Organization/Organization';
import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
    priority: string,
    stage: string,
    amount: string,
    closedate: string,
    opendate: string,
    userid: string,
    itemType: string,
    ditems: IDealItem[] | null,
    itemId: string,
    refId: number,
    type: string,
    file: string,
    billingcode: string,
    paymenttermcode: string,
    visitperyear: number,
    previousdealid: number,
}

export interface IDealItem {
    dealid: number,
    itemId: string,
    waranty: string,
    serialno: string,
    dateofsale: string,
    adid: number,
    name: string,
    billingFrequency: string,
    validity: string
}
export interface IErrorForm extends Omit<IDeal, 'closedate' | 'opendate' | 'ditems' | 'id' | 'file' | 'refId' | 'organizationName' | 'contactName'> { }
export const InitialErr: IErrorForm = {
    amount: "",
    name: "",
    pipeline: "",
    contid: "",
    dealtypeid: "",
    itemType: "",
    orgid: "",
    priority: "",
    userid: "",
    itemId: "",
    stage: "",
    type: "",
    billingcode: "",
    paymenttermcode: "",
    visitperyear: 0,
    previousdealid: 0,
}
export type SType = "ORGANIZATION" | "CONTACT" | "TICKET";
// export const Stages: DropdownOption[] = [{ id: "IS", name: "Introduction sent" }, { id: "PD", name: "Presentation done" }, { id: "SR", name: "Services" }, { id: "SD", name: "Scope defined" }, { id: "DMB", name: "Decision maker brought in" }, { id: "FPS", name: "Final proposal sent" }, { id: "CW", name: "Closed Won" }, { id: "CL", name: "Closed Lost" }] as const;
export const FileTypes: DropdownOption[] = [{ id: "IN", name: "Invoice" }, { id: "PO", name: "Purchase Order" }] as const;
export interface IDealDropdown extends Pick<DropdownList, 'pipelines' | 'priorities' | 'contacts' | 'itemTypes' | 'organizations' | 'owners' | 'stages' | 'bilingFreqency' | 'paymentTerm'> {
    // stages: DropdownOption[],
    dealtypes: DropdownOption[],
    filetypes: DropdownOption[],
    items: DropdownOption[]
}

const DealPage: React.FC = () => {
    const { did } = useParams<{ did: string | undefined }>();
    const location = useLocation();
    const renew = location.state?.renew;
    const logedUser: string | null = localStorage.getItem("@Id");
    const [itemSet, setItemSet] = useState<Set<string>>(new Set());
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<IDeal>({
        id: 0,
        pipeline: '-1',
        orgid: '0',
        contid: '0',
        itemType: '-1',
        priority: 'MEDIUM',
        opendate: dayjs().format("YYYY-MM-DDTHH:mm"),
        closedate: "",
        dealtypeid: "-1",
        stage: "IS",
        amount: "",
        userid: "-1",
        ditems: [],
        name: "",
        itemId: "-1",
        type: "0",
        file: "",
        refId: 0,
        organizationName: "",
        contactName: "",
        billingcode: "",
        paymenttermcode: "",
        visitperyear: 0,
        previousdealid: 0,
    });
    const [itemData, setItemData] = useState<IDealItem[]>([]);
    const [warningList, setWarningList] = useState<IErrorForm>(InitialErr);
    const [replicateIndex, setReplicateIndex] = useState<number | null>(null);
    const [replicateValue, setReplicateValue] = useState<string>("");

    const [productList, setProductList] = useState<NView[]>([]);
    const [editMode, setEditMode] = useState<boolean>(false);
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
        paymentTerm: []
    })

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
                itemTypes: await fetchOptions('itemtypes'),
                items: [],
                owners: await fetchOptions('owners'),
                priorities: dropdownOptions.priorities,
                stages: await fetchOptions('stages'),
                filetypes: dropdownOptions.filetypes,
                dealtypes: await fetchOptions("dealtypes"),
                bilingFreqency: await fetchOptions('bilingFreqency'),
                paymentTerm: await fetchOptions('paymentTerm')
            });
            startLoader(false)
            setTicketData((prev) => ({ ...prev, userid: logedUser ?? "-1" }))
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: name === "visitperyear" ? Number(value) : value,
        }));
    };

    // console.log("VISIT ", ticketData)

    const handleSelectChange = async (e: SelectChangeEvent<string>, field: string) => {
        const val: string = `${e.target.value}`;
        console.log("VAlues", val)
        if (field === "itemType") {
            setItemData([])
            setItemSet(new Set())
            setTicketData((ticketData) => ({ ...ticketData, itemId: '-1', itemType: val, task: "-1" }))
            if (val === "-1") {
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: [], tasks: [] }));
            }
            else {
                const items: DropdownOption[] = await fetchOptions("items", val);
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items }));
            }
        }
        else if (field === "itemId") {
            const vl = val.split("+");
            if (vl[0] === "-1") return;

            setItemData((data) => {
                const tasks: IDealItem[] = [];
                let available: boolean = false;
                for (let i = 0; i < data.length; i++) {
                    if (`${data[i].itemId}` === vl[0]) {
                        available = true;
                    } else tasks.push(data[i]);
                }
                if (!available) {
                    tasks.push({
                        adid: 0,
                        dateofsale: dayjs().format("YYYY-MM-DD"),
                        dealid: ticketData.id,
                        itemId: vl[0],
                        serialno: '',
                        name: vl[1],
                        validity: dayjs().format("YYYY-MM-DD"),
                        waranty: '',
                        billingFrequency: vl[2]
                    })
                }
                return tasks;
            })

            setItemSet((prevSet) => {
                const newSet = new Set(prevSet);
                if (prevSet.has(vl[0])) {
                    newSet.delete(vl[0]);
                } else {
                    newSet.add(vl[0]);
                }
                return newSet;
            })
        }
        else {
            setTicketData((prevData) => ({
                ...prevData,
                [field]: val,
            }));

            if (field === "pipeline") {
                setTicketData((prevData) => ({
                    ...prevData,
                    itemType: "-1",
                    itemId: "-1",
                }));

                // Use val directly since it's the pipeline ID
                const itemTypes: DropdownOption[] = await fetchOptions("itemtypes", `?pipelineid=${val}`);
                setDropdownOptions((prevOptions) => ({
                    ...prevOptions,
                    itemTypes: itemTypes,
                    items: [],
                    tasks: [],
                }));
            }
        }
    };

    function removeTask(taskMasterId: string): void {
        setItemData((itemData) => itemData.filter((item) => item.itemId !== taskMasterId));
        setItemSet((prevSet) => {
            const newSet = new Set(prevSet);
            if (prevSet.has(`${taskMasterId}`)) {
                newSet.delete(`${taskMasterId}`);
            } else {
                newSet.add(`${taskMasterId}`);
            }
            return newSet;
        })
    };

    const handleSubmit = async (senderRoute?: string) => {
        // Handle the form submission
        startLoader(true)
        const isValid = itemData.every(item => item.waranty);
        //  console.log(isValid)
        if (!isValid) {
            startFir({
                msg: "Warranty Date required",
                type: 'E'
            })
            startLoader(false);
            return;
        }
        //console.log(itemData) 
        const itemModel = itemData.map((v) => ({ ...v, dealid: 0, adid: 0, waranty: v?.waranty ? dayjs(v?.waranty).format("YYYY-MM-DD") : "", }));
        if (validateInput() === true) {
            let response: AxiosResponse<Response<IDealView[]>>;
            if (renew) {
                response = await myAxios.post(`/Deal/SaveDeal`, { ...ticketData, id: 0, previousdealid: did, opendate: isValidDate(ticketData.opendate) === true ? ticketData.opendate : "", closeDate: isValidDate(ticketData.closedate) === true ? ticketData.closedate : "", ditems: itemModel });
            } else {
                response = await myAxios.post(`/Deal/SaveDeal`, { ...ticketData, opendate: isValidDate(ticketData.opendate) === true ? ticketData.opendate : "", closeDate: isValidDate(ticketData.closedate) === true ? ticketData.closedate : "", ditems: itemModel });
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
                            setProductList(() => {
                                const list: NView[] = [];
                                itemData.map((e) => {
                                    list.push({
                                        amount: "",
                                        contactId: Number(ticketData.contid),
                                        contactName: ticketData.contactName,
                                        dealId: data[0]['id'],
                                        dealItemId: 0,
                                        dealName: e.name,
                                        itemType: ticketData.itemType,
                                        organizationName: ticketData.organizationName,
                                        organizationId: Number(ticketData.orgid),
                                        phone: "",
                                        pId: e.itemId,
                                        pipeline: ticketData.pipeline,
                                        priority: "",
                                        serialno: e.serialno,
                                        vindustry: "",
                                        userid: `${ticketData.userid}`
                                    })
                                })
                                return list;
                            })
                            setEditMode(true)
                        }
                    }
                    else handleNavigate("/deals")
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
        if (!ticketData.stage || ticketData.stage === '-1') {
            errList.stage = "Organization is required."
            isValid = false;
        }
        if (!ticketData.itemType || ticketData.itemType === '-1') {
            errList.itemType = "Item Type is required."
            isValid = false;
        }
        if (itemData.length < 1) {
            errList.itemId = "Please select atleast one item."
            isValid = false;
        }
        if (!ticketData.priority || ticketData.priority === '-1') {
            errList.priority = "Priority is required."
            isValid = false;
        }
        if (!ticketData.userid || ticketData.userid === '-1') {
            errList.userid = "Owner is required."
            isValid = false;
        }
        if (!ticketData.amount) {
            errList.amount = "Amount is required."
            isValid = false;
        }
        if (!ticketData.billingcode || ticketData.billingcode === "") {
            errList.billingcode = "Billing Frequency is required."
            isValid = false;
        }
        if (!ticketData.paymenttermcode || ticketData.paymenttermcode === "") {
            errList.paymenttermcode = "Payment Term is required."
            isValid = false;
        }
        // if (ticketData.file && ticketData.file != "") {
        //     if (!ticketData.type || ticketData.type === '0') {
        //         errList.type = "File Type is required."
        //         isValid = false;
        //     }
        // }
        // if (ticketData.billingcode && ticketData.billingcode != "") {
        //         errList.type = "Billing Frequency is required."
        //         isValid = false;
        // }
        if (!isValid) {
            startFir({
                msg: "Please fill up all required field.",
                type: "W"
            })
        }
        setWarningList({ ...errList })
        return isValid;
    };

    //console.log(warningList)

    const getData = async (did: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Deal/ShowDeals?id=${did}&showdealitem=true&fromdate=&todate=&pageno=0&recordperpage=0&showall=true`);
            if (req.status === 200) {
                const { data, status }: Response<IDeal[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        const items: DropdownOption[] = data[0]['itemType'] !== "" ? await fetchOptions("items", data[0]['itemType']) : [];
                        setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: [...items] }));
                        setTicketData({ ...data[0], opendate: dayjs(data[0]['opendate']).format("YYYY-MM-DDTHH:mm"), itemType: `${data[0]['itemType'] === "" ? "-1" : data[0]['itemType']}`, itemId: "-1", closedate: data[0]['closedate'] !== "" ? dayjs(data[0]['closedate']).format("YYYY-MM-DDTHH:mm") : "", type: "0", file: "" })

                        // setTicketData((tData) => ({ ...tData, contactName: val, contid: id }))
                        // setTicketData((tData) => ({ ...tData, organizationName: val, orgid: id }))
                        if (data[0]['ditems']) {
                            setItemData(data[0]['ditems']);
                            setItemSet(new Set<string>(data[0]['ditems'].map((v) => `${v.itemId}`)))
                        }
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

    const navigate = useNavigate();
    const handleNavigate = useCallback((arg0: string, state?: Record<any, any>): undefined => {
        navigate(arg0, { state: state ?? {} })
    }, []);

    function handleSerialInput(index: number, value: string, name: string): void {
        setItemData((prev) => {
            const newData = [...prev];

            if (name === "waranty") {
                newData[index] = {
                    ...newData[index],
                    waranty: value,
                };

                // Set this value to show replicate message
                setReplicateIndex(index);
                setReplicateValue(dayjs(value).format("YYYY-MM-DD"));
            } else {
                newData[index] = { ...newData[index], [name]: value };
            }

            return newData;
        });
    }


    // function handleSerialInput(index: number, value: string, name: string): void {
    //     setItemData((itemData) => {
    //         const newData = itemData;
    //         if (name === "dateofValidity") {
    //             newData[index] = {
    //                 ...newData[index],
    //                 waranty: dayjs(value).format("YYYY-MM-DD"),
    //             };
    //         }
    //         else {
    //             newData[index] = { ...newData[index], [name]: value };
    //         }
    //         return [...newData];
    //     })
    // };

    // const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const files: FileList | null = (e.target as HTMLInputElement).files;
    //     const file = files && files.length > 0 ? files[0] : null

    //     if (file) {
    //         const reader = new FileReader();
    //         reader.onloadend = () => {
    //             const base64Result = reader.result as string;
    //             setTicketData((prevData) => ({
    //                 ...prevData,
    //                 file: base64Result.split(",")[1],
    //                 refId: Number(ticketData.orgid),
    //             }));
    //         };
    //         reader.readAsDataURL(file);
    //     }
    // };

    // const handleReset = () => {
    //     setTicketData((prevData) => ({
    //         ...prevData,
    //         file: "",
    //         refId: 0,
    //     }));
    // }

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

    const [loader, setLoader] = useState<boolean>(false);
    const [searchOrigan, setSearchOrigan] = useState<boolean>(false);
    const [searchCont, setSearchCont] = useState<boolean>(false);

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
    const oriRef = useRef<HTMLDivElement | null>(null);
    const conRef = useRef<HTMLDivElement | null>(null);

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

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMsg = (obj: START_FIRE) => startFir(obj);
    const [contactModel, setContactModel] = useState<boolean>(false);
    const [organizationModel, setOrganizationModel] = useState<boolean>(false);
    const handleContactModel = (val: boolean) => setContactModel(val);
    const handleOrganizationModel = (val: boolean) => setOrganizationModel(val);

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
            const Index = dropdownOptions.organizations.findIndex((v) => v.id == ticketData.orgid)
            setTicketData((prev) => ({
                ...prev,
                organizationName: (dropdownOptions.organizations.length == 0) ? ticketData.organizationName : (Index !== -1) ? dropdownOptions.organizations[Index].name : ""
            }))
            setSearchOrigan(false)
        }
        else if (type === "CONTACT") {
            const Index = dropdownOptions.contacts.findIndex((v) => v.id == ticketData.contid)
            setTicketData((prev) => ({
                ...prev,
                contactName: (dropdownOptions.contacts.length == 0) ? ticketData.contactName : (Index !== -1) ? dropdownOptions.contacts[Index].name : ""
            }))
            setSearchCont(false)
        }
    }

    const replicateToAll = () => {
        setItemData((prev) =>
            prev.map((item) => ({
                ...item,
                waranty: item.waranty || replicateValue, // only update if empty
            }))
        );
        setReplicateIndex(null); // hide replicate message
    };


    console.log("Biling",)

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
                <Grid size={{ xs: 12, md: 8 }}>
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
                        {/* Owner Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Owner {<> <span style={{ color: 'red' }} >*</span> </>} </InputLabel>
                                <Select
                                    value={ticketData.userid}
                                    onChange={(e) => handleSelectChange(e, 'userid')}
                                    label="Owner *"
                                    size='small'
                                    error={warningList.userid !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.owners.length === 0 ? "No Owners" : "Choose Owner"}
                                    </MenuItem>
                                    {dropdownOptions.owners.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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
                                        <MenuItem key={option.id} value={option.id}>
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



                        {/* Stage Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Stage</InputLabel>
                                <Select
                                    value={ticketData.stage}
                                    onChange={(e) => handleSelectChange(e, 'stage')}
                                    label="Stage"
                                    size='small'
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.stages.length === 0 ? "No Statuses" : "Choose Status"}
                                    </MenuItem>
                                    {dropdownOptions.stages.map((option) => (
                                        <MenuItem key={option.id} value={option.stagecode}>
                                            {option.stagename}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {warningList.stage && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.stage}
                                </Typography>
                            )}
                        </Grid>

                        {/* Priority Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={ticketData.priority}
                                    onChange={(e) => handleSelectChange(e, 'priority')}
                                    label="Priority"
                                    size='small'
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.priorities.length === 0 ? "No Priorites" : "Choose Priority"}
                                    </MenuItem>
                                    {dropdownOptions.priorities.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {warningList.priority && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.priority}
                                </Typography>
                            )}
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
                                {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="caption" fontSize={15} p={1} px={2}>
                                        List of Organization
                                    </Typography>
                                    <IconButton tabIndex={-1} onClick={() => setSearchOrigan(false)}>
                                        <CancelOutlined />
                                    </IconButton>
                                </Box> */}

                                {/* <Divider /> */}

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


                        {/* Amount  */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label={<> Amount  <span style={{ color: 'red' }} >*</span></>}
                                fullWidth
                                name="amount"
                                onChange={handleInputChange}
                                size='small'
                                onFocus={() => { setSearchCont(false); setSearchOrigan(false) }}
                                value={ticketData.amount}
                                error={warningList.amount !== "" ? true : false}
                            />
                        </Grid>

                        {/* Opening Date */}
                        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "none" }} >
                            <TextField
                                disabled
                                label="Opening Date"
                                type="datetime-local"
                                size='small'
                                fullWidth
                                value={ticketData.opendate}
                                onChange={handleInputChange}
                                name="opendate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        {/* Closing Date */}
                        {did && <Grid size={{ xs: 12, sm: 6 }} sx={{ visibility: did ? "visible" : "hidden" }} >
                            <TextField
                                label="Closing Date"
                                placeholder='Closing Date'
                                size='small'
                                fullWidth
                                type='datetime-local'
                                value={ticketData.closedate}
                                onChange={handleInputChange}
                                name="closedate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    "& .MuiFormLabel-root.Mui-disabled": {
                                        color: "black",
                                    },
                                }}
                            />
                        </Grid>}

                        {/* Item Type Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Item Type {<> <span style={{ color: 'red' }} >*</span> </>} </InputLabel>
                                <Select
                                    value={ticketData.itemType}
                                    onChange={(e) => handleSelectChange(e, 'itemType')}
                                    label="Item Type *"
                                    size='small'
                                    error={warningList.itemType !== "" ? true : false}
                                >
                                    <MenuItem value={"-1"}>
                                        {dropdownOptions.itemTypes.length === 0 ? "No Item Types" : "Choose Item Type"}
                                    </MenuItem>
                                    {dropdownOptions.itemTypes.map((option) => (
                                        <MenuItem key={option.id} value={`${option.itemtypename}`}>
                                            {option.itemtypename}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        {/* Item Dropdown */}
                        <Grid size={{ xs: 12, sm: 6 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Product</InputLabel>
                                <Select
                                    value={ticketData.itemId}
                                    onChange={(e) => handleSelectChange(e as SelectChangeEvent<string>, 'itemId')}
                                    label="Product"
                                    size='small'
                                    error={(ticketData.itemType !== "-1" && itemData.length === 0) ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {((typeof ticketData.itemType === "number" && ticketData.itemType === -1) || ticketData.itemType === "-1") ? "Choose Product" : (dropdownOptions.itemTypes.length === 0 ? "No Product" : "Choose Product")}
                                    </MenuItem>
                                    {dropdownOptions.items.map((option) => (
                                        <MenuItem sx={{ justifyContent: "space-between" }} key={option.id} value={`${option.id}+${option.name}+${option.billingFrequency}`}>
                                            {option.name}
                                            {
                                                itemSet.has(`${option.id}`) && (
                                                    <ListItemIcon>
                                                        <Check />
                                                    </ListItemIcon>
                                                )
                                            }
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl size='small' fullWidth>
                                <InputLabel>File Type {ticketData.file !== "" && <span style={{ color: 'red' }}> *</span>}</InputLabel>
                                <Select
                                    value={ticketData.type}
                                    onChange={(e) => handleSelectChange(e, 'type')}
                                    label={<>File Type {ticketData.file !== "" && <> *</>} </>}
                                    size='small'
                                    error={warningList.type !== "" ? true : false}
                                >
                                    <MenuItem selected value={"0"}>
                                        {"Choose File Type"}
                                    </MenuItem>
                                    {dropdownOptions.filetypes.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid> */}
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
                                    <MenuItem value={"-1"}>
                                        {dropdownOptions.bilingFreqency.length === 0 ? "No Billing Frequency" : "Choose Billing Frequency"}
                                    </MenuItem>
                                    {dropdownOptions.bilingFreqency.map((option) => (
                                        <MenuItem key={option.id} value={`${option.code}`}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                            {warningList.billingcode && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.billingcode}
                                </Typography>
                            )}

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
                                        <MenuItem key={option.id} value={`${option.paymenttermcode}`}>
                                            {option.paymenttermname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {warningList.paymenttermcode && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.paymenttermcode}
                                </Typography>
                            )}
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
                                error={warningList.visitperyear === null ? true : false}
                            />
                        </Grid>


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
                <Grid size={{ xs: 12, md: 4 }} sx={{ borderLeft: "1px solid rgba(192, 192, 192, 0.6)" }}>
                    <Box sx={{ height: 400, maxHeight: 400 }}>
                        <Box display="flex" justifyContent="space-between" alignItems={"center"} paddingY={1} paddingX={1}>
                            <Typography variant="h5" align="left" >
                                Selected Product ({itemData.length})
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ overflow: "auto", maxHeight: 390 }}>
                            <FormGroup sx={{ py: 1, gap: 1, flexDirection: "column", minWidth: "100%" }}>
                                {itemData.map((v, i) => (
                                    <React.Fragment key={v.itemId}>
                                        <Box sx={{ justifyContent: "space-between", pt: 1, px: 0.5, alignItems: "center" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                                                <Box sx={{ display: "flex", pb: 1, gap: 1 }}>
                                                    <LabelIcon color='success' />
                                                    <Typography> {v.name}</Typography>
                                                </Box>

                                                <Tooltip title="Remove product">
                                                    <IconButton color='error' onClick={() => removeTask(v.itemId)}>
                                                        <DeleteForeverIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                            <Grid container gap={1} >

                                                <Grid size={5.8}>
                                                    <TextField
                                                        label="Serial No"
                                                        fullWidth
                                                        name="serialno"
                                                        onChange={(e) => handleSerialInput(i, e.target.value, "serialno")}
                                                        size='small'
                                                        value={v.serialno}
                                                    />
                                                </Grid>

                                                <Grid size={5.8} >
                                                    <TextField
                                                        label="Validity"
                                                        type="date"
                                                        size="small"
                                                        fullWidth
                                                        value={v.waranty || ""}
                                                        onChange={(e) => handleSerialInput(i, e.target.value, "waranty")}
                                                        name="waranty"
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        inputProps={{
                                                            min: "2000-01-01",
                                                        }}
                                                        placeholder="YYYY-MM-DD"
                                                        error={!v.waranty}
                                                        helperText={
                                                            !v.waranty
                                                                ? "Validity is required"
                                                                : replicateIndex === i
                                                                    ? (
                                                                        <span style={{ color: "#007BFF", cursor: "pointer" }} onClick={replicateToAll}>
                                                                            Click to apply this date to all ▶
                                                                        </span>
                                                                    )
                                                                    : ""
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
                    </Box>
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
