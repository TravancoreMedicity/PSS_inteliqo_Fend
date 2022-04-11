import { CNavItem } from "@coreui/react";

const Employeerecord = [
    {
        men_slno: 19,
        component: CNavItem,
        name: 'Employee Register',
        to: '/Home/EmployeeRecord',
    },
    {
        men_slno: 20,
        component: CNavItem,
        name: 'Employee File',
        to: '/Home/EmployeeFile',
    },
    {
        men_slno: 21,
        component: CNavItem,
        name: 'Allowance/Deduction',
        to: '/Home/AllowanceDeduction',
    },
    // {
    //     component: CNavItem,
    //     name: 'Bulk Updation',
    //     to: '/homes',
    // },
    {
        men_slno: 130,
        component: CNavItem,
        name: 'Hrm Alert',
        to: '/Home/Hrm_Alert',
    },
    {
        men_slno: 131,
        component: CNavItem,
        name: 'Hrm Message',
        to: '/Home/Hrm_message',
    },
]

export default Employeerecord;