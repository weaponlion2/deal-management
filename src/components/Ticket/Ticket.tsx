import dayjs from 'dayjs';
import myAxios from '../api';
import { AxiosError, AxiosResponse } from 'axios';
import { CancelOutlined, Check } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FIRE, HEADER_FIRE, Response, START_FIRE, START_LOADER } from '../Layout.Interface';
import { Link as RLink, useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Grid2 as Grid, TextField, Select, MenuItem, InputLabel, FormControl, Button, Typography, Box, SelectChangeEvent, Paper, Divider, FormGroup, Chip, Link, ListItemIcon, Zoom, Fab, IconButton, Tooltip, CircularProgress, Stack } from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import ContactModal from './ContactModal';
import OrganizationModal from './OrganizationModal';
import { VisuallyHiddenInput } from '../Organization/Organization';
import { SType } from '../Deal/Deal';
import EmailModal, { IEmailPrep } from '../Other/Email';
import { TicketView } from './List';
import AddIcon from '@mui/icons-material/Add';

const fabStyle = {
    position: 'absolute',
    bottom: 16,
    right: 16,
    color: 'common.white',
    bgcolor: green[500],
    transition: "all 1s",
    '&:hover': { bgcolor: green[600], transform: 'rotate(-0.50turn) !important', }
};
const fabStyle2 = {
    color: 'common.white',
    bgcolor: red[300],
    transition: "all 0.2s",
    '&:hover': { bgcolor: red[600], transform: 'rotate(-0.50turn) !important' }
};

// Type for the dropdown options
export interface DropdownOption {
    id: string;
    name: string;
    billingFrequency?: string;
    address?: string;
    email?: string;
    itemtypename?: string;
    stagename?: string;
    stagecode?: string;
    code?: string;
    paymenttermcode?: string,
    paymenttermname?: string
}

// Type for the ticket form
export interface TicketForm {
    id: number;
    dealId: number;
    createdOn: string;
    pipeline: string;
    description: string;
    source: typeof Sources[number]['id'];
    organizationId: string;
    organizationName: string;
    contactId: string;
    contactName: string;
    itemType: string;
    itemId: string;
    task: string;
    priority: typeof Priorites[number]['id'];
    openDate: string;
    closeDate: string;
    status: typeof Statuses[number]['id'];
    uidd: string;
    taskmodel: undefined | TaskForm[],
    comment: string,
    tickCode: string | null,
    serialNo: string,
    usercmntid: string,
    refId: number,
    type: string,
    file: string,
    contactFirstName: string,
    contactLastName: string,
}

export interface TaskForm {
    id: number,
    ticketId: number,
    description: string,
    userid: string,
    startDate: string,
    endDate: string,
    status: typeof Statuses[number]['id'] | "-1",
    taskMasterId: number,
    name: string,
    cuid: string | null,
    comment: string,
}

export interface ErrorForm extends Pick<TicketForm, 'pipeline' | 'itemId' | 'uidd' | 'itemType' | 'organizationId' | 'openDate' | 'contactId'> {
    task: string,
    priority: string,
    status: string,
    source: string,
    type: string,
}

export const InitialErr: ErrorForm = {
    itemId: "",
    itemType: "",
    openDate: "",
    organizationId: "",
    uidd: "",
    pipeline: "",
    source: "",
    task: "",
    contactId: "",
    priority: "",
    status: "",
    type: ""
}

export interface DropdownList {
    pipelines: DropdownOption[];
    sources: DropdownOption[];
    organizations: DropdownOption[];
    contacts: DropdownOption[];
    itemTypes: DropdownOption[];
    items: DropdownOption[];
    tasks: DropdownOption[];
    priorities: DropdownOption[];
    statuses: DropdownOption[];
    owners: DropdownOption[];
    filetypes: DropdownOption[];
    stages: DropdownOption[];
    bilingFreqency: DropdownOption[];
    paymentTerm: DropdownOption[];
}

export const Priorites = [{ id: "LOW", name: "Low" }, { id: "MEDIUM", name: "Medium" }, { id: 'HIGH', name: 'High' }, { id: 'URGENT', name: 'Urgent' }, { id: "CRITICAL", name: "Critical" }] as const;
export const Statuses = [{ id: "OPN", name: "OPEN" }, { id: "INP", name: "In Progress" }, { id: "PEN-US", name: "Pending (on us)" }, { id: "PEN-CS", name: "Pending (on customer)" }, { id: "CAN", name: "Cancelled" }, { id: "CLO", name: "Closed" }] as const;
export type urlType = "pipelines" | "owners" | "organizations" | "contacts" | "itemtypes" | "items" | "statuses" | "priorities" | "tasks" | "dealtypes" | "stages" | "bilingFreqency" | "paymentTerm"
export type contactType = DropdownOption & { firstName: string, lastName: string }
export const Sources = [{ id: "CH", name: "Call Helpline" }, { id: "CSP", name: "Call Service Person" }, { id: "EMAIL", name: "Email" }, { id: "WH", name: "Whatsapp Helpline" }, { id: "WSP", name: "Whatsapp Service Person" },] as const;
export const FileTypes: DropdownOption[] = [{ id: "SR", name: "Service Report" }, { id: "IR", name: "Installation Report" }, { id: "PIR", name: "Primary Information Report" }] as const;

