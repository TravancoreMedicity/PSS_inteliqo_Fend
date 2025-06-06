import React, { Fragment, useState, useCallback, memo, useEffect } from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { ToastContainer } from 'react-toastify'
import ReportLayout from '../ReportComponent/ReportLayout';
import { Paper, Typography } from '@mui/material';
import { Box, Button, CssVarsProvider, } from '@mui/joy';
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from 'moment';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import CustomAgGridRptFormatOne from 'src/views/Component/CustomAgGridRptFormatOne';
import { axioslogin } from 'src/views/Axios/Axios';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';
import InputComponent from 'src/views/MuiComponents/JoyComponent/InputComponent';
import { useDispatch } from 'react-redux';
import JoyTrainingTypeSelect from 'src/views/MuiComponents/JoyComponent/JoyTrainingTypeSelect';
import JoyTopicByType from 'src/views/MuiComponents/JoyComponent/JoyTopicByType';
import { TrainingTopicByType } from 'src/redux/actions/Training.Action';

const InductionCalenderReport = () => {

    const dispatch = useDispatch()

    const [type, setType] = useState(0)
    const [fromdate, Setfromdate] = useState('')
    const [todate, Settodate] = useState('')
    const [datas, setDatas] = useState([]);
    const [topic, setTopic] = useState(0)

    useEffect(() => {
        if (type !== 0) {
            dispatch(TrainingTopicByType(type))
        }
    }, [dispatch, type])

    const getData = useCallback(() => {
        const postdata = {
            type: type,
            topic: topic,
            fromdate: (moment(fromdate).format("YYYY-MM-DD HH:SS:DD")),
            todate: (moment(todate).format("YYYY-MM-DD HH:SS:DD"))
        }
        if (type !== 0 && topic !== 0 && topic !== 0) {
            const SelectDatas = async (postdata) => {
                const result = await axioslogin.post(`/TrainingInductionReport/SelectInductCalenderReport`, postdata)
                const { data, success } = result.data
                if (success === 2) {
                    const viewData = data?.map((val) => {
                        const object = {
                            sn: val.sn,
                            em_name: val.em_name,
                            induct_emp_dept: val.induct_emp_dept,
                            induct_emp_sec: val.induct_emp_sec,
                            emp_desig: val.emp_desig,
                            offline_status: val.offline_status,
                            posttest_mark: val.posttest_mark,
                            posttest_status: val.posttest_status,
                            pretest_status: val.pretest_status,
                            retest_mark: val.retest_mark !== null ? val.retest_mark : "No Retest",
                            schedule_date: val.schedule_date,
                            date: moment(val.schedule_date).format("YYYY-MM-DD"),
                            slno: val.slno,
                            topic_slno: val.topic_slno,
                            training_topic_name: val.training_topic_name,
                            em_id: val.em_id,
                            online_status: val.online_status,
                            retest_status: val.retest_status,
                            retest: val.retest_status === 1 ? "Yes" : "No",
                            Pretest_mark: val.Pretest_mark,
                            online_mode: val.online_mode === 1 ? "Yes" : "No",
                            offline_mode: val.offline_mode === 1 ? "Yes" : "No",
                            dept_id: val.dept_id,
                            dept_name: val.dept_name,
                            sect_id: val.sect_id,
                            sect_name: val.sect_name,
                            eligible: val.retest_mark >= 2 || val.posttest_mark >= 2 ? "Eligible" : "Not Eligible",
                            trainingmode: val.online_mode ? "Online" : "Offline"
                        }
                        return object;
                    })
                    setDatas(viewData);
                } else {
                    setDatas([]);
                    warningNofity("No Data to Show")
                }
            }
            SelectDatas(postdata)
        } else {
            warningNofity("Please Enter all the fields")
        }
    }, [type, topic, fromdate, todate])


    const [columnDef] = useState([
        { headerName: 'Sl.No', field: 'sn', filter: true, width: 100 },
        { headerName: 'Employee ID', field: 'em_id', filter: true, width: 200 },
        { headerName: 'Employee Names', field: 'em_name', filter: true, width: 200 },
        { headerName: 'Department', field: 'dept_name', filter: true, width: 300 },
        { headerName: 'Department Section', field: 'sect_name', filter: true, width: 300 },
        { headerName: 'Training Topics', field: 'training_topic_name', filter: true, width: 200 },
        { headerName: 'Schedule Date', field: 'date', filter: true, width: 200 }
    ])

    return (
        <Fragment>
            <ToastContainer />
            <ReportLayout title=" Induction Training Calender Report"
                data={datas}
                displayClose={true} >
                <Paper sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', flex: { xs: 4, sm: 4, md: 4, lg: 4, xl: 3, }, flexDirection: 'row', }}>
                        <Box sx={{ flex: 1, mt: 1, px: 0.3, }} >
                            <JoyTrainingTypeSelect type={type} setType={setType} />
                        </Box>
                        <Box sx={{ flex: 1, mt: 1, px: 0.3, }} >
                            <Box sx={{ flex: 1, px: 0.3, }} >
                                <JoyTopicByType type={type} topic={topic} setTopic={setTopic} />
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, mt: 1, px: 0.3, display: "flex", flexDirection: "row", }} >
                            <Typography sx={{ p: 1 }}>From:</Typography>
                            <InputComponent
                                type="date"
                                size="sm"
                                placeholder="From Date"
                                name="Fromdate"
                                value={fromdate}
                                onchange={(e) => Setfromdate(e.target.value)}
                            />
                        </Box>
                        <Box sx={{ flex: 1, mt: 1, px: 0.3, display: "flex", flexDirection: "row", }} >
                            <Typography sx={{ p: 1 }}>To:</Typography>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <InputComponent
                                    type="date"
                                    size="sm"
                                    placeholder="ToDate"
                                    name="Todate"
                                    value={todate}
                                    onchange={(e) => Settodate(e.target.value)}
                                />
                            </LocalizationProvider>
                        </Box>

                        <Box sx={{
                            display: 'flex', flex: { xs: 0, sm: 0, md: 0, lg: 0, xl: 1, }, mt: 0.5,
                            justifyContent: 'flex-start'
                        }} >
                            <CssVarsProvider>
                                <Box sx={{ p: 0.2 }} >
                                    <Button aria-label="Like" variant="outlined" color="neutral"
                                        onClick={getData}
                                        sx={{
                                            color: '#90caf9'
                                        }} >
                                        <PublishedWithChangesIcon />
                                    </Button>
                                </Box>
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
                        }} >
                        <CustomAgGridRptFormatOne
                            tableDataMain={datas}
                            columnDefMain={columnDef}
                        />
                    </Paper>
                </Paper>
            </ReportLayout>
        </Fragment>
    )
}

export default memo(InductionCalenderReport) 
