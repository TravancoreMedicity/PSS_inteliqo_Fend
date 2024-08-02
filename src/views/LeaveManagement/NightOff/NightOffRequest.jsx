
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { axioslogin } from 'src/views/Axios/Axios'
import { Box, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { warningNofity, succesNofity } from 'src/views/CommonCode/Commonfunc';
import { Button, CssVarsProvider, Input, Typography } from '@mui/joy';
import { addDays, differenceInDays, format, isAfter, subDays } from 'date-fns';
import { ToastContainer } from 'react-toastify';
import { setCommonSetting } from 'src/redux/actions/Common.Action'
import DeptSectionSelect from './DeptSectionSelect';
import EmployeeUderDeptSec from './EmployeeUderDeptSec';
import moment from 'moment/moment';

const NightOffRequest = () => {

    const dispatch = useDispatch();
    const [requiredate, setRequireDate] = useState(moment())
    const [fromdate, setFromDate] = useState('')
    const [todate, setToDate] = useState('')
    const [deptSection, setDeptSection] = useState(0);
    const [employee, setEmployee] = useState(0)

    //get the employee details for taking the HOd and Incharge Details
    const employeeState = useSelector((state) => state.getProfileData.ProfileData);
    const employeeProfileDetl = useMemo(() => employeeState[0], [employeeState]);

    const { em_no, em_id, em_name, sect_name, dept_name, hod, incharge } = employeeProfileDetl

    useEffect(() => {
        dispatch(setCommonSetting());
    }, [dispatch])

    //Common settings
    const commonState = useSelector((state) => state.getCommonSettings);
    const commonSettings = useMemo(() => commonState, [commonState]);

    const HandleRequiredDate = useCallback((newValue) => {
        const reqDate = moment(newValue).format('YYYY-MM-DD');
        setRequireDate(reqDate);
    }, []);

    useEffect(() => {
        const todate = subDays(new Date(requiredate), 1)
        const tdate = moment(todate).format('DD-MM-YYYY');
        const fromdate = subDays(new Date(requiredate), commonSettings.noff_selct_day_count)
        const fdate = moment(fromdate).format('DD-MM-YYYY');
        setToDate(tdate)
        setFromDate(fdate)
    }, [requiredate, commonSettings])

    const submitRequest = useCallback(async () => {
        const empdata = {
            fromDate: moment(fromdate).format('yyyy-MM-DD'),
            todate: moment(todate).format('yyyy-MM-DD'),
            em_no: hod === 0 && incharge === 0 ? em_no : employee
        }
        // if (isAfter(new Date(requiredate), new Date(todate))) {
        // console.log(new Date(todate))
        console.log("todate", todate)
        console.log("fromdate", fromdate);

        // console.log("commonSettings.noff_count", commonSettings.noff_count);


        // if (differenceInDays(new Date(todate), new Date(fromdate)) === commonSettings.noff_count) {
        const result = await axioslogin.post('/attandancemarking/getnightoffdata', empdata)
        const { success, data } = result.data
        console.log("data", result.data);
        if (success === 1) {
            const submitdata = {
                duty_day: moment(requiredate).format('yyyy-MM-DD'),
                duty_desc: 'NOFF',
                duty_status: 1,
                lve_tble_updation_flag: 1,
                em_no: hod === 0 && incharge === 0 ? em_no : employee,
                frmdate: moment(fromdate).format('yyyy-MM-DD'),
                todate: moment(todate).format('yyyy-MM-DD')
            }
            console.log(submitdata);
            // const result = await axioslogin.patch('/attandancemarking/updatenightoff', submitdata)
            // const { success } = result.data
            // if (success === 1) {
            //     succesNofity("NOFF Requested Sucessfully");
            //     setRequireDate(new Date())
            //     setFromDate(new Date())
            //     setToDate(new Date())
            // }
        } else {
            warningNofity('Plaese mark Punch In Out!')
        }

        // }
        // else {
        //     warningNofity('Less Night duties Under Selected Dates,Not Applicable for NOFF')
        // }

        // } else {
        //     warningNofity("Plase Select Required date after to Date!!")
        // }

        // *************Previous Code*******************
        // const result = await axioslogin.post('/attandancemarking/getnightoffdata', empdata)
        // const { success } = result.data
        // if (success === 1) {
        //     const findata = result.data.message
        //     if (findata.length === commonSettings.noff_count) {
        //         const submitdata = {
        //             duty_day: moment(requiredate).format('yyyy-MM-DD'),
        //             duty_desc: 'NOFF',
        //             duty_status: 1,
        //             lve_tble_updation_flag: 1,
        //             em_no: hod === 0 && incharge === 0 ? em_no : employee,
        //             frmdate: moment(fromdate).format('yyyy-MM-DD'),
        //             todate: moment(todate).format('yyyy-MM-DD')
        //         }
        //         const result = await axioslogin.patch('/attandancemarking/updatenightoff', submitdata)
        //         const { success } = result.data
        //         if (success === 1) {
        //             succesNofity("NOFF Requested Sucessfully");
        //             setRequireDate(new Date())
        //             setFromDate(new Date())
        //             setToDate(new Date())
        //         }
        //     } else if (findata.length > commonSettings.noff_count) {
        //         warningNofity('More Night duties Selected,You Can Reduce the Date Range')
        //     }
        //     else {
        //         warningNofity('Less Night duties Under Selected Dates,Not Applicable for NOFF')
        //     }
        // } else if (success === 0) {
        //     warningNofity('No Night duties Under Selected Dates')
        // }
    }, [requiredate, fromdate, todate, hod, incharge, em_no, employee])

    return (
        <CustomLayout title="Night Off Request" displayClose={true} >
            <ToastContainer />
            <Paper variant="outlined" sx={{ width: '100%', p: 0.5 }}  >
                {hod === 1 || incharge === 1 ?
                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <Box sx={{ mt: 0.5, px: 0.3, flex: 1 }} >
                            <DeptSectionSelect em_id={413} value={deptSection} setValue={setDeptSection} />
                        </Box>
                        <Box sx={{ mt: 0.5, px: 0.3, flex: 1 }} >
                            <EmployeeUderDeptSec value={employee} setValue={setEmployee} deptSect={deptSection} />
                        </Box>
                        <Box sx={{ mt: 0.5, px: 0.3, flex: 1 }} >
                            <Input
                                value={employee}
                                disabled
                            />
                        </Box>
                    </Box>
                    :
                    <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', width: '100%' }}>
                        <Box sx={{ flex: 1, mt: 0.5, px: 0.3 }}>
                            <Input
                                value={dept_name}
                                disabled
                            />
                        </Box>
                        <Box sx={{ flex: 1, alignItems: 'center', mt: 0.5, px: 0.3 }} >
                            <Input
                                value={sect_name}
                                disabled
                            />
                        </Box>
                        <Box sx={{ flex: 1, alignItems: 'center', mt: 0.5, px: 0.3 }} >
                            <Input
                                value={em_name}
                                disabled
                            />
                        </Box>
                        <Box sx={{ flex: 1, alignItems: 'center', mt: 0.5, px: 0.3 }} >
                            <Input
                                value={em_no}
                                disabled
                            />
                        </Box>
                    </Box>
                }
                <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', width: '100%', }}>
                    <Box sx={{ display: 'flex', flex: 1, p: 0.5, mt: 0.2, flexDirection: 'row', }} >
                        <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                            <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>Required Date </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    views={['day']}
                                    inputFormat="dd-MM-yyyy"
                                    value={requiredate}
                                    size="small"
                                    onChange={(newValue) => {
                                        HandleRequiredDate(newValue);
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
                            </LocalizationProvider>
                        </Box>
                        <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                            <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>From</Typography>
                            <Input
                                value={fromdate}
                                disabled
                            />
                        </Box>
                        <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                            <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>To</Typography>
                            <Input
                                value={todate}
                                disabled
                            />
                        </Box>
                        <Box sx={{ mt: 3 }}>
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
                        {/* <Box sx={{ pt: 1, pl: 0.5 }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 350 }}>From Date: </Typography>
                        </Box>
                        <Box sx={{ flex: 1, pl: 0.5 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                < DatePicker
                                    views={['day']}
                                    value={fromdate}
                                    size="small"
                                    onChange={(newValue) => {
                                        setFromDate(newValue);
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
                        <Box sx={{ pt: 1, pl: 0.5 }}>
                            <CssVarsProvider>
                                <Typography sx={{ fontSize: 18, fontWeight: 350 }}>To Date: </Typography>
                            </CssVarsProvider>
                        </Box>
                        <Box sx={{ flex: 1, pl: 0.5 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                < DatePicker
                                    views={['day']}
                                    minDate={addDays(new Date(fromdate), commonSettings.noff_count)}
                                    value={todate}
                                    size="small"
                                    onChange={(newValue) => {
                                        setToDate(newValue);
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
                        </Box> */}
                    </Box>

                </Box>
            </Paper>
        </CustomLayout >
    )
}

export default memo(NightOffRequest) 