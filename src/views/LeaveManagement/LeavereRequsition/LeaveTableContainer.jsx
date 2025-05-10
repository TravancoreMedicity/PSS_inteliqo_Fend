import { Paper } from '@mui/material'
import { format } from 'date-fns'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { useDispatch, } from 'react-redux'
import { axioslogin } from 'src/views/Axios/Axios'
import CommonAgGrid from 'src/views/Component/CommonAgGrid'
import { IconButton } from '@mui/material'
import BeenhereIcon from '@mui/icons-material/Beenhere';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCallback } from 'react'

import LeaveCancelEmp from '../LeavereRequsition/EmpView/LeaveCancelEmp';
import NopunchCancelEmp from '../LeavereRequsition/EmpView/NopunchCancelEmp';
import OneHourCancelModal from '../CommonRequest/Approvals/Modals/OneHourCancelModal'

const LeaveTableContainer = ({ count, setCount, requestType, requestUser }) => {

    const dispatch = useDispatch()
    const [tabledata, setTabledata] = useState([])

    //MODAL STATES FOR RENDERING OPEN MODAL & UPDATE DATA
    const [leaveReqModal, setleaveReqModal] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [noPunchReqModal, setnoPunchReqModal] = useState(false);

    //UPDATE DATA
    const [lveData, setlveData] = useState({});
    const [empdata, setEmpdata] = useState({})
    const [noPunchData, setnoPunchData] = useState({});

    const selectedEmp = useMemo(() => requestUser, [requestUser])

    useEffect(() => {

        const getLeaveData = async () => {
            const result = await axioslogin.get(`/LeaveRequestApproval/employee/LeaveData/${selectedEmp?.emID}`);
            const { success, data } = result.data;
            if (success === 1) {
                const arr = data?.map((val) => {
                    return {
                        ...val,
                        code: 1,
                        lvDate: format(new Date(val.leave_dates), 'dd-MM-yyyy'),
                        reqDate: format(new Date(val.request_date), 'dd-MM-yyyy'),
                        toDate: format(new Date(val.leavetodate), 'dd-MM-yyyy'),
                        inchargestatus: val.incapprv_status,
                        hodstatus: val.hod_apprv_status,
                        hrstatus: val.hr_apprv_status,
                        status: (val.inc_apprv_req === 1 && val.incapprv_status === 0) ? 'Incharge Approval Pending' :
                            (val.inc_apprv_req === 1 && val.incapprv_status === 2) ? 'Incharge Rejected' :
                                (val.inc_apprv_req === 0 && val.incapprv_status === 0 && val.hod_apprv_req === 1 && val.hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                    (val.inc_apprv_req === 1 && val.incapprv_status === 1 && val.hod_apprv_req === 1 && val.hod_apprv_status === 0 && val.hr_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (val.inc_apprv_req === 0 && val.incapprv_status === 0 && val.hod_apprv_req === 1 && val.hod_apprv_status === 2) ? 'HOD Rejected' :
                                            (val.inc_apprv_req === 1 && val.incapprv_status === 1 && val.hod_apprv_req === 1 && val.hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (val.hod_apprv_req === 1 && val.hod_apprv_status === 0 && val.hr_aprrv_requ === 1 && val.hr_apprv_status === 1) ? 'HR Approved' :
                                                    (val.hod_apprv_req === 1 && val.hod_apprv_status === 1 && val.hr_aprrv_requ === 1 && val.hr_apprv_status === 1) ? 'HR Approved' :
                                                        (val.hr_aprrv_requ === 1 && val.hr_apprv_status === 2 && val.hod_apprv_status === 1) ? 'HR Rejected' : 'HR Approval Pending',
                        cancel: val.lv_cancel_status === 1 ? 'Leave Cancelled' : val.lv_cancel_status_user === 1 ? 'Leave Cancelled' : 'NIL',
                        cancelComment: val.lv_cancel_cmnt === null ? 'NIL' :
                            val.lv_cancel_cmnt !== null ? val.lv_cancel_cmnt :
                                val.lv_cancel_cmnt_user === null ? 'NIL' : val.lv_cancel_cmnt_user,
                        cancel_status: val.lv_cancel_status || val.lv_cancel_req_status_user
                    }
                })
                setTabledata(arr)
            } else {
                setTabledata([])
            }
        }
        const getMisspunchData = async () => {
            const result = await axioslogin.get(`/LeaveRequestApproval/employee/misspunchData/${selectedEmp?.emID}`);
            const { success, data } = result.data;
            if (success === 1) {
                const arr = data?.map((val) => {
                    return {
                        ...val,
                        code: 3,
                        lvDate: format(new Date(val.nopunchdate), 'dd-MM-yyyy'),
                        misspunchtime: val.checkinflag === 1 ? 'In Punch' : 'Out Punch',
                        reqDate: format(new Date(val.creteddate), 'dd-MM-yyyy'),
                        leave_reason: val.np_reason,
                        inchargestatus: val.np_incapprv_status,
                        hodstatus: val.np_hod_apprv_status,
                        hrstatus: val.np_hr_apprv_status,
                        status: (val.np_inc_apprv_req === 1 && val.np_incapprv_status === 0) ? 'Incharge Approval Pending' :
                            (val.np_inc_apprv_req === 1 && val.np_incapprv_status === 2) ? 'Incharge Rejected' :
                                (val.np_inc_apprv_req === 0 && val.np_incapprv_status === 0 && val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                    (val.np_inc_apprv_req === 1 && val.np_incapprv_status === 0 && val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 0) ? 'HOD Approval Pending' :
                                        (val.np_inc_apprv_req === 0 && val.np_incapprv_status === 0 && val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 2) ? 'HOD Rejected ' :
                                            (val.np_inc_apprv_req === 1 && val.np_incapprv_status === 1 && val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 2) ? 'HOD Rejected' :
                                                (val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 1 && val.np_hr_aprrv_requ === 1 && val.np_hr_apprv_status === 2) ? 'HR Rejected' :
                                                    (val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 1 && val.np_hr_aprrv_requ === 1 && val.np_hr_apprv_status === 1) ? 'HR Approved' :
                                                        (val.np_hod_apprv_req === 0 && val.np_hod_apprv_status === 0 && val.np_hr_aprrv_requ === 1 && val.np_hr_apprv_status === 1) ? 'HR Approved' :
                                                            (val.np_hod_apprv_req === 1 && val.np_hod_apprv_status === 0 && val.np_hr_aprrv_requ === 1 && val.np_hr_apprv_status === 1) ? 'HR Approved' : 'HR Approval Pending',
                        cancel: val.lv_cancel_status === 1 ? 'Miss punch Cancelled' : val.lv_cancel_req_status_user === 1 ? 'Miss punch Cancelled' : 'NIL',
                        cancelComment: val.lv_cancel_cmnt === null ? 'NIL' :
                            val.lv_cancel_cmnt !== null ? val.lv_cancel_cmnt :
                                val.lv_cancel_cmnt_user === null ? 'NIL' : val.lv_cancel_cmnt_user,
                        cancel_status: val.lv_cancel_status || val.lv_cancel_req_status_user
                    }
                })
                setTabledata(arr)
            } else {
                setTabledata([])
            }
        }

        const getonehourData = async () => {
            const result = await axioslogin.get(`/LeaveRequestApproval/employee/onehour/${selectedEmp?.emID}`);
            const { success, data } = result.data;
            if (success === 1) {
                const arr = data?.map((val) => {
                    return {
                        ...val,
                        code: 5,
                        lvDate: format(new Date(val.one_hour_duty_day), 'dd-MM-yyyy'),
                        reqDate: format(new Date(val.request_date), 'dd-MM-yyyy'),
                        leave_reason: val.reason,
                        misspunchtime: val.checkin_flag === 1 ? 'In Punch' : 'Out Punch',
                        inchargestatus: val.incharge_approval_status,
                        hodstatus: val.hod_approval_status,
                        hrstatus: val.hr_approval_status,
                        status: (val.incharge_req_status === 1 && val.incharge_approval_status === 0) ? 'Incharge Approval Pending' :
                            (val.incharge_req_status === 1 && val.incharge_approval_status === 2) ? 'Incharge Rejected' :
                                (val.incharge_req_status === 0 && val.incharge_approval_status === 0 && val.hod_req_status === 1 && val.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                    (val.incharge_req_status === 1 && val.incharge_approval_status === 0 && val.hod_req_status === 1 && val.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                        (val.incharge_req_status === 1 && val.incharge_approval_status === 1 && val.hod_req_status === 1 && val.hod_approval_status === 0) ? 'HOD Approval Pending' :
                                            (val.incharge_req_status === 0 && val.incharge_approval_status === 0 && val.hod_req_status === 1 && val.hod_approval_status === 2) ? 'HOD Rejected' :
                                                (val.incharge_req_status === 1 && val.incharge_approval_status === 0 && val.hod_req_status === 1 && val.hod_approval_status === 2) ? 'HOD Rejected' :
                                                    (val.incharge_req_status === 1 && val.incharge_approval_status === 1 && val.hod_req_status === 1 && val.hod_approval_status === 2) ? 'HOD Rejected' :
                                                        (val.hod_req_status === 0 && val.hod_approval_status === 0 && val.hr_req_status === 1 && val.hr_approval_status === 1) ? 'HR Approved' :
                                                            (val.hod_req_status === 1 && val.hod_approval_status === 1 && val.hr_req_status === 1 && val.hr_approval_status === 1) ? 'HR Approved' :
                                                                (val.hod_req_status === 1 && val.hod_approval_status === 0 && val.hr_req_status === 1 && val.hr_approval_status === 2) ? 'HR Rejected' :
                                                                    (val.hod_req_status === 1 && val.hod_approval_status === 1 && val.hr_req_status === 1 && val.hr_approval_status === 2) ? 'HR Rejected' :
                                                                        (val.hod_req_status === 0 && val.hod_approval_status === 0 && val.hr_req_status === 1 && val.hr_approval_status === 2) ? 'HR Rejected' : 'HR Approval Pending',
                        cancel: val.cancel_status === 1 ? 'Onhour Cancelled' : 'NIL',
                        cancelComment: val.cancel_comment === null ? 'NIL' : val.cancel_comment,
                        cancel_status: val.cancel_status
                    }
                })
                setTabledata(arr)
            } else {
                setTabledata([])
            }
        }

        if (requestType === 1) {
            getLeaveData(selectedEmp?.emID)
            setCount(0)
        } else if (requestType === 3) {
            getMisspunchData(selectedEmp?.emID)
            setCount(0)
        } else if (requestType === 5) {
            getonehourData(selectedEmp?.emID)
            setCount(0)
        }

    }, [requestType, selectedEmp, dispatch, count, setCount])



    const [columnDef] = useState([
        { headerName: 'Emp. ID', field: 'em_no', filter: true, minWidth: 150, },
        { headerName: 'Emp. Name', field: 'em_name', filter: true, minWidth: 200, },
        { headerName: 'Dept. Section', field: 'sect_name', filter: true, minWidth: 250, },
        { headerName: 'Request Date', field: 'reqDate', minWidth: 200, filter: true },
        { headerName: 'Leave Date', field: 'lvDate', filter: true, minWidth: 150, },
        { headerName: 'Leave Reason', field: 'leave_reason', minWidth: 150, },
        { headerName: 'Status', field: 'status', filter: true, minWidth: 150, },
        {
            headerName: 'Delete', minWidth: 150,
            cellRenderer: params => {
                if (params.data.hrstatus === 1 || params.data.hrstatus === 2 || params.data.cancel_status === 1) {
                    return <IconButton
                        sx={{ paddingY: 0.5, cursor: 'none' }}  >
                        <BeenhereIcon />
                    </IconButton>
                } else {
                    return <IconButton sx={{ paddingY: 0.5 }} onClick={() => LeaveCancel(params)} >
                        <DeleteIcon color='primary' />
                    </IconButton>
                }
            }
        },
    ])

    const LeaveCancel = useCallback(async (params) => {
        const { code } = params?.data
        if (code === 1) {
            setlveData(params.data)
            setleaveReqModal(true)
        } else if (code === 3) {
            setnoPunchData(params.data)
            setnoPunchReqModal(true)
        } else if (code === 5) {
            setDeleteOpen(true)
            setEmpdata(params.data)
        }
    }, [])

    return (
        <>
            <LeaveCancelEmp open={leaveReqModal} setOpen={setleaveReqModal} data={lveData} setCount={setCount} />
            <NopunchCancelEmp open={noPunchReqModal} setOpen={setnoPunchReqModal} data={noPunchData} setCount={setCount} />
            <OneHourCancelModal open={deleteOpen} setOpen={setDeleteOpen} empData={empdata} setCount={setCount} />
            <Paper variant="outlined" sx={{ display: "flex", flexDirection: 'column', flex: 1, p: 0.3, mb: 0.5 }} >
                <CommonAgGrid
                    columnDefs={columnDef}
                    tableData={tabledata}
                    sx={{
                        height: 400,
                        width: "100%"
                    }}
                    rowHeight={30}
                    headerHeight={30}
                />
            </Paper>
        </>

    )
}

export default memo(LeaveTableContainer) 