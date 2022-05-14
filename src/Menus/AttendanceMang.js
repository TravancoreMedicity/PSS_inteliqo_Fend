import { CNavItem } from "@coreui/react";

const AttendanceManagement = [
    {
        men_slno: 23,
        component: CNavItem,
        name: 'Duty Planning',
        to: '/Home/Dutyplanning',
    },
    {
        men_slno: 24,
        component: CNavItem,
        name: 'Attendance Updation',
        to: '/Home/ShiftUpdation',
    },
    {
        men_slno: 125,
        component: CNavItem,
        name: 'Attendance Marking',
        to: '/Home/AttendanceMarking',
    },
    {
        men_slno: 127,
        component: CNavItem,
        name: 'Leave Carry Forwad',
        to: '/Home/LeaveCarryForwad',
    },
    {
        men_slno: 151,
        component: CNavItem,
        name: 'Annual Leave Process',
        to: '/Home/AnnualLeaveProcess',
    },
    {
        men_slno: 152,
        component: CNavItem,
        name: 'Department Section Change',
        to: '/Home/DeptSecChange',
    },
]

export default AttendanceManagement;