export const urlList: Record<urlType, string> = {
    pipelines: '/Pipeline/ShowPipeline?id=0',
    owners: '/User/AllUsers?id=0&pageNumber=1&recordPerPage=5&showAll=true',
    organizations: '/Organization/AllOrganization?pageno=0&recordperpage=10&showall=true&isfile=false',
    contacts: '/Contact/ShowAllContacts?id=0&pageno=0&recordperpage=10&showall=false',
    itemtypes: '/Pipeline/ShowPipelineItemType',
    tasks: '/MasterTask/ShowAllMtask?type=',
    items: 'ItemType/Items?type=',
    priorities: '',
    statuses: '',
    dealtypes: 'Deal/ShowDealType?id=0',
    stages: '/Deal/showstage',
    bilingFreqency: '/Deal/ShowBillingFrequency',
    paymentTerm: '/Deal/ShowPaymentTerm',
}

export const isValidDate = (date: string) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};

export const fetchOptions = async (ntype: urlType, other: string = ""): Promise<DropdownOption[]> => {
    try {
        const req: AxiosResponse = await myAxios(urlList[ntype] + other);
        if (req.status === 200) {
            const { status, data }: Response<DropdownOption[] | contactType[]> = req.data;
            // console.log("DATA",data)
            if (status === "Success") {
                if (typeof data !== "undefined") {
                    if (ntype === "contacts") {
                        const owners: DropdownOption[] = data.map((it) => {
                            const item = it as contactType;
                            return { id: item.id, name: `${item.firstName} ${item.lastName}`, email: item.email }
                        });
                        return owners;
                    }
                    return data as DropdownOption[];
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
    return []
};

export interface commentForm {
    cid: number,
    id: number,
    type: "TASK" | "TICKET",
    comments: string,
    createOn: string,
    userName: string,
    isactive: boolean,
    uid: number
}

export interface NView {
    amount: string;
    contactId: number;
    dealId: number;
    organizationId: number;
    dealItemId: number;
    dealName: string;
    contactName: string;
    organizationName: string;
    phone: string;
    serialno: string;
    priority: string;
    vindustry: string;
    itemType: string;
    pId: string;
    pipeline: string;
    userid: string;
}

export const CommentLine = ({ comments, toggleDrawer, id, selected }: { comments: commentForm[], toggleDrawer: () => void, id?: string, selected?: boolean }) => {
    return (
        <Box sx={{ height: 600, maxHeight: 600 }}>
            <Box display="flex" justifyContent="space-between" alignItems={"center"} paddingY={1} paddingX={1}>
                <Typography variant="h5" align="left" >
                    Comment History {id && ` - ${id}`}
                </Typography>
                <Box>
                    <IconButton sx={{ ...fabStyle2, display: "none" }} color='error' type='button' onClick={toggleDrawer}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>
            <Divider />
            <Box sx={{ overflow: "auto", maxHeight: 530, px: 1 }}>
                <Timeline sx={{ p: 0 }}>
                    {
                        comments.map((v) => (
                            <TimelineItem sx={{ p: 0 }} key={v.cid}>
                                <TimelineOppositeContent color="text.secondary" sx={{ textAlign: "left", maxWidth: 120 }}>
                                    <Typography sx={{ fontSize: 13.5 }}>{v.createOn}</Typography>
                                    <Typography color='primary' sx={{ fontSize: 13 }}>{v.userName}</Typography>
                                </TimelineOppositeContent>
                                <TimelineSeparator >
                                    <TimelineDot />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent><Typography sx={{ fontSize: 14 }}>{v.comments}</Typography></TimelineContent>
                            </TimelineItem>
                        ))
                    }
                </Timeline>
                {
                    (comments.length === 0 && typeof id !== "undefined" && selected) && <Typography color='warning' variant='h5' >No comments found</Typography>
                }
                {
                    (comments.length === 0 && typeof id === "undefined" && typeof selected !== "undefined" && selected === false) && <Typography color='warning' variant='h5' >No task selected</Typography>
                }
                {
                    (comments.length === 0 && typeof id === "undefined" && typeof selected === "undefined") && <Typography color='warning' variant='h5' >No comments found</Typography>
                }
            </Box>
        </Box>
    )
}


export const fetchComment = async <T extends commentForm>(id: string, type?: "TICKET" | "TASK" | "DEALS", cid?: string): Promise<T[]> => {
    try {
        const req: AxiosResponse = await myAxios(`/TicketComments/ShowTicketComments?cid=${cid ?? 0}&id=${id}&type=${type ?? "TICKET"}`);
        if (req.status === 200) {
            const { status, data }: Response<T[]> = req.data;
            if (status === "Success") {
                if (typeof data !== "undefined") {
                    return data;
                }
            }
        }
    } catch (err: unknown) {
        if (err instanceof AxiosError) {
            console.log(err.message);
        } else {
            console.log("An unexpected error occurred");
        }
    }
    return [];
};

const CreateTicketPage: React.FC = () => {
    const { uid } = useParams<{ uid: string | undefined }>();
    //  console.log("AAA RAHA HU MI ", uid)
    const logedUser: string = localStorage.getItem("@Id") ?? "-1";
    const location = useLocation();
    const navigateData: NView | null = location.state;
    const [taskSet, setTaskSet] = useState<Set<string>>(new Set());
    const { startFir, setUpHeader, startLoader } = useOutletContext<{ startFir: FIRE; setUpHeader: HEADER_FIRE, startLoader: START_LOADER }>();
    const [ticketData, setTicketData] = useState<TicketForm>({
        id: 0,
        dealId: 0,
        createdOn: '',
        pipeline: '-1',
        description: '',
        source: 'CSP',
        organizationId: '0',
        contactId: '0',
        itemType: '-1',
        itemId: '-1',
        task: "-1",
        priority: 'MEDIUM',
        openDate: dayjs().format("YYYY-MM-DDTHH:mm"),
        closeDate: '',
        status: 'OPN',
        uidd: "-1",
        usercmntid: "-1",
        taskmodel: undefined,
        comment: "",
        serialNo: "",
        tickCode: null,
        refId: uid ? Number(uid) : 0,
        type: "-1",
        file: "",
        contactName: "",
        organizationName: "",
        contactFirstName: "",
        contactLastName: ""
    });

    const [emailData, setEmailData] = useState<IEmailPrep>({
        closeDate: "",
        description: "",
        openDate: "",
        organizationLocation: "",
        contactEmail: "",
        ownerEmail: "",
        productName: "",
        organizationName: "",
        ownerName: "",
        serialNo: "",
        tickCode: "",
        type: "TICKETOPEN"
    });
    const [commentList, setCommentList] = useState<commentForm[]>([]);
    const [taskData, setTaskData] = useState<TaskForm[]>([]);
    const [warningList, setWarningList] = useState<ErrorForm>(InitialErr);

    const [open, setOpen] = useState<boolean>(false);
    const toggleDrawer = (open: boolean) => () => setOpen(open)

    const [dropdownOptions, setDropdownOptions] = useState<DropdownList>({
        pipelines: [],
        sources: [...Sources],
        organizations: [],
        contacts: [],
        itemTypes: [],
        items: [],
        tasks: [],
        priorities: [...Priorites],
        statuses: [...Statuses],
        owners: [],
        filetypes: [...FileTypes],
        stages: [],
        bilingFreqency: [],
        paymentTerm: [],
    });

    useEffect(() => {
        setUpHeader({
            title: "",
            // sub_title: `Kindly ensure all required fields are completed to ${userId != 0 ? 'edit a user' : 'create a new user'}.`,
            breadcrum: () => [
                <Link key={0} component={RLink} underline="hover" color="inherit" to="/">
                    Dashboard
                </Link>,
                <Link key={1} component={RLink} underline="hover" color="inherit" to="/tickets">
                    Ticket
                </Link>,
                <Typography key={2} >{uid ? "Update" : "Create"}</Typography>,
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
                tasks: [],
                owners: await fetchOptions('owners'),
                priorities: dropdownOptions.priorities,
                statuses: dropdownOptions.statuses,
                sources: dropdownOptions.sources,
                filetypes: dropdownOptions.filetypes,
                stages: await fetchOptions('stages'),
                bilingFreqency: await fetchOptions('bilingFreqency'),
                paymentTerm: await fetchOptions('paymentTerm')
            });

            if (uid) {
                await getData(uid);
            }
            else if (navigateData !== null) {
                setTicketData((prev: TicketForm) => {
                    return {
                        ...prev,
                        organizationId: `${navigateData.organizationId}`,
                        contactId: `${navigateData.contactId}`,
                        serialNo: navigateData.serialno,
                        pipeline: navigateData.pipeline,
                        itemType: navigateData.itemType,
                        itemId: `${navigateData.pId}`,
                        uidd: `${navigateData.userid}`,
                        usercmntid: logedUser,
                        organizationName: navigateData.organizationName,
                        contactName: navigateData.contactName,
                        dealId: navigateData.dealId
                    }
                })
                if (navigateData !== null) {
                    console.log("Mai Hu naak mai dm")
                    const tasks: DropdownOption[] = await fetchOptions("tasks", navigateData.itemType);
                    const items: DropdownOption[] = await fetchOptions("items", navigateData.itemType ? navigateData?.itemType : navigateData?.pipeline);
                    setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items, tasks: tasks }));
                }
            }
            else {
                setTicketData((prev) => ({
                    ...prev,
                    uidd: logedUser,
                    usercmntid: logedUser
                }))
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTicketData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = async (e: SelectChangeEvent<string>, field: string) => {
        const val: string = `${e.target.value}`;
        if (val === "-2") return;
        if (field === "itemType") {
            setTaskData([])
            setTaskSet(new Set())
            setTicketData((ticketData) => ({ ...ticketData, itemId: '-1', itemType: val, task: "-1" }))
            if (val === "-1") {
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: [], tasks: [] }));
            }
            else {
                const items: DropdownOption[] = await fetchOptions("items", val);
                const tasks: DropdownOption[] = await fetchOptions("tasks", val);
                setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items, tasks: tasks }));
            }
        }
        else if (field === "task") {

            const vl = val.split("+");
            // console.log("OSLSL",vl)
            if (vl[0] === "-1") return;

            setTaskData((taskData) => {
                // console.log(taskData)
                const tasks: TaskForm[] = [];
                let available: boolean = false;
                for (let i = 0; i < taskData.length; i++) {
                    if (`${taskData[i].taskMasterId}` === vl[0]) {
                        available = true;
                    } else tasks.push(taskData[i]);
                }
                if (!available) {
                    tasks.push({
                        id: 0,
                        description: ticketData.description,
                        userid: ticketData.uidd,
                        status: ticketData.status,
                        endDate: "",
                        startDate: ticketData.openDate,
                        ticketId: 0,
                        taskMasterId: vl[0] as unknown as number,
                        name: vl[1],
                        cuid: "0",
                        comment: "",
                    })
                }
                console.log(tasks,vl[0])
                return tasks;
            })


            setTaskSet((prevSet) => {
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

                console.log("I am in Pipeline that causes error")
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

    function removeTask(taskMasterId: number): void {
        setTaskData((taskData) => taskData.filter((task) => task.taskMasterId !== taskMasterId));
        setTaskSet((prevSet) => {
            const newSet = new Set(prevSet);
            if (prevSet.has(`${taskMasterId}`)) {
                newSet.delete(`${taskMasterId}`);
            } else {
                newSet.add(`${taskMasterId}`);
            }
            return newSet;
        })
    }

    const handleSubmit = async () => {
        // Handle the form submission
        startLoader(true)
        const taskmodel = taskData.map((v) => ({ ...v, id: 0, uidd: ticketData.uidd, description: ticketData.description, status: ticketData.status }));
        if (validateInput() === true) {
            const response: AxiosResponse = await myAxios.post(`/Tickets/SaveTicket`, { ...ticketData, openDate: isValidDate(ticketData.openDate) === true ? ticketData.openDate : "", closeDate: isValidDate(ticketData.closeDate) === true ? ticketData.closeDate : ticketData.status === "CLO" ? dayjs().format("YYYY-MM-DDTHH:mm") : "", taskmodel: taskmodel, usercmntid: logedUser, });
            try {
                const { data, status }: Response<TicketView[]> = response.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        const nData: TicketView = data[0];
                        startFir({
                            msg: "Ticket save successfully",
                            type: "S"
                        })

                        if (ticketData.status === "OPN" || ticketData.status === "CLO") {
                            const ContactIndex = dropdownOptions.contacts.findIndex((v) => v.id == ticketData.contactId)
                            // console.log({ ContactIndex })
                            // console.log({ d: ticketData.contactId })
                            // console.log({ d: dropdownOptions.contacts })

                            if (ContactIndex !== -1) {
                                const email = dropdownOptions.contacts[ContactIndex]['email'] ?? "";
                                if (email !== "") {
                                    const OriIndex = dropdownOptions.organizations.findIndex((v) => v.id == ticketData.organizationId)
                                    const ItemIndex = dropdownOptions.items.findIndex((v) => v.id == ticketData.itemId)
                                    const OwnerIndex = dropdownOptions.owners.findIndex((v) => v.id == ticketData.uidd)

                                    setEmailData((pre) => ({
                                        ...pre,
                                        closeDate: nData.closeDate,
                                        description: ticketData.description,
                                        openDate: nData.createdOn,
                                        serialNo: ticketData.serialNo,
                                        tickCode: nData.tickCode ?? "",
                                        type: ticketData.status === "OPN" ? "TICKETOPEN" : "TICKETCLOSE",

                                        productName: dropdownOptions.items[ItemIndex]?.name ?? "",

                                        ownerName: dropdownOptions.owners[OwnerIndex]?.name ?? "",
                                        ownerEmail: dropdownOptions.owners[OwnerIndex]?.email ?? "",

                                        organizationLocation: dropdownOptions.organizations[OriIndex]?.address ?? "",
                                        organizationName: dropdownOptions.organizations[OriIndex]?.name ?? "",
                                        contactEmail: email,
                                    }))

                                    handleEmailModel(true)
                                }
                                else {
                                    handleNavigate("/tickets")
                                }

                            }
                            else {
                                handleNavigate("/tickets")
                            }
                        }
                        else {
                            handleNavigate("/tickets")
                        }
                    }
                } else {
                    startFir({
                        msg: "Unable to save ticket",
                        type: "W"
                    })
                }
            }
            catch (err: unknown) {
                if (err instanceof AxiosError) {
                    console.log(err.message);
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
        const errList: ErrorForm = { ...InitialErr };
        let isValid: boolean = true;

        if (!ticketData.pipeline || ticketData.pipeline === '-1') {
            errList.pipeline = "Pipeline is required."
            isValid = false;
        }
        if (!ticketData.source) {
            errList.source = "Source is required."
            isValid = false;
        }
        if (!ticketData.itemType || ticketData.itemType === '-1') {
            errList.itemType = "Item Type is required."
            isValid = false;
        }
        if (!ticketData.itemId || ticketData.itemId === '-1') {
            errList.itemId = "Item is required."
            isValid = false;
        }
        if (taskData.length < 1) {
            errList.task = "Please select atleast one task."
            isValid = false;
        }
        if (!ticketData.priority) {
            errList.priority = "Priority is required."
            isValid = false;
        }
        if (!ticketData.openDate) {
            errList.openDate = "Opening Date is required."
            isValid = false;
        } else if (!isValidDate(ticketData.openDate)) {
            errList.openDate = "Opening Date is invalid."
            isValid = false;
        }
        if (!ticketData.status) {
            errList.status = "Status is required."
            isValid = false;
        }
        if (!ticketData.uidd || ticketData.uidd === '-1') {
            errList.uidd = "Owner is required."
            isValid = false;
        }
        if (ticketData.file && ticketData.file != "") {
            if (!ticketData.type || ticketData.type === '-1') {
                errList.type = "File Type is required."
                isValid = false;
            }
        }
        if (!isValid) {
            startFir({
                msg: "Please fill up all required field.",
                type: "W"
            })
        }
        setWarningList({ ...errList })
        return isValid;
    }

    const getData = useCallback(async (uid: string) => {
        try { //2024-12-20
            const req = await myAxios.get(`/Tickets/ShowTicket?id=${uid}&fromdate=&todate=&pageno=0&recordperpage=0&showall=true&showTask=true`);
            if (req.status === 200) {
                const { data, status }: Response<TicketForm[]> = req.data;
                if (status === "Success") {
                    if (typeof data !== "undefined") {
                        const items: DropdownOption[] = await fetchOptions("items", data[0]['itemType']);
                        const tasks: DropdownOption[] = await fetchOptions("tasks", data[0]['itemType']);
                        setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, items: items, tasks: tasks }));
                        setTicketData({ ...data[0], openDate: dayjs(data[0]['openDate']).format("YYYY-MM-DDTHH:mm"), itemType: `${data[0]['itemType']}`, task: "-1", closeDate: data[0]['closeDate'] !== "" ? dayjs(data[0]['closeDate']).format("YYYY-MM-DDTHH:mm") : "", file: "", type: "-1", usercmntid: logedUser, comment: "", contactName: `${data[0]['contactFirstName']} ${data[0]['contactLastName']}` })
                        if (data[0]['taskmodel']) {
                            setTaskData(data[0]['taskmodel']);
                            setTaskSet(new Set<string>(data[0]['taskmodel'].map((v) => `${v.taskMasterId}`)))
                        }
                        getHistory(uid)
                    }
                }
            }
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.message);
            } else {
                console.log("An unexpected error occurred");
            }
        }
    }, []);

    const navigate = useNavigate();
    const handleNavigate = useCallback((arg0: string): undefined => {
        navigate(arg0)
    }, []);

    const getHistory = async (id: string) => {
        const comm = await fetchComment(id, "TICKET")
        setCommentList(comm);
        toggleDrawer(true)();
    };

    const handleMsg = (obj: START_FIRE) => startFir(obj);
    const [contactModel, setContactModel] = useState<boolean>(false);
    const [emailModel, setEmailModel] = useState<boolean>(false);
    const [organizationModel, setOrganizationModel] = useState<boolean>(false);
    const handleContactModel = (val: boolean) => setContactModel(val);
    const handleEmailModel = (val: boolean) => {
        setEmailModel(val)
        if (!val) {
            handleNavigate("/tickets")
        }
    };
    const handleOrganizationModel = (val: boolean) => setOrganizationModel(val);

    const callManipulator = useCallback((data: DropdownOption, type: "contact" | "organization") => {
        if (type === "contact") {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.contacts] }));
            setTicketData((ticketData) => ({ ...ticketData, contactId: `${data.id}`, contactName: data.name }))
        }
        else {
            setDropdownOptions((options) => ({ ...options, contacts: [data, ...options.organizations] }));
            setTicketData((ticketData) => ({ ...ticketData, organizationId: `${data.id}`, organizationName: data.name }))
        }
    }, [dropdownOptions])

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files: FileList | null = (e.target as HTMLInputElement).files;
        const file = files && files.length > 0 ? files[0] : null

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Result = reader.result as string;
                setTicketData((prevData) => ({
                    ...prevData,
                    file: base64Result.split(",")[1],
                    refId: Number(ticketData.id),
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReset = () => {
        setTicketData((prevData) => ({
            ...prevData,
            file: "",
            refId: 0,
        }));
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
                        else setDropdownOptions((dropdownOptions) => ({ ...dropdownOptions, organizations: data }));
                    }
                }
            }
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                console.log(err.message);
            } else {
                console.log("An unexpected error occurred");
            }
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
            else {
                setSearchCont(true);
                setSearchOrigan(false);
            }
        }
    };

    function changeData(id: string, val: string, type: SType): void {
        if (type === "ORGANIZATION") {
            setTicketData((tData) => ({ ...tData, organizationName: val, organizationId: id }))
        }
        else {
            setTicketData((tData) => ({ ...tData, contactName: val, contactId: id }))
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

   


    const handleResetOri = (type: SType) => {
        if (type === "ORGANIZATION") {
            setTicketData((prev) => ({
                ...prev,
                organizationId: "0",
                organizationName: ""
            }))
        }
        else if (type === "CONTACT") {
            setTicketData((prev) => ({
                ...prev,
                contactId: "0",
                contactName: ""
            }))
        }
    }

    const handleFocus = (type: SType) => {
        if (type === "ORGANIZATION") {
            const Index = dropdownOptions.organizations.findIndex((v) => v.id == ticketData.organizationId)
            setTicketData((prev) => ({
                ...prev,
                organizationName: (dropdownOptions.organizations.length == 0) ? ticketData.organizationName : (Index !== -1) ? dropdownOptions.organizations[Index].name : ""
            }))
            setSearchOrigan(false)
        }
        else if (type === "CONTACT") {
            const Index = dropdownOptions.contacts.findIndex((v) => v.id == ticketData.contactId)
            setTicketData((prev) => ({
                ...prev,
                contactName: (dropdownOptions.contacts.length == 0) ? ticketData.contactName : (Index !== -1) ? dropdownOptions.contacts[Index].name : ""
            }))
            setSearchCont(false)
        }
    }

    // console.log("TICKET DATA", ticketData)
    // console.log("Naviagat DATA", dropdownOptions?.items)
    // console.log("mai Hu tasjseet",taskSet,taskData)

    return (
        <Paper>
            <Box display="flex" justifyContent="space-between" paddingY={1} paddingX={2}>
                {ticketData.tickCode ? (<>
                    <Typography variant='h5' align="left">Ticket Code : <Typography display={"inline-block"} sx={{ px: 1, borderRadius: 1.5, fontSize: 23 }} color='white' bgcolor={"GrayText"}>{ticketData.tickCode}</Typography></Typography>
                </>) : <Typography variant="h5" align="left" >Ticket Form</Typography>}

                <Box display={"flex"} alignItems={"center"} >
                    <Grid>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{ width: "100%", textWrap: "nowrap" }}
                            onClick={() => handleNavigate("/tickets")}
                        >
                            Ticket List
                        </Button>
                    </Grid>
                </Box>
            </Box>
            <Divider />
            <Grid container>
                <Grid size={8}>
                    <Grid container spacing={3} padding={2}>

                        {/* Pipeline Dropdown */}
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.pipeline !== "" ? true : false}>Pipeline <span style={{ color: "red" }}>*</span></InputLabel>
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

                        {/* Owner Dropdown */}
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.uidd !== "" ? true : false}>Owner <span style={{ color: "red" }}>*</span></InputLabel>
                                <Select
                                    value={ticketData.uidd}
                                    onChange={(e) => handleSelectChange(e, 'uidd')}
                                    label="Owner *"
                                    size='small'
                                    error={warningList.uidd !== "" ? true : false}
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

                        {/* Source Dropdown */}
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.source !== "" ? true : false}>Source <span style={{ color: "red" }}>*</span></InputLabel>
                                <Select
                                    value={ticketData.source}
                                    onChange={(e) => handleSelectChange(e, 'source')}
                                    label="Source *"
                                    size='small'
                                    error={warningList.source !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.sources.length === 0 ? "No Sources" : "Choose Source"}
                                    </MenuItem>
                                    {dropdownOptions.sources.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                        {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative" }} >
                            <TextField
                                label="Organization"
                                value={ticketData.organizationName ?? ""}
                                onChange={(e) => handleSearch(e, "ORGANIZATION")}
                                placeholder='Search Organization...'
                                size='small'
                                name='searhbar'
                                type='text'
                                fullWidth
                                onFocus={() => setSearchOrigan(true)}
                                slotProps={{
                                    input: {
                                        name: `${"oiuy" + Math.random()}`
                                    },
                                }}
                            />
                            <Paper ref={oriRef} tabIndex={-1} onMouseEnter={() => setSearchOrigan(true)} sx={{ position: "absolute", right: 0, top: 40, zIndex: 111, width: "100%", borderRadius: 1, display: searchOrigan ? "block" : "none", maxHeight: 200, overflow: "auto" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant='caption' fontSize={15} p={1} px={2}>List of Organization</Typography>
                                    <IconButton tabIndex={-1} onClick={() => { setSearchOrigan(false); }}><CancelOutlined /></IconButton>
                                </Box>
                                <MenuItem value={-2} sx={{ color: green[600] }} onClick={() => handleOrganizationModel(true)}>
                                    {"New Organization"}
                                </MenuItem>
                                <MenuItem sx={{ color: red[600] }} value={-2} onClick={() => handleResetOri("ORGANIZATION")}>
                                    {"Reset Organization"}
                                </MenuItem>
                                <Divider />
                                {
                                    dropdownOptions.organizations.map((v) => (
                                        <MenuItem color='primary' key={v.id} onClick={() => changeData(`${v.id}`, v.name, "ORGANIZATION")} >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                <Box sx={{ display: "flex" }}>
                                                    <Typography>{v.name}</Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))
                                }
                                {
                                    dropdownOptions.organizations.length === 0 && loader && (
                                        <MenuItem color='primary' sx={{ display: "flex", justifyContent: "center" }}>
                                            <CircularProgress />
                                        </MenuItem>)
                                }
                                {
                                    dropdownOptions.organizations.length === 0 && loader === false && (
                                        <>
                                            <MenuItem color='primary'>
                                                <Typography width={"100%"}>No organization found </Typography>
                                            </MenuItem>
                                        </>
                                    )
                                }

                            </Paper>
                        </Grid> */}

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
                        {/* <Grid size={{ xs: 12, sm: 6 }} sx={{ position: "relative" }}  >
                            <TextField
                                label="Contact"
                                value={ticketData.contactName ?? ""}
                                onChange={(e) => handleSearch(e, "CONTACT")}
                                placeholder='Search Organization...'
                                size='small'
                                name='searhbar'
                                type='text'
                                fullWidth
                                onFocus={() => {setSearchCont(true); handleFocus("ORGANIZATION")}}
                                slotProps={{
                                    input: {
                                        name: `${"oidf" + Math.random()}`
                                    },
                                }}
                            />

                            <Paper ref={conRef} tabIndex={-1} onMouseEnter={() => setSearchCont(true)} sx={{ position: "absolute", right: 0, top: 40, zIndex: 111, width: "100%", borderRadius: 1, display: searchCont ? "block" : "none", maxHeight: 200, overflow: "auto" }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant='caption' fontSize={15} p={1} px={2}>List of Contact</Typography>
                                    <IconButton tabIndex={-1} onClick={() => { setSearchCont(false); }}><CancelOutlined /></IconButton>
                                </Box>
                                <MenuItem sx={{ color: green[600] }} value={-2} onClick={() => handleContactModel(true)}>
                                    {"New Contact"}
                                </MenuItem>
                                <MenuItem sx={{ color: red[600] }} value={-2} onClick={() => handleResetOri("CONTACT")}>
                                    {"Reset Contact"}
                                </MenuItem>
                                <Divider />
                                {
                                    dropdownOptions.contacts.map((v) => (
                                        <MenuItem color='primary' key={v.id} onClick={() => changeData(`${v.id}`, v.name, "CONTACT")} >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                <Box sx={{ display: "flex" }}>
                                                    <Typography>{v.name}</Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))
                                }
                                {
                                    dropdownOptions.contacts.length === 0 && loader && (
                                        <MenuItem color='primary' sx={{ display: "flex", justifyContent: "center" }}>
                                            <CircularProgress />
                                        </MenuItem>)
                                }
                                {
                                    dropdownOptions.contacts.length === 0 && loader === false && (
                                        <>
                                            <MenuItem color='primary'>
                                                <Typography width={"100%"}>No contact found </Typography>
                                            </MenuItem>
                                        </>
                                    )
                                }

                            </Paper>
                        </Grid> */}

                        {/* Priority Dropdown */}
                        <Grid size={{ xs: 12, sm: 3 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    onFocus={() => { handleFocus("CONTACT") }}
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

                        {/* Status Dropdown */}
                        <Grid size={{ xs: 12, sm: 3 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={ticketData.status}
                                    onChange={(e) => handleSelectChange(e, 'status')}
                                    label="Status"
                                    size='small'
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.statuses.length === 0 ? "No Statuses" : "Choose Status"}
                                    </MenuItem>
                                    {dropdownOptions.statuses.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {warningList.status && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.status}
                                </Typography>
                            )}
                        </Grid>

                        {/* Opening Date */}
                        <Grid size={{ xs: 12, sm: 3 }} >
                            <TextField
                                label="Opening Date"
                                type="datetime-local"
                                size='small'
                                fullWidth
                                value={ticketData.openDate}
                                onChange={handleInputChange}
                                name="openDate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            {warningList.openDate && (
                                <Typography
                                    variant="button"
                                    sx={{ display: "block", textAlign: "right", color: "red" }}
                                >
                                    {warningList.openDate}
                                </Typography>
                            )}
                        </Grid>

                        {/* Closing Date */}
                        <Grid size={{ xs: 12, sm: 3 }} >
                            <TextField
                                label="Closing Date"
                                size='small'
                                fullWidth
                                type="datetime-local"
                                value={ticketData.closeDate}
                                onChange={handleInputChange}
                                name="closeDate"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{
                                    "& .MuiFormLabel-root.Mui-disabled": {
                                        color: "black",
                                    },
                                }}
                            />
                        </Grid>

                        {/* Item Type Dropdown */}
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.itemType !== "" ? true : false}>Item Type <span style={{ color: "red" }}>*</span></InputLabel>
                                <Select
                                    value={ticketData.itemType}
                                    onChange={(e) => handleSelectChange(e, 'itemType')}
                                    label="Item Type *"
                                    size='small'
                                    {...(uid ? { disabled: true } : { disabled: false })}
                                    error={warningList.itemType !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {dropdownOptions.itemTypes.length === 0 ? "No Itemtypes" : "Choose Itemtype"}
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
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel error={warningList.itemId !== "" ? true : false}>Item <span style={{ color: "red" }}>*</span></InputLabel>
                                <Select
                                    value={ticketData.itemId}
                                    onChange={(e) => handleSelectChange(e, 'itemId')}
                                    label="Item *"
                                    size='small'
                                    error={warningList.itemId !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {((typeof ticketData.itemType === "number" && ticketData.itemType === -1) || ticketData.itemType === "-1") ? "Choose Itemtype first" : (dropdownOptions.items.length === 0 ? "No Items" : "Choose Item")}
                                    </MenuItem>
                                    {dropdownOptions.items.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Task Dropdown */}
                        <Grid size={{ xs: 12, sm: 4 }} >
                            <FormControl size='small' fullWidth>
                                <InputLabel>Task</InputLabel>
                                <Select
                                    value={ticketData.task}
                                    onChange={(e) => handleSelectChange(e as SelectChangeEvent<string>, 'task')}
                                    label="Task"
                                    size='small'
                                    error={warningList.task !== "" ? true : false}
                                >
                                    <MenuItem value={-1}>
                                        {((typeof ticketData.itemType === "number" && ticketData.itemType === -1) || ticketData.itemType === "-1") ? "Choose Itemtype first" : (dropdownOptions.tasks.length === 0 ? "No Tasks" : "Choose Task")}
                                    </MenuItem>
                                    {dropdownOptions.tasks.map((option) => (
                                        <MenuItem sx={{ justifyContent: "space-between" }} key={option.id} value={`${option.id}+${option.name}`}>
                                            {option.name}
                                            {
                                                taskSet.has(`${option.id}`) && (
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

                        {/* Serial Number */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Serial Number"
                                fullWidth
                                value={ticketData.serialNo ?? ""}
                                onChange={handleInputChange}
                                name="serialNo"
                                size='small'
                            />
                        </Grid>

                        {/* Comment */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Comment"
                                fullWidth
                                value={ticketData.comment ?? ""}
                                onChange={handleInputChange}
                                name="comment"
                                size='small'
                            />
                        </Grid>


                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl size='small' fullWidth>
                                <InputLabel>File Type {ticketData.file !== "" && <span style={{ color: 'red' }}> *</span>}</InputLabel>
                                <Select
                                    value={ticketData.type}
                                    onChange={(e) => handleSelectChange(e, 'type')}
                                    label={<>File Type {ticketData.file !== "" && <> *</>} </>}
                                    size='small'
                                    error={warningList.type !== "" ? true : false}
                                >
                                    <MenuItem value={"-1"}>
                                        {"Choose File Type"}
                                    </MenuItem>
                                    {dropdownOptions.filetypes.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", gap: 2, alignItems: "center" }} >
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

                        </Grid>

                        {/* {selected task} */}
                        <Grid size={{ xs: 12, sm: 12 }} >
                            <TextField
                                label={`Seleted Task (${taskData.length})`}
                                variant="outlined"
                                fullWidth
                                size='small'
                                disabled
                                InputProps={{
                                    startAdornment: (
                                        <FormGroup sx={{ py: 1, gap: 1, flexDirection: "row", minWidth: "100%" }}>
                                            {taskData.map((v) => (
                                                <Chip
                                                    key={v.taskMasterId}
                                                    label={v.name}
                                                    // onClick={handleClick}
                                                    onDelete={() => removeTask(v.taskMasterId)}
                                                />
                                            ))}
                                        </FormGroup>
                                    ),
                                }}
                                sx={{
                                    '& .MuiInputBase-root': {
                                        padding: 1,
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        borderColor: 'gray',
                                        borderRadius: 1,
                                    },
                                }}
                            />
                            {warningList.task && (
                                <Typography variant="button" sx={{ display: "block", textAlign: "right", color: "red", fontSize: 13 }}>
                                    {warningList.task}
                                </Typography>
                            )}
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12, sm: 12 }}>
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={2}
                                value={ticketData.description}
                                onChange={handleInputChange}
                                name="description"
                            />
                        </Grid>

                        {/* Submit Button */}
                        <Grid size={12}>
                            <Box display="flex" justifyContent="center">
                                <Button variant="contained" color="primary" onClick={handleSubmit}>
                                    {uid ? 'Update' : 'Create'} Ticket
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>
                </Grid>
                <Grid size={4} sx={{ borderLeft: "1px solid rgba(192, 192, 192, 0.6)" }}>
                    <CommentLine comments={commentList.sort((a, b) => b.cid - a.cid)} toggleDrawer={() => toggleDrawer(false)()} />
                </Grid>
            </Grid>


            {ticketData.id !== 0 && <Zoom
                in={!open}
                timeout={100}
                unmountOnExit
            >
                <Tooltip title="Comment History">
                    <Fab onClick={() => getHistory(`${ticketData.id}`)} sx={fabStyle} aria-label={"Toolbar"} color={"success"} size='small'>
                        <TimelineIcon />
                    </Fab>
                </Tooltip>
            </Zoom>}

            {emailData.tickCode !== "" && <EmailModal data={emailData} open={emailModel} handleModel={handleEmailModel} />}
            <ContactModal open={contactModel} organizationList={dropdownOptions.organizations} handleModel={handleContactModel} startFir={handleMsg} callBack={callManipulator} />
            <OrganizationModal open={organizationModel} handleModel={handleOrganizationModel} startFir={handleMsg} callBack={callManipulator} />
        </Paper>
    );
};

export default CreateTicketPage;
