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
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop'

const SalaryProcessed = () => {

    const dispatch = useDispatch();

    const [value, setValue] = useState(new Date());
    const [dept, setDeptartment] = useState(0)
    const [deptSection, setDeptSection] = useState(0)
    const [all, setAll] = useState(false)
    const [mainArray, setArray] = useState([])
    const [processBtn, setProcessBtn] = useState(false)
     const [openBkDrop, setOpenBkDrop] = useState(false)

    useEffect(() => {
        dispatch(setDepartment());
        dispatch(setDeptWiseSection());
        dispatch(setCommonSetting());
        dispatch(setDept())
        dispatch(getHolidayList());
    }, [dispatch])


    //Common settings
    const commonState = useSelector((state) => state?.getCommonSettings);
    const commonSettings = useMemo(() => commonState, [commonState]);
    const deptSect = useSelector((state) => state?.getDeptSectList?.deptSectionList)
    const departments = useSelector((state) => state?.getdept?.departmentlist)
    const allDept = useMemo(() => departments, [departments])
    const allSection = useMemo(() => deptSect, [deptSect])
    const holiday = useSelector((state) => state?.getHolidayList);
    const holidayList = useMemo(() => holiday, [holiday]);

    const onClickProcess = useCallback(async () => {
    setProcessBtn(true);
    setOpenBkDrop(true)
    try {
        if (!isValid(value) || value === null) {
            warningNofity("Invalid or empty date selected!");
            return;
        }

        const fromDate = format(startOfMonth(new Date(value)), 'yyyy-MM-dd');
        const toDate = format(endOfMonth(new Date(value)), 'yyyy-MM-dd');
        const totalDays = getDaysInMonth(new Date(value));

        const getEmpData = all === true
            ? {
                em_department: allDept?.map(val => val?.dept_id),
                em_dept_section: allSection?.map(val => val?.sect_id),
            }
            : {
                em_department: dept,
                em_dept_section: deptSection,
            };

        const empEndpoint = all
            ? "/payrollprocess/getAllEmployee"
            : "/payrollprocess/getEmpNoDeptWise";

        const result1 = await axioslogin.post(empEndpoint, getEmpData);
        const { succes, dataa: employeeData } = result1.data;

        if (succes !== 1 || !employeeData?.length) {
            warningNofity("No Employee Found for the selected filters.");
            setOpenBkDrop(false)
            return;

        }

        const empIds = employeeData?.map(val => val?.em_id);

        const postdata = { emp_id: empIds, from: fromDate, to: toDate };
        const result2 = await axioslogin.post("/payrollprocess/punchbiId", postdata);
        const { success, data } = result2.data;

        if (success !== 1 || !data?.length) {
            warningNofity("No Punch Details found.");
            setOpenBkDrop(false)
            return;
        }

        const finalDataArry = employeeData?.map((val) => {
                
            const empwise = data?.filter((entry) => entry?.emp_id === val?.em_id);

            const totalHD = empwise?.filter(val => ['HD', 'CHD', 'EGHD'].includes(val?.lvereq_desc))?.length || 0;
            const extranight = empwise?.filter(val =>
                val?.night_off_flag === 1 &&
                ['P', 'OHP', 'OBS', 'LC'].includes(val?.lvereq_desc)
            )?.length || 0;
  
            const totalnormalpresent = empwise?.filter(val =>
                val?.night_off_flag === 0 &&
                ['P', 'OHP', 'OBS', 'LC'].includes(val?.lvereq_desc)
            )?.length || 0;

            const totalDp = empwise?.filter(val => val?.lvereq_desc === 'DP')?.length || 0;
            const totaldpOff = empwise?.filter(val => val?.lvereq_desc === 'DOFF')?.length || 0;
            const totalWOFF = empwise?.filter(val => val?.lvereq_desc === 'WOFF')?.length || 0;

            const egWOFF = totalnormalpresent >= 24 ? commonSettings?.week_off_count :
                totalnormalpresent >= 18 ? commonSettings?.week_off_count - 1 :
                    totalnormalpresent >= 12 ? commonSettings?.week_off_count - 2 :
                        totalnormalpresent >= 6 ? commonSettings?.week_off_count - 3 :
                            (totalDp * 2) >= 24 ? commonSettings?.week_off_count :
                                (totalDp * 2) >= 18 ? commonSettings?.week_off_count - 1 :
                                    (totalDp * 2) >= 12 ? commonSettings?.week_off_count - 2 :
                                        (totalDp * 2) >= 6 ? commonSettings?.week_off_count - 3 :
                                            0;

            const extranightday=extranight>8?(extranight-8)*0.5:0

            const extraDp = totalDp === totaldpOff ? 0 : totalDp - totaldpOff;
            const presentDays = totalnormalpresent + (totalHD * 0.5) +  totalDp + totaldpOff + totalWOFF + (egWOFF - totalWOFF)+extranightday;
            const totallopCount = totalDays - presentDays;
            const onedaySalary = val?.gross_salary / totalDays;
            const paydaySalary = (val?.gross_salary / totalDays) * presentDays;

            return {
                em_no: val?.em_no,
                em_name: val?.em_name,
                branch_name: val?.branch_name,
                dept_name: val?.dept_name,
                sect_name: val?.sect_name,
                ecat_name: val?.ecat_name,
                inst_emp_type: val?.inst_emp_type,
                empSalary: val?.gross_salary,
                em_account_no: val?.em_account_no,
                totalDays,
                totallopCount,
                totalHD,

                eligibleWeekOff: egWOFF,
                takenWeekoff: totalWOFF,
                remainingOff: egWOFF - totalWOFF,

                totalDp,
                eligibledoff: totalDp,
                takendoff: totaldpOff,
                remainingDoff: extraDp,

                paydays: presentDays,
                lopAmount: Math.round((onedaySalary * totallopCount) / 10) * 10,
                totalSalary: Math.round(paydaySalary / 10) * 10,
            };
        });

        setArray(finalDataArry);
        setOpenBkDrop(false)
    } catch (error) {
        warningNofity("Something went wrong during processing.");
        setOpenBkDrop(false)
    }
}, [value, all, dept, deptSection, allDept, allSection, commonSettings]);


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

    const isValidDate = isValid(value) && value !== null;

    // Date Range helpers
    const fromDate = format(startOfMonth(new Date(value)), 'yyyy-MM-dd');
    const toDate = format(endOfMonth(new Date(value)), 'yyyy-MM-dd');
    const dateRange = eachDayOfInterval({ start: new Date(fromDate), end: new Date(toDate) })
        .map(e => format(new Date(e), 'yyyy-MM-dd'));

    // Helper to format employee data
    const formatEmployeeData = (punchData) => {
        const uniqueEmpNos = [...new Set(punchData?.map(e => e.em_no))];

        return uniqueEmpNos.map((el) => {
            const empArray = punchData.filter(e => e?.em_no === el);
            const empInfo = empArray.find(e => e?.em_no === el);

            return {
                em_no: empInfo?.em_no,
                em_name: empInfo?.em_name,
                dept_name: empInfo?.dept_name,
                sect_name: empInfo?.sect_name,
                arr: dateRange.map((date) => {
                    const attendance = empArray.find(em => em?.duty_day === date);
                    return {
                        attDate: date,
                        duty_date: attendance?.duty_date ?? date,
                        duty_status: attendance?.duty_status ?? 0,
                        em_name: attendance?.em_name ?? empInfo?.em_name,
                        em_no: attendance?.em_no ?? empInfo?.em_no,
                        emp_id: attendance?.emp_id ?? empInfo?.emp_id,
                        hld_desc: attendance?.hld_desc ?? null,
                        holiday_slno: attendance?.holiday_slno ?? 0,
                        holiday_status: attendance?.holiday_status ?? 0,
                        leave_status: attendance?.leave_status ?? 0,
                        duty_desc: attendance?.duty_desc ?? 'A',
                        lvereq_desc: attendance?.lvereq_desc ?? 'A',
                    };
                }),
            };
        });
    };

    // Excel Export Helper
    const exportToExcel = async (formattedData) => {
        const fileName = "Attendance_Report";

        const values = await DeptWiseAttendanceViewFun(fromDate, holidayList);

        const headers = ["Name", "Emp Id", "Department", "Department Section", ...values?.map(val => val?.date)];
        const days = ["Days", "", "", "", ...values?.map(val => val?.holiday === 1 ? val?.holidayDays?.toLowerCase() : val?.days)];

        const rows = formattedData?.map(row => [
            row?.em_name,
            row?.em_no,
            row?.dept_name,
            row?.sect_name,
            ...row?.arr.map(val => val?.lvereq_desc),
        ]);

        const excelData = [headers, days, ...rows];
        ExporttoExcel(excelData, fileName);
    };

    // Main Logic
    if (!processBtn) {
        warningNofity("Please Select Any Option!!");
        return;
    }

    try {
        let empDataResponse;

        if (all) {
            const deptArray = allDept?.map(val => val?.dept_id);
            const sectArray = allSection?.map(val => val?.sect_id);
            empDataResponse = await axioslogin.post("/payrollprocess/getAllEmployee", {
                em_department: deptArray,
                em_dept_section: sectArray,
            });
        } else {
            empDataResponse = await axioslogin.post("/payrollprocess/getEmpNoDeptWise", {
                em_department: dept,
                em_dept_section: deptSection,
            });
        }

        const { succes, dataa: employeeData } = empDataResponse.data;

        if (succes !== 1 || !isValidDate) {
            warningNofity(all ? "Error While Fetching data!" : "No Employee Under this Department || Department Section");
            return;
        }

        const emNoArray = employeeData?.map(emp => emp.em_no);
        const punchResponse = await axioslogin.post("/payrollprocess/getPunchmastData", {
            em_no: emNoArray,
            from: fromDate,
            to: toDate,
        });

        const { success, data: punchData } = punchResponse.data;

        if (success !== 1) {
            warningNofity("No Punch Details or Not a Valid date");
            return;
        }

        const formattedEmployeeData = formatEmployeeData(punchData);
        await exportToExcel(formattedEmployeeData);

    } catch (error) {
        warningNofity("An unexpected error occurred!");
    }
}, [value, all, dept, deptSection, allDept, allSection, processBtn, holidayList]);


    return (
        <ReportLayout title="Salary Reports" data={[column]} displayClose={true} >
             <CustomBackDrop open={openBkDrop} text="Please wait !. Salary information Updation In Process" />
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }} >
                <Box sx={{ mt: 1, ml: 0.5, display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', }}>
                    <Box sx={{ flex: 1, px: 0.5 }} >
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={['year', 'month']}
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