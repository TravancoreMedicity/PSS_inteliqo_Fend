import React, { memo, useEffect, useMemo, useState } from 'react'
import { Paper } from '@mui/material'
import { Box } from '@mui/system'
import TextField from '@mui/material/TextField'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import moment from 'moment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import DeptSelectByRedux from 'src/views/MuiComponents/DeptSelectByRedux'
import DeptSecSelectByRedux from 'src/views/MuiComponents/DeptSecSelectByRedux'
import { useReducer } from 'react'
import { lastDayOfMonth } from 'date-fns/esm'
import { CssVarsProvider, Button } from '@mui/joy'
import SaveIcon from '@mui/icons-material/Save';
import {
    dutyPlanInitialState,
    dutyPlanReducer,
    getEmployeeDetlDutyPlanBased,
    planInitialState,
} from 'src/views/Attendance/DutyPlan/DutyPlanFun/DutyPlanFun'
import _ from 'underscore'
import { ToastContainer } from 'react-toastify'
import { infoNofity, warningNofity } from 'src/views/CommonCode/Commonfunc'
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop'
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import { Actiontypes } from 'src/redux/constants/action.type'
import { useDispatch } from 'react-redux'

const AutomaticToCard = ({ setfromdate, setTodate, setEmpdata, empData }) => {

    const [open, setOpen] = useState(false)
    const { GET_SHIFT_PLAN_DETL, GET_SHIFT_DATE_FORMAT, FETCH_EMP_DETAILS } = Actiontypes;
    const { FROM_DATE, TO_DATE, DEPT_NAME, DEPT_SEC_NAME } = planInitialState

    const reduxDispatch = useDispatch()

    const setDepartment = (deptSlno) => dispatch({ type: DEPT_NAME, deptSlno })
    const setDepartSecName = (deptSecSlno) => dispatch({ type: DEPT_SEC_NAME, deptSecSlno })

    const [planState, dispatch] = useReducer(dutyPlanReducer, dutyPlanInitialState)
    const { fromDate, toDate, deptName, deptSecName } = planState
    const calanderMaxDate = lastDayOfMonth(new Date(fromDate))

    const getData = async (e) => {
        setOpen(true)
        e.preventDefault()
        if (deptName === 0 || deptSecName === 0) {
            infoNofity('Check The Department || Department Section Feild');
            setOpen(false);
        } else if (moment(toDate) > moment(calanderMaxDate)) {
            infoNofity('Select the Correct From || To || Both Dates')
            setOpen(false);
        } else {
            const postData = {
                em_department: deptName,
                em_dept_section: deptSecName,
            }
            getEmployeeDetlDutyPlanBased(postData).then((emplyDataArray) => {
                const { status, data } = emplyDataArray;
                if (status === 1) {
                    setfromdate(fromDate)
                    setTodate(toDate)
                    reduxDispatch({ type: GET_SHIFT_PLAN_DETL, payload: data, status: false })
                } else {
                    reduxDispatch({ type: GET_SHIFT_PLAN_DETL, payload: [], status: false })
                    warningNofity("No employees in this department!!")
                }
            })
        }
    }
    console.log(empData);
    const saveData = async () => {
        // const array1 = Detldata && Detldata.map((val, index) => {
        //     const obje = {
        //         em_no: val.EmployeeNo,
        //         em_id: val.em_id,
        //         dept_id: deptName,
        //         sect_id: deptSecName,
        //         attendance_marking_month: fromDate,
        //         attnd_mark_startdate: fromDate,
        //         attnd_mark_enddate: toDate,
        //         total_working_days: val.Total,
        //         tot_days_present: val.Worked,
        //         calculated_worked: val.CalculatedWorked,
        //         off_days: val.off,
        //         total_leave: val.Leave,
        //         total_lwp: val.lwp,
        //         total_lop: val.lop,
        //         calculated_lop: val.Calculatedlop,
        //         total_days: val.total_p_day,
        //         total_holidays: val.holiday,
        //         holiday_worked: val.holidayworked,
        //         process_status: 1
        //     }
        //     return obje
        // })
        // const checkData = {
        //     attendance_marking_month: fromDate
        // }

        // const result = await axioslogin.post("/payrollprocess/check/dateexist", checkData)
        // const { success } = result.data
        // if (success === 1) {
        //     infoNofity("Attendance is already processed for this month!")
        // } else {
        //     const result = await axioslogin.post("/payrollprocess/create/manual", array1)
        //     const { success, message } = result.data
        //     if (success === 1) {
        //         succesNofity(message)
        //     } else {
        //         errorNofity(message)
        //     }
        // }
    }

    return (
        <Paper
            square
            variant="outlined"
            sx={{ display: 'flex', flex: 1, flexDirection: 'row', p: 0.5, alignItems: 'center', mb: 0.5 }}
        >
            <ToastContainer />
            {/* <CustomBackDrop open={open} text="Please Wait" /> */}
            <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', }}>
                <Box sx={{ display: 'flex', mt: 0.5, px: 0.3, }} >
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                            views={['day']}
                            // maxDate={moment(calanderMaxDate)}
                            inputFormat="DD-MM-YYYY"
                            value={fromDate}
                            onChange={(date) =>
                                dispatch({ type: FROM_DATE, from: moment(date).format('YYYY-MM-DD') })
                            }
                            renderInput={(params) => (
                                <TextField {...params} helperText={null} size="small" sx={{ display: 'flex' }} />
                            )}
                        />
                    </LocalizationProvider>
                </Box>
                <Box sx={{ display: 'flex', mt: 0.5, px: 0.3, }} >
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                            views={['day']}
                            minDate={moment(fromDate)}
                            maxDate={moment(calanderMaxDate)}
                            inputFormat="DD-MM-YYYY"
                            value={toDate}
                            onChange={(date) =>
                                dispatch({ type: TO_DATE, to: moment(date).format('YYYY-MM-DD') })
                            }
                            renderInput={(params) => (
                                <TextField {...params} helperText={null} size="small" sx={{ display: 'flex' }} />
                            )}
                        />
                    </LocalizationProvider>
                </Box>
                <Box sx={{ display: 'flex', mt: 0.5, px: 0.3, }} >
                    <DeptSelectByRedux setValue={setDepartment} value={deptName} />
                </Box>
                <Box sx={{ display: 'flex', mt: 0.5, px: 0.3, }} >
                    <DeptSecSelectByRedux dept={deptName} setValue={setDepartSecName} value={deptSecName} />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', flex: { xs: 0, sm: 0, md: 0, lg: 0, xl: 1, }, justifyContent: 'flex-start' }} >
                <CssVarsProvider>
                    <Box sx={{ p: 0.2 }} >
                        <Button aria-label="Like" variant="outlined" color="neutral" onClick={getData} sx={{
                            color: '#90caf9'
                        }} >
                            <PublishedWithChangesIcon />
                        </Button>
                    </Box>
                    <Box sx={{ p: 0.2 }}>
                        <Button aria-label="Like" variant="outlined" color="neutral" onClick={saveData} sx={{
                            color: '#81c784'
                        }}>
                            <SaveIcon />
                        </Button>
                    </Box>
                </CssVarsProvider>
            </Box>
        </Paper>
    )
}

export default memo(AutomaticToCard)