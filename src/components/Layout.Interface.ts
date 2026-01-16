import { BiSolidInstitution, BiLibrary, BiRfid } from "react-icons/bi";
import { CgScreen } from "react-icons/cg";
import { GrTransaction } from "react-icons/gr";
import { HiStatusOnline } from "react-icons/hi";
import { FaAddressCard, FaUsers, FaUniversalAccess, FaCog, FaPrint, FaIdCard } from 'react-icons/fa';
import { MdLabel, MdAutorenew } from "react-icons/md";
import { GiBookshelf, GiProcessor } from "react-icons/gi";
import { AiOutlineDashboard, AiFillHome, AiOutlineUserAdd } from "react-icons/ai";
import { IoIosBarcode } from "react-icons/io";
import { FaList, FaArrowRightToBracket, FaChartSimple, FaUserGroup, FaUsersRays, FaRightFromBracket } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { TbReportAnalytics } from "react-icons/tb";
import { IconType } from "react-icons";
import { ReactNode } from "react";
import { CiSettings } from "react-icons/ci";
import { FcDepartment } from "react-icons/fc";
import { RiEarthFill } from "react-icons/ri";

export interface CHILD_RIGHT {
    rightid: number;
    name: string;
    displayName: string;
    description: string;
    url: string;
    icon: string;
    parent: string;
    active: boolean;
}

export interface USER_RIGHT {
    parentid: number;
    pName: string;
    pDisplayName: string;
    pIcon: string;
    childMenu: CHILD_RIGHT[];
}

export interface Response<T> {
    status: "Success" | "Fail";
    message?: string;
    data?: T;
    totalCount?: number;
}

export const iconMapping: Record<string, IconType> = {
    BiSolidInstitution: BiSolidInstitution,
    BiLibrary: BiLibrary,
    BiRfid: BiRfid,
    FaPrint: FaPrint,
    GrTransaction: GrTransaction,
    HiStatusOnline: HiStatusOnline,
    FaArrowRightToBracket: FaArrowRightToBracket,
    FaRightFromBracket: FaRightFromBracket,
    FaUserGroup: FaUserGroup,
    FaAddressCard: FaAddressCard,
    FaUsersRays: FaUsersRays,
    MdAutorenew: MdAutorenew,
    TbReportAnalytics: TbReportAnalytics,
    CgScreen: CgScreen,
    MdLabel: MdLabel,
    FaUniversalAccess: FaUniversalAccess,
    FaChartSimple: FaChartSimple,
    FaCog: FaCog,
    GiBookshelf: GiBookshelf,
    GiProcessor: GiProcessor,
    FaList: FaList,
    FaIdCard: FaIdCard,
    FaUsers: FaUsers,
    AiOutlineDashboard: AiOutlineDashboard,
    AiFillHome: AiFillHome,
    IoIosBarcode: IoIosBarcode,
    FiUsers: FiUsers,
    AiOutlineUserAdd: AiOutlineUserAdd,
    CiSettings: CiSettings,
    FcDepartment: FcDepartment,
    Earth: RiEarthFill
};

export interface START_FIRE {
    msg: string;
    type: "S" | "E" | "W" | "N";
    func?: () => ReactNode;
}

export type FIRE = (args: START_FIRE) => void;

export interface HEADER {
    title: string;
    sub_title?: ReactNode | string;
    breadcrum?: () => ReactNode[];
}

export type HEADER_FIRE = (args: HEADER) => void;

export type Loader = {
    color?: string;
    size?: number;
    status: boolean
};

export type START_LOADER = (args: Loader | boolean) => void;