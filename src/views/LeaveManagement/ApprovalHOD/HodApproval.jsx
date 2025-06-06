import { CssVarsProvider, Radio, RadioGroup } from '@mui/joy'
import { Box, IconButton, Paper, Tooltip, } from '@mui/material'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { getleaverequest, } from 'src/views/CommonCode/Commonfunc'
import { useDispatch, useSelector } from 'react-redux'
import CustomLayout from 'src/views/Component/MuiCustomComponent/CustomLayout'
import HodWiseDeptSection from 'src/views/MuiComponents/JoyComponent/HodWiseDeptSection'
import { getHodBasedDeptSectionName, } from 'src/redux/actions/LeaveReqst.action'
import { getDepartmentSectionBasedHod } from '../LeavereRequsition/Func/LeaveFunction'
import CommonAgGrid from 'src/views/Component/CommonAgGrid'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { axioslogin } from 'src/views/Axios/Axios'
import { format } from 'date-fns'

import LeavRqModel from '../LeaveCommonComponent/LeavRqModel';
import HaldayRqModel from '../LeaveCommonComponent/HaldayRqModel';
import NopunchRqModel from '../LeaveCommonComponent/NopunchRqModel';
import OneHourModal from '../LeaveCommonComponent/OneHourModal'
import OnDutyModal from '../LeaveCommonComponent/OndutyModal'


