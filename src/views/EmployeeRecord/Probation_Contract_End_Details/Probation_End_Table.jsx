import MaterialTable from 'material-table'
import React, { Fragment, memo, useEffect, useState } from 'react'
import { tableIcons } from 'src/views/Constant/MaterialIcon'
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded';
import { axioslogin } from 'src/views/Axios/Axios';
import { useHistory } from 'react-router-dom';



const Probation_End_Table = () => {
    const history = useHistory()
    const [tableData, setTableData] = useState([]);
    useEffect(() => {
        const getProbationEnd = async () => {
            const result = await axioslogin.get('/empcat/probation/detl')
            const { success, data } = result.data
            if (success === 1) {
                setTableData(data)
            }
            else if (success === 0) {
                setTableData([])
            }
        }
        getProbationEnd()
    }, [])
    const title = [
        {
            title: 'Emp Id', field: 'em_no', cellStyle: { minWidth: 1, maxWidth: 50 }
        },
        {
            title: 'Department', field: 'sect_name', cellStyle: { minWidth: 200, maxWidth: 300 }
        },
        {
            title: 'Emp Name', field: 'em_name', cellStyle: { minWidth: 200, maxWidth: 300 }
        },
        {
            title: 'Designation', field: 'desg_name', cellStyle: { minWidth: 150, maxWidth: 200 }
        },
        {
            title: 'Date of Join', field: 'em_doj', cellStyle: { minWidth: 200, maxWidth: 350 }
        },
        {
            title: 'Probation End', field: 'em_prob_end_date', cellStyle: { minWidth: 200, maxWidth: 400 }
        },
    ]
    //category change
    const CategoryChange = (data) => {
        const { em_no, em_id } = data
        history.push(`/Home/EmployeeCompany/${em_no}/${em_id}`)
    }

    return (
        <Fragment>
            <MaterialTable
                title="Probaton End List"
                data={tableData}
                columns={title}
                icons={tableIcons}
                actions={[
                    {
                        icon: () => <AddTaskRoundedIcon color='success' />,
                        tooltip: "Click Here to Change Category",
                        onClick: (e, data) => CategoryChange(data)

                    }
                ]}
                options={{
                    paginationType: "stepped",
                    showFirstLastPageButtons: false,
                    padding: "dense",
                    actionsColumnIndex: -1,
                    rowStyle: (data, index) => data.probation_falg === 1 ? { background: "#E3E4FA" } : null
                }}
            />
        </Fragment>
    )
}

export default memo(Probation_End_Table)