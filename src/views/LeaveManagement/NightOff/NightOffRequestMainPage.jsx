import React, { memo, useEffect, useState, useMemo, useCallback } from 'react'
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { useDispatch, useSelector } from 'react-redux';
import { getDepartmentSectionAll, getDepartmentAll, getEmployeeInformationLimited, getCommonSettings } from 'src/redux/reduxFun/reduxHelperFun';
import { Box, Button, CssVarsProvider, IconButton, Input, Table, Tooltip, Typography } from '@mui/joy';
import { getDepartmentSectionBasedHod, getEmployeeArraySectionArray } from '../LeavereRequsition/Func/LeaveFunction';
import { setDept } from 'src/redux/actions/Dept.Action';
import { setdeptSection } from 'src/redux/actions/DeptSection.action';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { axioslogin } from 'src/views/Axios/Axios';
import { Paper } from '@mui/material';
import CommonAgGrid from 'src/views/Component/CommonAgGrid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addDays, addHours, addMonths, differenceInHours, endOfMonth, format, formatDuration, intervalToDuration, isValid, lastDayOfMonth, max, min, startOfMonth, subDays, subHours } from 'date-fns';
import { setCommonSetting } from 'src/redux/actions/Common.Action';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton as OpenIcon } from '@mui/material';
import NOFFCancelModal from './NOFFCancelModal';
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout';
import { ToastContainer } from 'react-toastify';
import { setShiftDetails } from 'src/redux/actions/Shift.Action';
import { getAttendanceCalculation, getLateInTimeIntervel } from 'src/views/Attendance/PunchMarkingHR/punchMarkingHrFunc';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop';

