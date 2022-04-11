import { IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Tooltip } from '@mui/material'
import React, { Fragment, useContext, useEffect, memo, Suspense } from 'react'
import Paper from '@mui/material/Paper';
import { useHistory } from 'react-router'
import CustomePagination from 'src/views/CommonCode/CustomePagination';
import PageLayoutProcess from 'src/views/CommonCode/PageLayoutProcess'
import TextInput from 'src/views/Component/TextInput'
import { FcPlus, FcCancel, FcProcess } from "react-icons/fc";
import { SELECT_CMP_STYLE } from 'src/views/Constant/Constant'
import DepartmentSelect from 'src/views/CommonCode/DepartmentSelect';
import DepartmentSectionSelect from 'src/views/CommonCode/DepartmentSectionSelect';
import { PayrolMasterContext } from 'src/Context/MasterContext';
import { useState } from 'react';
import { addDays, format, getMonth } from 'date-fns';
import moment from 'moment';
import PageLayoutCloseOnly from 'src/views/CommonCode/PageLayoutCloseOnly'
import { infoNofity, getDayDiffrence, succesNofity, errorNofity } from 'src/views/CommonCode/Commonfunc';
import { axioslogin } from 'src/views/Axios/Axios';
import EmployeeNameSelect from 'src/views/CommonCode/EmployeeNameSelect';
const ShiftTableDataRow = React.lazy(() => import('./ShiftUpdationTblRow'))

