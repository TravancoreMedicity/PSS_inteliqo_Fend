import React, { useMemo } from 'react'
import { memo } from 'react'
import { Button, Paper } from '@mui/material'
import { Box } from '@mui/system'
import TextField from '@mui/material/TextField'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import moment from 'moment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useState } from 'react'
import DeptSelectByRedux from 'src/views/MuiComponents/DeptSelectByRedux'
import DeptSecSelectByRedux from 'src/views/MuiComponents/DeptSecSelectByRedux'
import SendIcon from '@mui/icons-material/Send'
import { useReducer } from 'react'
import { addDays, lastDayOfMonth } from 'date-fns/esm'
import {
    dutyPlanInitialState,
    dutyPlanInsertFun,
    dutyPlanReducer,
    getEmployeeDetlDutyPlanBased,
    planInitialState,
} from './DutyPlanFun/DutyPlanFun'
import { infoNofity } from 'src/views/CommonCode/Commonfunc'
import { useDispatch } from 'react-redux'
import { getdeptShift, getempdetails } from 'src/redux/actions/dutyplan.action'
import { useEffect } from 'react'
import { setCommonSetting } from 'src/redux/actions/Common.Action'
import { useSelector } from 'react-redux'
import { getHolidayList } from 'src/redux/actions/LeaveProcess.action'
import _ from 'underscore'
import { Actiontypes } from 'src/redux/constants/action.type'
import CustomBackDrop from 'src/views/Component/MuiCustomComponent/CustomBackDrop'

const DutyPlanTopCard = () => {
    const [count, setCount] = useState(0)
    const [plan, setPlan] = useState([])
    const [dateFormat, setDateFormat] = useState([])
    const [open, setOpen] = useState(false)

    const { FETCH_EMP_DETAILS } = Actiontypes;
    const reduxDispatch = useDispatch()
    const { FROM_DATE, TO_DATE, DEPT_NAME, DEPT_SEC_NAME } = planInitialState

    const setDepartment = (deptSlno) => dispatch({ type: DEPT_NAME, deptSlno })
    const setDepartSecName = (deptSecSlno) => dispatch({ type: DEPT_SEC_NAME, deptSecSlno })

    const [planState, dispatch] = useReducer(dutyPlanReducer, dutyPlanInitialState)
    const { fromDate, toDate, deptName, deptSecName } = planState
    const calanderMaxDate = lastDayOfMonth(new Date(fromDate))


    // console.log(deptName, deptSecName)

    useEffect(() => {
        // common settings
        reduxDispatch(setCommonSetting());
        //get holiday current
        reduxDispatch(getHolidayList());

        return () => {
            dispatch({ type: FETCH_EMP_DETAILS, payload: [] })
        }
    }, [])


    // state variable from reducx state
    // EMployee detaild selected dept & dept_section
    const employeeDetl = useSelector((state) => state.getEmployeedetailsDutyplan.EmpdetlInitialdata, _.isEqual);
    //Common settings
    const commonState = useSelector((state) => state.getCommonSettings, _.isEqual);
    // get holiday 
    const holiday = useSelector((state) => state.getHolidayList, _.isEqual);
    // selected department shift details
    const departmentShiftt = useSelector((state) => state.getDepartmentShiftData.deptShiftData, _.isEqual);


    const empDetl = useMemo(() => employeeDetl, [employeeDetl]);
    const commonSettings = useMemo(() => commonState, [commonState]);
    const holidayList = useMemo(() => holiday, [holiday]);
    const deptShift = useMemo(() => departmentShiftt, [departmentShiftt])

    /****
     * a->before getting the date need to check the validation it exceed current month last days
     *
     * 1-> get post data dep,sect,and date start & end
     * 2-> dispatch for gettting employee details
     */

    const onClickDutyPlanButton = async (e) => {
        setOpen(true)
        e.preventDefault()
        if (deptName === 0 || deptSecName === 0) {
            infoNofity('Check The Department || Department Section Feild');
            setOpen(false);
        } else if (moment(toDate) > moment(calanderMaxDate)) {
            infoNofity('Select the Correct From || To || Both Dates')
            setOpen(false);
        } else {
            //For get shift Details
            const postData = {
                em_department: deptName,
                em_dept_section: deptSecName,
            }

            const departmentDetlFrShiftGet = {
                dept_id: deptName,
                sect_id: deptSecName
            }

            getEmployeeDetlDutyPlanBased(postData).then((emplyDataArray) => {
                const { status, data } = emplyDataArray;
                if (status === 1) {
                    dispatch({ type: FETCH_EMP_DETAILS, payload: data });
                    reduxDispatch(getdeptShift(departmentDetlFrShiftGet));
                    //process function
                    dutyPlanInsertFun(planState, commonSettings, holidayList, data, deptShift).then((values) => {
                        //employee details based on selected dept and dept sec
                        const { data, status, message, dateFormat } = values;
                        if (status === 1) {
                            setPlan(data);
                            setDateFormat(dateFormat);
                            setOpen(false)
                        } else {

                        }

                    })
                } else {
                    dispatch({ type: FETCH_EMP_DETAILS, payload: [] })
                }
            })
        }
    }

    const planData = useMemo(() => plan, [plan])
    console.log(planData)
    console.log(dateFormat)
    return (
        <Paper
            square
            variant="outlined"
            sx={{ display: 'flex', flex: 1, flexDirection: 'row', p: 0.5, alignItems: 'center', mb: 0.5 }}
        >
            <CustomBackDrop open={open} />
            <Box
                sx={{
                    display: 'flex',
                    flex: {
                        xs: 4,
                        sm: 4,
                        md: 4,
                        lg: 4,
                        xl: 3,
                    },
                    flexDirection: 'row',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        mt: 0.5,
                        px: 0.3,
                        // width: { sm: 100, md: 100, lg: 100 },
                    }}
                >
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
                <Box
                    sx={{
                        display: 'flex',
                        mt: 0.5,
                        px: 0.3,
                        // width: { sm: , md: 100, lg: 100 },
                    }}
                >
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
                <Box
                    sx={{
                        display: 'flex',
                        mt: 0.5,
                        px: 0.3,
                    }}
                >
                    <DeptSelectByRedux setValue={setDepartment} value={deptName} />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        mt: 0.5,
                        px: 0.3,
                    }}
                >
                    <DeptSecSelectByRedux dept={deptName} setValue={setDepartSecName} value={deptSecName} />
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flex: {
                        xs: 0,
                        sm: 0,
                        md: 0,
                        lg: 0,
                        xl: 1,
                    },
                }}
            >
                <Button variant="outlined" startIcon={<SendIcon />} onClick={onClickDutyPlanButton}>
                    Process
                </Button>
            </Box>
        </Paper>
    )
}

export default memo(DutyPlanTopCard)
