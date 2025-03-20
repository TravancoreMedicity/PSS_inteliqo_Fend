import { Box, Button, CssVarsProvider, Input } from '@mui/joy'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { addMonths, eachDayOfInterval, endOfMonth, format, getDaysInMonth, isValid, startOfMonth, } from 'date-fns'
import React, { memo, useMemo, useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import DepartmentDropRedx from 'src/views/Component/ReduxComponent/DepartmentRedx';
import DepartmentSectionRedx from 'src/views/Component/ReduxComponent/DepartmentSectionRedx';
import { setDepartment } from 'src/redux/actions/Department.action';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { useCallback } from 'react'
import { axioslogin } from 'src/views/Axios/Axios'
import JoyCheckbox from 'src/views/MuiComponents/JoyComponent/JoyCheckbox'
import { setCommonSetting } from 'src/redux/actions/Common.Action'
import { warningNofity } from 'src/views/CommonCode/Commonfunc'
import ReportLayout from 'src/views/HrReports/ReportComponent/ReportLayout'
import { Paper } from '@mui/material'
import SalaryReportAgGrid from 'src/views/Component/SalaryReportAgGrid'
import { setDeptWiseSection } from 'src/redux/actions/DepartmentSection.Action'
import { setDept } from 'src/redux/actions/Dept.Action'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DeptWiseAttendanceViewFun } from '../AttendanceView/Functions'
import { getHolidayList } from 'src/redux/actions/LeaveProcess.action'
import { ExporttoExcel } from 'src/views/HrReports/DayWiseAttendence/ExportToExcel'

