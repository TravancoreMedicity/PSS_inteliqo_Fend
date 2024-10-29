import { Box } from '@mui/material';
import React, { memo, Suspense, useEffect, useMemo, useState, } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout';
import { CircularProgress, } from '@mui/joy';
import { setDept } from 'src/redux/actions/Dept.Action';
import { getEmployeeInformationLimited } from 'src/redux/reduxFun/reduxHelperFun';
import { getEmployeeInformation, getHodBasedDeptSectionName } from 'src/redux/actions/LeaveReqst.action';
import { setCommonSetting } from 'src/redux/actions/Common.Action';
import EmpSelection from './EmpSelection';
import { setdeptSection } from 'src/redux/actions/DeptSection.action';
import WoffPresentSubmit from './WoffPresentSubmit';
import { setShiftDetails } from 'src/redux/actions/Shift.Action';
import WoffPresentTable from './WoffPresentTable';
import { axioslogin } from 'src/views/Axios/Axios';
import { format } from 'date-fns';

const WeekOFFPresentMainpage = () => {

    const dispatch = useDispatch();

    const [showForm, setShowForm] = useState(0)
    const [employeeData, steEmployeeData] = useState({})
    const [count, setCount] = useState(0)
    const [showTable, setShowtable] = useState([])
    const [EmpWoffData, setEmpWoffData] = useState([])
    const [requestUser, setRequestUser] = useState({
        deptID: 0,
        sectionID: 0,
        emNo: 0,
        emID: 0
    })

    //get the employee details for taking the HOd and Incharge Details
    const empInform = useSelector((state) => getEmployeeInformationLimited(state))
    const employeeInform = useMemo(() => empInform, [empInform])
    const { hod, incharge, em_id } = employeeInform;

    useEffect(() => {
        dispatch(getHodBasedDeptSectionName(em_id));
        dispatch(getEmployeeInformation(employeeData?.emID))
        dispatch(setCommonSetting());
        dispatch(setDept())
        dispatch(setdeptSection())
        dispatch(setShiftDetails())
        setCount(0)

        const obj = {
            deptID: requestUser?.deptID,
            sectionID: requestUser?.sectionID,
            emID: requestUser?.emID
        }
        const getData = async () => {
            const result = await axioslogin.post("/attendCal/GetWOffPresentData", obj)
            const { success, data } = result.data;
            if (success === 1) {
                const viewData = data.map((val, ndx) => {
                    const obj = {
                        slNo: ndx + 1,
                        duty_day: val.duty_day,
                        WoffPresent: format(new Date(val.duty_day), "dd-MM-yyyy"),
                        remark: val.remark,
                        requested_date: val.requested_date,
                        reqstOn: format(new Date(val.requested_date), "dd-MM-yyyy"),
                        sect_name: val.sect_name,
                        em_no: val.em_no,
                        em_name: val.em_name,
                        shft_desc: val.shft_desc,
                    }
                    return obj;
                })
                setEmpWoffData(viewData);
            } else {
                setEmpWoffData([]);
            }
        }
        getData()
    }, [hod, incharge, em_id, dispatch, employeeData, count, requestUser])

    return (
        <CustomLayout title="Week Off Present Setting" displayClose={true} >
            <Box sx={{ display: 'flex', flex: 1, px: 0.8, mt: 0.3, flexDirection: 'column' }}>
                <Suspense fallback={
                    <Box sx={{ display: 'flex', flex: 1, zIndex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress
                            color="danger"
                            size="md"
                            value={20}
                            variant="outlined"
                        />
                    </Box>
                }>
                    <EmpSelection requestUser={requestUser} setRequestUser={setRequestUser} setShowForm={setShowForm} steEmployeeData={steEmployeeData} setShowtable={setShowtable} count={count} setEmpWoffData={setEmpWoffData} />
                    {
                        showForm === 1 ? <WoffPresentSubmit setShowtable={setShowtable} employeeData={employeeData} count={count} setCount={setCount} setShowForm={setShowForm} /> : null
                    }
                </Suspense>
                <WoffPresentTable EmpWoffData={EmpWoffData} />
                {/* {
                    showTable === 1 ? <WoffPresentTable EmpWoffData={EmpWoffData} /> : null
                } */}
            </Box>
        </CustomLayout >
    )
}


export default memo(WeekOFFPresentMainpage) 
