
import React, { Fragment, useState, useEffect, memo, useCallback } from 'react'
import { succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { axioslogin } from 'src/views/Axios/Axios';
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout'
import { ToastContainer } from 'react-toastify'
import BranchSelectRedux from 'src/views/MuiComponents/BranchSelectRedux'
import { Box, IconButton, Paper, Tooltip } from '@mui/material'
import DeptSelectByRedux from 'src/views/MuiComponents/DeptSelectByRedux'
import DeptSecSelectByRedux from 'src/views/MuiComponents/DeptSecSelectByRedux'
import { Button, CssVarsProvider } from '@mui/joy'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CommonAgGrid from 'src/views/Component/CommonAgGrid'

const EmployeeInactiveHR = () => {

    const [count, setCount] = useState(0)
    const [branch, setBranch] = useState(0)
    const [dept, setDept] = useState(0)
    const [deptSect, setDeptSect] = useState(0)
    const [state, setState] = useState(0)
    const [empData, setempData] = useState([])

    useEffect(() => {
        const getempdetl = async () => {
            const postData = {
                em_department: dept,
                em_dept_section: deptSect,
                em_branch: branch
            }
            const result = await axioslogin.post("/plan/create", postData);
            const { success, data } = result.data
            if (success === 1) {
                setempData(data)
                setCount(0)
            }
            else {
                warningNofity("There is No employees In This Department And Department Section")

            }

        }
        if (branch !== 0 && dept !== 0 && deptSect !== 0) {
            getempdetl()
        } else {
        }

    }, [count, branch, dept, deptSect])

    const getemployeedetails = useCallback(async () => {
        if (dept === 0 && deptSect === 0) {
            warningNofity("Please Select All Option")
        } else {
            setState(1)
            // setTableData(empData)
        }
    }, [dept, deptSect])

    const [column] = useState([
        { headerName: 'Emp ID ', field: 'em_no', filter: true },
        { headerName: 'Emp Name ', field: 'em_name', filter: true },
        { headerName: 'Designation', field: 'desg_name', filter: true },
        { headerName: 'Date of Join', field: 'em_doj', filter: true },
        {
            headerName: 'Action',
            cellRenderer: params =>
                <Fragment>
                    <Tooltip title="In Active " followCursor placement='top' arrow >
                        <IconButton sx={{ mb: 0.5 }} onClick={() => InactiveEmp(params)} >
                            <CheckCircleOutlineIcon color='primary' />
                        </IconButton>
                    </Tooltip>
                </Fragment>
        },
    ])

    const InactiveEmp = useCallback(async (params) => {
        const data = params.api.getSelectedRows()
        const { em_id, dept_id, sect_id } = data[0]
        const postData = {
            em_id: em_id
        }
        const postDeptData = {
            dept_id: dept_id,
            sect_id: sect_id,
        }
        const results = await axioslogin.post('/Duedepartment/duedept', postDeptData)
        const { success1, data1 } = results.data
        if (success1 === 1) {
            const { due_dept_code } = data1[0]
            const duedepartment = JSON.parse(due_dept_code)
            const duedeptdetl = duedepartment.map((val) => {
                return { deptcode: val.deptcode, deptname: val.deptdesc, emp_id: em_id }
            })
            //inactive employee
            const result = await axioslogin.patch('/empmast/empmaster/Inactiveemp', postData)
            const { success } = result.data
            if (success === 2) {
                setCount(count + 1)
                const result = await axioslogin.post('/dueclearence', duedeptdetl)
                const { success } = result.data
                if (success === 1) {
                    succesNofity("Employee Inactivated")
                    setCount(count + 1)
                } else {
                    warningNofity("Error while Inactive")
                }
            }
        }
        else {
            warningNofity("Please Map Due Clearence Department for this department Section ")
        }
    }, [count])

    return (
        <CustomLayout title="Employee Inactive" displayClose={true} >
            <ToastContainer />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Paper variant="outlined" sx={{ width: '100%', p: 0.5, display: 'flex', flexDirection: 'row' }}  >
                    <Box sx={{ flex: 1, mt: 0.5, px: 0.3 }}>
                        <BranchSelectRedux value={branch} setValue={setBranch} />
                    </Box>
                    <Box sx={{ flex: 1, mt: 0.5, px: 0.3 }}>
                        <DeptSelectByRedux value={dept} setValue={setDept} />
                    </Box>
                    <Box sx={{ flex: 1, mt: 0.5, px: 0.3 }}>
                        <DeptSecSelectByRedux dept={dept} value={deptSect} setValue={setDeptSect} />
                    </Box>
                    <Box sx={{ mt: 0.2, pr: 0.2 }} >
                        <CssVarsProvider>
                            <Button
                                aria-label="Like"
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    getemployeedetails()
                                }}
                            >
                                <AddCircleOutlineIcon />
                            </Button>
                        </CssVarsProvider>
                    </Box>
                </Paper>
                <Paper square sx={{ pt: 1, mt: 0.5, display: 'flex', flexDirection: "column" }} >
                    <CommonAgGrid
                        columnDefs={column}
                        tableData={state === 1 ? empData : null}
                        sx={{
                            height: 400,
                            width: "100%"
                        }}
                        rowHeight={30}
                        headerHeight={30}
                    />
                </Paper>
            </Box>
        </CustomLayout>
    )
}

export default memo(EmployeeInactiveHR)