const HodApproval = () => {

    const dispatch = useDispatch()

    const [leaverequesttype, setleaverequesttype] = useState([]);//leave type list
    const [deptSect, setDeptSect] = useState(0)//select box selected department section
    const [value, setValue] = useState(1)//selected checkbox
    const [count, setcount] = useState(0)//to render dispatch useeffect
    const [tableData, setTableData] = useState([])

    const [ondutyOpen, setOndutyOpen] = useState(false)
    const [onhourOpen, setOneHourOpen] = useState(false)
    const [misspunchOpen, setMisspunchOpen] = useState(false)
    const [halfdayOpen, setHalfdayOpen] = useState(false)
    const [leaveOpen, setLeaveOpen] = useState(false)

    const [ondutyData, setOndutyData] = useState({})
    const [oneHourData, setOneHourData] = useState({})
    const [misspunchData, setmisspunchData] = useState({})
    const [halfdayData, setHalfdayData] = useState({})
    const [leaveData, setLeaveData] = useState({})

    //login incharge id
    const em_id = useSelector((state) => state?.getProfileData?.ProfileData[0]?.em_id ?? 0)

    useEffect(() => {
        dispatch(getHodBasedDeptSectionName(em_id));
        getleaverequest().then((val) => {
            setleaverequesttype(val)
        })
    }, [dispatch, em_id])

    const handleChangeRadioBtn = useCallback(async (event) => {
        let radioBtnVal = event.target.value;
        setValue(radioBtnVal);
    }, [])


    useEffect(() => {
        const fetchData = async (em_id) => {
            const result = await getDepartmentSectionBasedHod(em_id);
            const section = await result?.map((e) => e.dept_section)
            const postData = {
                sectIds: section.length === 0 ? [0] : section
            }
            if ((value === 1 || value === "1") && deptSect === 0) {
                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/leaveData/', postData);
                const { success, data } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_apprv_req === 1 && val.hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.leave_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 1,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            fromDate: format(new Date(e.leave_date), 'dd-MM-yyyy'),
                            toDate: format(new Date(e.leavetodate), 'dd-MM-yyyy'),
                            showStatus: (e.inc_apprv_req === 1 && e.incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.inc_apprv_req === 1 && e.incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.inc_apprv_req === 0 && e.incapprv_status === 0 && e.hod_apprv_req === 1 && e.hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.inc_apprv_req === 1 && e.incapprv_status === 1 && e.hod_apprv_req === 1 && e.hod_apprv_status === 0 && e.hr_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.inc_apprv_req === 0 && e.incapprv_status === 0 && e.hod_apprv_req === 1 && e.hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (e.inc_apprv_req === 1 && e.incapprv_status === 1 && e.hod_apprv_req === 1 && e.hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_apprv_req === 1 && e.hod_apprv_status === 0 && e.hr_aprrv_requ === 1 && e.hr_apprv_status === 1) ? 'HR Approved' :
                                                        (e.hod_apprv_req === 1 && e.hod_apprv_status === 1 && e.hr_aprrv_requ === 1 && e.hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.hr_aprrv_requ === 1 && e.hr_apprv_status === 2 && e.hod_apprv_status === 1) ? 'HR Rejected' : 'HR Approval Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_apprv_status !== 1)?.filter((k) => k.incapprv_status !== 2)

                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }
            } else if ((value === 1 || value === "1") && deptSect !== 0) {
                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/leaveData/', postData);
                const { success, data } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_apprv_req === 1 && val.hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.leave_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 1,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            fromDate: format(new Date(e.leave_date), 'dd-MM-yyyy'),
                            toDate: format(new Date(e.leavetodate), 'dd-MM-yyyy'),
                            showStatus: (e.inc_apprv_req === 1 && e.incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.inc_apprv_req === 1 && e.incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.inc_apprv_req === 0 && e.incapprv_status === 0 && e.hod_apprv_req === 1 && e.hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.inc_apprv_req === 1 && e.incapprv_status === 1 && e.hod_apprv_req === 1 && e.hod_apprv_status === 0 && e.hr_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.inc_apprv_req === 0 && e.incapprv_status === 0 && e.hod_apprv_req === 1 && e.hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (e.inc_apprv_req === 1 && e.incapprv_status === 1 && e.hod_apprv_req === 1 && e.hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_apprv_req === 1 && e.hod_apprv_status === 0 && e.hr_aprrv_requ === 1 && e.hr_apprv_status === 1) ? 'HR Approved' :
                                                        (e.hod_apprv_req === 1 && e.hod_apprv_status === 1 && e.hr_aprrv_requ === 1 && e.hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.hr_aprrv_requ === 1 && e.hr_apprv_status === 2 && e.hod_apprv_status === 1) ? 'HR Rejected' : 'HR Approval Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_apprv_status !== 1)?.filter((k) => k.incapprv_status !== 2)?.filter((i) => i.dept_section === deptSect)
                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }

            } else if (value === '2' && deptSect === 0) {
                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/halfday/', postData);
                const { success, data } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hf_hod_apprv_req === 1 && val.hf_hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.half_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 2,
                            requestDate: format(new Date(e.requestdate), 'dd-MM-yyyy'),
                            halfday_date: format(new Date(e.leavedate), 'dd-MM-yyyy'),
                            showStatus: (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.hf_inc_apprv_req === 0 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 1 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.hf_inc_apprv_req === 0 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 1) ? 'HR Approved' :
                                                        (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 1 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 1 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 2) ? 'HR Rejected' :
                                                                (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 2) ? 'HR Rejected' : 'HR Approval Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hf_hr_apprv_status !== 1)?.filter((k) => k.hf_incapprv_status !== 2)
                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }
            } else if (value === '2' && deptSect !== 0) {
                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/halfday/', postData);
                const { success, data } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hf_hod_apprv_req === 1 && val.hf_hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.half_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 2,
                            requestDate: format(new Date(e.requestdate), 'dd-MM-yyyy'),
                            halfday_date: format(new Date(e.leavedate), 'dd-MM-yyyy'),
                            showStatus: (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.hf_inc_apprv_req === 0 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 1 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.hf_inc_apprv_req === 0 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (e.hf_inc_apprv_req === 1 && e.hf_incapprv_status === 0 && e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 1) ? 'HR Approved' :
                                                        (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 1 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 1 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 2) ? 'HR Rejected' :
                                                                (e.hf_hod_apprv_req === 1 && e.hf_hod_apprv_status === 0 && e.hf_hr_aprrv_requ === 1 && e.hf_hr_apprv_status === 2) ? 'HR Rejected' : 'HR Approval Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hf_hr_apprv_status !== 1)?.filter((k) => k.hf_incapprv_status !== 2)?.filter((i) => i.dept_section === deptSect)
                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }
            } else if (value === '3' && deptSect === 0) {
                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/misspunchData/', postData);
                const { success, data } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.nopunch_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 3,
                            requestDate: format(new Date(e.creteddate), 'dd-MM-yyyy'),
                            nopunch_date: format(new Date(e.nopunchdate), 'dd-MM-yyyy'),
                            showStatus: (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.np_inc_apprv_req === 0 && e.np_incapprv_status === 0 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 1 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.np_inc_apprv_req === 0 && e.np_incapprv_status === 0 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 2) ? 'HOD Rejected ' :
                                                (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 1 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 2) ? 'HR Rejected' :
                                                        (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 1 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 1) ? 'HR Approved' : 'HR Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.np_hr_apprv_status !== 1)?.filter((k) => k.np_incapprv_status !== 2)
                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }
            } else if (value === '3' && deptSect !== 0) {

                const result = await axioslogin.post('/LeaveRequestApproval/inchargeHod/misspunchData/', postData);
                const { success, data } = result.data;

                if (success === 1) {
                    const arr = data?.filter((val) => val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.nopunch_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 3,
                            requestDate: format(new Date(e.creteddate), 'dd-MM-yyyy'),
                            nopunch_date: format(new Date(e.nopunchdate), 'dd-MM-yyyy'),
                            showStatus: (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 0) ? 'Incharge Approval Pending' :
                                (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 2) ? 'Incharge Rejected' :
                                    (e.np_inc_apprv_req === 0 && e.np_incapprv_status === 0 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 1 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                            (e.np_inc_apprv_req === 0 && e.np_incapprv_status === 0 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 2) ? 'HOD Rejected ' :
                                                (e.np_inc_apprv_req === 1 && e.np_incapprv_status === 1 && e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                    (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 2) ? 'HR Rejected' :
                                                        (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 1 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 1) ? 'HR Approved' :
                                                            (e.np_hod_apprv_req === 1 && e.np_hod_apprv_status === 0 && e.np_hr_aprrv_requ === 1 && e.np_hr_apprv_status === 1) ? 'HR Approved' : 'HR Pending',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.np_hr_apprv_status !== 1)?.filter((k) => k.np_incapprv_status !== 2)?.filter((i) => i.em_dept_section === deptSect)
                    setTableData(arr)
                    setcount(0)
                } else {
                    setTableData([])
                }
            } else if (value === '5' && deptSect === 0) {

                const result = await axioslogin.post('/CommonReqst/onehour/sectionWise', postData)
                const { data, success } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_req_status === 1 && val.hod_approval_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.request_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 5,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            one_hour_day: format(new Date(e.one_hour_duty_day), 'dd-MM-yyyy'),
                            showStatus: (e.incharge_req_status === 1 && e.incharge_approval_status === 0) ? 'Incharge Approval Pending' :
                                (e.incharge_req_status === 1 && e.incharge_approval_status === 2) ? 'Incharge Rejected' :
                                    (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                        (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                            (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 0) ? 'HR Approval Pending' :
                                                        (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 2) ? 'HR Reject' : 'HR Approved',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_approval_status !== 1)?.filter((k) => k.incharge_approval_status !== 2)
                    setTableData(arr)
                } else {
                    setTableData([])
                }
            } else if (value === '5' && deptSect !== 0) {

                const result = await axioslogin.post('/CommonReqst/onehour/sectionWise', postData)
                const { data, success } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_req_status === 1 && val.hod_approval_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.request_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 5,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            one_hour_day: format(new Date(e.one_hour_duty_day), 'dd-MM-yyyy'),
                            showStatus: (e.incharge_req_status === 1 && e.incharge_approval_status === 0) ? 'Incharge Approval Pending' :
                                (e.incharge_req_status === 1 && e.incharge_approval_status === 2) ? 'Incharge Rejected' :
                                    (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                        (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                            (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 0) ? 'HR Approval Pending' :
                                                        (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 2) ? 'HR Reject' : 'HR Approved',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_approval_status !== 1)?.filter((k) => k.incharge_approval_status !== 2)?.filter((i) => i.dept_sect_id === deptSect)
                    setTableData(arr)
                } else {
                    setTableData([])
                }
            }
            else if (value === '6' && deptSect === 0) {
                const result = await axioslogin.post('/CommonReqst/onduty/sectioWise', postData)
                const { data, success } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_req_status === 1 && val.hod_approval_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.onduty_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 6,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            on_dutydate: format(new Date(e.on_duty_date), 'dd-MM-yyyy'),
                            showStatus: (e.incharge_req_status === 1 && e.incharge_approval_status === 0) ? 'Incharge Approval Pending' :
                                (e.incharge_req_status === 1 && e.incharge_approval_status === 2) ? 'Incharge Rejected' :
                                    (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                        (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                            (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 0) ? 'HR Approval Pending' :
                                                        (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 2) ? 'HR Reject' : 'HR Approved',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_approval_status !== 1)?.filter((k) => k.incharge_approval_status !== 2)
                    setTableData(arr)
                } else {
                    setTableData([])
                }
            } else if (value === '6' && deptSect !== 0) {
                const result = await axioslogin.post('/CommonReqst/onduty/sectioWise', postData)
                const { data, success } = result.data;
                if (success === 1) {
                    const arr = data?.filter((val) => val.hod_req_status === 1 && val.hod_approval_status === 0)?.map((e) => {
                        const obj = {
                            slno: e.onduty_slno,
                            emno: e.em_no,
                            name: e.em_name,
                            department: e.dept_name,
                            section: e.sect_name,
                            code: 6,
                            requestDate: format(new Date(e.request_date), 'dd-MM-yyyy'),
                            on_dutydate: format(new Date(e.on_duty_date), 'dd-MM-yyyy'),
                            showStatus: (e.incharge_req_status === 1 && e.incharge_approval_status === 0) ? 'Incharge Approval Pending' :
                                (e.incharge_req_status === 1 && e.incharge_approval_status === 2) ? 'Incharge Rejected' :
                                    (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                        (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                            (e.incharge_req_status === 0 && e.incharge_approval_status === 0 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                (e.incharge_req_status === 1 && e.incharge_approval_status === 1 && e.hod_req_status === 1 && e.hod_approval_status === 2) ? 'HOD Rejected' :
                                                    (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 0) ? 'HR Approval Pending' :
                                                        (e.hod_approval_status === 1 && e.hr_req_status === 1 && e.hr_approval_status === 2) ? 'HR Reject' : 'HR Approved',
                        }
                        return {
                            ...e,
                            ...obj
                        }
                    })?.filter((k) => k.hr_approval_status !== 1)?.filter((k) => k.incharge_approval_status !== 2)?.filter((i) => i.dept_sect_id === deptSect)
                    setTableData(arr)
                } else {
                    setTableData([])
                }
            }
        }
        fetchData(em_id, deptSect)
    }, [em_id, dispatch, count, value, deptSect])

    const [columnDef] = useState([
        { headerName: 'ID#', field: 'emno', filter: true, minWidth: 100 },
        { headerName: 'Name ', field: 'name', filter: true, minWidth: 200 },
        { headerName: 'Department ', field: 'department', minWidth: 200, filter: true },
        { headerName: 'Section', field: 'section', filter: true, minWidth: 200 },
        { headerName: 'Request Date', field: 'requestDate', filter: true, minWidth: 200 },
        { headerName: 'Status', field: 'showStatus', filter: true, minWidth: 200 },
        {
            headerName: 'Action',
            cellRenderer: params => {
                if (params.data.hodaprv === 1 || params.data.hodaprv === 2 || params.data.incaprv === 2 || params.data.hr_apprv === 1) {
                    return <IconButton
                        sx={{ paddingY: 0.5 }}  >
                        <CheckCircleOutlineIcon />
                    </IconButton>
                } else {
                    return <IconButton onClick={() => handleClick(params)}
                        sx={{ paddingY: 0.5 }} >
                        <Tooltip title="Click Here to Approve/Reject">
                            <CheckCircleOutlineIcon color='primary' />
                        </Tooltip>
                    </IconButton>
                }
            }
        },
    ])

    const handleClick = useCallback(async (params) => {
        const { code } = params.data
        if (code === 1) {
            setLeaveOpen(true)
            setLeaveData(params.data)
        } else if (code === 2) {
            setHalfdayOpen(true)
            setHalfdayData(params.data)
        } else if (code === 3) {
            setMisspunchOpen(true)
            setmisspunchData(params.data)
        } else if (code === 5) {
            setOneHourOpen(true)
            setOneHourData(params.data)

        } else if (code === 6) {
            setOndutyOpen(true)
            setOndutyData(params.data)
        }
    }, [])

    return (
        <CustomLayout title="Leave Approval HOD" displayClose={true} >
            <LeavRqModel open={leaveOpen} setOpen={setLeaveOpen} empData={leaveData} authority={2} setcount={setcount} />
            <HaldayRqModel open={halfdayOpen} setOpen={setHalfdayOpen} empData={halfdayData} authority={2} setcount={setcount} />
            <NopunchRqModel open={misspunchOpen} setOpen={setMisspunchOpen} empData={misspunchData} authority={2} setcount={setcount} />
            <OneHourModal open={onhourOpen} setOpen={setOneHourOpen} empData={oneHourData} authority={2} setCount={setcount} />
            <OnDutyModal open={ondutyOpen} setOpen={setOndutyOpen} empData={ondutyData} authority={2} setCount={setcount} />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Paper variant="outlined" square sx={{ display: 'flex', flex: 1, p: 0.5, alignItems: 'center' }} >
                    <Box sx={{ flex: 1, px: 0.5 }}>
                        <HodWiseDeptSection detSection={deptSect} setSectionValue={setDeptSect} />
                    </Box>
                    <Box sx={{ display: 'flex', flex: 2 }}>
                        {
                            <CssVarsProvider>
                                {
                                    <RadioGroup
                                        defaultValue="female"
                                        name="controlled-radio-buttons-group"
                                        value={value}
                                        onChange={handleChangeRadioBtn}
                                        sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}
                                        size="lg"
                                    >
                                        {
                                            leaverequesttype && leaverequesttype?.map((val, idx) => {
                                                return <Box key={idx} sx={{ display: 'flex', flex: 1 }}>
                                                    <Radio
                                                        value={val.lrequest_slno}
                                                        label={val.lrequest_type}
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            })
                                        }
                                    </RadioGroup>
                                }
                            </CssVarsProvider>
                        }
                    </Box>
                </Paper>
                <Paper square elevation={0} sx={{ p: 1, mt: 0.5, display: 'flex', flexDirection: "column" }} >
                    <CommonAgGrid
                        columnDefs={columnDef}
                        tableData={tableData}
                        sx={{
                            height: 600,
                            width: "100%"
                        }}
                        rowHeight={30}
                        headerHeight={30}
                    />
                </Paper>
            </Box>
        </CustomLayout>
    )
}

export default memo(HodApproval) 