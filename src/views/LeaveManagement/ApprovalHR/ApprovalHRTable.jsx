import MaterialTable from 'material-table';
import React, { Fragment, memo, useState } from 'react';
import { tableIcons } from 'src/views/Constant/MaterialIcon';
import { MdCheckCircle } from "react-icons/md"
import ModelApproveReject from '../LeaveCommonComponent/ModelApproveReject';


const ApprovalHRTable = () => {
    //Table
    const title = [
        {
            title: "SlNo", field: "SlNo"
        },
        {
            title: "Emp_no", field: "Emp_no"
        },
        {
            title: "Employee name", field: "Employee_name"
        },
        {
            title: "Department Section", field: "Department_section"
        },
        {
            title: "Status", field: "Status"
        },

    ]
    const data = [
        {
            SlNo: 1,
            Emp_no: 18,
            Employee_name: 'Reshma',
            Department_section: 'IT',
            Status: 'pending'
        },
    ]

    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);

    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        < Fragment >
            <ModelApproveReject open={open} handleClose={handleClose} />
            <MaterialTable
                title="Leave Approval HR"
                data={data}
                columns={title}
                icons={tableIcons}
                actions={[
                    {
                        icon: () => <MdCheckCircle size={26} color="secondary" />,
                        tooltip: "Click here to Edit",
                        onClick: (e, data) => handleClickOpen()
                    }
                ]}
                options={{
                    paginationType: "stepped",
                    showFirstLastPageButtons: false,
                    padding: "dense",
                    actionsColumnIndex: -1
                }}
            />
        </Fragment >
    )
}

export default memo(ApprovalHRTable)
