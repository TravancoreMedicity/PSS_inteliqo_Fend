import { Box, Button, LinearProgress, Tooltip } from '@mui/joy'
import { Paper } from '@mui/material'
import React, { memo, Suspense, useCallback, useMemo } from 'react'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useSelector } from 'react-redux';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';
import NormalEmployeeLeveReqPage from '../LeavereRequsition/NormalEmployeeLeveReqPage';
import { getEmployeeInformationLimited } from 'src/redux/reduxFun/reduxHelperFun';
// import { getCommonSettings } from 'src/redux/reducers/CommonSett.Reducer';
import InchargeHODPage from './InchargeHODPage';

const EmpSelection = ({ setShowForm, steEmployeeData, requestUser, setRequestUser }) => {

    // const dispatch = useDispatch()

    // const [masterGroupStatus, setMasterGroupStatus] = useState(false);

    const empInformation = useSelector((state) => getEmployeeInformationLimited(state))
    const empInformationFromRedux = useMemo(() => empInformation, [empInformation])
    const { hod, incharge, em_no, em_id, em_department, em_dept_section, groupmenu } = empInformationFromRedux;

    // const getcommonSettings = useSelector((state) => getCommonSettings(state, groupmenu))
    // const groupStatus = useMemo(() => getcommonSettings, [getcommonSettings])
    // useEffect(() => {
    //     setMasterGroupStatus(groupStatus)
    // }, [groupStatus])

    // POST DATA FOR EMPLOYE IS NOT A HOD AOR INCHARGE
    const employeePostData = useMemo(() => {
        return {
            emNo: em_no,
            emID: em_id,
            deptID: em_department,
            sectionID: em_dept_section
        }
    }, [em_no, em_id, em_department, em_dept_section])

    // Leave request user User States
    // const [requestUser, setRequestUser] = useState({
    //     deptID: 0,
    //     sectionID: 0,
    //     emNo: 0,
    //     emID: 0
    // })
    const userPostData = useMemo(() => requestUser, [requestUser])

    // HANDLE CLICK THE LEAVE REQUST PROCESS BUTTON
    const handleProcessLeveRequest = useCallback(async () => {
        const isInchargeOrHOD = (hod === 1 || incharge === 1) ? true : false //IF TRUE IS (HOD OR INCHARGE ) OR NORMAL USER

        // CHECK THE EMPLOYEE IS HOD OR INCHARGE
        const postData = isInchargeOrHOD === true ? { ...userPostData } : { ...employeePostData }

        const { sectionID, emNo, emID } = postData;

        if (sectionID === 0 || emNo === 0 || emID === 0) {
            warningNofity("Please Check for Any Selection")
        } else {
            setShowForm(1)
            steEmployeeData(postData)
            // const obj = {
            //     deptID: requestUser?.deptID,
            //     sectionID: requestUser?.sectionID,
            //     emID: requestUser?.emID
            // }

            // const result = await axioslogin.post("/attendCal/GetWOffPresentData", obj)
            // const { success, data } = result.data;
            // if (success === 1) {
            //     const viewData = data.map((val, ndx) => {
            //         const obj = {
            //             slNo: ndx + 1,
            //             duty_day: val.duty_day,
            //             WoffPresent: format(new Date(val.duty_day), "dd-MM-yyyy"),
            //             remark: val.remark,
            //             requested_date: val.requested_date,
            //             reqstOn: format(new Date(val.requested_date), "dd-MM-yyyy"),
            //             sect_name: val.sect_name,
            //             em_no: val.em_no,
            //             em_name: val.em_name,
            //             shft_desc: val.shft_desc,
            //         }
            //         return obj;
            //     })
            //     setEmpWoffData(viewData);
            // } else {
            //     setEmpWoffData([]);
            // }
        }
    }, [userPostData, hod, incharge, employeePostData, setShowForm, steEmployeeData, requestUser])

    // console.log("******EmpSelection******em_no :", em_no, "incharge === 1:", incharge === 1);

    return (
        <Paper variant="outlined" sx={{ display: "flex", alignItems: 'center', flexWrap: 'wrap' }} >
            <Box display={'flex'} sx={{ flexGrow: 1, }} >
                <Suspense fallback={<LinearProgress variant="outlined" />} >
                    {
                        (hod === 1 || incharge === 1)
                            ? <InchargeHODPage state={requestUser} setState={setRequestUser} />
                            : <NormalEmployeeLeveReqPage />
                    }
                </Suspense>
            </Box>
            <Box sx={{ display: "flex", px: 0.3, }} >
                <Tooltip title="Process" followCursor placement='top' arrow >
                    <Button
                        aria-label="Like"
                        variant="outlined"
                        color="danger"
                        onClick={handleProcessLeveRequest}
                        size='sm'
                    >
                        <AddCircleOutlineIcon />
                    </Button>
                </Tooltip>
            </Box>
        </Paper>
    )
}

export default memo(EmpSelection) 
