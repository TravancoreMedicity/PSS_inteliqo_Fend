import { Box, IconButton, Input, Tooltip, Typography } from '@mui/joy'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import ReportLayout from '../ReportComponent/ReportLayout';
import { Paper } from '@mui/material';
import DepartmentDropRedx from 'src/views/Component/ReduxComponent/DepartmentRedx';
import DepartmentSectionRedx from 'src/views/Component/ReduxComponent/DepartmentSectionRedx';
import CustomAgGridRptFormatOne from 'src/views/Component/CustomAgGridRptFormatOne';
import SectionBsdEmployee from 'src/views/Component/ReduxComponent/SectionBsdEmployee';
import { useDispatch } from 'react-redux';
import { setDepartment } from 'src/redux/actions/Department.action';
// import InputComponent from 'src/views/MuiComponents/JoyComponent/InputComponent';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import { infoNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { axioslogin } from 'src/views/Axios/Axios';
import { endOfMonth, format, formatDuration, intervalToDuration, isValid, } from 'date-fns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop';

const OvertimeReport = () => {


    const [deptName, setDepartmentName] = useState(0)
    const [deptSecName, setDepartSecName] = useState(0)
    const [emply, getEmployee] = useState({});
    // const [Empno, setEmpNo] = useState(0)
    const [openBkDrop, setOpenBkDrop] = useState(false)
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [tableData, setTableData] = useState([])

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setDepartment());
    }, [dispatch])


    const getEmployeeList = useCallback(async () => {
        setOpenBkDrop(true)
        if (deptName !== 0 && deptSecName !== 0 && emply?.em_id !== 0) {
            const postdata = {
                emp_id: [emply?.em_id],
                from: format(new Date(fromDate), 'yyyy-MM-dd'),
                to: format(new Date(toDate), 'yyyy-MM-dd'),
            }
            const result = await axioslogin.post("/payrollprocess/punchbiId", postdata);
            const { success, data } = result.data
            if (success === 1) {
                const finalDataArry = data?.map((val) => {
                    let interVal = intervalToDuration({
                        start: isValid(new Date(val.punch_in)) ? new Date(val.punch_in) : 0,
                        end: isValid(new Date(val.punch_out)) ? new Date(val.punch_out) : 0
                    })
                    let extrahours = val?.hrs_worked - val?.shift_duration_in_min
                    return {
                        em_no: val?.em_no,
                        em_name: val?.em_name,
                        shft_desc: val?.shft_desc,
                        shift_in: format(new Date(val.shift_in), 'HH:mm'),
                        shift_out: format(new Date(val.shift_out), 'HH:mm'),
                        punch_in: format(new Date(val.punch_in), 'HH:mm'),
                        punch_out: format(new Date(val.punch_out), 'HH:mm'),
                        hrs_worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                            formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                        extra_hour: extrahours <= 0 ? 0 : convertMinutesToHours(extrahours),
                    }
                })
                setTableData(finalDataArry)
                setOpenBkDrop(false)
            } else {
                warningNofity("No Punch Details or Not a Valid date")
                setOpenBkDrop(false)
            }
        } else {
            const getEmpData = {
                dept_id: deptName,
                sect_id: deptSecName,
            }
            //To get the emp details
            const result = await axioslogin.post('/empmast/getEmpDet', getEmpData)
            const { success, data: employeedata } = result.data
            if (success === 1 && employeedata?.length > 0) {

                const arr = employeedata?.map((val) => val.em_id)
                const postdata = {
                    emp_id: arr,
                    from: format(new Date(fromDate), 'yyyy-MM-dd'),
                    to: format(new Date(toDate), 'yyyy-MM-dd'),
                }
                const result = await axioslogin.post("/payrollprocess/punchbiId", postdata);
                const { success, data } = result.data
                if (success === 1) {
                    const finalDataArry = data?.map((val) => {

                        let interVal = intervalToDuration({
                            start: isValid(new Date(val.punch_in)) ? new Date(val.punch_in) : 0,
                            end: isValid(new Date(val.punch_out)) ? new Date(val.punch_out) : 0
                        })
                        let extrahours = val?.hrs_worked - val?.shift_duration_in_min
                        return {
                            em_no: val?.em_no,
                            em_name: val?.em_name,
                            shft_desc: val?.shft_desc,
                            shift_in: format(new Date(val.shift_in), 'HH:mm'),
                            shift_out: format(new Date(val.shift_out), 'HH:mm'),
                            punch_in: format(new Date(val.punch_in), 'HH:mm'),
                            punch_out: format(new Date(val.punch_out), 'HH:mm'),
                            hrs_worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                                formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                            extra_hour: extrahours <= 0 ? 0 : convertMinutesToHours(extrahours),
                        }
                    })
                    setTableData(finalDataArry)
                    setOpenBkDrop(false)
                } else {
                    warningNofity("No Punch Details or Not a Valid date")
                    setOpenBkDrop(false)
                }
            } else {
                setOpenBkDrop(false)
                infoNofity("No employee to show")
            }
        }
    }, [deptName, deptSecName, emply, fromDate, toDate])

    function convertMinutesToHours(minutes) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    }

    const [columnDef] = useState([
        { headerName: 'EmID', field: 'em_no', minWidth: 150, filter: true },
        { headerName: 'Name', field: 'em_name', autoHeight: true, wrapText: true, filter: true },
        { headerName: 'Shift', field: 'shft_desc', wrapText: true, },
        { headerName: 'Shift In', field: 'shift_in', wrapText: true, minWidth: 100 },
        { headerName: 'Shift Out', field: 'shift_out', wrapText: true, minWidth: 100 },
        { headerName: 'Punch In', field: 'punch_in', wrapText: true, minWidth: 100 },
        { headerName: 'Punch Out', field: 'punch_out', wrapText: true, minWidth: 100 },
        { headerName: 'Total Hours', field: 'hrs_worked', wrapText: true, minWidth: 100 },
        { headerName: 'Extra Hours', field: 'extra_hour', wrapText: true, minWidth: 100 }
    ])


    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", }} >
            <CustomBackDrop open={openBkDrop} text="Please wait !. Submitting COFF Request" />
            <ToastContainer />
            <ReportLayout title="Overtime Report" displayClose={true} data={[]} >
                <Paper sx={{ display: 'flex', flex: 1, flexDirection: 'column', }}>

                    <Box sx={{ mt: 1, ml: 0.5, display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', flexWrap: "wrap", gap: 0.5 }}>
                        <Box sx={{ flex: 1, px: 0.5 }}>
                            <DepartmentDropRedx getDept={setDepartmentName} />
                        </Box>
                        <Box sx={{ flex: 1, px: 0.5 }}>
                            <DepartmentSectionRedx getSection={setDepartSecName} />
                        </Box>
                        <Box sx={{ flex: 1, px: 0.5 }}>
                            <SectionBsdEmployee getEmploy={getEmployee} />
                        </Box>
                        <Tooltip title="Employee Number" followCursor placement='top' arrow>
                            {/* <Box sx={{ flex: 1, px: 0.5, }}>
                                <InputComponent
                                    type="number"
                                    size="sm"
                                    placeholder="Employee Number"
                                    name="Empno"
                                    value={Empno}
                                    onchange={(e) => setEmpNo(e.target.value)}
                                />
                            </Box> */}
                        </Tooltip>
                        <Box sx={{ display: 'flex', px: 0.5, alignItems: 'center' }} >
                            <Typography level="title-sm" variant="plain" flexGrow={1} paddingX={2} >From Date</Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    views={['day']}
                                    inputFormat="dd-MM-yyyy"
                                    value={fromDate}
                                    size="small"
                                    onChange={(newValue) => setFromDate(newValue)}
                                    renderInput={({ inputRef, inputProps, InputProps }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                            <Input ref={inputRef} {...inputProps} style={{ width: '80%' }} size='sm' disabled={true} color='primary' variant='outlined' />
                                            {InputProps?.endAdornment}
                                        </Box>
                                    )}
                                />
                            </LocalizationProvider>
                        </Box>

                        <Box sx={{ display: 'flex', px: 0.5, alignItems: 'center' }} >
                            <Typography level="title-sm" variant="plain" flexGrow={1} paddingX={2} >To Date</Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    views={['day']}
                                    inputFormat="dd-MM-yyyy"
                                    maxDate={endOfMonth(new Date(fromDate))}
                                    value={toDate}
                                    size="small"
                                    onChange={(newValue) => setToDate(newValue)}
                                    renderInput={({ inputRef, inputProps, InputProps }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                            <Input ref={inputRef} {...inputProps} style={{ width: '80%' }} size='sm' disabled={true} color='primary' />
                                            {InputProps?.endAdornment}
                                        </Box>
                                    )}
                                />
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ px: 0.2 }}>
                            <IconButton variant="outlined" size='md' color="primary"
                                onClick={getEmployeeList}
                            >
                                <PublishedWithChangesIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Paper square elevation={0} sx={{ p: 1, mt: 0.5, display: 'flex', flexDirection: "column", width: "100%" }} >
                        <CustomAgGridRptFormatOne
                            tableDataMain={tableData}
                            columnDefMain={columnDef}
                        />
                    </Paper>

                </Paper>
            </ReportLayout>
        </Box >

    )
}

export default memo(OvertimeReport)