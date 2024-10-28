import { Paper } from '@mui/material'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Button, Checkbox, CssVarsProvider, Grid, Input, Option, Select, Textarea, Tooltip } from '@mui/joy';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getDepartmentShiftDetails } from '../LeavereRequsition/Func/LeaveFunction';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import { axioslogin } from 'src/views/Axios/Axios';
import { errorNofity, succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { addDays, addHours, format, subHours, isValid } from 'date-fns'
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop';
import { getAttendanceCalculation, getLateInTimeIntervel } from 'src/views/Attendance/PunchMarkingHR/punchMarkingHrFunc';

const WoffPresentSubmit = ({ employeeData, setCount, setShowForm, setShowtable, count }) => {

    const empData = useMemo(() => employeeData, [employeeData])

    const [fromDate, setFromDate] = useState(moment(new Date()))
    //const [disShift, setDisShift] = useState(false)
    const [deptShift, setDeptShift] = useState([])
    const [selectedShift, setSelectedShift] = useState(0)
    const [punchSlno, setPunchSlno] = useState(0)
    const [EmpSalary, setEmpSalary] = useState(0)


    const [shiftTiming, setShiftTiming] = useState([])
    const [punchDetl, setPunchDetl] = useState([])
    const [disableCheck, setDisableCheck] = useState(true)
    // const [selectedShiftTiming, setselectedShiftTiming] = useState({})
    const [reason, setReason] = useState('')

    const [checkinBox, setCheckIn] = useState(false)
    const [checkoutBox, setCheckOut] = useState(false)

    const [disableIn, setDisableIn] = useState(true)
    const [disableOut, setDisableOut] = useState(true)

    const [punchInTime, setPunchInTime] = useState(0);
    const [punchOutTime, setPunchOutTime] = useState(0);

    const [openBkDrop, setOpenBkDrop] = useState(false)
    // const [tableArray, setTableArray] = useState([]);
    // const [message, setMessage] = useState(false)

    const state = useSelector((state) => state?.getCommonSettings)
    const commonStates = useMemo(() => state, [state])
    const { salary_above, week_off_day, comp_hour_count, punch_taken_hour_count, cmmn_late_in, cmmn_grace_period, default_shift, notapplicable_shift, noff, halfday_time_count } = commonStates;

    const employeeState = useSelector((state) => state?.getProfileData?.ProfileData);
    const employeeProfileDetl = useMemo(() => employeeState[0], [employeeState]);
    const { em_id } = employeeProfileDetl;

    const shiftData = useSelector((state) => state?.getShiftList?.shiftDetails)

    useEffect(() => {
        if (Object.keys(empData).length !== 0) {
            getDepartmentShiftDetails(empData).then((values) => {
                const { status, deptShift, shiftTime } = values;
                if (status === 1) {
                    setDeptShift(deptShift);
                    setShiftTiming(shiftTime)
                    // setDisShift(false)
                } else {
                    setDeptShift([]);
                    setShiftTiming([])
                }
            })
        }
    }, [empData])

    const
        handleChangefetchShift = useCallback(async () => {
            setDisableCheck(false)
            if (selectedShift !== 0 && isValid(new Date(fromDate)) && Object.keys(empData).length !== 0) {
                //GET SHIFT DATA 
                const postData = {
                    emp_id: empData?.emID,
                    duty_day: moment(fromDate).format('YYYY-MM-DD')
                }

                const result = await axioslogin.post('common/getShiftdetails/', postData);
                const { success, data, message } = result.data;
                // console.log(data);
                const { lve_tble_updation_flag, punch_slno, holiday_slno, shift_id } = data[0];

                if (success === 1 && shift_id === week_off_day) {
                    setPunchSlno(punch_slno)
                    const selectedShiftTiming = shiftTiming?.filter(val => val.shft_slno === selectedShift)
                    const { shft_chkin_time, shft_chkout_time, shft_cross_day } = selectedShiftTiming[0]

                    const inTime = moment(shft_chkin_time).format('HH:mm:ss');
                    const outTime = moment(shft_chkout_time).format('HH:mm:ss');

                    const selecteShiftData = {
                        inCheck: shft_chkin_time,
                        outCheck: shft_chkout_time
                    }
                    // setselectedShiftTiming(selecteShiftData);

                    const chekIn = `${moment(fromDate).format('YYYY-MM-DD')} ${inTime}`;
                    const chekOut = `${moment(fromDate).format('YYYY-MM-DD')} ${outTime}`;

                    const result = await axioslogin.get(`/common/getEmpoyeeInfomation/${empData?.emID}`);
                    const { success, data: Salarydata } = result.data;
                    if (success === 1) {
                        const { gross_salary } = Salarydata[0]
                        setEmpSalary(gross_salary);
                        if (lve_tble_updation_flag === 1) {
                            warningNofity('Selected Date Already Raised A WOFF Present Request')
                            setDisableCheck(true)
                        }
                        else if (holiday_slno !== 0 && gross_salary < salary_above) {
                            warningNofity('Cannot Apply for WOFF Present Request!')
                            setDisableCheck(true)
                        }
                        else if (shift_id !== week_off_day && holiday_slno === 0) {
                            warningNofity("Can't Apply for WOFF Present, Shift Must be Week Off")
                            setDisableCheck(true)
                        }
                        else {

                            //TO FETCH PUNCH DATA FROM TABLE
                            const postDataForpunchMaster = {
                                date1: shft_cross_day === 0 ? format(addHours(new Date(chekOut), comp_hour_count), 'yyyy-MM-dd H:mm:ss') : format(addHours(new Date(addDays(new Date(fromDate), 1)), comp_hour_count), 'yyyy-MM-dd H:mm:ss'),
                                date2: shft_cross_day === 0 ? format(subHours(new Date(chekIn), comp_hour_count), 'yyyy-MM-dd H:mm:ss') : format(subHours(new Date(fromDate), comp_hour_count), 'yyyy-MM-dd H:mm:ss'),
                                em_no: empData?.emNo
                            }

                            // console.log("postDataForpunchMaster", postDataForpunchMaster);

                            //FETCH THE PUNCH TIME FROM PUNCH DATA
                            const result = await axioslogin.post('common/getShiftdata/', postDataForpunchMaster)
                            const { success, data } = result.data;

                            if (success === 1) {
                                setPunchDetl(data)
                                succesNofity('Done , Select The Punching Info')
                            } else if (success === 0) {
                                //no record
                                warningNofity('Punching Data Not Found')
                                setDisableCheck(true)
                            } else {
                                // error
                                errorNofity(message)
                                setDisableCheck(true)
                            }
                        }
                    } else {
                        warningNofity("Employee Details Not Found")
                    }
                } else {
                    warningNofity("Can't Apply for Compensatory Off, Shift Must be Week Off")
                    setDisableCheck(true)
                }

            } else {
                warningNofity('Select The Off Type and Shift Feild')
            }
        }, [fromDate, selectedShift, empData, shiftTiming, salary_above,
            week_off_day, comp_hour_count])

    const handleChangeCheckInCheck = useCallback((e) => {
        const checkin = e.target.checked;
        setCheckIn(checkin)
        setDisableIn(!checkin)
    }, [])

    const handleChangeCheckOutCheck = useCallback((e) => {
        const checkout = e.target.checked;
        setCheckOut(checkout)
        setDisableOut(!checkout)
    }, [])

    const handleChangeSubmitCoffRequest = useCallback(async () => {

        if (punchInTime !== 0 && punchOutTime !== 0 && selectedShift !== 0 && reason !== '') {

            const crossDay = shiftData?.find(shft => shft.shft_slno === selectedShift);
            const crossDayStat = crossDay?.shft_cross_day ?? 0;

            // Format shift in and out times
            const shiftIn = `${format(new Date(fromDate), 'yyyy-MM-dd')} ${format(new Date(crossDay?.checkInTime), 'HH:mm')}`;
            const shiftOut = crossDayStat === 0
                ? `${format(new Date(fromDate), 'yyyy-MM-dd')} ${format(new Date(crossDay?.checkOutTime), 'HH:mm')}`
                : `${format(addDays(new Date(fromDate), 1), 'yyyy-MM-dd')} ${format(new Date(crossDay?.checkOutTime), 'HH:mm')}`;

            const startPunchInTime = subHours(new Date(shiftIn), 16); // 16 hours before shift in time
            const endPunchOutTime = addHours(new Date(shiftOut), punch_taken_hour_count); // Extend based on punch hours

            // Filter punch data based on in and out times
            const filteredPunchData = punchDetl
                ?.map(e => new Date(e.punch_time))
                ?.filter(punchTime => startPunchInTime <= punchTime && punchTime <= endPunchOutTime)
                ?.map(punchTime => format(punchTime, 'yyyy-MM-dd HH:mm'));

            // Filter punch master data between in and out times
            const filteredPunchMasterDataAll = punchDetl
                ?.map(e => [
                    (e.punch_in && isValid(new Date(e.punch_in))) && new Date(e.punch_in),
                    (e.punch_out && isValid(new Date(e.punch_out))) && new Date(e.punch_out)
                ])
                ?.flat()
                ?.filter(e => e) // Remove falsy values
                ?.filter(punchTime => startPunchInTime <= punchTime && punchTime <= endPunchOutTime)
                ?.map(punchTime => format(punchTime, 'yyyy-MM-dd HH:mm'));

            // Filter punch master data for the selected date
            const filteredPunchMasterDataSelectedDate = punchDetl
                ?.filter(e => e.duty_day === fromDate)
                ?.map(e => [
                    (e.punch_in && isValid(new Date(e.punch_in))) && new Date(e.punch_in),
                    (e.punch_out && isValid(new Date(e.punch_out))) && new Date(e.punch_out)
                ])
                ?.flat()
                ?.filter(e => e) // Remove falsy values
                ?.filter(punchTime => startPunchInTime <= punchTime && punchTime <= endPunchOutTime)
                ?.map(punchTime => format(punchTime, 'yyyy-MM-dd HH:mm'));

            // Remove punches from filteredPunchData that are already in filteredPunchMasterDataAll
            const finalFilteredData = filteredPunchData
                ?.filter(punch => !filteredPunchMasterDataAll.includes(punch))
                ?.concat(filteredPunchMasterDataSelectedDate);

            // Update punch in and out data
            const updatePunchInOutData = async () => {
                try {
                    const punch_In = new Date(punchInTime);
                    const punch_out = new Date(punchOutTime);
                    const shift_In = new Date(shiftIn);
                    const shift_Out = new Date(shiftOut);
                    const holidayStatus = 0;

                    const getLateInTime = await getLateInTimeIntervel(punch_In, shift_In, punch_out, shift_Out);

                    if (isValid(punch_In) && isValid(punch_out)) {
                        const salaryLimit = EmpSalary > salary_above;

                        const getAttendance = await getAttendanceCalculation(
                            punch_In, shift_In, punch_out, shift_Out, cmmn_grace_period, getLateInTime,
                            holidayStatus, selectedShift, default_shift, notapplicable_shift, noff, week_off_day,
                            cmmn_late_in, halfday_time_count, salaryLimit
                        );
                        const postData = {
                            punch_in: format(punch_In, 'yyyy-MM-dd HH:mm:ss'),
                            punch_out: format(punch_out, 'yyyy-MM-dd HH:mm:ss'),
                            hrs_worked: getLateInTime?.hrsWorked,
                            late_in: getLateInTime?.lateIn,
                            early_out: getLateInTime?.earlyOut,
                            // duty_status: getAttendance?.duty_status,
                            duty_status: getAttendance?.duty_desc === "P" ? 2 : 0,
                            duty_desc: getAttendance?.duty_desc === "P" ? "WP" : getAttendance?.duty_desc,
                            lvereq_desc: getAttendance?.lvereq_desc === "P" ? "WP" : getAttendance?.lvereq_desc,
                            punch_slno: punchSlno,
                            deptID: empData?.deptID,
                            emID: empData?.emID,
                            sectionID: empData?.sectionID,
                            emNo: empData?.emNo,
                            remark: reason,
                            duty_day: format(new Date(fromDate), 'yyyy-MM-dd'),
                            create_user: em_id,
                            shiftId: selectedShift,
                            shift_In: format(shift_In, 'yyyy-MM-dd HH:mm:ss'),
                            shift_Out: format(shift_Out, 'yyyy-MM-dd HH:mm:ss')
                        };

                        let result = await axioslogin.post("/attendCal/WOffPresentDuty", postData);
                        const { success } = result.data;
                        if (success === 1) {
                            setShowtable(1)
                            succesNofity('Week Off Present Credited SuccessFully');
                            setCount(count + 1)
                            setOpenBkDrop(false)
                            setShowForm(0)
                        } else {
                            errorNofity('Punch Data Not Updated! Contact HR/IT');
                            setOpenBkDrop(false)
                            setShowForm(0)
                        }

                    } else {
                        warningNofity("Enter Punch In & Out Time"); // Invalid punch in/out times
                    }
                } catch (error) {
                    warningNofity("Enter Punch In & Out Time");
                    // console.error('Error updating punch data:', error);
                }
            }

            updatePunchInOutData();
        }
        else {
            warningNofity("Enter Punch In & Out Time");
        }
        // Call the update function

    }, [punchSlno, empData, punchInTime, punchOutTime, fromDate, selectedShift, punch_taken_hour_count, EmpSalary, reason, em_id, setShowtable, count]);


    return (
        <Paper variant='outlined' sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
            <CustomBackDrop open={openBkDrop} text="Please wait !. Submitting COFF Request" />
            <Box sx={{ display: "flex", flex: 1, px: 0.5, alignItems: 'center' }} >
                <Box sx={{ flex: 1, px: 0.5, mt: 0.5 }} >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            views={['day']}
                            inputFormat="dd-MM-yyyy"
                            value={fromDate}
                            size="small"
                            onChange={(newValue) => {
                                setFromDate(newValue);
                            }}
                            renderInput={({ inputRef, inputProps, InputProps }) => (
                                <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                    <CssVarsProvider>
                                        <Input ref={inputRef} {...inputProps} style={{ width: '100%' }} disabled={true} />
                                    </CssVarsProvider>
                                    {InputProps?.endAdornment}
                                </Box>
                            )}
                        />
                    </LocalizationProvider>
                </Box>

                <Box sx={{ flex: 1, px: 0.5, mt: 0.5 }} >
                    <Select
                        value={selectedShift}
                        onChange={(event, newValue) => {
                            setSelectedShift(newValue);
                        }}
                        size='md'
                        variant='outlined'
                    >
                        <Option disabled value={0}>Select Shift</Option>
                        {
                            deptShift?.map((val) => {
                                return <Option key={val.shiftcode} value={val.shiftcode}>{val.shiftDescription}</Option>
                            })
                        }
                    </Select>
                </Box>
                <Box sx={{ px: 0.5, mt: 0.5 }}>
                    <Tooltip title="Click Here to Add Leaves" followCursor placement='top' arrow variant='outlined' color='success'  >
                        <Button
                            aria-label="Like"
                            variant="outlined"
                            color="success"
                            onClick={handleChangefetchShift}
                            size='sm'
                            sx={{ width: '100%' }}
                            endDecorator={<Box>Show Punch Data</Box>}
                        >
                            <ExitToAppOutlinedIcon fontSize='medium' />
                        </Button>
                    </Tooltip>
                </Box>
            </Box>
            <Box sx={{ display: "flex", flex: 1, px: 1, mt: 0.3, alignItems: 'center', justifyContent: 'space-evenly' }} >
                <Box sx={{ display: "flex", mx: 2, alignItems: 'center', }} >
                    <Checkbox
                        label={`Check In`}
                        variant="outlined"
                        color='danger'
                        size="lg"
                        disabled={disableCheck}
                        onChange={(e) => handleChangeCheckInCheck(e)}
                        checked={checkinBox}
                    />
                </Box>
                <Box sx={{ display: 'flex', flex: 1, p: 0.2, }} >
                    <Select
                        value={punchInTime}
                        onChange={(event, newValue) => {
                            setPunchInTime(newValue);
                        }}
                        sx={{ width: '100%' }}
                        size='md'
                        variant='outlined'
                        disabled={disableIn}
                    >
                        <Option disabled value={0}>Select Check In Time</Option>
                        {
                            punchDetl?.map((val, index) => {
                                return <Option key={index} value={val.punch_time}>{val.punch_time}</Option>
                            })
                        }
                    </Select>
                </Box>
                <Box sx={{ display: "flex", mx: 2, alignItems: 'center', }} >
                    <Checkbox
                        label={`Check Out`}
                        variant="outlined"
                        color='danger'
                        size="lg"
                        disabled={disableCheck}
                        onChange={(e) => handleChangeCheckOutCheck(e)}
                        checked={checkoutBox}
                    />

                </Box>
                <Box sx={{ display: 'flex', flex: 1, p: 0.2, }} >
                    <Select
                        value={punchOutTime}
                        onChange={(event, newValue) => {
                            setPunchOutTime(newValue);
                        }}
                        sx={{ width: '100%' }}
                        size='md'
                        variant='outlined'
                        disabled={disableOut}
                    >
                        <Option disabled value={0}>Select Check Out Time</Option>
                        {
                            punchDetl?.map((val, index) => {
                                return <Option key={index} value={val.punch_time}>{val.punch_time}</Option>
                            })
                        }
                    </Select>
                </Box>
            </Box>
            <Box
                sx={{ display: 'flex', flex: 1, width: '100%', my: 0.3, px: 1 }}
                component={Grid}
            >
                <Box sx={{ display: 'flex', flex: 3 }} >
                    <Textarea
                        label="Outlined"
                        placeholder="Reason For Week OFF Present Setting"
                        variant="outlined"
                        color="warning"
                        size="sm"
                        minRows={1}
                        maxRows={2}
                        onChange={(e) => setReason(e.target.value)}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', px: 1, justifyContent: "space-evenly" }}>
                    <Box sx={{ display: 'flex', flex: 1, }} >
                        <Tooltip title="Save Week Off Present Request" variant="outlined" color="success" placement="top" followCursor arrow>
                            <Button
                                variant="outlined"
                                component="label"
                                size="sm"
                                fullWidth
                                color="primary"
                                onClick={handleChangeSubmitCoffRequest}
                            >
                                Save Request
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </Paper >
    )
}

export default memo(WoffPresentSubmit) 