const NightOffRequestMainPage = () => {

    const dispatch = useDispatch();

    //dispatch for getting department and department section
    useEffect(() => {
        dispatch(setDept())
        dispatch(setdeptSection())
    }, [dispatch])

    const [deptID, setDeptID] = useState(0);
    const [deptSection, setDeptSection] = useState(0);
    const [employeeID, setEmployeeID] = useState(0);
    const [disabled, setDisables] = useState(false);
    const [emplist, setEmpList] = useState([]);
    const [mapEmpList, setMapEmpList] = useState([]);
    const [hodBasedSection, setHodBasedSection] = useState([]);
    const [deptSectionList, setDeptSectionList] = useState([]);
    const [masterGroupStatus, setMasterGroupStatus] = useState(false);
    const [hodEmpFilter, setHodEmpFilter] = useState(false);
    const [empDisableStat, setEmpDisableStat] = useState(false)
    const [requestUser, setRequestUser] = useState({
        deptID: 0,
        sectionID: 0,
        emNo: 0,
        emID: 0
    })

    const [EmpNoffList, SetEmpNoffList] = useState([]);
    const [openDateField, setopenDateField] = useState(false)
    const [requiredate, setRequireDate] = useState('')
    const [fromdate, setFromDate] = useState('')
    const [todate, setToDate] = useState('')
    const [NoffdayPunch, SetNoffdayPunch] = useState([]);
    const [open, SetOpen] = useState(false)
    const [modalData, SetmodalData] = useState([])
    const [count, Setcount] = useState(0);
    const [EmployeeNo, SetEmployeeNo] = useState(0);
    const [NoffRequestData, SetNoffRequestData] = useState([]);
    const [drop, setDropOpen] = useState(false)

    const department = useSelector((state) => getDepartmentAll(state))
    const departmentNameList = useMemo(() => department, [department])
    const filterDeptSection = useSelector((state) => getDepartmentSectionAll(state))
    const departmentSectionListFilterd = useMemo(() => filterDeptSection, [filterDeptSection])

    //LOGGED EMPLOYEE INFORMATION
    const empInform = useSelector((state) => getEmployeeInformationLimited(state))
    const employeeInform = useMemo(() => empInform, [empInform])
    const { hod, incharge, groupmenu, em_no, em_id, em_department, em_dept_section } = employeeInform;

    const getcommonSettings = useSelector((state) => getCommonSettings(state, groupmenu))
    const groupStatus = useMemo(() => getcommonSettings, [getcommonSettings])
    useEffect(() => {
        setMasterGroupStatus(groupStatus)
        dispatch(setCommonSetting());
        dispatch(setShiftDetails())
    }, [groupStatus])

    const shiftInformation = useSelector((state) => state?.getShiftList?.shiftDetails)

    const minDate = startOfMonth(new Date()); // First day of the current month
    const maxDate = endOfMonth(new Date());

    //GET THE DEPARTMENT SECTION DETAILS BASED ON LOGED USER EM_ID
    useEffect(() => {
        // IF THE LOGGED EMPLOYEE IS HOD OR INCHARGE
        if ((hod === 1 || incharge === 1) && masterGroupStatus === true) {
            setDisables(false)
            setHodBasedSection([])

        } else if ((hod === 1 || incharge === 1) && masterGroupStatus === false) {
            setDisables(true)
            setDeptID(0)
            const fetchData = async (em_id) => {
                const result = await getDepartmentSectionBasedHod(em_id);
                const section = await result?.map((e) => e.dept_section)
                // if the employee is hhod or incharge in another department but they can access thery information but this function hel to view ther datas
                section?.find((e) => e === em_dept_section) === undefined ? setHodEmpFilter(true) : setHodEmpFilter(false)
                setHodBasedSection([...section, em_dept_section]) // INCLUDING HOD OR INCHARGE DEPARTMENT SECTION IF IT NOT IN THE AUTHORISED SECTION
            }
            fetchData(em_id)
        } else {
            setDisables(false)
        }

        //CLEAN UP FUNCTION
        return () => {
            setHodBasedSection([])
        }
    }, [hod, incharge, em_id, em_dept_section, masterGroupStatus])

    // FILTERING AND SORTING DEPARTMENT SECTION AND EMPLOYEE
    useEffect(() => {
        // if (departmentSectionListFilterd?.length > 0 && hodBasedSection?.length === 0) {
        if (departmentSectionListFilterd?.length > 0 && masterGroupStatus === true) {
            // NO FILTER FOR DEPARTMENT AND DEPARTMENT SECTION
            const departmentSection = departmentSectionListFilterd?.filter((e) => e.dept_id === deptID)
            setDeptSectionList(departmentSection)
            const filterSectionId = departmentSection?.map((e) => e.sect_id)
            getEmployeeArraySectionArray(filterSectionId).then((e) => e?.length > setEmpList(e))
        } else if (departmentSectionListFilterd?.length > 0 && hodBasedSection?.length > 0) {
            //HOD BASED DEPRTMENT SECTION SHOWING
            const hodBasedSecion = departmentSectionListFilterd?.filter((e) => hodBasedSection?.includes(e.sect_id))
            setDeptSectionList(hodBasedSecion)

            //GET EMPLOYEE -> HOD AND INCHARGE BASED DEPARTMENT SECTION WISE EMPLYEE 
            getEmployeeArraySectionArray(hodBasedSection).then((e) => e?.length > setEmpList(e))
        } else {
            setDeptSectionList([])
            setEmpList([])
        }
        return () => { //Clean up function
            setDeptSectionList([])
            setEmpList([])
        }

    }, [departmentSectionListFilterd, deptID, hodBasedSection, masterGroupStatus])


    //HANDELE CHANGE DEPARTMENT
    const handleChangeDepartmentID = useCallback((e, value) => {
        setDeptID(value)
        setDeptSection(0)
        setEmployeeID(0)
        setMapEmpList([]) // EMPLOYEE ARRAY SET TO BLANK
        setRequestUser({ ...requestUser, deptID: value, sectionID: 0, emNo: 0, emID: 0 })
    }, [setRequestUser, requestUser])

    //HANDLE CHANGE DEPARTMENT SECTION
    const handleChangeDepetSection = useCallback(async (e, value) => {
        setMapEmpList([...emplist?.filter((e) => e.em_dept_section === value)])
        setDeptSection(value)
        setEmployeeID(0)
        // if the employee is hhod or incharge in another department but they can access thery information but this function hel to view ther datas
        if (hodEmpFilter === true && value === em_dept_section) {
            // em_id
            setEmployeeID(em_no)
            setRequestUser({ ...requestUser, deptID: em_department, sectionID: value, emNo: em_no, emID: em_id })
            setEmpDisableStat(true)
        } else {
            setEmpDisableStat(false)
            setRequestUser({ ...requestUser, sectionID: value, emNo: 0, emID: 0 })
        }
    }, [emplist, hodEmpFilter, setRequestUser, requestUser, em_no, em_id, em_department, em_dept_section])

    //HANDLE CHANGE EMPLOYEE NAME 
    const handleChangeEmployeeName = useCallback((e, value) => {
        setEmployeeID(value)
        setRequestUser({ ...requestUser, emNo: value })
    }, [requestUser, setRequestUser])

    const commonState = useSelector((state) => state?.getCommonSettings);
    const commonSettings = useMemo(() => commonState, [commonState]);

    const {
        cmmn_early_out, // Early going time interval
        cmmn_grace_period, // common grace period for late in time
        cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY 
        salary_above, //Salary limit for calculating the holiday double wages
        week_off_day, // week off SHIFT ID
        notapplicable_shift, //not applicable SHIFT ID
        default_shift, //default SHIFT ID
        noff // night off SHIFT ID
    } = commonSettings; //COMMON SETTING

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
        const shft_desc = shiftMergedPunchMaster?.shft_desc;
        const noff_min_days = shiftMergedPunchMaster?.noff_min_days;
        const noff_max_days = shiftMergedPunchMaster?.noff_max_days;
        const noff_flag = shiftMergedPunchMaster?.noff_flag;

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
            shft_desc: shft_desc,
            noff_min_days: noff_min_days,
            noff_max_days: noff_max_days,
            noff_flag: noff_flag
        }
    }

    const HandleRequireDate = useCallback(async (newValue) => {
        // Update the required date
        setRequireDate(newValue);
        //const todateValue = subDays(new Date(newValue), 1);
        const todateValue = new Date(newValue);
        const fromdateValue = subDays(new Date(newValue), parseInt(commonSettings?.noff_selct_day_count));

        if (isValid(fromdateValue) && isValid(todateValue)) {
            // If both dates are valid, update the state
            setFromDate(format(new Date(fromdateValue), 'yyyy-MM-dd'))
            setToDate(format(new Date(todateValue), 'yyyy-MM-dd'))
        } else {
            // Handle the invalid date scenario, e.g., show an error or reset the state
            warningNofity("Invalid date value(s) calculated. Please check the input.");
        }
    }, [commonSettings]);

    //To get NOFF Table Datas
    const GetNofftableData = useCallback(async () => {
        if (requestUser?.deptID !== 0 && requestUser?.sectionID !== 0 && requestUser?.emID !== 0 && EmployeeNo === 0 && requiredate !== '') {
            setopenDateField(true)
            const empdata = {
                em_id: parseInt(requestUser?.emID)
            };
            const result = await axioslogin.post('/NightOff/GetEmpBasedNoff', empdata);
            const { suces, data } = result.data;
            if (suces === 1) {
                const ShowData = data?.map((val, indx) => {
                    const object = {
                        slno: indx + 1,
                        noff_req_slno: val.noff_req_slno,
                        emp_no: val.emp_no,
                        emp_id: val.emp_id,
                        em_dept: val.em_dept,
                        em_dept_sec: val.em_dept_sec,
                        noff_req_date: format(new Date(val.noff_req_date), 'yyyy-MM-dd'),
                        em_name: val.em_name,
                        dept_name: val.dept_name,
                        attendance_update_flag: val.attendance_update_flag
                    }
                    return object
                })
                SetEmpNoffList(ShowData)
            } else {
                SetEmpNoffList([])
            }
        }
        else if (EmployeeNo !== 0 && requiredate !== '') {
            setopenDateField(true)
            const empdata = {
                EmployeeNo: parseInt(EmployeeNo)
            };

            const result = await axioslogin.post('/NightOff/GetEmpDetailsByEmNo', empdata);
            const { sucss, datas } = result.data;

            const { em_id, em_no, em_department, em_dept_section } = datas[0];
            if (sucss === 1) {
                const obj = {
                    emID: em_id,
                    emNo: em_no,
                    deptID: em_department,
                    sectionID: em_dept_section
                };
                setRequestUser({
                    ...requestUser, ...obj
                })
                const empdatas = {
                    em_id: parseInt(em_id)
                };
                const result = await axioslogin.post('/NightOff/GetEmpBasedNoff', empdatas);
                const { suces, data } = result.data;
                if (suces === 1) {
                    const ShowData = data?.map((val, indx) => {
                        const object = {
                            slno: indx + 1,
                            noff_req_slno: val.noff_req_slno,
                            emp_no: val.emp_no,
                            emp_id: val.emp_id,
                            em_dept: val.em_dept,
                            em_dept_sec: val.em_dept_sec,
                            noff_req_date: format(new Date(val.noff_req_date), 'yyyy-MM-dd'),
                            em_name: val.em_name,
                            dept_name: val.dept_name,
                            attendance_update_flag: val.attendance_update_flag
                        }
                        return object
                    })
                    SetEmpNoffList(ShowData)
                } else {
                    SetEmpNoffList([])
                }
            }
            else {
                warningNofity("Enter Valid Employee Number")
            }
        }
        else {
            warningNofity("Enter Valid Datas For Process")
        }
    }, [requestUser, EmployeeNo, requiredate])

    const GetEmpNOFFLists = useCallback(async () => {
        GetNofftableData()
        const punchDatapostData = {
            fromDate: fromdate,
            todate: format(addDays(new Date(todate), 1), 'yyyy-MM-dd 23:59:59'),
            em_no: parseInt(requestUser?.emNo) !== 0 ? parseInt(requestUser?.emNo) : parseInt(EmployeeNo) !== 0 ? parseInt(EmployeeNo) : 0
        }

        // if (openDateField === true) {
        const punchMasterpostData = {
            // fromDate: format(new Date(fromdate), 'yyyy-MM-dd'),
            // todate: format(new Date(todate), 'yyyy-MM-dd'),
            fromDate: fromdate,
            todate: todate,
            em_no: parseInt(requestUser?.emNo) !== 0 ? parseInt(requestUser?.emNo) : parseInt(EmployeeNo) !== 0 ? parseInt(EmployeeNo) : 0
        }

        const punchdep_data = await axioslogin.post("/NightOff/getPunchDataEmpWiseDateWise", punchDatapostData);
        const { su, resultPunch_data } = punchdep_data?.data;

        const punchaMasData = resultPunch_data;
        if (su === 1 && resultPunch_data?.length > 0) {
            const punchResult = await axioslogin.post("/NightOff/getPunchMasterDataEmptWise", punchMasterpostData)
            const { success, planData } = punchResult.data;
            const punchMasterData = planData;
            if (success === 1 && punchMasterData?.length > 0) {
                //PUNCHMSTER DATA
                const maindata = await Promise.allSettled(
                    punchMasterData?.map(async (data, index) => {
                        const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
                        const shiftMergedPunchMaster = {
                            ...data,
                            shft_chkin_start: sortedShiftData?.shft_chkin_start,
                            shft_chkin_end: sortedShiftData?.shft_chkin_end,
                            shft_chkout_start: sortedShiftData?.shft_chkout_start,
                            shft_chkout_end: sortedShiftData?.shft_chkout_end,
                            shft_cross_day: sortedShiftData?.shft_cross_day,
                            earlyGoingMaxIntervl: cmmn_early_out,
                            gracePeriodInTime: cmmn_grace_period,
                            maximumLateInTime: cmmn_late_in,
                            salaryLimit: salary_above,
                            woff: week_off_day,
                            naShift: notapplicable_shift,
                            defaultShift: default_shift,
                            noff: noff,
                            holidayStatus: sortedShiftData?.holiday_status,
                            shft_desc: sortedShiftData?.shft_desc,
                            noff_min_days: sortedShiftData?.noff_min_days,
                            noff_max_days: sortedShiftData?.noff_max_days,
                            night_off_flag: sortedShiftData?.night_off_flag
                        }
                        const employeeBasedPunchData = punchaMasData.filter((e) => String(e.emp_code) === String(data.em_no));
                        return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
                    })
                ).then((data) => {
                    if (data?.length > 0) {
                        const punchMasterMappedData = data?.map((e) => e.value)

                        return Promise.allSettled(
                            punchMasterMappedData?.map(async (val) => {
                                const noff_flag = val.noff_flag;
                                const night_off_flag = val.night_off_flag;
                                const shift_id = val.shift_id;
                                const shft_desc = val.shft_desc;
                                const holidayStatus = val.holiday_status;
                                const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
                                const punch_out = val.punch_out === null ? null : new Date(val.punch_out);
                                const noff_min_days = val.noff_min_days;
                                const noff_max_days = val.noff_max_days;
                                const shift_in = new Date(val.shift_in);
                                const shift_out = new Date(val.shift_out);
                                let interVal = intervalToDuration({
                                    start: isValid(new Date(val.punch_in)) ? new Date(val.punch_in) : 0,
                                    end: isValid(new Date(val.punch_out)) ? new Date(val.punch_out) : 0
                                })
                                //SALARY LINMIT
                                const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;
                                const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)
                                const getAttendanceStatus = await getAttendanceCalculation(
                                    punch_In,
                                    shift_in,
                                    punch_out,
                                    shift_out,
                                    cmmn_grace_period,
                                    getLateInTime,
                                    holidayStatus,
                                    shft_desc,
                                    val.shift_id,
                                    val.defaultShift,
                                    val.naShift,
                                    val.noff,
                                    val.woff,
                                    salaryLimit,
                                    val.maximumLateInTime,
                                    noff_min_days,
                                    noff_max_days,
                                    shift_id,
                                    night_off_flag,
                                    noff_flag
                                )

                                return {
                                    punch_slno: val.punch_slno,
                                    punch_in: val.punch_in,
                                    punch_out: val.punch_out,
                                    hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.hrsWorked,
                                    late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.lateIn,
                                    early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.earlyOut,
                                    duty_status: getAttendanceStatus?.duty_status,
                                    holiday_status: val.holiday_status,
                                    leave_status: val.leave_status,
                                    lvereq_desc: val?.leave_status === 1 ? val?.lvereq_desc : getAttendanceStatus?.lvereq_desc,
                                    duty_desc: val?.leave_status === 1 ? val?.duty_desc : getAttendanceStatus?.duty_desc,
                                    lve_tble_updation_flag: val.lve_tble_updation_flag,
                                    name: val?.em_name,
                                    dept: val?.dept_name,
                                    sect: val?.sect_name,
                                    Duty: format(new Date(val.duty_day), 'yyyy-MM-dd'),
                                    Shift_in: format(new Date(val.shift_in), 'yyyy-MM-dd HH:mm'),
                                    Shift_Out: format(new Date(val.shift_out), 'yyyy-MM-dd HH:mm'),
                                    worked: (isValid(new Date(val.punch_in)) && val.punch_in !== null) && (isValid(new Date(val.punch_out)) && val.punch_out !== null) ?
                                        formatDuration({ hours: interVal.hours, minutes: interVal.minutes }) : 0,
                                    late: val?.late_in,
                                    early: val?.early_out,
                                    em_no: val?.em_no,
                                    shft_desc: shft_desc,
                                    noff_min_days: noff_min_days,
                                    noff_max_days: noff_max_days,
                                    shift_id: shift_id,
                                    night_off_flag: night_off_flag,
                                    noff_flag: noff_flag,
                                }
                            })

                        ).then(async (element) => {

                            if (element?.length > 0) {
                                const extractedValues = element?.map(item => item.value);
                                return { status: 1, data: extractedValues }
                            } else {
                                return { status: 0, message: "something went wrong", errorMessage: '' }
                            }
                        })
                    } else {
                        return { status: 0, message: "something went wrong", errorMessage: '' }
                    }
                })
                // if (maindata?.status === 1 && openDateField === true) {
                if (maindata?.status === 1) {
                    const mainarray = maindata?.data
                    const NoffDatas = mainarray?.filter((val) =>
                        val.noff_flag !== 1 && val.noff_min_days !== 0 && val.noff_max_days !== 0 && (val.lvereq_desc === "P" || val.lvereq_desc === "LC")
                    );
                    SetNoffRequestData(NoffDatas)
                    SetNoffdayPunch(mainarray)
                } else {
                    SetNoffdayPunch([])
                }

            } else {
                warningNofity("No Data Found")
            }
        }
        else {
            SetNoffdayPunch([])
            warningNofity("Selected Days Punching Record Not Found")
        }
        // }
        // else {
        //     SetNoffdayPunch([])
        // }
    }, [GetNofftableData, requestUser, EmpNoffList, fromdate, todate])

    const handleDeleteRequest = useCallback((params) => {
        const data = params.api.getSelectedRows();
        SetOpen(true)
        SetmodalData(data)
    }, [])

    const [columnDef] = useState([
        { headerName: 'Sl No', field: 'slno', filter: true, width: 100 },
        { headerName: 'Employee Id', field: 'emp_no', filter: true, width: 150 },
        { headerName: 'Employee Names', field: 'em_name', filter: true, width: 250 },
        { headerName: 'Department', field: 'dept_name', filter: true, width: 200 },
        { headerName: 'NOFF Requested Date', field: 'noff_req_date', filter: true, width: 150 },
        {
            headerName: 'Cancel Request',
            cellRenderer: params => {
                return <OpenIcon
                    onClick={() => handleDeleteRequest(params)}
                    sx={{ paddingY: 0.5 }} >
                    <Tooltip title="Delete the Request">
                        <DeleteIcon color='primary' />
                    </Tooltip>
                </OpenIcon>
            }
        }
    ])

    const ReSetAllFields = useCallback(() => {
        setDeptID(0);
        setDeptSection(0);
        setEmployeeID(0);
        setRequestUser({});
        SetEmpNoffList([])
        setopenDateField(false);
        setRequireDate('');
        setFromDate('');
        setToDate('');
        SetNoffdayPunch([]);
        SetOpen(false);
        SetmodalData([]);
        Setcount(0);
        SetEmployeeNo(0)
    }, [])

    const submitRequest = useCallback(async () => {
        if (openDateField === true) {




            const monthStartDate = format(startOfMonth(new Date(requiredate)), 'yyyy-MM-dd')
            const postData = {
                month: monthStartDate,
                section: parseInt(requestUser?.sectionID)
            }
            const checkPunchMarkingHr = await axioslogin.post("/attendCal/checkPunchMarkingHR/", postData);
            const { success, data } = checkPunchMarkingHr.data
            if (success === 0 || success === 1) {
                const lastUpdateDate = data?.length === 0 ? format(startOfMonth(new Date(requiredate)), 'yyyy-MM-dd') : format(new Date(data[0]?.last_update_date), 'yyyy-MM-dd')
                const lastDay_month = format(lastDayOfMonth(new Date(requiredate)), 'yyyy-MM-dd')
                if ((lastUpdateDate === lastDay_month) || (lastUpdateDate > lastDay_month)) {
                    warningNofity("Punch Marking Monthly Process Done !! Can't Apply No punch Request!!  ")
                } else {


                    const getNoff = NoffRequestData?.filter(val => val.noff_min_days !== 0)
                        .map(val => ({
                            shift_id: val.shift_id,
                            noff_min_days: val.noff_min_days,
                            noff_max_days: val.noff_max_days
                        }));

                    //NoffRequestData
                    const NoffCount = NoffRequestData?.filter(val => val.lvereq_desc === "P" || val.lvereq_desc === "LC").length

                    // Find the minimum and maximum NOFF days
                    const minNoffDays = Math.min(...getNoff.map(val => val.noff_min_days));

                    const MinArray = getNoff?.filter(val => val.noff_min_days !== 0)
                        .map(val => ({
                            shift_id: val.shift_id,
                            noff_min_days: val.noff_min_days,
                            noff_max_days: val.noff_max_days
                        }));

                    const minNoffMinDays = Math.min(...MinArray.map(val => val.noff_min_days));

                    let checksameDay = [];
                    if (EmpNoffList !== undefined && EmpNoffList !== null) {
                        checksameDay = EmpNoffList?.filter(
                            (val) => format(new Date(val.noff_req_date), 'yyyy-MM-dd') === format(new Date(requiredate), 'yyyy-MM-dd')
                        );
                    }
                    else {
                        checksameDay = [];
                    }
                    if (checksameDay?.length === 0) {

                        const submitdata = {
                            duty_day: format(new Date(requiredate), 'yyyy-MM-dd'),
                            duty_desc: 'NOFF',
                            lvereq_desc: 'NOFF',
                            duty_status: 1,
                            lve_tble_updation_flag: 1,
                            em_no: requestUser?.emNo,
                            // frmdate: format(new Date(fromdate), 'yyyy-MM-dd'),
                            // todate: format(new Date(todate), 'yyyy-MM-dd'),
                            frmdate: fromdate,
                            todate: todate,
                            em_id: parseInt(requestUser?.emID),
                            dept: parseInt(requestUser?.deptID),
                            deptSec: parseInt(requestUser?.sectionID),
                            create_user: em_id
                        }

                        if (NoffRequestData?.length > 1) {
                            if ((parseInt(NoffCount) >= parseInt(minNoffDays)) && (parseInt(NoffCount) >= parseInt(minNoffMinDays))) {
                                const result = await axioslogin.post('/NightOff/InsertNOffTbl', submitdata)
                                const { success, message } = result.data
                                if (success === 1) {
                                    const result = await axioslogin.patch('/NightOff/updatenightoff', submitdata)
                                    const { success } = result.data
                                    if (success === 1) {
                                        succesNofity("NOFF Requested Sucessfully");
                                        GetEmpNOFFLists()
                                        setopenDateField(false)
                                        SetNoffRequestData([])
                                        SetNoffdayPunch([])
                                        setDropOpen(false)
                                    } else {
                                        warningNofity("Can't Apply Night Off! Contact IT")
                                    }
                                } else {
                                    warningNofity(message)
                                    SetNoffdayPunch([])
                                    setopenDateField(false)
                                    SetNoffRequestData([])
                                }

                            }
                            else {
                                setopenDateField(false)
                                SetNoffdayPunch([])
                                SetNoffRequestData([])
                                warningNofity(`Minimum Dates to Avail The NOFF is  ${minNoffDays} `)
                            }
                        }
                        else {
                            setopenDateField(false)
                            SetNoffdayPunch([])
                            SetNoffRequestData([])
                            warningNofity("No Night Offs Are Available Within The Chosen Dates, or They've Already Been Used")
                        }
                    }
                    else {
                        setopenDateField(false)
                        SetNoffdayPunch([])
                        SetNoffRequestData([])
                        warningNofity("Requested Date Already Taken")
                    }
                }
            }
        }
        else {
            warningNofity("Process the Data Before Submiting")
        }

    }, [NoffdayPunch, EmpNoffList, requiredate, fromdate, todate, requestUser, NoffRequestData])

    return (
        <Paper variant="outlined" sx={{ width: '100%', p: 0.5 }}  >
            <CustomLayout title="Night Off Request" displayClose={true} >
                <ToastContainer />
                <CustomBackDrop open={drop} text="Your Request Is Processing. Please Wait..." />
                <Box sx={{ width: '100%', }} >
                    {/* <Paper variant="outlined" sx={{ width: '100%', }}  > */}
                    <Paper variant="outlined" sx={{ p: 0.5, mt: 0.5 }}>
                        <Box sx={{ display: 'flex', flex: 1 }} >
                            <Box sx={{ flex: 1, px: 0.3 }} >
                                <Select
                                    defaultValue={0}
                                    onChange={handleChangeDepartmentID}
                                    sx={{ width: '100%' }}
                                    value={deptID}
                                    variant='outlined'
                                    color='primary'
                                    size='sm'
                                    disabled={disabled}
                                    placeholder="Select Department"
                                    slotProps={{
                                        listbox: {
                                            placement: 'bottom-start',
                                        },
                                    }}
                                >
                                    <Option disabled value={0}>Select Department</Option>
                                    {
                                        departmentNameList && departmentNameList?.map((val, index) => {
                                            return <Option key={index} value={val.dept_id}>{val.dept_name}</Option>
                                        })
                                    }
                                </Select>
                            </Box>
                            <Box sx={{ flex: 1, px: 0.3 }}>
                                <Select
                                    defaultValue={0}
                                    value={deptSection}
                                    onChange={handleChangeDepetSection}
                                    sx={{ width: '100%' }}
                                    size='sm'
                                    variant='outlined'
                                    color='primary'
                                    placeholder="Select Department Section"
                                    endDecorator={deptSectionList?.length === 0 && <div className='loading-spinner' ></div>}

                                >
                                    <Option disabled value={0}>Select Department Section</Option>
                                    {
                                        deptSectionList && deptSectionList?.map((val, index) => {
                                            return <Option key={index} value={val.sect_id}  >{val.sect_name}</Option>
                                        })
                                    }
                                </Select>
                            </Box>
                            <Box sx={{ width: '20%', px: 0.3 }}>
                                <Select
                                    onChange={handleChangeEmployeeName}
                                    sx={{ width: '100%' }}
                                    value={employeeID}
                                    size='sm'
                                    variant='outlined'
                                    color='primary'
                                    disabled={empDisableStat}
                                    placeholder="Employee Name"
                                    endDecorator={mapEmpList?.length === 0 && <div className='loading-spinner' ></div>}
                                >
                                    <Option disabled value={0}  >Employee Name</Option>
                                    {
                                        mapEmpList && mapEmpList?.map((val, index) => {
                                            return <Option key={index} value={val.em_no} label={val.em_name} onClick={() => setRequestUser({ ...requestUser, emID: val.em_id })} >
                                                <Box gap={-1}
                                                    sx={{
                                                        display: 'flex',
                                                        flex: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        paddingX: 1,
                                                        mx: -1,
                                                        gap: 0
                                                    }}>
                                                    <Typography level='body-sm'>{val.em_name}</Typography>
                                                    <Typography endDecorator={val.em_no} color='success' level='body-md'></Typography>
                                                </Box>
                                            </Option>
                                        })
                                    }
                                </Select>
                            </Box>
                            <Box sx={{ width: '10%', px: 0.3 }}>
                                <Input
                                    type='number'
                                    size="sm"
                                    fullWidth
                                    variant='outlined'
                                    color='primary'
                                    value={EmployeeNo}
                                    onChange={(e) => SetEmployeeNo(e.target.value)}
                                />
                            </Box>
                        </Box>
                    </Paper>
                    <Box>
                        <Box sx={{ display: 'flex', flex: 1 }} >
                            <Box sx={{ flex: 1, alignItems: 'center', px: 0.5 }} >
                                <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>Required Date </Typography>
                                {/* <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            views={['day']}
                                            inputFormat="dd-MM-yyyy"
                                            value={requiredate}
                                            size="small"
                                            onChange={(newValue) => {
                                                HandleRequireDate(newValue);
                                            }}
                                            renderInput={({ inputRef, inputProps, InputProps }) => (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CssVarsProvider>
                                                        <Input ref={inputRef} {...inputProps} disabled={true} style={{ width: "100%" }} />
                                                    </CssVarsProvider>
                                                    {InputProps?.endAdornment}
                                                </Box>
                                            )}
                                        />
                                    </LocalizationProvider> */}
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        views={['day']}
                                        inputFormat="dd-MM-yyyy"
                                        value={requiredate}
                                        size="small"
                                        onChange={(newValue) => {
                                            HandleRequireDate(newValue);
                                        }}
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        renderInput={({ inputRef, inputProps, InputProps }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CssVarsProvider>
                                                    <Input ref={inputRef} {...inputProps} disabled={true} style={{ width: "100%" }} />
                                                </CssVarsProvider>
                                                {InputProps?.endAdornment}
                                            </Box>
                                        )}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                                <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>From</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        views={['day']}
                                        inputFormat="dd-MM-yyyy"
                                        value={subDays(new Date(requiredate), parseInt(commonSettings?.noff_selct_day_count))}
                                        size="small"
                                        disabled={true}
                                        onChange={(newValue) => {
                                            setToDate(newValue);
                                        }}
                                        renderInput={({ inputRef, inputProps, InputProps }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                                <CssVarsProvider>
                                                    <Input ref={inputRef} {...inputProps} style={{ width: "100%" }} disabled={true} color='primary' />
                                                </CssVarsProvider>
                                                {InputProps?.endAdornment}
                                            </Box>
                                        )}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                                <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>To</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        views={['day']}
                                        inputFormat="dd-MM-yyyy"
                                        value={subDays(new Date(requiredate), 1)}
                                        size="small"
                                        disabled={true}
                                        onChange={(newValue) => {
                                            setFromDate(newValue);
                                        }}
                                        renderInput={({ inputRef, inputProps, InputProps }) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                                <CssVarsProvider>
                                                    <Input ref={inputRef} {...inputProps} style={{ width: "100%" }} disabled={true} color='primary' />
                                                </CssVarsProvider>
                                                {InputProps?.endAdornment}
                                            </Box>
                                        )}
                                    />
                                </LocalizationProvider>
                            </Box>
                            <Box sx={{ mt: 3, px: 1 }}>
                                <CssVarsProvider>
                                    <Tooltip title="Process" followCursor placement='top' arrow >
                                        <Button
                                            aria-label="Like"
                                            variant="outlined"
                                            color="danger"
                                            onClick={GetEmpNOFFLists}
                                            size='sm'
                                        >
                                            <AddCircleOutlineIcon />
                                        </Button>
                                    </Tooltip>
                                </CssVarsProvider>

                                {/* <IconButton sx={{ paddingY: 0.5, ml: 2 }}
                                    onClick={GetEmpNOFFLists}
                                >
                                    <AddCircleOutlineIcon
                                        color="primary"
                                        sx={{
                                            animation: 'move 1s ease infinite',
                                            '@keyframes move': {
                                                '0%': {
                                                    transform: 'translateX(-10px)',
                                                },
                                                '50%': {
                                                    transform: 'translateX(10px)',
                                                },
                                                '100%': {
                                                    transform: 'translateX(-10px)',
                                                },
                                            },
                                        }}
                                    />

                                </IconButton> */}
                            </Box>
                            <Box sx={{ mt: 3, px: 1 }}>
                                <CssVarsProvider>
                                    <Tooltip title="Refresh" followCursor placement='top' arrow >
                                        <Button
                                            aria-label="Like"
                                            variant="outlined"
                                            color="success"
                                            onClick={ReSetAllFields}
                                            size='sm'
                                        >
                                            <RefreshIcon />
                                        </Button>
                                    </Tooltip>
                                </CssVarsProvider>
                            </Box>
                            <Box sx={{ mt: 3, px: 2 }}>
                                <CssVarsProvider>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="md"
                                        color="primary"
                                        onClick={submitRequest}
                                    >
                                        Save Request
                                    </Button>
                                </CssVarsProvider>
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        {openDateField === true ?
                            <Paper variant="outlined" sx={{ width: '100%', p: 0.5, mt: 2 }}  >
                                <Box>
                                    <Table
                                        aria-label="basic table"
                                        color="secondary"
                                        size="sm"
                                        sx={{ width: '100%', borderRadius: 5, overflow: 'hidden' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th style={{ textAlign: "center" }}>Night Duty Days</th>
                                                <th style={{ textAlign: "center" }}>Shift</th>
                                                <th style={{ textAlign: "center" }}>Punch In</th>
                                                <th style={{ textAlign: "center" }}>Punch Out</th>
                                                <th style={{ textAlign: "center" }}>Duty Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {NoffdayPunch?.map((row, ndx) => (
                                                <tr key={ndx} style={{}}>
                                                    <td style={{ textAlign: "center", height: 15, p: 0, fontSize: 11.5, lineHeight: 1, width: '15%' }}>{row?.Duty}</td>
                                                    <td style={{ textAlign: "center", padding: 0 }}>{row?.shft_desc === null || undefined ? "Not Updated" : row?.shft_desc}</td>
                                                    <td style={{ textAlign: "center", padding: 0 }}>{row?.punch_in === null || undefined ? "No Punch" : row?.punch_in}</td>
                                                    <td style={{ textAlign: "center", padding: 0 }}>{row?.punch_out === null || undefined ? "No Punch" : row?.punch_out}</td>
                                                    <td style={{ textAlign: "center", padding: 0 }}>{row?.lvereq_desc === null || undefined ? "Not Updated" : row?.lvereq_desc === "P" ? "P" : row?.lvereq_desc === "WOFF" ? "WOFF" : row?.lvereq_desc === "A" ? "A" : row?.lvereq_desc === "HD" ? "HD" :
                                                        row?.lvereq_desc === "EGHD" ? "EGHD" : row?.lvereq_desc === "NOFF" ? "NOFF" : row?.lvereq_desc === "LC" ? "LC" : "Not Updated"}</td>
                                                    {/* <td style={{ textAlign: "center", padding: 0 }}>
                                                        {(() => {
                                                            switch (row?.lvereq_desc) {
                                                                case "P":
                                                                case "WOFF":
                                                                case "A":
                                                                case "HD":
                                                                case "EGHD":
                                                                case "NOFF":
                                                                case "LC":
                                                                    return row.lvereq_desc;
                                                                default:
                                                                    return "Not Updated";
                                                            }
                                                        })()}
                                                    </td> */}
                                                </tr>

                                            ))}
                                        </tbody>
                                    </Table>
                                </Box>
                            </Paper>
                            : null}
                    </Box>
                    <Box sx={{ display: 'flex', p: 0.2, width: "100%", }} >
                        {open === true ? <NOFFCancelModal count={count} Setcount={Setcount} SetOpen={SetOpen} open={open} modalData={modalData} em_id={em_id} SetNoffdayPunch={SetNoffdayPunch} NoffdayPunch={NoffdayPunch}
                            commonSettings={commonSettings} GetNofftableData={GetNofftableData} SetEmpNoffList={SetEmpNoffList} setopenDateField={setopenDateField} />
                            :
                            <Box sx={{ width: "100%", overflow: 'auto' }}>
                                <Box sx={{ height: 500, display: 'flex', flexDirection: "column" }}>
                                    <CommonAgGrid
                                        columnDefs={columnDef}
                                        tableData={EmpNoffList}
                                        sx={{
                                            height: 490,
                                            width: "100%",
                                            mt: 1
                                        }}
                                        rowHeight={30}
                                        headerHeight={30}
                                    />
                                </Box>
                            </Box>
                        }
                    </Box>
                </Box>
            </CustomLayout>
        </Paper>
    )
}

export default memo(NightOffRequestMainPage) 