const SalaryProcessed = () => {

    const dispatch = useDispatch();

    const [value, setValue] = useState(new Date());
    const [dept, setDeptartment] = useState(0)
    const [deptSection, setDeptSection] = useState(0)
    const [all, setAll] = useState(false)
    const [mainArray, setArray] = useState([])
    const [processBtn, setProcessBtn] = useState(false)

    useEffect(() => {
        dispatch(setDepartment());
        dispatch(setDeptWiseSection());
        dispatch(setCommonSetting());
        dispatch(setDept())
        dispatch(getHolidayList());
    }, [dispatch])


    //Common settings
    const commonState = useSelector((state) => state.getCommonSettings);
    const commonSettings = useMemo(() => commonState, [commonState]);
    const deptSect = useSelector((state) => state?.getDeptSectList?.deptSectionList)
    const departments = useSelector((state) => state?.getdept?.departmentlist)
    const allDept = useMemo(() => departments, [departments])
    const allSection = useMemo(() => deptSect, [deptSect])
    const holiday = useSelector((state) => state.getHolidayList);
    const holidayList = useMemo(() => holiday, [holiday]);

    const onClickProcess = useCallback(async () => {
        setProcessBtn(true)
        if (all === true) {
            const deptArray = allDept?.map(val => val.dept_id)
            const sectArray = allSection?.map(val => val.sect_id)
            const getEmpData = {
                em_department: deptArray,
                em_dept_section: sectArray,
            }
            const result1 = await axioslogin.post("/payrollprocess/getAllEmployee", getEmpData);
            const { succes, dataa: employeeData } = result1.data
            if (succes === 1 && isValid(value) && value !== null) {
                const arr = employeeData && employeeData.map((val) => val.em_id)
                const postdata = {
                    emp_id: arr,
                    from: format(startOfMonth(new Date(value)), 'yyyy-MM-dd'),
                    to: format(endOfMonth(new Date(value)), 'yyyy-MM-dd'),
                }
                const result = await axioslogin.post("/payrollprocess/punchbiId", postdata);
                const { success, data } = result.data
                if (success === 1) {
                    const finalDataArry = employeeData?.map((val) => {
                        const empwise = data.filter((value) => value.emp_id === val.em_id)
                        const totalHD = (empwise?.filter(val => val.lvereq_desc === 'HD' || val.lvereq_desc === 'CHD' || val.lvereq_desc === 'EGHD')).length
                        const totalWork = (empwise?.filter(val => val.lvereq_desc === 'P' || val.lvereq_desc === 'OHP' || val.lvereq_desc === 'OBS'
                            || val.lvereq_desc === 'LC')).length
                        const totalOff = (empwise?.filter(val => val.lvereq_desc === 'WOFF' || val.lvereq_desc === 'NOFF' || val.lvereq_desc === 'EOFF')).length

                        const totalWOFF = (empwise?.filter(val => val.lvereq_desc === 'WOFF')).length

                        const totalDp = (empwise?.filter(val => val.lvereq_desc === 'DP')).length
                        const totaldpOff = (empwise?.filter(val => val.lvereq_desc === 'DOFF')).length

                        const onedaySalary = val.gross_salary / getDaysInMonth(new Date(value))

                        const extraDp = totalDp === totaldpOff ? 0 : totalDp - totaldpOff;

                        const totalDays = getDaysInMonth(new Date(value))
                        const presentDays = totalWork + (totalHD * 0.5) + totalOff + (totalDp * 2)
                        const totallopCount = getDaysInMonth(new Date(value)) - presentDays;
                        const paydaySalay = (val.gross_salary / totalDays) * presentDays

                        const egWOFF = presentDays >= 24 ? commonSettings?.week_off_count :
                            presentDays < 24 && presentDays >= 18 ? commonSettings?.week_off_count - 1 :
                                presentDays < 18 && presentDays >= 12 ? commonSettings?.week_off_count - 2 :
                                    presentDays < 12 && presentDays >= 6 ? commonSettings?.week_off_count - 3 : 0


                        return {
                            em_no: val.em_no,
                            em_name: val.em_name,
                            branch_name: val.branch_name,
                            dept_name: val.dept_name,
                            sect_name: val.sect_name,
                            ecat_name: val.ecat_name,
                            inst_emp_type: val.inst_emp_type,
                            empSalary: val.gross_salary,
                            em_account_no: val.em_account_no,
                            totalDays: getDaysInMonth(new Date(value)),
                            totallopCount: totallopCount,
                            totalHD: totalHD,
                            eligibleWeekOff: egWOFF,
                            takenWeekoff: totalWOFF,
                            remainingOff: egWOFF - totalWOFF,
                            totalDp: totalDp,
                            eligibledoff: totalDp,
                            takendoff: totaldpOff,
                            remainingDoff: extraDp,
                            paydays: presentDays,
                            lopAmount: Math.round((onedaySalary * totallopCount) / 10) * 10,
                            totalSalary: Math.round(paydaySalay / 10) * 10,
                        }
                    })
                    setArray(finalDataArry)
                }
                else {
                    warningNofity("No Punch Details")
                }
            } else {
                warningNofity("Error While Fetching data!")
            }

        } else {
            const getEmpData = {
                em_department: dept,
                em_dept_section: deptSection,
            }
            const result1 = await axioslogin.post("/payrollprocess/getEmpNoDeptWise", getEmpData);
            const { succes, dataa: employeeData } = result1.data
            if (succes === 1 && isValid(value) && value !== null) {

                const arr = employeeData?.map((val) => val.em_id)
                const postdata = {
                    emp_id: arr,
                    from: format(startOfMonth(new Date(value)), 'yyyy-MM-dd'),
                    to: format(endOfMonth(new Date(value)), 'yyyy-MM-dd'),
                }
                const result = await axioslogin.post("/payrollprocess/punchbiId", postdata);
                const { success, data } = result.data
                if (success === 1) {

                    const finalDataArry = employeeData?.map((val) => {
                        const empwise = data.filter((value) => value.emp_id === val.em_id)
                        const totalHD = (empwise?.filter(val => val.lvereq_desc === 'HD' || val.lvereq_desc === 'CHD' || val.lvereq_desc === 'EGHD')).length
                        const totalWork = (empwise?.filter(val => val.lvereq_desc === 'P' || val.lvereq_desc === 'OHP' || val.lvereq_desc === 'OBS'
                            || val.lvereq_desc === 'LC')).length
                        const totalOff = (empwise?.filter(val => val.lvereq_desc === 'WOFF' || val.lvereq_desc === 'NOFF' || val.lvereq_desc === 'EOFF')).length

                        const totalWOFF = (empwise?.filter(val => val.lvereq_desc === 'WOFF')).length

                        const totalDp = (empwise?.filter(val => val.lvereq_desc === 'DP')).length
                        const totaldpOff = (empwise?.filter(val => val.lvereq_desc === 'DOFF')).length

                        const onedaySalary = val.gross_salary / getDaysInMonth(new Date(value))

                        const extraDp = totalDp === totaldpOff ? 0 : totalDp - totaldpOff;

                        const totalDays = getDaysInMonth(new Date(value))
                        const presentDays = totalWork + (totalHD * 0.5) + totalOff + (totalDp * 2)
                        const totallopCount = getDaysInMonth(new Date(value)) - presentDays;
                        const paydaySalay = (val.gross_salary / totalDays) * presentDays

                        const egWOFF = presentDays >= 24 ? commonSettings?.week_off_count :
                            presentDays < 24 && presentDays >= 18 ? commonSettings?.week_off_count - 1 :
                                presentDays < 18 && presentDays >= 12 ? commonSettings?.week_off_count - 2 :
                                    presentDays < 12 && presentDays >= 6 ? commonSettings?.week_off_count - 3 : 0


                        return {
                            em_no: val.em_no,
                            em_name: val.em_name,
                            branch_name: val.branch_name,
                            dept_name: val.dept_name,
                            sect_name: val.sect_name,
                            ecat_name: val.ecat_name,
                            inst_emp_type: val.inst_emp_type,
                            empSalary: val.gross_salary,
                            em_account_no: val.em_account_no,
                            totalDays: getDaysInMonth(new Date(value)),
                            totallopCount: totallopCount,
                            totalHD: totalHD,
                            eligibleWeekOff: egWOFF,
                            takenWeekoff: totalWOFF,
                            remainingOff: egWOFF - totalWOFF,
                            totalDp: totalDp,
                            eligibledoff: totalDp,
                            takendoff: totaldpOff,
                            remainingDoff: extraDp,
                            paydays: presentDays,
                            lopAmount: Math.round((onedaySalary * totallopCount) / 10) * 10,
                            totalSalary: Math.round(paydaySalay / 10) * 10,
                        }
                    })
                    setArray(finalDataArry)
                } else {
                    warningNofity("No Punch Details or Not a Valid date")
                }
            } else {
                warningNofity("No Employee Under this Department || Department Section")
            }
        }
    }, [value, all, dept, deptSection, commonSettings])

    const [column] = useState([
        { headerName: 'ID', field: 'em_no' },
        { headerName: 'Name ', field: 'em_name' },
        { headerName: 'Branch', field: 'branch_name' },
        { headerName: 'Department', field: 'dept_name', minWidth: 250 },
        { headerName: 'Department Section ', field: 'sect_name', minWidth: 250 },
        { headerName: 'Category ', field: 'ecat_name', minWidth: 250 },
        { headerName: 'Institution ', field: 'inst_emp_type', minWidth: 250 },
        { headerName: 'Gross Salary ', field: 'empSalary' },
        { headerName: 'Account Number', field: 'em_account_no' },
        { headerName: 'Total Days ', field: 'totalDays' },
        { headerName: 'No Of Half Day LOP(HD)', field: 'totalHD', minWidth: 250 },
        { headerName: 'Total LOP', field: 'totallopCount' },
        { headerName: 'Eligible WOFF', field: 'eligibleWeekOff' },
        { headerName: 'Taken WOFF', field: 'takenWeekoff' },
        { headerName: 'Remaining WOFF', field: 'remainingOff' },
        { headerName: 'Total DP', field: 'totalDp' },
        { headerName: 'Eligible DOFF', field: 'eligibledoff' },
        { headerName: 'Taken DOFF', field: 'takendoff' },
        { headerName: 'Remaining DOFF', field: 'remainingDoff' },
        { headerName: 'Total Pay Day', field: 'paydays' },
        { headerName: 'LOP Amount ', field: 'lopAmount' },
        { headerName: 'Total Salary', field: 'totalSalary' },
    ])

    const downloadFormat = useCallback(async () => {

        if (processBtn === false) {
            warningNofity("Please Select Any Option!!")
        }
        else if (processBtn === true && all === true) {
            const deptArray = allDept?.map(val => val.dept_id)
            const sectArray = allSection?.map(val => val.sect_id)
            const getEmpData = {
                em_department: deptArray,
                em_dept_section: sectArray,
            }
            const result1 = await axioslogin.post("/payrollprocess/getAllEmployee", getEmpData);
            const { succes, dataa: employeeData } = result1.data
            if (succes === 1 && isValid(value) && value !== null) {

                const arr = employeeData?.map((val) => val.em_no)
                const postdata = {
                    em_no: arr,
                    from: format(startOfMonth(new Date(value)), 'yyyy-MM-dd'),
                    to: format(endOfMonth(new Date(value)), 'yyyy-MM-dd'),
                }
                const result = await axioslogin.post("/payrollprocess/getPunchmastData", postdata);
                const { success, data: punchMasteData } = result.data
                if (success === 1) {

                    const dateRange = eachDayOfInterval({ start: new Date(startOfMonth(new Date(value))), end: new Date(endOfMonth(new Date(value))) })
                        ?.map(e => format(new Date(e), 'yyyy-MM-dd'));

                    const resultss = [...new Set(punchMasteData?.map(e => e.em_no))]?.map((el) => {
                        const empArray = punchMasteData?.filter(e => e.em_no === el)
                        let emName = empArray?.find(e => e.em_no === el).em_name;
                        let emNo = empArray?.find(e => e.em_no === el).em_no;
                        let emId = empArray?.find(e => e.em_no === el).emp_id;
                        let deptName = empArray?.find(e => e.em_no === el).dept_name;
                        let sectName = empArray?.find(e => e.em_no === el).sect_name;

                        return {
                            em_no: el,
                            em_name: emName,
                            dept_name: deptName,
                            sect_name: sectName,
                            arr: dateRange?.map((e) => {
                                return {
                                    attDate: e,
                                    duty_date: empArray?.find(em => em.duty_day === e)?.duty_date ?? e,
                                    duty_status: empArray?.find(em => em.duty_day === e)?.duty_status ?? 0,
                                    em_name: empArray?.find(em => em.duty_day === e)?.em_name ?? emName,
                                    em_no: empArray?.find(em => em.duty_day === e)?.em_no ?? emNo,
                                    emp_id: empArray?.find(em => em.duty_day === e)?.emp_id ?? emId,
                                    hld_desc: empArray?.find(em => em.duty_day === e)?.hld_desc ?? null,
                                    holiday_slno: empArray?.find(em => em.duty_day === e)?.holiday_slno ?? 0,
                                    holiday_status: empArray?.find(em => em.duty_day === e)?.holiday_status ?? 0,
                                    leave_status: empArray?.find(em => em.duty_day === e)?.leave_status ?? 0,
                                    duty_desc: empArray?.find(em => em.duty_day === e)?.duty_desc ?? 'A',
                                    lvereq_desc: empArray?.find(em => em.duty_day === e)?.lvereq_desc ?? 'A',
                                }
                            }),
                        }
                    })

                    DeptWiseAttendanceViewFun(format(startOfMonth(new Date(value)), 'yyyy-MM-dd'), holidayList).then((values) => {
                        const fileName = "Attendance_Report";
                        const headers = ["Name", "Emp Id", "Department", "Department Section", ...values.map(val => val.date)];
                        const days = ["Days", "", "", "", ...values.map(val => val.holiday === 1 ? val.holidayDays.toLowerCase() : val.days)];
                        // Rows for Excel file
                        const rows = resultss.map(row => {
                            const rowData = [
                                row.em_name,
                                row.em_no,
                                row.dept_name,
                                row.sect_name,
                                ...row.arr.map(val => val.lvereq_desc)
                            ];
                            return rowData;
                        });

                        // Prepare data for Excel export
                        const excelData = [headers, days, ...rows];

                        // Call ExporttoExcel function
                        ExporttoExcel(excelData, fileName);

                    })
                } else {
                    warningNofity("No Punch Details or Not a Valid date")
                }
            } else {
                warningNofity("Error While Fetching data!")
            }

        } else {
            const getEmpData = {
                em_department: dept,
                em_dept_section: deptSection,
            }
            const result1 = await axioslogin.post("/payrollprocess/getEmpNoDeptWise", getEmpData);
            const { succes, dataa: employeeData } = result1.data
            if (succes === 1 && isValid(value) && value !== null) {


                const arr = employeeData?.map((val) => val.em_no)
                const postdata = {
                    em_no: arr,
                    from: format(startOfMonth(new Date(value)), 'yyyy-MM-dd'),
                    to: format(endOfMonth(new Date(value)), 'yyyy-MM-dd'),
                }
                const result = await axioslogin.post("/payrollprocess/getPunchmastData", postdata);
                const { success, data: punchMasteData } = result.data
                if (success === 1) {

                    const dateRange = eachDayOfInterval({ start: new Date(startOfMonth(new Date(value))), end: new Date(endOfMonth(new Date(value))) })
                        ?.map(e => format(new Date(e), 'yyyy-MM-dd'));

                    const resultss = [...new Set(punchMasteData?.map(e => e.em_no))]?.map((el) => {
                        const empArray = punchMasteData?.filter(e => e.em_no === el)
                        let emName = empArray?.find(e => e.em_no === el).em_name;
                        let emNo = empArray?.find(e => e.em_no === el).em_no;
                        let emId = empArray?.find(e => e.em_no === el).emp_id;
                        let deptName = empArray?.find(e => e.em_no === el).dept_name;
                        let sectName = empArray?.find(e => e.em_no === el).sect_name;

                        return {
                            em_no: el,
                            em_name: emName,
                            dept_name: deptName,
                            sect_name: sectName,
                            arr: dateRange?.map((e) => {

                                return {
                                    attDate: e,
                                    duty_date: empArray?.find(em => em.duty_day === e)?.duty_date ?? e,
                                    duty_status: empArray?.find(em => em.duty_day === e)?.duty_status ?? 0,
                                    em_name: empArray?.find(em => em.duty_day === e)?.em_name ?? emName,
                                    em_no: empArray?.find(em => em.duty_day === e)?.em_no ?? emNo,
                                    emp_id: empArray?.find(em => em.duty_day === e)?.emp_id ?? emId,
                                    hld_desc: empArray?.find(em => em.duty_day === e)?.hld_desc ?? null,
                                    holiday_slno: empArray?.find(em => em.duty_day === e)?.holiday_slno ?? 0,
                                    holiday_status: empArray?.find(em => em.duty_day === e)?.holiday_status ?? 0,
                                    leave_status: empArray?.find(em => em.duty_day === e)?.leave_status ?? 0,
                                    duty_desc: empArray?.find(em => em.duty_day === e)?.duty_desc ?? 'A',
                                    lvereq_desc: empArray?.find(em => em.duty_day === e)?.lvereq_desc ?? 'A',
                                }
                            }),
                        }
                    })



                    DeptWiseAttendanceViewFun(format(startOfMonth(new Date(value)), 'yyyy-MM-dd'), holidayList).then((values) => {
                        const fileName = "Attendance_Report";
                        const headers = ["Name", "Emp Id", "Department", "Department Section", ...values.map(val => val.date)];
                        const days = ["Days", "", "", "", ...values.map(val => val.holiday === 1 ? val.holidayDays.toLowerCase() : val.days)];
                        // Rows for Excel file
                        const rows = resultss.map(row => {
                            const rowData = [
                                row.em_name,
                                row.em_no,
                                row.dept_name,
                                row.sect_name,
                                ...row.arr.map(val => val.lvereq_desc)
                            ];
                            return rowData;
                        });

                        // Prepare data for Excel export
                        const excelData = [headers, days, ...rows];

                        // Call ExporttoExcel function
                        ExporttoExcel(excelData, fileName);

                    })
                } else {
                    warningNofity("No Punch Details or Not a Valid date")
                }
            } else {
                warningNofity("No Employee Under this Department || Department Section")
            }
        }
    }, [value, all, dept, deptSection, allDept, allSection, processBtn, holidayList])


    return (
        <ReportLayout title="Salary Reports" data={[column]} displayClose={true} >
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }} >
                <Box sx={{ mt: 1, ml: 0.5, display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', }}>
                    <Box sx={{ flex: 1, px: 0.5 }} >
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={['year', 'month']}
                                // minDate={subMonths(new Date(), 1)}
                                maxDate={addMonths(new Date(), 1)}
                                value={value}
                                onChange={(newValue) => {
                                    setValue(newValue);
                                }}
                                renderInput={({ inputRef, inputProps, InputProps }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                        <CssVarsProvider>
                                            <Input ref={inputRef} {...inputProps} style={{ width: '80%' }} disabled={true} />
                                        </CssVarsProvider>
                                        {InputProps?.endAdornment}
                                    </Box>
                                )}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box sx={{ flex: 1, px: 0.3, }} >
                        <DepartmentDropRedx getDept={setDeptartment} />
                    </Box>
                    <Box sx={{ flex: 1, px: 0.3, }} >
                        <DepartmentSectionRedx getSection={setDeptSection} />
                    </Box>
                    <Box sx={{ px: 0.3, mt: 1 }} >
                        <JoyCheckbox
                            label='All'
                            name="all"
                            checked={all}
                            onchange={(e) => setAll(e.target.checked)}
                        />
                    </Box>
                    <Box sx={{ px: 1, display: 'flex', flex: { xs: 0, sm: 0, md: 0, lg: 0, xl: 1, }, justifyContent: 'flex-start' }} >
                        <CssVarsProvider>
                            <Button aria-label="Like" variant="outlined" color='success'
                                sx={{
                                    // color: '#90caf9'
                                }}
                                startDecorator={<RotateRightIcon />}
                                endDecorator={'Process'}
                                onClick={onClickProcess}
                            >

                            </Button>
                        </CssVarsProvider>
                    </Box>
                    <Box sx={{ px: 1, display: 'flex', flex: { xs: 0, sm: 0, md: 0, lg: 0, xl: 1, }, justifyContent: 'flex-start' }} >
                        <CssVarsProvider>
                            <Button aria-label="Like" variant="outlined" color='primary'
                                sx={{
                                    // color: '#90caf9'
                                }}
                                startDecorator={<ArrowDownwardIcon />}
                                endDecorator={'Download Attendance Format'}
                                onClick={downloadFormat}
                            >

                            </Button>
                        </CssVarsProvider>
                    </Box>
                </Box>
                <Paper
                    square
                    elevation={0}
                    sx={{
                        p: 1, mt: 0.5,
                        display: 'flex',
                        backgroundColor: '#f0f3f5',
                        flexDirection: "column",
                    }}  >
                    <SalaryReportAgGrid
                        tableDataMain={mainArray}
                        columnDefMain={column}
                        sx={{
                            height: 470,
                            width: "100%"
                        }}
                    />
                </Paper>
            </Box>
        </ReportLayout>
    )
}

export default memo(SalaryProcessed) 