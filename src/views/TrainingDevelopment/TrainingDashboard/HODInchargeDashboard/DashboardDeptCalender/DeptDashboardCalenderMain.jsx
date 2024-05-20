import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Tooltip } from '@mui/material'
import moment from 'moment';
import { Box, Chip } from '@mui/joy';
import { endOfMonth, getMonth, getYear, startOfMonth } from 'date-fns';
import DeptTrainingRow from 'src/views/TrainingDevelopment/DepartmentalTraining/DeptTrainingRow';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'underscore';
import { DeptEmployeeNameDesList } from 'src/redux/actions/Training.Action';
import { axioslogin } from 'src/views/Axios/Axios';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';
import TrainingonMonthModal from 'src/views/TrainingDevelopment/DepartmentalTraining/TrainingonMonthModal';

const DeptDashboardCalenderMain = () => {

    const employeeState = useSelector((state) => state?.getProfileData?.ProfileData, _.isEqual);
    const employeeProfileDetl = useMemo(() => employeeState[0], [employeeState]);
    const { em_department, em_dept_section } = employeeProfileDetl;

    const dispatch = useDispatch()

    const [year, setYear] = useState(moment(new Date()).format("YYYY-MM-DD"));
    const yr = getYear(new Date(year))
    const [insertModal, setinsetmodal] = useState(0);
    const [open, setOpen] = useState(false);
    const [monthdata, setmonthData] = useState(0);
    const [checkdata, setCheckdata] = useState([]);
    const [count, Setcount] = useState(0);

    useEffect(() => {
        dispatch(DeptEmployeeNameDesList(em_department))
    }, [dispatch, count, em_department])

    const EmpDetails = useSelector((state) => state?.gettrainingData?.deptEmpNameDesDetails?.deptEmpNameDesDetailsList, _.isEqual);

    const months = [
        { id: 0, name: "Jan" }, { id: 1, name: "Feb" }, { id: 2, name: "Mar" }, { id: 3, name: "Apr" },
        { id: 4, name: "May" }, { id: 5, name: "Jun" }, { id: 6, name: "Jul" }, { id: 7, name: "Aug" },
        { id: 8, name: "Sep" }, { id: 9, name: "Oct" }, { id: 10, name: "Nov" }, { id: 11, name: "Dec" }
    ];


    const OpenInsertModal = useCallback((e, month) => {
        setinsetmodal(1);
        setOpen(true);
        const monthId = month.id
        setmonthData(monthId);
    }, [setinsetmodal, setOpen])


    const date = new Date(yr, monthdata, 1);
    const start = startOfMonth(new Date(date))
    const end = endOfMonth(new Date(date))

    const postdata = useMemo(() => {
        return {
            department: em_department,
            deparment_sect: em_dept_section,
            schedule_year: year,
        }
    }, [em_dept_section, em_department, year])

    useEffect(() => {
        const getData = async (postdata) => {
            const result = await axioslogin.post(`/TrainingAfterJoining/selectdepartmentalSchedule`, postdata)
            const { data, success } = result.data;
            if (success === 2) {

                const displayData = data?.map((val) => {
                    const object = {
                        slno: val.slno,
                        topic_slno: val.topic_slno,
                        dept_id: val.dept_id,
                        sect_id: val.sect_id,
                        dept_name: val.dept_name,
                        schedule_year: val.schedule_year,
                        year: getYear(new Date(val.schedule_year)),
                        schedule_date: val.schedule_date,
                        months: getMonth(new Date(val.schedule_date)),
                        date: moment(val.schedule_date).format("DD/MM/YYYY"),
                        schedule_remark: val.schedule_remark,
                        training_topic_name: val.training_topic_name,
                        traineer_name: val.traineer_name
                    }
                    return object;
                })
                setCheckdata(displayData)
            }
            else {
                warningNofity("Nodata Found")
                setCheckdata([])
            }
        }

        getData(postdata);

    }, [postdata, count])

    return (
        <Fragment>
            <Box sx={{ mt: 2, height: 600, width: "100%" }}>

                <Box sx={{ width: "100%", textAlign: "center", px: 10 }}>
                    <h4><u> TRAINING CALENDAR  {yr} </u></h4>
                    <Box sx={{ mt: 2, border: 1, backgroundColor: "#176B87", borderColor: "#D8D9DA", textAlign: "center", display: "flex", flexDirection: "row", }}>
                        <Box sx={{ color: "white", width: "20%", p: 1.5, borderRight: 1, borderColor: "#D8D9DA" }}><h6>MONTH</h6></Box>
                        <Box sx={{ color: "white", width: "40%", p: 1.5, borderRight: 1, borderColor: "#D8D9DA" }}> <h6>TOPIC</h6></Box>
                        <Box sx={{ color: "white", width: "30%", p: 1.5, borderRight: 1, borderColor: "#D8D9DA" }}> <h6>TRAINERS</h6></Box>
                        <Box sx={{ color: "white", width: "30%", p: 1.5, borderRight: 1, borderColor: "#D8D9DA" }}><h6>SCHEDULE DATE</h6></Box>
                    </Box>

                    <Box sx={{
                        overflow: 'auto',
                        '::-webkit-scrollbar': { display: "none" }, height: 500
                    }}>
                        {
                            months?.map((month, index) => (
                                <Box key={index}>
                                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                                        <Box sx={{
                                            width: "16.8%", borderBottom: 1, borderLeft: 1,
                                            borderColor: "#D8D9DA", display: "flex", flexDirection: "row", justifyContent: "center",
                                            bgcolor: "#EEF5FF",
                                            '&:hover': {
                                                bgcolor: '#DFF5FF',
                                            },

                                        }}>

                                            <Box onClick={(e) => OpenInsertModal(e, month)} sx={{ margin: "auto", cursor: "pointer", }}>
                                                <Tooltip title="Schedule Trainings">
                                                    <Chip
                                                        sx={{ color: "#265073", bgcolor: '#C2D9FF', my: 1, }}>
                                                        {month.name}     {yr}
                                                    </Chip>
                                                </Tooltip>
                                            </Box>

                                        </Box>
                                        <Box sx={{ width: "83.2%", backgroundColor: "#EEF5FF", }}>
                                            <DeptTrainingRow id={month.id} yr={yr}
                                                months={months} count={count} Setcount={Setcount}
                                                checkdata={checkdata} end={end} EmpDetails={EmpDetails} monthdata={monthdata}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            ))
                        }
                    </Box>
                </Box>

            </Box>

            {
                insertModal === 1 ? <TrainingonMonthModal checkdata={checkdata} dept={em_department}
                    monthdata={monthdata} deptSec={em_dept_section} year={year} setYear={setYear}
                    open={open} setinsetmodal={setinsetmodal} setOpen={setOpen} count={count} Setcount={Setcount}
                    start={start} end={end}
                /> : null
            }

        </Fragment >

    )
}

export default memo(DeptDashboardCalenderMain) 