const ShiftUpdation = () => {
    //SET  POST DATA
    const history = useHistory()
    const [apiData, setApiData] = useState([]);
    const [year, setYear] = useState(new Date());
    //SHIFT TABLE CODE
    //SHIFT TABLE - pagination code
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [count, setcount] = useState(0)

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, rowsPerPage));
        setPage(0);
    };

    // GET FORM DATA
    const [formData, setFormData] = useState({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
    })





    const setchange = (e) => {

        //finding the dates between start date and end date
        setYear(e.target.value)
        const f1date = moment(e.target.value).startOf('month').format('yyyy-MM-DD');
        const enddate = moment(e.target.value).endOf('month').format('yyyy-MM-DD');
        setFormData({
            startDate: format(new Date(f1date), "yyyy-MM-dd"),
            endDate: format(new Date(enddate), "yyyy-MM-dd"),
        })
    }
    const { startDate, endDate } = formData;
    const maxdate = addDays(new Date(startDate), 30);
    const maxdatee = moment(maxdate).format('YYYY-MM-DD');

    useEffect(() => {
        //get days diffrence for the page pagination
        const x = moment(startDate);
        const y = moment(endDate);
        const daysDiff = getDayDiffrence(x, y);
        const rows = daysDiff === 0 ? 0 : daysDiff + 1;
        setRowsPerPage(rows)
        // setDays(daysDiff)
    }, [startDate, endDate, apiData])
    const {
        selectedDept,
        selectDeptSection,
        selectEmpName
    } = useContext(PayrolMasterContext)

    // Get the attendance data from the database 
    const getPunchDetl = async () => {

        displayleave()
        if (selectedDept !== 0 && selectDeptSection !== 0 && selectEmpName === 0) {
            const deptDetl = {
                startDate: startDate,
                endDate: endDate,
                department: selectedDept,
                departmentSec: selectDeptSection,
                cmpCode: 1,
                emp_code: selectEmpName
            }
            if (Object.keys(deptDetl).length > 1) {
                const result = await axioslogin.post("/attendCal", deptDetl);
                const { success, data } = result.data;
                if (success === 1) {
                    if (data.length !== 0) {
                        setApiData(data)
                        setcount(count + 1)
                    }
                    else {
                        setApiData(data)
                        setcount(count + 1)
                        infoNofity("Please Do the Shift Marking")
                    }

                }

                if (success === 0) {
                    infoNofity("Please Do the Shift Marking")
                    setcount(count + 1)
                }
            }

        } else if (selectedDept !== 0 && selectDeptSection !== 0 && selectEmpName !== 0) {
            const deptDetl = {
                startDate: startDate,
                endDate: endDate,
                department: selectedDept,
                departmentSec: selectDeptSection,
                empName: selectEmpName,
                cmpCode: 1,
                emp_code: selectEmpName
            }

            if (Object.keys(deptDetl).length > 1) {
                const result = await axioslogin.post("/attendCal", deptDetl);
                const { success, data } = result.data;
                if (success === 1) {
                    if (data.length !== 0) {
                        setApiData(data)
                        setcount(count + 1)
                    }
                    else {
                        setApiData(data)
                        infoNofity("Please Do the Shift Marking")
                        setcount(count + 1)
                    }

                }

                if (success === 0) {
                    infoNofity("Please Do the Shift Marking")
                }
            }
            // const result = await axioslogin.post("/attendCal", deptDetl);
        } else {
            setApiData([])
            infoNofity("AtLeast Department & Section is Required");
        }
    }
    //processing  leave first credit the leave of the current month
    const displayleave = async () => {

        const selempdata = {

            em_department: selectedDept,
            em_dept_section: selectDeptSection,

        }
        const result = await axioslogin.post('/empmast/getempName/', selempdata)
        const { success, data } = result.data

        const empdata = data.map((val) => {
            return val.em_id

        })

        const result2 = await axioslogin.post('/common/getCasualeavearry/', empdata)


        if (result2.data.success === 1) {
            const leaveMonth = getMonth(new Date())
            const casual = result2.data.data.filter((val) => {

                return val.cl_lv_mnth === leaveMonth
            })
            if (casual.length !== 0) {
                const { hrm_cl_slno } = casual[0]
                const postdata = {
                    hrm_cl_slno: hrm_cl_slno
                }


                const result = await axioslogin.patch('/yearleaveprocess/creditcasual', postdata)



            }
        }
    }

    //Process and Get Attendance data from the database
    const processPunchdetl = async () => {

        setApiData([])
        if (selectedDept !== 0 && selectDeptSection !== 0 && selectEmpName === 0) {
            const deptDetl = {
                startDate: startDate,
                endDate: endDate,
                department: selectedDept,
                departmentSec: selectDeptSection,
                cmpCode: 1,
                emp_code: selectEmpName
            }
            if (Object.keys(deptDetl).length > 1) {

                const result = await axioslogin.post("/attendCal/proc", deptDetl)

                const { success } = result.data;
                if (success === 1) {
                    const result = await axioslogin.post("/attendCal/attendancecal", deptDetl)
                    const { success, data } = result.data;

                    if (success === 1) {
                        const resultcalc = await axioslogin.post("/attendCal/getdataupdatecal", deptDetl);

                        if (resultcalc.data.success === 1) {
                            const result = await axioslogin.post("/attendCal", deptDetl);
                            const { success, data } = result.data;
                            if (success === 1) {
                                if (data.length !== 0) {
                                    setApiData(data)
                                    setcount(count + 1)
                                }
                                else {
                                    setApiData(data)
                                    infoNofity("Please Do the Shift Marking")
                                    setcount(count + 1)
                                }

                            }

                            if (success === 0) {
                                infoNofity("Please Do the Shift Marking")
                            }

                        } else {
                            errorNofity('Please Contact')
                        }
                    } else {
                        setcount(count + 1)
                        errorNofity('Please Contact')
                    }


                }

                if (success === 0) {
                    setcount(count + 1)
                    infoNofity("Please Do the Shift Marking")
                }
            }

        } else if (selectedDept !== 0 && selectDeptSection !== 0 && selectEmpName !== 0) {
            const deptDetl = {
                startDate: startDate,
                endDate: endDate,
                department: selectedDept,
                departmentSec: selectDeptSection,
                empName: selectEmpName,
                cmpCode: 1,
                emp_code: selectEmpName
            }

            if (Object.keys(deptDetl).length > 1) {

                const result = await axioslogin.post("/attendCal/proc", deptDetl)

                const { success } = result.data;
                if (success === 1) {
                    const result = await axioslogin.post("/attendCal/attendancecal", deptDetl)

                    const { success } = result.data;

                    if (success === 1) {
                        const resultcalc = await axioslogin.post("/attendCal/getdataupdatecal", deptDetl);

                        if (resultcalc.data.success === 1) {
                            const result = await axioslogin.post("/attendCal", deptDetl);
                            const { success, data } = result.data;
                            if (success === 1) {
                                if (data.length !== 0) {
                                    setApiData(data)
                                    setcount(count + 1)
                                }
                                else {
                                    setApiData(data)
                                    infoNofity("Please Do the Shift Marking")
                                    setcount(count + 1)
                                }

                            }

                            if (success === 0) {
                                infoNofity("Please Do the Shift Marking")
                            }

                        } else {
                            errorNofity('Please Contact')
                        }


                    } else {
                        setcount(count + 1)
                        errorNofity('Please Contact')
                    }



                }

                if (success === 0) {
                    infoNofity("Please Do the Shift Marking")
                }
            }
        } else {
            setApiData([])
            infoNofity("AtLeast Department & Section is Required");
        }

    }
    //redirecting to profile page
    const redirecting = () => {

        history.push('/Home')
    }
    return (
        <Fragment>
            <PageLayoutCloseOnly
                heading="Attendance Marking" redirect={redirecting}>
                <div className="col-md-12 mb-2">
                    <div className="row g-2">
                        <div className="col-md-2">
                            <div className="col-md-12">
                                <TextInput
                                    type="month"
                                    classname="form-control form-control-sm"
                                    Placeholder="Arrived Time"
                                    changeTextValue={(e) => {

                                        setchange(e)

                                    }}
                                    value={year}
                                    name="monthwise"
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <DepartmentSelect select="Department" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-2">
                            <DepartmentSectionSelect select="Department" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-2">
                            <EmployeeNameSelect select="Department Section" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-1">
                            <div className='d-flex justify-content-evenly' >
                                <div>
                                    <Tooltip title="Search" placement="top" arrow>
                                        <IconButton
                                            aria-label="add"
                                            style={{ padding: '0rem' }}
                                            onClick={getPunchDetl}
                                        >
                                            <FcPlus className="text-info" size={30} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip title="Process" placement="top" arrow>
                                        <IconButton
                                            aria-label="add"
                                            style={{ padding: '0rem' }}
                                            onClick={processPunchdetl}
                                        >
                                            <FcProcess className="text-info" size={30} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip title="Back To Home" placement="top" arrow>
                                        <IconButton
                                            aria-label="add"
                                            style={{ padding: '0rem' }}
                                        >
                                            <FcCancel className="text-info" size={30} />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">

                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                            <TableHead>
                                <TableRow style={{ backgroundColor: "#a2a3ac", height: '1rem' }} >
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '6rem', }}>Date</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '6rem', }}>Emp No</TableCell>
                                    <TableCell align="center" colSpan={2} className="p-0" style={{ width: '8rem', }}>Shift Time</TableCell>
                                    <TableCell align="center" colSpan={2} className="p-0" style={{ width: '8rem', }}>Punch Data</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '6rem', }}>Hrs Worked</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '4rem', }}>OT (min)</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '4rem', }}>L-IN(min)</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '4rem', }}>E-GO(min)</TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '1rem', }}></TableCell>
                                    <TableCell align="center" rowSpan={2} className="p-0" style={{ width: '1rem', }}></TableCell>
                                </TableRow>
                                <TableRow style={{ backgroundColor: "#a2a3ac", height: '1rem' }} >
                                    {/* <TableCell>Date</TableCell> */}
                                    <TableCell align="center" style={{ padding: 0, width: '2rem' }}>In Time</TableCell>
                                    <TableCell align="center" style={{ padding: 0, width: '2rem' }}>Out Time</TableCell>
                                    <TableCell align="center" style={{ padding: 0, width: '2rem' }}>In Time</TableCell>
                                    <TableCell align="center" style={{ padding: 0, width: '2rem' }}>Out Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {
                                    (rowsPerPage > 0
                                        ? apiData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : apiData
                                    ).map((val, index) => {
                                        return <ShiftTableDataRow val={val} key={index} count={count} />
                                    })
                                }


                            </TableBody>
                            <TableFooter>
                                <TableRow hover={true} >
                                    <CustomePagination
                                        data={apiData}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        handleChangePage={handleChangePage}
                                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                                    />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </div>
            </PageLayoutCloseOnly>
        </Fragment>
    )
}

export default memo(ShiftUpdation)
