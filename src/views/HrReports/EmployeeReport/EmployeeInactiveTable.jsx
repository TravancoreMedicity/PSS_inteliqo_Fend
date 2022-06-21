import React, { Fragment } from 'react'
import Materialtable from 'src/views/Component/Materialtable'

const EmployeeInactiveTable = ({ tableData }) => {
    const title = [
        {
            title: 'Emp ID', field: 'em_no', cellStyle: { minWidth: 200, maxWidth: 250 }
        },
        {
            title: 'Emp Name', field: 'em_name', cellStyle: { minWidth: 300, maxWidth: 400 }
        },
        {
            title: 'Gender', field: 'em_gender', cellStyle: { minWidth: 200, maxWidth: 300 }
        },
        {
            title: 'Branch', field: 'branch_name', cellStyle: { minWidth: 200, maxWidth: 300 }
        },
        {
            title: 'Department', field: 'dept_name', cellStyle: { minWidth: 300, maxWidth: 400 }
        },
        {
            title: 'Department Section', field: 'sect_name', cellStyle: { minWidth: 300, maxWidth: 400 }
        },
        {
            title: 'Emp Type', field: 'inst_emp_type', cellStyle: { minWidth: 300, maxWidth: 400 }
        },
        {
            title: 'Designation', field: 'desg_name', cellStyle: { minWidth: 300, maxWidth: 500 }
        },
        {
            title: 'Employee Category', field: 'ecat_name', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Date of Join', field: 'em_doj', cellStyle: { minWidth: 200, maxWidth: 350 }
        },
        {
            title: 'DOB', field: 'em_dob', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Permanent Address', field: 'addressPresent1', cellStyle: { minWidth: 700, maxWidth: 900 }
        },
        {
            title: 'Permanent Address', field: 'addressPresent2', cellStyle: { minWidth: 700, maxWidth: 900 }
        },
        {
            title: 'Pin No', field: 'hrm_pin2', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Mobile', field: 'em_mobile', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'E-mail', field: 'em_email', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Adhar No', field: 'em_adhar_no', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Contract End Date', field: 'contract_end_date', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Retirement Date', field: 'em_retirement_date', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
        {
            title: 'Status', field: 'status', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
    ]
    return (
        <Fragment>
            <Materialtable title="Employee List With Status In Active"
                data={tableData} columns={title}
            />
        </Fragment>
    )
}

export default EmployeeInactiveTable