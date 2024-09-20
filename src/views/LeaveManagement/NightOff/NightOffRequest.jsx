
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { axioslogin } from 'src/views/Axios/Axios'
import { Box, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { warningNofity, succesNofity, infoNofity } from 'src/views/CommonCode/Commonfunc';
import { Button, CssVarsProvider, Input, Table, Tooltip, Typography } from '@mui/joy';
import { subDays } from 'date-fns';
import { ToastContainer } from 'react-toastify';
import { setCommonSetting } from 'src/redux/actions/Common.Action'
import DeptSectionSelect from './DeptSectionSelect';
import EmployeeUderDeptSec from './EmployeeUderDeptSec';
import moment from 'moment/moment';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const NightOffRequest = () => {

    const dispatch = useDispatch();
    const [requiredate, setRequireDate] = useState(moment())
    const [fromdate, setFromDate] = useState('')
    const [todate, setToDate] = useState('')
    const [deptSection, setDeptSection] = useState(0);
    const [employee, setEmployee] = useState(0)
    const [DutyDetails, SetDutyDetails] = useState([])
    const [count, setCount] = useState(0)
    const [showDetails, SetshowDetails] = useState(0)
    const [nofTable, SetnofTable] = useState(0)
    const [noffList, SetnoffList] = useState([])

    //get the employee details for taking the HOd and Incharge Details
    const employeeState = useSelector((state) => state.getProfileData.ProfileData);
    const employeeProfileDetl = useMemo(() => employeeState[0], [employeeState]);

    const { em_no, em_id, em_name, sect_name, dept_name, hod, incharge } = employeeProfileDetl

    const getNoffDetails = useCallback(async () => {
        // SetshowDetails(1);

        if (deptSection !== 0 && employee !== 0 && fromdate !== '' && todate !== '') {
            const empdata = {
                fromDate: moment(fromdate).format('yyyy-MM-DD'),
                todate: moment(todate).format('yyyy-MM-DD'),
                em_no: hod === 0 && incharge === 0 ? em_no : employee
            };
            const result2 = await axioslogin.post('/attandancemarking/getnightoffdata', empdata);
            const { success: success2, data: data2 } = result2.data;
            if (success2 === 1) {
                console.log(data2);

                SetDutyDetails(data2);
            } else {
                SetDutyDetails([]);
                console.log(data2);
                infoNofity("Less Night duties Under Selected Dates,Not Applicable for NOFF")
            }
        }
        else {
            warningNofity("Select Employee and Required Date")
        }

    }, [SetshowDetails, deptSection, fromdate, todate, hod, incharge, em_no, employee]);

    const fetchNoffDetails = useCallback(async () => {
        const obj = {
            emp_no: parseInt(employee)
        };
        const result1 = await axioslogin.post('/attandancemarking/getNoffDetails', obj);
        const { success: success1, data: data1 } = result1.data;
        if (success1 === 1) {
            SetnoffList(data1);

        } else {
            SetnoffList([]);
        }

        // if (showDetails === 1) {
        //     try {
        //         const obj = {
        //             emp_no: parseInt(employee)
        //         };
        //         const result1 = await axioslogin.post('/attandancemarking/getNoffDetails', obj);
        //         const { success: success1, data: data1 } = result1.data;
        //         if (success1 === 1) {
        //             SetnofTable(1);
        //             SetnoffList(data1);
        //         } else {
        //             SetnofTable(0);
        //             SetnoffList([]);
        //         }

        //         const empdata = {
        //             fromDate: moment(fromdate).format('yyyy-MM-DD'),
        //             todate: moment(todate).format('yyyy-MM-DD'),
        //             em_no: hod === 0 && incharge === 0 ? em_no : employee
        //         };
        //         console.log(empdata);

        //         const result2 = await axioslogin.post('/attandancemarking/getnightoffdata', empdata);
        //         const { success: success2, data: data2 } = result2.data;
        //         if (success2 === 1) {
        //             SetDutyDetails(data2);
        //         } else {
        //             SetDutyDetails([]);
        //         }

        //     } catch (error) {
        //         console.error("Error fetching NOFF details:", error);
        //     }
        // }
    }, [showDetails, employee, fromdate, todate, hod, incharge, em_no]);

    useEffect(() => {
        dispatch(setCommonSetting());
        if (employee !== 0) {
            fetchNoffDetails();
        }
    }, [dispatch, fetchNoffDetails]);

    //Common settings
    const commonState = useSelector((state) => state.getCommonSettings);
    const commonSettings = useMemo(() => commonState, [commonState]);


    const HandleRequireDate = useCallback((newValue) => {
        setRequireDate(newValue)
        const todateValue = subDays(new Date(newValue), 1);
        const fromdateValue = subDays(new Date(newValue), parseInt(commonSettings?.noff_selct_day_count))
        setFromDate(fromdateValue)
        setToDate(todateValue)
    }, [commonSettings, setFromDate, setToDate])


    const submitRequest = useCallback(async () => {

        // if (showDetails === 1 && fromdate !== '' && todate !== '') {
        //     const empdata = {
        //         fromDate: moment(fromdate).format('yyyy-MM-DD'),
        //         todate: moment(todate).format('yyyy-MM-DD'),
        //         em_no: hod === 0 && incharge === 0 ? em_no : employee
        //     };
        //     const result2 = await axioslogin.post('/attandancemarking/getnightoffdata', empdata);
        //     const { success: success2, data: data2 } = result2.data;
        //     if (success2 === 1) {
        //         console.log(data2);

        //         SetDutyDetails(data2);
        //     } else {
        //         SetDutyDetails([]);
        //     }
        // }
        // else {
        //     warningNofity("Select the Required Date")
        // }



        // const empdata = {
        //     requiredate: moment(requiredate).format('yyyy-MM-DD'),
        //     em_no: hod === 0 && incharge === 0 ? em_no : employee
        // }
        // const result = await axioslogin.post('/attandancemarking/checkNoFF', empdata)
        // const { success, data } = result.data

        // const CheckNoff = data?.filter(val => val.night_off_flag).length;

        const countNoff = DutyDetails?.filter(val => val.night_off_flag).length;





        // if (parseInt(countNoff) >= parseInt(commonSettings?.noff_count)) {
        // if (data?.length !== 0) {
        // if (parseInt(countNoff) >= parseInt(commonSettings?.noff_count)) {
        // const submitdata = {
        //     duty_day: moment(requiredate).format('yyyy-MM-DD'),
        //     duty_desc: 'NOFF',
        //     lvereq_desc: 'NOFF',
        //     duty_status: 1,
        //     lve_tble_updation_flag: 1,
        //     em_no: hod === 0 && incharge === 0 ? em_no : employee,
        //     frmdate: moment(fromdate).format('yyyy-MM-DD'),
        //     todate: moment(todate).format('yyyy-MM-DD')
        // }
        // console.log("submitdata", submitdata);

        // const result = await axioslogin.patch('/attandancemarking/updatenightoff', submitdata)
        // const { success } = result.data
        // if (success === 1) {
        //     succesNofity("NOFF Requested Sucessfully");
        //     setRequireDate(new Date())
        //     setFromDate('')
        //     setToDate('')
        // } else {
        //     warningNofity('A NOFF has already been taken on the selected date')
        // }







        // }
        // else {
        //     warningNofity('A NOFF has already been taken on the selected date')
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
    }, [requiredate, requiredate, fromdate, todate, hod, incharge, em_no, employee, DutyDetails])


    return (
        <CustomLayout title="Night Off Request" displayClose={true} >
            <ToastContainer />
            <Paper variant="outlined" sx={{ width: '100%', p: 0.5 }}  >
                {hod === 1 || incharge === 1 ?
                    <Box sx={{ display: 'flex', width: '100%' }}>
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
                    <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, width: '100%' }}>
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
                <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, width: '100%', }}>
                    <Box sx={{ display: 'flex', flex: 1, p: 0.5, mt: 0.2, }} >
                        <Box sx={{ flex: 1, alignItems: 'center', px: 0.3 }} >
                            <Typography sx={{ fontWeight: "bold", pl: 3, color: "#686D76" }}>Required Date </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                        <Tooltip title="Process">
                            <Box sx={{ mt: 3, px: 2 }}>
                                <AddCircleOutlineIcon onClick={getNoffDetails} />
                            </Box>
                        </Tooltip>
                        <Box sx={{ flex: 1, mt: 3, px: 2 }}>
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
                {/* {nofTable === 1 && DutyDetails?.length !== 0 ?
                    <Paper variant="outlined" sx={{ width: '100%', p: 0.5, mt: 2 }}  >
                        <Box>
                            <Table sx={{ '& tr > *:not(:first-child)': { textAlign: 'right' } }}>
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
                                    {DutyDetails?.map((row, ndx) => (
                                        <tr key={ndx}>
                                            <td style={{ textAlign: "center" }}>{row?.duty_day}</td>
                                            <td style={{ textAlign: "center" }}>{row?.shft_desc === null || undefined ? "Not Updated" : row?.shft_desc}</td>
                                            <td style={{ textAlign: "center" }}>{row?.punch_in === null || undefined ? "No Punch" : row?.punch_in}</td>
                                            <td style={{ textAlign: "center" }}>{row?.punch_out === null || undefined ? "No Punch" : row?.punch_out}</td>
                                            <td style={{ textAlign: "center" }}>{row?.duty_desc === null || undefined ? "Not Updated" : "Present"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Box>
                    </Paper>
                    : null}
                 */}
                {noffList?.length === 1 ?
                    <Paper variant="outlined" sx={{ width: '100%', p: 0.5, mt: 2 }}  >
                        <Table sx={{ '& tr > *:not(:first-child)': { textAlign: 'right' } }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: "center" }}>Sl No</th>
                                    <th style={{ textAlign: "center" }}>Em ID</th>
                                    <th style={{ textAlign: "center" }}>Name</th>
                                    <th style={{ textAlign: "center" }}>Department</th>
                                    <th style={{ textAlign: "center" }}> NOFF Requested Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {noffList?.map((row, ndx) => (
                                    <tr key={ndx}>
                                        <td style={{ textAlign: "center" }}>1</td>
                                        <td style={{ textAlign: "center" }}>{row?.em_no === null || undefined ? "Not Updated" : row?.em_no}</td>
                                        <td style={{ textAlign: "center" }}>{row?.em_name === null || undefined ? "Not Updated" : row?.em_name}</td>
                                        <td style={{ textAlign: "center" }}>{row?.dept_name === null || undefined ? "Not Updated" : row?.dept_name}</td>
                                        <td style={{ textAlign: "center" }}>{row?.duty_day === null || undefined ? "Not Updated" : row?.duty_day}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Paper>
                    : null}

            </Paper>

        </CustomLayout >
    )
}

export default memo(NightOffRequest) 