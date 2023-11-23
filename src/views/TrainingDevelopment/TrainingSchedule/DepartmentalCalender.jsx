import React, { Fragment, memo, useCallback, useMemo } from 'react'
import CustomDashboardPage from 'src/views/Component/MuiCustomComponent/CustomDashboardPage';
import { CssVarsProvider, Input } from '@mui/joy'
import { Box, Paper } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import ScheduleCalender from './ScheduleCalender';
import DepartmentDropRedx from 'src/views/Component/ReduxComponent/DepartmentRedx';
import DepartmentSectionRedx from 'src/views/Component/ReduxComponent/DepartmentSectionRedx';
import { useEffect } from 'react';
import { setDepartment } from 'src/redux/actions/Department.action';
import { TrainerNames, TrainingTopics } from 'src/redux/actions/Training.Action';
import { getMonth, getYear } from 'date-fns';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';
import { axioslogin } from 'src/views/Axios/Axios';


const DepartmentalCalender = ({ setShow, count, Setcount }) => {

    const dispatch = useDispatch();

    const [dept, setdept] = useState(0);
    const [deptSec, setdeptSec] = useState(0);
    const [year, setYear] = useState(moment(new Date()).format("YYYY"));
    const [table, setTable] = useState(0);
    const [checkdata, setCheckdata] = useState([]);

    useEffect(() => {
        dispatch(setDepartment());
        dispatch(TrainingTopics());
        dispatch(TrainerNames());
    }, [dispatch, count])


    const updateYear = useCallback((e) => {
        const Y = moment(new Date(e)).format("YYYY")
        setYear(Y)
    }, [])

    const postdata = useMemo(() => {
        return {
            department: dept,
            deparment_sect: deptSec,
            schedule_year: year,
        }
    }, [dept, deptSec, year])
    useEffect(() => {
        const getData = async (postdata) => {
            const result = await axioslogin.post(`/TrainingAfterJoining/selectdepartmentalSchedule`, postdata)
            const { data, success } = result.data;
            if (success === 2) {
                if (data.length !== 0) {
                    setTable(1);
                    const displayData = data?.map((val) => {
                        const object = {
                            slno: val.slno,
                            topic_slno: val.topic_slno,
                            dept_id: val.dept_id,
                            dept_name: val.dept_name,
                            schedule_year: val.schedule_year,
                            year: getYear(new Date(val.schedule_year)),
                            schedule_date: val.schedule_date,
                            months: getMonth(new Date(val.schedule_date)),
                            date: moment(val.schedule_date).format("DD-MM-YYYY"),
                            schedule_remark: val.schedule_remark,
                            training_topic_name: val.training_topic_name,
                            traineer_name: val.traineer_name,
                            sect_id: val.sect_id
                        }
                        return object;
                    })

                    setCheckdata(displayData)

                }
                else {
                    setTable(1);
                }
            }
            else {
                warningNofity("Nodata Found")
                setCheckdata([])
                setTable(0);
            }
        }
        if ((dept !== 0 && deptSec !== 0 && deptSec !== undefined) || count !== 0) {
            getData(postdata);

        }

    }, [postdata, count, dept, deptSec, year])

    console.log("checkdata", checkdata);
    return (
        <Fragment>
            <ToastContainer />
            <CustomDashboardPage title="Departmental Training Calender" displayClose={true} setClose={setShow}  >
                <Box sx={{ width: "100%", p: 1, height: 800 }}>

                    <Paper variant='outlined' sx={{ p: 1, width: "100%", display: "flex", flexDirection: "row", gap: 0.5 }}>
                        <Box sx={{ flex: 1, }}>
                            <DepartmentDropRedx getDept={setdept} />
                        </Box>
                        <Box sx={{ flex: 1, }}>
                            <DepartmentSectionRedx getSection={setdeptSec}
                            />
                        </Box>

                        <Box sx={{ flex: 1, }}>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    views={['year']}
                                    value={year}
                                    name="year"
                                    onChange={(newValue) => {
                                        updateYear(newValue);
                                    }}
                                    renderInput={({ inputRef, inputProps, InputProps }) => (
                                        <Box sx={{ display: "flex", alignItems: "center", }}>
                                            <CssVarsProvider>
                                                <Input fullWidth ref={inputRef} {...inputProps} disabled={false} />
                                            </CssVarsProvider>
                                            {InputProps?.endAdornment}
                                        </Box>
                                    )}
                                />
                            </LocalizationProvider>

                        </Box>

                        <Box sx={{ flex: 1 }}></Box>
                    </Paper>
                    {
                        table === 1 ? <ScheduleCalender checkdata={checkdata} dept={dept} setdept={setdept} deptSec={deptSec} setdeptSec={setdeptSec} year={year}
                            setYear={setYear} count={count} Setcount={Setcount} setTable={setTable} /> : null
                    }
                </Box>
            </CustomDashboardPage >
        </Fragment >
    )
}

export default memo(DepartmentalCalender)
