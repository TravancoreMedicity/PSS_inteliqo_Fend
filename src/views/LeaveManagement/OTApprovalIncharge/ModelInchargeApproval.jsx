import React, { Fragment, memo, useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import TextInput from 'src/views/Component/TextInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import { axioslogin } from 'src/views/Axios/Axios';
import moment from 'moment';
import { PayrolMasterContext } from 'src/Context/MasterContext';
import { FormControl, MenuItem, Select, TextareaAutosize, Typography } from '@material-ui/core'
import { Button, Checkbox, DialogActions } from '@mui/material';
import { succesNofity, warningNofity, infoNofity } from 'src/views/CommonCode/Commonfunc';
import CoffshowTable from '../OTComponent/CoffshowTable';
import OTRemarkCompnt from '../OTComponent/OTRemarkCompnt';
import { useContext } from 'react';
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
});

const ModelInchargeApproval = ({ open, handleClose, otno, setCount, count }) => {
    const { employeedetails } = useContext(PayrolMasterContext)
    const { em_id } = employeedetails
    const [tableset, settable] = useState(false)
    const [countcl, setcount] = useState(0)
    const [days, setdays] = useState(0)
    const [otslno, setotslno] = useState([])
    const [overtimeSl, Setovertimesl] = useState([])
    const [otAdd, setOtAdd] = useState({
        totalot: ''
    })

    const [flag, setFlag] = useState(0)
    const [newottime, setnewottime] = useState({
        over_time: 0,
    })
    const [modeldata, setModeldata] = useState({
        ot_days: '',
        overtime: '',
        ot_reson: '',
        emp_id: '',
        inchargeAuth: '',
        hodAuth: '',
        ceoAuth: ''
    })
    const [incharge, seIncharge] = useState({
        ot_type: '0',
        approve: false,
        reject: false,
        ot_inch_remark: ''
    })
    const { ot_type, approve, reject, ot_inch_remark } = incharge
    const updateInchargeApproval = async (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        seIncharge({ ...incharge, [e.target.name]: value })
    }

    // Get Data
    useEffect(() => {
        const getOt = async () => {
            const result1 = await axioslogin.get(`/overtimerequest/incharge/list/${otno}`)
            const { success, data } = result1.data;
            if (success === 1) {
                const { ot_days, over_time, ot_reson, ot_coff_type, ot_inch_status, ot_inch_remark, emp_id,
                    ot_inch_require, ot_hod_require, ot_ceo_require } = data[0]
                if (ot_inch_status !== 0) {
                    const frmdata = {
                        ot_days: ot_days,
                        overtime: over_time,
                        ot_reson: ot_reson,
                        emp_id: emp_id,
                        inchargeAuth: ot_inch_require,
                        hodAuth: ot_hod_require,
                        ceoAuth: ot_ceo_require
                    }
                    const inch = {
                        ot_type: ot_coff_type,
                        ot_inch_remark: ot_inch_remark,
                        approve: ot_inch_status === 1 ? true : false,
                        reject: ot_inch_status === 2 ? true : false,
                    }
                    const frm = {
                        over_time: over_time
                    }
                    const frmot = {
                        totalot: over_time
                    }
                    setOtAdd(frmot)
                    setnewottime(frm)
                    setModeldata(frmdata);
                    seIncharge(inch)
                } else {
                    const frmdata = {
                        ot_days: ot_days,
                        overtime: over_time,
                        ot_reson: ot_reson,
                        emp_id: emp_id,
                        inchargeAuth: ot_inch_require,
                        hodAuth: ot_hod_require,
                        ceoAuth: ot_ceo_require
                    }
                    const inch = {
                        ot_type: '0',
                        ot_inch_remark: '',
                        approve: false,
                        reject: false,
                    }
                    const frm = {
                        over_time: over_time
                    }
                    const frmot = {
                        totalot: over_time
                    }
                    setOtAdd(frmot)
                    setnewottime(frm)
                    setModeldata(frmdata);
                    seIncharge(inch)
                }
                if (over_time <= 480) {
                    infoNofity("Not Applicable for COff please check more OT Available")
                } else { }
            } else {
                warningNofity(" Error occured contact EDP")
            }
        }
        getOt();
        settable(false)
    }, [otno]);

    const updatechageottype = (val) => {
        if (val === '1') {
            settable(true)
        } else {
            settable(false)
        }
    }
    const checkOT = (val) => {
        if (val === '1') {
            if (newottime.over_time > 480) {
                var othr = Math.floor(newottime.over_time / 480)
                setdays(othr)
                setFlag(1)
            }
        } else if (val === '2') {
            setOtAdd({
                totalot: newottime.over_time
            })
            setFlag(3)
        }
    }

    useEffect(() => {
        if (otAdd.totalot > 480 && otslno.length !== 0) {
            var othr = Math.floor(otAdd.totalot / 480)
            setdays(othr)
            setFlag(2)
        } else { }
    }, [otAdd.totalot])

    const patchData = {
        ot_inch_status: approve === true ? 1 : reject === true ? 2 : 0,
        ot_inch_remark: ot_inch_remark,
        ot_inch_user: em_id,
        ot_coff_type: ot_type,
        ot_new_time: otAdd.totalot,
        emp_id: modeldata.emp_id,
        ot_status: reject === true ? 2 : 0,
        ot_slno: otno
    }
    var leavecalarray = [];
    for (var i = 0; i < days; i++) {
        const postdata = {
            emp_id: modeldata.emp_id,
            credited: 1,
            lvetype_slno: 11,
            credited_date: moment(new Date()).format('YYYY-MM-DD  HH:mm:ss'),
            approver_user: em_id,
            ot_slno: otno
        }
        leavecalarray.push(postdata)
    }
    const resetotadd = {
        totalot: ''
    }
    const resetnewot = {
        over_time: ''
    }
    const resetmodel = {
        ot_days: '',
        overtime: '',
        ot_reson: '',
        emp_id: '',
        inchargeAuth: '',
        hodAuth: '',
        ceoAuth: ''
    }
    const resetinch = {
        ot_type: '',
        approve: false,
        reject: false,
        ot_inch_remark: ''
    }
    const dataPost = {
        ot_time: newottime.over_time,
        emp_id: modeldata.emp_id,
        applied_cl: 1,
        ot_coff_slno: otno,
    }
    const dataPostflagtwo = {
        ot_time: modeldata.overtime,
        emp_id: modeldata.emp_id,
        applied_cl: 1,
        ot_coff_slno: otno,
    }
    const coffpostdata = {
        ot_time: modeldata.overtime,
        emp_id: modeldata.emp_id,
        applied_cl: 0,
        ot_coff_slno: otno,
    }
    const coffpatchdata = {
        applied_cl: 1,
        ot_coff_slno: otslno,
        ot_added: 1,
        ot_slno: overtimeSl
    }

    const submitIncharge = async (e) => {
        e.preventDefault()
        const result1 = await axioslogin.patch('/overtimerequest/inchargeapprove', patchData)
        const { success, message } = result1.data
        if (success === 2) {
            if (approve === true && reject === false) {
                succesNofity("Incharge Approved ");
            } else if (approve === false && reject === true) {
                succesNofity("Incharge Rejected ");
            }
            if (flag === 1) {
                const result = await axioslogin.patch('/overtimerequest/coff/insert', dataPost)
                const { message, success } = result.data;
                if (success === 2) {
                    if ((modeldata.inchargeAuth === 1) && (modeldata.hodAuth === 0) && (modeldata.ceoAuth === 0)) {
                        const result2 = await axioslogin.post('/overtimerequest/leavecalculated/insert', leavecalarray)
                        const { message, success } = result2.data;
                        if (success === 1) {
                            succesNofity(message);
                        }
                        setcount(countcl + 1)
                    } else { }
                }
            } else if (flag === 2) {
                const result = await axioslogin.patch('/overtimerequest/coff/insert', dataPostflagtwo)
                const { message, success } = result.data;
                const result4 = await axioslogin.patch('/overtimerequest/cofftabl/slno/update', coffpatchdata)
                const { messagee, succes } = result4.data;
                if ((modeldata.inchargeAuth === 1) && (modeldata.hodAuth === 0) && (modeldata.ceoAuth === 0)) {
                    const result2 = await axioslogin.post('/overtimerequest/leavecalculated/insert', leavecalarray)
                    const { messagee, success } = result2.data;
                }
            } else if (flag === 3) {
                succesNofity("Converted to Over Time");
            }
            else {
                const result3 = await axioslogin.patch('/overtimerequest/coff/insert', coffpostdata)
            }
            setCount(count + 1)
            seIncharge(resetinch)
            setModeldata(resetmodel)
            setnewottime(resetnewot)
            setOtAdd(resetotadd)
            setFlag(0)
            handleClose()
        }
    }

    return (
        <Fragment>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
                keepMounted
                aria-describedby="alert-dialog-slide-descriptiona"
            >
                <DialogTitle>
                    {"Over Time Incharge Approval/Reject"}
                </DialogTitle>
                <DialogContent sx={{
                    minWidth: 500,
                    maxWidth: 600,
                    width: 600,
                }}>
                    <div className="card">
                        <div className="card-body">
                            <div className="col-md-12 col-sm-12">
                                <div className="row g-1">
                                    <div className="col-md-5 pt-1" >
                                        <Typography>Over Time Date</Typography>
                                    </div>
                                    <div className="col-md-7" >
                                        <TextInput
                                            type="text"
                                            classname="form-control form-control-sm"
                                            Placeholder="Over Time Date"
                                            fullWidth
                                            disabled="Disabled"
                                            value={modeldata.ot_days}
                                        />
                                    </div>
                                </div>
                                <div className="row g-1 pt-2">
                                    <div className="col-md-5 pt-1" >
                                        <Typography>Time in Minutes</Typography>
                                    </div>
                                    <div className="col-md-7" >
                                        <TextInput
                                            type="text"
                                            classname="form-control form-control-sm"
                                            Placeholder="Time in Minutes"
                                            fullWidth
                                            disabled="Disabled"
                                            value={newottime.over_time}
                                        />
                                    </div>
                                </div>
                                {<OTRemarkCompnt heading={'Over Time Reason'} remarks={modeldata.ot_reson} />}
                                <div className="col-md-12">
                                    <div className="row g-3">
                                        <div className="col-md-5">
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                            >
                                                <Select
                                                    name="ot_type"
                                                    fullWidth
                                                    variant="outlined"
                                                    className="ml-1"
                                                    defaultValue={0}
                                                    value={ot_type}
                                                    onChange={(e) => {
                                                        updateInchargeApproval(e)
                                                        updatechageottype(e.target.value)
                                                        checkOT(e.target.value)
                                                    }
                                                    }
                                                    style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }}
                                                >
                                                    <MenuItem value='0'>Select OT Type</MenuItem>
                                                    <MenuItem value='1'>Compensatory Off</MenuItem>
                                                    <MenuItem value='2'>Over Time</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-md-1"></div>
                                        <div className="col-md-3">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="approve"
                                                        color="primary"
                                                        value={approve}
                                                        checked={approve}
                                                        disabled={reject === true ? true : false}
                                                        className="ml-2 "
                                                        onChange={(e) =>
                                                            updateInchargeApproval(e)
                                                        }
                                                    />
                                                }
                                                label="Approve"
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        name="reject"
                                                        color="primary"
                                                        value={reject}
                                                        checked={reject}
                                                        disabled={approve === true ? true : false}
                                                        className="ml-2 "
                                                        onChange={(e) =>
                                                            updateInchargeApproval(e)
                                                        }
                                                    />
                                                }
                                                label="Reject"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-1 pt-2">
                                    <div className="col-md-12">
                                        {tableset === true ? <CoffshowTable
                                            emp_id={modeldata.emp_id}
                                            overtime={newottime.over_time}
                                            setOtAdd={setOtAdd}
                                            setnewottime={setnewottime}
                                            setotslno={setotslno}
                                            Setovertimesl={Setovertimesl}
                                        /> : null}
                                    </div>
                                </div>
                                <div className="row g-1 pt-2">
                                    <div className="col-md-12" >
                                        <TextareaAutosize
                                            aria-label="minimum height"
                                            minRows={3}
                                            placeholder="Incharge Remarks"
                                            style={{ width: 515 }}
                                            name="ot_inch_remark"
                                            value={ot_inch_remark}
                                            onChange={(e) => updateInchargeApproval(e)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" onClick={submitIncharge}>Submit</Button>
                    <Button onClick={handleClose} color="primary" >Cancel</Button>
                </DialogActions>
            </Dialog>
        </Fragment >
    )
}

export default memo(ModelInchargeApproval)
