import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Box, IconButton, CssVarsProvider, Typography, Input } from '@mui/joy'
import { ToastContainer } from 'react-toastify';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Paper } from '@mui/material'
import { useHistory } from 'react-router-dom';
import DepartmentDropRedx from 'src/views/Component/ReduxComponent/DepartmentRedx';
import DepartmentSectionRedx from 'src/views/Component/ReduxComponent/DepartmentSectionRedx';
import { setDepartment } from 'src/redux/actions/Department.action';
import { useDispatch, useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import moment from 'moment';
import { setCommonSetting } from 'src/redux/actions/Common.Action';
import { setShiftDetails } from 'src/redux/actions/Shift.Action';
import { getAttendanceCalculation, getBreakDutyLateInTimeIntervel, getLateInTimeIntervel, } from 'src/views/Attendance/PunchMarkingHR/punchMarkingHrFunc';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import { infoNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { addDays, addHours, differenceInHours, format, endOfMonth, isValid, max, min, subHours, formatDuration, intervalToDuration } from "date-fns";
import { axioslogin } from 'src/views/Axios/Axios';
import Table from '@mui/joy/Table';
import _ from 'underscore';
import { DeptWiseAttendanceViewFun } from 'src/views/Attendance/AttendanceView/Functions';
import { getHolidayList } from 'src/redux/actions/LeaveProcess.action';
import DownloadIcon from '@mui/icons-material/Download';
import { ExporttoExcel } from './ExportToExcel';
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop';
import { getBreakDutyAttendance } from 'src/views/Attendance/ShiftUpdation/Function';

const DayWiseAttendence = () => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [openBkDrop, setOpenBkDrop] = useState(false)

    const [fromdate, Setfromdate] = useState(moment(new Date()));
    const [todate, Settodate] = useState(moment(new Date()));
    const [dateArray, setDateArray] = useState([])
    const [empArray, setEmpArray] = useState([])
    const commonSettings = useSelector((state) => state?.getCommonSettings)
    const shiftInformation = useSelector((state) => state?.getShiftList?.shiftDetails)
    const toRedirectToHome = () => {
        history.push(`/Home/Reports`)
    }
    const [deptName, setDepartmentName] = useState(0)
    const [deptSecName, setDepartSecName] = useState(0)
    // get holiday 
    const holiday = useSelector((state) => state.getHolidayList, _.isEqual);
    const holidayList = useMemo(() => holiday, [holiday]);
    useEffect(() => {
        dispatch(setDepartment());
        dispatch(setCommonSetting())
        dispatch(setShiftDetails())
        dispatch(getHolidayList());
    }, [dispatch])

    const {
        cmmn_early_out, // Early going time interval
        cmmn_grace_period, // common grace period for late in time
        cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY 
        salary_above, //Salary limit for calculating the holiday double wages
        week_off_day, // week off SHIFT ID
        notapplicable_shift, //not applicable SHIFT ID
        default_shift, //default SHIFT ID
        noff,// night off SHIFT ID
        break_shift_taken_count,
        // holiday_policy_count, //HOLIDAY PRESENT AND ABSENT CHECKING COUNT 
        // weekoff_policy_max_count, // WEEK OFF ELIGIBLE MAX DAY COUNT
        // weekoff_policy_min_count,
        dutyoff,
        extra_off
    } = commonSettings; //COMMON SETTING

    const postPunchData = useMemo(() => {
        return {
            // empno: em_no,
            deptName: deptName,
            deptSecName: deptSecName,
            fromdate: isValid(new Date(fromdate)) ? format(new Date(fromdate), 'yyyy-MM-dd') : null,
            todate: isValid(new Date(todate)) ? format(addDays(new Date(todate), 2), 'yyyy-MM-dd ') : null,
        }

    }, [deptSecName, fromdate, todate, deptName])
    const getData = useCallback(async (e) => {
        if (deptSecName === 0) {
            warningNofity("Please Select Any Department Section")
            setOpenBkDrop(false)
        } else {
            setOpenBkDrop(true)
            const getEmpData = {
                dept_id: deptName,
                sect_id: deptSecName,
            }
            //To get the emp details
            const result = await axioslogin.post('/empmast/getEmpDet', getEmpData)
            const { success, data } = result.data

            if (success === 1 && data?.length > 0) {
                const empData = data;
                const punchdep_data = await axioslogin.post("/AttendenceReport/getPunchDataDptWiseDateWise/", postPunchData);
                const { su, resultPunch_data } = punchdep_data?.data;
                if (su === 1 && resultPunch_data?.length > 0) {
                    const punchaMasData = resultPunch_data;
                    const punchResult = await axioslogin.post("/AttendenceReport/getPunchMasterDataDeptWise", postPunchData)
                    const { success, planData } = punchResult.data;
                    const punchMasterData = planData;
                    if (success === 1 && punchMasterData?.length > 0) {
                        //PUNCHMSTER DATA
                        const maindata = await Promise.allSettled(

                            punchMasterData?.map(async (data, index) => {
                                const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
                                // const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA
                                const shiftMergedPunchMaster = {
                                    ...data,
                                    shft_chkin_start: sortedShiftData?.shft_chkin_start,
                                    shft_chkin_end: sortedShiftData?.shft_chkin_end,
                                    shft_chkout_start: sortedShiftData?.shft_chkout_start,
                                    shft_chkout_end: sortedShiftData?.shft_chkout_end,
                                    shft_cross_day: sortedShiftData?.shft_cross_day,
                                    // gross_salary: sortedSalaryData?.gross_salary,
                                    earlyGoingMaxIntervl: cmmn_early_out,
                                    gracePeriodInTime: cmmn_grace_period,
                                    maximumLateInTime: cmmn_late_in,
                                    salaryLimit: salary_above,
                                    woff: week_off_day,
                                    naShift: notapplicable_shift,
                                    defaultShift: default_shift,
                                    noff: noff,
                                    holidayStatus: sortedShiftData?.holiday_status,
                                    break_shift_status: sortedShiftData?.break_shift_status,
                                    first_half_in: sortedShiftData?.first_half_in,
                                    first_half_out: sortedShiftData?.first_half_out,
                                    second_half_in: sortedShiftData?.second_half_in,
                                    second_half_out: sortedShiftData?.second_half_out,
                                    dutyoff: dutyoff,
                                    extra_off: extra_off
                                }
                                // const employeeBasedPunchData = punchaMasData.filter((e) => e.emp_code == data.em_no)
                                const employeeBasedPunchData = punchaMasData.filter((e) => String(e.emp_code) === String(data.em_no));

                                // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
                                if (shiftMergedPunchMaster?.break_shift_status === 1) {
                                    return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData, break_shift_taken_count)
                                }
                                else {
                                    return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

                                }
                            })
                        ).then((data) => {

                            const punchMasterMappedData = data?.map((e) => e.value)

                            console.log(punchMasterMappedData);
                            return Promise.allSettled(
                                punchMasterMappedData?.map(async (val) => {
                                    // const holidayStatus = val.holiday_status;
                                    // const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
                                    // const punch_out = val.punch_out === null ? null : new Date(val.punch_out);

                                    // const shift_in = new Date(val.shift_in);
                                    // const shift_out = new Date(val.shift_out);

                                    // //SALARY LINMIT
                                    // const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;


                                    // const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)
                                    // const getAttendanceStatus = await getAttendanceCalculation(
                                    //     punch_In,
                                    //     shift_in,
                                    //     punch_out,
                                    //     shift_out,
                                    //     cmmn_grace_period,
                                    //     getLateInTime,
                                    //     holidayStatus,
                                    //     val.shift_id,
                                    //     val.defaultShift,
                                    //     val.naShift,
                                    //     val.noff,
                                    //     val.woff,
                                    //     salaryLimit,
                                    //     val.maximumLateInTime
                                    // )

                                    // return {

                                    //     punch_slno: val.punch_slno,
                                    //     punch_in: val.punch_in,
                                    //     punch_out: val.punch_out,
                                    //     hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.hrsWorked,
                                    //     late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.lateIn,
                                    //     early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.earlyOut,
                                    //     duty_status: getAttendanceStatus?.duty_status,
                                    //     holiday_status: val.holiday_status,
                                    //     leave_status: val.leave_status,
                                    //     lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                    //     duty_desc: val?.leave_status === 1 ? val?.duty_desc : getAttendanceStatus?.duty_desc,
                                    //     lve_tble_updation_flag: val.lve_tble_updation_flag,


                                    //     name: val?.em_name,
                                    //     dept: val?.dept_name,
                                    //     sect: val?.sect_name,
                                    //     Duty: (moment(val?.duty_day).format("DD-MM-yyyy")),
                                    //     Shift_in: (moment(val?.shift_in).format("DD-MM-yyyy HH:mm")),
                                    //     Shift_Out: (moment(val?.shift_out).format("DD-MM-yyyy HH:mm ")),
                                    //     // hrsWorked: formatDuration({ hours: val?.hrs_worked.hours, minutes: val?.hrs_worked.minutes }),
                                    //     worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                                    //         formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                                    //     late: val?.late_in,
                                    //     early: val?.early_out,
                                    //     em_no: val?.em_no,
                                    // }


                                    const holidayStatus = val?.holiday_status;
                                    const punch_In = val?.punch_in === null ? null : new Date(val?.punch_in);
                                    const punch_out = val?.punch_out === null ? null : new Date(val?.punch_out);

                                    const shift_in = new Date(val?.shift_in);
                                    const shift_out = new Date(val?.shift_out);

                                    const shft_duty_day = val?.shft_duty_day;
                                    const salaryLimit = val?.gross_salary > val?.salaryLimit ? true : false;
                                    console.log("vnbvn");

                                    let interVal = intervalToDuration({
                                        start: isValid(new Date(val.punch_in)) ? new Date(val.punch_in) : 0,
                                        end: isValid(new Date(val.punch_out)) ? new Date(val.punch_out) : 0
                                    })

                                    //break duty

                                    const break_shift_status = val?.break_shift_status;
                                    const break_first_punch_in = val?.break_first_punch_in === null ? null : new Date(val?.break_first_punch_in);
                                    const break_first_punch_out = val?.break_first_punch_out === null ? null : new Date(val?.break_first_punch_out);
                                    const break_second_punch_in = val?.break_second_punch_in === null ? null : new Date(val?.break_second_punch_in);
                                    const break_second_punch_out = val?.break_second_punch_out === null ? null : new Date(val?.break_second_punch_out);


                                    //shift details
                                    const first_shift_in = `${format(new Date(val?.first_shift_in), 'yyyy-MM-dd HH:mm')} `
                                    const first_shift_out = `${format(new Date(val?.first_shift_out), 'yyyy-MM-dd HH:mm')} `
                                    const second_shift_in = `${format(new Date(val?.second_shift_in), 'yyyy-MM-dd HH:mm')} `
                                    const second_shift_out = `${format(new Date(val?.second_shift_out), 'yyyy-MM-dd HH:mm')} `
                                    console.log("abc");
                                    if (break_shift_status === 1) {
                                        console.log(",mnb");
                                        const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(
                                            first_shift_in,
                                            first_shift_out,
                                            second_shift_in,
                                            second_shift_out,
                                            break_first_punch_in,
                                            break_first_punch_out,
                                            break_second_punch_in,
                                            break_second_punch_out
                                        )

                                        const getAttendance = await getBreakDutyAttendance(
                                            first_shift_in, first_shift_out,
                                            second_shift_in, second_shift_out,
                                            break_first_punch_in, break_first_punch_out,
                                            break_second_punch_in, break_second_punch_out,
                                            cmmn_grace_period, getBreakDutyLateInTime,
                                            val?.shift_id, val?.defaultShift, val?.naShift,
                                            val?.noff, val?.woff, val?.dutyoff, val?.extra_off,
                                            val?.break_shift_status, val?.duty_day

                                        )

                                        return {
                                            punch_slno: val?.punch_slno,
                                            punch_in: (val?.break_first_punch_in === null || val?.break_first_punch_out === null) ? val?.break_second_punch_in : val?.break_first_punch_in,
                                            punch_out: (val?.break_second_punch_out === null || val?.break_second_punch_in === null) ? val?.break_first_punch_out : val?.break_second_punch_out,
                                            hrs_worked: (val?.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.hrsWorked,
                                            late_in: (val?.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.lateIn,
                                            early_out: (val?.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.earlyOut,
                                            duty_status: getAttendance?.duty_status,
                                            holiday_status: val?.holiday_status,
                                            leave_status: val?.leave_status,
                                            lvereq_desc: getAttendance?.lvereq_desc,
                                            duty_desc: getAttendance?.duty_desc,
                                            lve_tble_updation_flag: val?.lve_tble_updation_flag,
                                            shft_duty_day: val?.shft_duty_day,
                                            name: val?.em_name,
                                            dept: val?.dept_name,
                                            sect: val?.sect_name,
                                            Duty: (moment(val?.duty_day).format("DD-MM-yyyy")),
                                            Shift_in: (moment(val?.shift_in).format("DD-MM-yyyy HH:mm")),
                                            Shift_Out: (moment(val?.shift_out).format("DD-MM-yyyy HH:mm ")),
                                            // hrsWorked: formatDuration({ hours: val?.hrs_worked.hours, minutes: val?.hrs_worked.minutes }),
                                            worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                                                formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                                            late: val?.late_in,
                                            early: val?.early_out,
                                            em_no: val?.em_no,
                                        }
                                    }
                                    else {
                                        console.log("bknmkb");
                                        const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

                                        const getAttendanceStatus = await getAttendanceCalculation(
                                            punch_In,
                                            shift_in,
                                            punch_out,
                                            shift_out,
                                            cmmn_grace_period,
                                            getLateInTime,
                                            holidayStatus,
                                            val.shift_id,
                                            val.defaultShift,
                                            val.naShift,
                                            val.noff,
                                            val.woff,
                                            salaryLimit,
                                            val.maximumLateInTime,
                                            shft_duty_day,
                                            val.dutyoff,
                                            val.extra_off,
                                            val?.duty_day
                                        )

                                        return {
                                            punch_slno: val.punch_slno,
                                            punch_in: val.punch_in,
                                            punch_out: val.punch_out,
                                            hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.hrsWorked,
                                            late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.lateIn,
                                            early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.earlyOut,
                                            duty_status: getAttendanceStatus?.duty_status,
                                            holiday_status: val.holiday_status,
                                            leave_status: val.leave_status,
                                            lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                            duty_desc: getAttendanceStatus?.duty_desc,
                                            lve_tble_updation_flag: val.lve_tble_updation_flag,
                                            shft_duty_day: val.shft_duty_day,
                                            name: val?.em_name,
                                            dept: val?.dept_name,
                                            sect: val?.sect_name,
                                            Duty: (moment(val?.duty_day).format("DD-MM-yyyy")),
                                            Shift_in: (moment(val?.shift_in).format("DD-MM-yyyy HH:mm")),
                                            Shift_Out: (moment(val?.shift_out).format("DD-MM-yyyy HH:mm ")),
                                            // hrsWorked: formatDuration({ hours: val?.hrs_worked.hours, minutes: val?.hrs_worked.minutes }),
                                            worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                                                formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                                            late: val?.late_in,
                                            early: val?.early_out,
                                            em_no: val?.em_no,

                                        }
                                    }
                                })

                            ).then(async (element) => {

                                if (element?.length > 0) {
                                    const extractedValues = element?.map(item => item.value);
                                    return { status: 1, data: extractedValues }
                                    // setTableData(extractedValues)
                                } else {
                                    return { status: 0, message: "something went wrong", errorMessage: '' }
                                }
                            })
                        })
                        if (maindata?.status === 1) {

                            console.log(maindata);

                            const mainarray = maindata?.data

                            //to get the Holiday and add the details to the Emp Array

                            DeptWiseAttendanceViewFun(fromdate, holidayList).then((values) => {
                                const datearr = values?.filter(item => item.dateFormat >= fromdate && item.dateFormat <= todate);
                                setDateArray(datearr);
                                // setDateArray(values)
                                const newFun = (val) => {
                                    const arr = mainarray?.filter(item => val?.em_no === item?.em_no)
                                    const array = arr.sort((a, b) => new Date(a?.duty_day) - new Date(b?.duty_day));
                                    return {
                                        ...val,
                                        "arr": array.slice(0, -2)
                                    }
                                }
                                const newEmp = empData?.map(newFun)
                                setEmpArray(newEmp);
                                setOpenBkDrop(false)
                            })
                        } else {
                            setOpenBkDrop(false)
                            setEmpArray([])
                        }
                    }


                } else {
                    setOpenBkDrop(false)
                    infoNofity("No employee under given condition")
                    setEmpArray([])
                }
            } else {
                setOpenBkDrop(false)
                infoNofity("No employee to show")
            }

        }
    }, [fromdate, todate, postPunchData, shiftInformation, cmmn_early_out,
        deptSecName, deptName, holidayList, break_shift_taken_count,
        cmmn_grace_period, dutyoff, extra_off,
        cmmn_late_in,
        salary_above,
        week_off_day,
        notapplicable_shift,
        default_shift,
        noff])

    const punchInOutMapping = async (shiftMergedPunchMaster, employeeBasedPunchData) => {
        const crossDay = shiftMergedPunchMaster?.shft_cross_day;
        const shiftInTime = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
        const shiftOutTime = crossDay === 0 ? `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}` :
            `${format(addDays(new Date(shiftMergedPunchMaster?.duty_day), crossDay), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}`;

        //SHIFT MASTER DATA    
        const shiftIn = new Date(shiftMergedPunchMaster?.shift_in);
        const shiftOut = new Date(shiftMergedPunchMaster?.shift_out);
        const shiftInStart = new Date(shiftMergedPunchMaster?.shft_chkin_start);
        const shiftInEnd = new Date(shiftMergedPunchMaster?.shft_chkin_end);
        const shiftOutStart = new Date(shiftMergedPunchMaster?.shft_chkout_start);
        const shiftOutEnd = new Date(shiftMergedPunchMaster?.shft_chkout_end);

        //Diffrence in Check IN time Intervel in Hours
        const shiftInStartDiffer = differenceInHours(shiftIn, shiftInStart);
        const shiftInEndDiffer = differenceInHours(shiftInEnd, shiftIn);

        //Diffrence in Check OUT time Intervel in Hours
        const shiftOutStartDiffer = differenceInHours(shiftOut, shiftOutStart);
        const shiftOutEndDiffer = differenceInHours(shiftOutEnd, shiftOut);

        const checkInTIme = new Date(shiftInTime);
        const checkOutTime = new Date(shiftOutTime);

        const checkInStartTime = subHours(checkInTIme, shiftInStartDiffer);
        const checkInEndTime = addHours(checkInTIme, shiftInEndDiffer);

        const checkOutStartTime = subHours(checkOutTime, shiftOutStartDiffer)
        const checkOutEndTime = addHours(checkOutTime, shiftOutEndDiffer);

        const empPunchData = employeeBasedPunchData?.map((e) => new Date(e.punch_time));

        const inTimesArray = empPunchData?.filter((e) => (e >= checkInStartTime && e <= checkInEndTime))
        const outTimeArray = empPunchData?.filter((e) => (e >= checkOutStartTime && e <= checkOutEndTime))
        const inPunch = min(inTimesArray)
        const outPunch = max(outTimeArray)
        return {
            ...shiftMergedPunchMaster,
            punch_in: isValid(inPunch) === true ? format(inPunch, 'yyyy-MM-dd HH:mm') : null,
            punch_out: isValid(outPunch) === true ? format(outPunch, 'yyyy-MM-dd HH:mm') : null,
            shift_in: checkInTIme,
            shift_out: checkOutTime,
            shiftInStart: checkInStartTime,
            shiftInEnd: checkInEndTime,
            shiftOutStart: checkOutStartTime,
            shiftOutEnd: checkOutEndTime,
            //break shift punch
            break_first_punch_in: null,
            break_first_punch_out: null,
            break_second_punch_in: null,
            break_second_punch_out: null,
            //break shift time
            first_shift_in: null,
            first_shift_out: null,
            second_shift_in: null,
            second_shift_out: null,
        }
    }

    const BreakDutypunchInOutMapping = async (shiftMergedPunchMaster, employeeBasedPunchData, break_shift_taken_count) => {

        //BREAK DUTY SHIFT
        const first_shift_in = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.first_half_in), 'HH:mm')}`;
        const first_shift_out = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.first_half_out), 'HH:mm')}`;
        const second_shift_in = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.second_half_in), 'HH:mm')}`;
        const second_shift_out = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.second_half_out), 'HH:mm')}`;

        /***
        * find start-end time to taken brk duty day punches by adding a count
        * if break duty 5 AM - 20 PM
        * first half    5 AM - 10 AM
        * second half   15 PM - 20 PM
        * 
        * if break_shift_taken_count=2
        * first half punch in start from 3 AM
        * second half punch out end to 22 PM 
        */
        const first_punch_start_time = subHours(new Date(first_shift_in), break_shift_taken_count)
        const second_punch_end_time = addHours(new Date(second_shift_out), break_shift_taken_count)

        //filter punch time with punch start time and punch end time
        /**
         * filter the punch based on particular day  
         * punch between 3 AM - 22 PM
         */
        const punchBasedonDutyday = employeeBasedPunchData?.map((e) => new Date(e?.punch_time))?.filter((e) => e >= first_punch_start_time && e <= second_punch_end_time);

        /**
         * First half punch difference in time
         * 5 AM - 10 AM => 5 hrs
         * So, punch taken to 2.5 hrs
         */
        const first_shift_differ = differenceInHours(new Date(first_shift_out), new Date(first_shift_in)) / 2;
        /**
         * Second half punch difference in time
         * 15 PM - 20 PM => 5 hrs
         * So, punch taken to 2.5 hrs
         */
        const second_shift_differ = differenceInHours(new Date(second_shift_out), new Date(second_shift_in)) / 2;
        /**
         * Adding 2.5 hrs to calculate First punch end time
         * 7.30 AM
         */
        const first_punch_in_end_time = addHours(new Date(first_shift_in), new Date(first_shift_differ));
        /**
         * Minusing 2.5 hrs from the second half punch out time.
         * 19.30 PM
         */
        const second_punch_out_start_time = subHours(new Date(second_shift_out), new Date(second_shift_differ));

        /**
         * First half punch in bteween 3 AM - 7.30 AM
         * Second half punch out bteween 19.30 PM - 22 PM 
         */
        const sorted_first_punch_in = punchBasedonDutyday?.filter((e) => e >= first_punch_start_time && e <= first_punch_in_end_time)
        const sorted_second_punch_out = punchBasedonDutyday?.filter((e) => e >= new Date(second_punch_out_start_time) && e <= second_punch_end_time)

        const FIRST_PUNCH = min(sorted_first_punch_in)//first half punch in time
        const FOURTH_PUNCH = max(sorted_second_punch_out)//second half punch out time

        /**
         * to find second and third punch
         * find break time btw 10 AM - 15 PM
         */
        const intermediateTime = differenceInHours(new Date(second_shift_in), new Date(first_shift_out)) / 2;
        //adding 2.5 to 10 AM, 12.30 PM
        const first_punch_out_end_time = addHours(new Date(first_shift_out), new Date(intermediateTime));
        //second punch in start tim e from 12.30 PM
        const second_punch_in_start_time = subHours(new Date(second_shift_in), new Date(intermediateTime));
        // taking punch bteween 10 AM - 15 PM
        const punchbetweenbreaktime = punchBasedonDutyday?.filter((e) => e > new Date(first_shift_out) && e <= new Date(second_shift_in))

        const sorted_first_punch_out = punchBasedonDutyday?.filter((e) => e > new Date(first_punch_in_end_time) && e <= first_punch_out_end_time)
        const sorted_second_punch_in = punchBasedonDutyday?.filter((e) => e > second_punch_in_start_time && e < new Date(second_punch_out_start_time))

        const SECOND_PUNCH = max(sorted_first_punch_out)
        const THIRD_PUNCH = min(sorted_second_punch_in)
        const inbtwpunch = max(punchbetweenbreaktime)

        return {
            ...shiftMergedPunchMaster,
            punch_in: null,
            punch_out: null,
            shift_in: null,
            shift_out: null,
            shiftInStart: null,
            shiftInEnd: null,
            shiftOutStart: null,
            shiftOutEnd: null,
            break_first_punch_in: isValid(FIRST_PUNCH) === true ? format(FIRST_PUNCH, 'yyyy-MM-dd HH:mm') : null,
            break_first_punch_out: isValid(FIRST_PUNCH) === false ? null
                : isValid(FOURTH_PUNCH) === false && isValid(SECOND_PUNCH) === false ? format(inbtwpunch, 'yyyy-MM-dd HH:mm')
                    : isValid(SECOND_PUNCH) === true ? format(SECOND_PUNCH, 'yyyy-MM-dd HH:mm') : null,
            break_second_punch_in: isValid(FOURTH_PUNCH) === false ? null
                : isValid(FIRST_PUNCH) === false && isValid(THIRD_PUNCH) === false ? format(inbtwpunch, 'yyyy-MM-dd HH:mm')
                    : isValid(THIRD_PUNCH) === true ? format(THIRD_PUNCH, 'yyyy-MM-dd HH:mm') : null,
            break_second_punch_out: isValid(FOURTH_PUNCH) === true ? format(FOURTH_PUNCH, 'yyyy-MM-dd HH:mm') : null,
            first_shift_in: first_shift_in,
            first_shift_out: first_shift_out,
            second_shift_in: second_shift_in,
            second_shift_out: second_shift_out

        }
    }


    //for excel convertion
    const toDownload = useCallback(() => {
        const fileName = "Attendance_Report";
        const headers = ["Name", "Emp Id", "Department", "Department Section", ...dateArray.map(val => val.date)];
        const days = ["Days", "", "", "", ...dateArray.map(val => val.holiday === 1 ? val.holidayDays.toLowerCase() : val.days)];
        // Rows for Excel file
        const rows = empArray.map(row => {
            const rowData = [
                row.emp_name,
                row.em_no,
                row.dept_name,
                row.sect_name,
                ...row.arr.map(val => val.duty_desc)
            ];
            return rowData;
        });

        // Prepare data for Excel export
        const excelData = [headers, days, ...rows];

        // Call ExporttoExcel function
        ExporttoExcel(excelData, fileName);
    }, [empArray, dateArray]);


    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", height: window.innerHeight }} >
            <CustomBackDrop open={openBkDrop} text="Please wait !. " />

            <ToastContainer />
            <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', overflowY: "auto", width: "100%", }} >
                <Paper sx={{ flex: 1, }} >
                    <Paper square sx={{ display: "flex", height: 30, flexDirection: 'column' }}>
                        <Box sx={{ display: "flex", flex: 1, height: 30, }} >
                            <Paper square sx={{ display: "flex", flex: 1, height: 30, alignItems: 'center', justifyContent: "space-between" }} >
                                <Box sx={{ display: "flex" }}>
                                    <DragIndicatorOutlinedIcon />
                                    <CssVarsProvider>
                                        <Typography textColor="neutral.400" sx={{ display: 'flex', }} >
                                            Daily Attendence Report
                                        </Typography>
                                    </CssVarsProvider>
                                </Box>
                                <Box sx={{ display: "flex", pr: 1 }}>
                                    <CssVarsProvider>

                                        <IconButton
                                            variant="outlined"
                                            size='xs'
                                            color="danger"
                                            onClick={toRedirectToHome}
                                            sx={{ color: '#ef5350' }}
                                        >
                                            <CloseIcon />
                                        </IconButton>

                                    </CssVarsProvider>
                                </Box>
                            </Paper>
                        </Box>
                    </Paper>
                    <Box sx={{ mt: 1, ml: 0.5, display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', flexWrap: "wrap", gap: 0.5 }} >
                        <Box sx={{ flex: 1, px: 0.5, width: '20%', }}>
                            <DepartmentDropRedx getDept={setDepartmentName} />
                        </Box>
                        <Box sx={{ flex: 1, px: 0.5, width: '50%' }}>
                            <DepartmentSectionRedx getSection={setDepartSecName} />
                        </Box>
                        <Box sx={{ display: "flex", flexDirection: "row", }}>
                            <Box sx={{ flex: 1, px: 0.5, display: "flex", }} >
                                <Typography sx={{ p: 1 }}>From:</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    < DatePicker
                                        // disableFuture={true}
                                        views={['day']}
                                        value={fromdate}
                                        maxDate={new Date()}
                                        inputFormat="dd-MM-yyyy"
                                        size="small"
                                        onChange={(e) => {
                                            Setfromdate(moment(e).format("YYYY-MM-DD"));
                                        }}
                                        renderInput={({ inputRef, inputProps, InputProps }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                                <CssVarsProvider>
                                                    <Input ref={inputRef} {...inputProps} disabled={true} style={{ width: "100%" }} />
                                                </CssVarsProvider>
                                                {InputProps?.endAdornment}
                                            </Box>
                                        )}
                                    />
                                </LocalizationProvider>


                            </Box>
                            <Box sx={{ flex: 1, px: 0.5, display: "flex", flexDirection: "row", }} >
                                <Typography sx={{ p: 1 }}>To:</Typography>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    < DatePicker
                                        // disableFuture={true}
                                        views={['day']}
                                        value={todate}
                                        inputFormat="dd-MM-yyyy"
                                        maxDate={endOfMonth(new Date(fromdate))}
                                        size="small"
                                        onChange={(e) => {
                                            Settodate(moment(e).format("YYYY-MM-DD"));
                                        }}
                                        renderInput={({ inputRef, inputProps, InputProps }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                                <CssVarsProvider>
                                                    <Input ref={inputRef} {...inputProps} disabled={true} style={{ width: "100%" }} />
                                                </CssVarsProvider>
                                                {InputProps?.endAdornment}
                                            </Box>
                                        )}
                                    />
                                </LocalizationProvider>

                            </Box>
                            <Box sx={{ flex: 1, px: 0.5, mt: .5 }}>

                                <IconButton variant="outlined" size='sm' color="primary"
                                    onClick={getData}
                                >
                                    <PublishedWithChangesIcon />
                                </IconButton>

                                <IconButton variant="outlined" size='sm' color="primary" sx={{ ml: 1 }} onClick={toDownload}>
                                    <DownloadIcon />
                                </IconButton>

                            </Box>
                        </Box>
                    </Box>
                    {empArray.length > 0 ?

                        <Box sx={{ overflowY: "auto", width: "100%", height: window.innerHeight - 200, mt: 1 }}>
                            <Table
                                borderAxis="bothBetween"
                                // stripe="odd"
                                size="sm"
                                hoverRow
                                stickyHeader
                                sx={{
                                    '& tr > *:first-child': {
                                        position: 'sticky',
                                        left: 0,
                                        boxShadow: '1px 0 var(--TableCell-borderColor)',
                                        bgcolor: 'background.surface',


                                    },


                                }}
                            >
                                <thead  >
                                    <tr>
                                        <th style={{ width: 200, p: 0, m: 0 }}>Name</th>
                                        <th style={{ width: 100, p: 0, m: 0 }}>ID#</th>
                                        <th style={{ width: 100, p: 0, m: 0 }}>Department</th>
                                        <th style={{ width: 100, p: 0, m: 0 }}>Department Section</th>
                                        {dateArray && dateArray.map((val, index) => (
                                            <th key={index} style={{ width: 70, p: 0, m: 0, textAlign: "center", }}>
                                                {val.date}
                                            </th>
                                        ))}

                                    </tr>
                                    <tr>
                                        <th style={{ textAlign: "center", }}> Days </th>
                                        <th style={{ textAlign: "center", }}>  </th>
                                        <th style={{ textAlign: "center", }}>  </th>
                                        <th style={{ textAlign: "center", }}>  </th>
                                        {dateArray && dateArray.map((val, index) => (
                                            <th key={index} style={{}}>
                                                <Box sx={{
                                                    textAlign: "center",
                                                    textTransform: 'capitalize',
                                                    color: val.holiday === 1 || val.sunday === '0' ? 'red' : '#212121'
                                                }} >
                                                    {val.holiday === 1 ? val.holidayDays.toLowerCase() : val.days}
                                                </Box>
                                            </th>
                                        ))}

                                    </tr>
                                </thead>
                                <tbody>
                                    {empArray && empArray.map((row, index) => (
                                        <tr key={index} >
                                            <td >
                                                <Box > {row.emp_name}</Box>
                                            </td>
                                            <td >
                                                <Box sx={{ textAlign: "center", }}> {row.em_no}</Box>
                                            </td>
                                            <td >
                                                <Box sx={{ textAlign: "center", }}> {row.dept_name}</Box>
                                            </td>
                                            <td >
                                                <Box sx={{ textAlign: "center", }}> {row.sect_name}</Box>
                                            </td>
                                            {row.arr.map((val, index) => (
                                                <td key={index} style={{

                                                    backgroundColor: val.duty_desc === "LC" ? "#F6FDC3" :
                                                        val.duty_desc === "A" ? "#FAD4D4" :
                                                            val.duty_desc === "LV" ? "#FFDEFA" :
                                                                val.duty_desc === "HD" ? "#CDF5FD" :
                                                                    val.duty_desc === "HDL" ? "#89CFF3" : null
                                                }}>
                                                    <Box sx={{
                                                        textAlign: "center",
                                                        color: val.duty_desc === "LC" ? "ORANGE" :
                                                            val.duty_desc === "A" ? "RED" : null
                                                    }}>
                                                        {val.duty_desc}
                                                    </Box>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>

                                {/* <Sheet /> */}
                            </Table>
                        </Box>
                        : null}

                </Paper>
            </Box>



        </Box >
    )
}

export default memo(DayWiseAttendence)