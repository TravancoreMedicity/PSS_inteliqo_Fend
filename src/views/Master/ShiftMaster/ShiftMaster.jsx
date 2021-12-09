import React, { Fragment, useState } from 'react'
import TextInput from 'src/views/Component/TextInput';
//import { useStyles } from 'src/views/CommonCode/MaterialStyle'
import PageLayoutSave from 'src/views/CommonCode/PageLayoutSave';
import { useHistory } from 'react-router';
import Timepicker from 'src/views/Component/Timepicker';
import { FormControl, MenuItem, Select } from '@mui/material';
import { Checkbox, FormControlLabel } from '@material-ui/core'
import MinutePicker from 'src/views/Component/MinutePicker';
import moment from 'moment';
import { axioslogin } from 'src/views/Axios/Axios';
import { errorNofity, succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import ShiftMasterTable from './ShiftMasterTable';



const ShiftMaster = () => {
    // const classes = useStyles()
    const history = useHistory()
    const toSettings = () => {
        history.push('/Home/Settings')
    }
    const [count, setCount] = useState(0)

    //use State For Check In
    const [checkIn, setCheckIn] = useState(new Date());
    const SetcheckInTime = (val) => {
        setCheckIn(val)
    }
    //use State For Check Out
    const [checkOut, setCheckOut] = useState(new Date());
    const SetcheckOutTime = (val) => {
        setCheckOut(val)
    }
    //use State For Check In Start
    const [checkInStart, setcheckInStart] = useState(new Date());
    const SetcheckInTimeStart = (val) => {
        setcheckInStart(val)
    }
    //use State For Check In End
    const [checkInEnd, setcheckInEnd] = useState(new Date());
    const SetcheckInTimeEnd = (val) => {
        setcheckInEnd(val)
    }
    //use State For Check Out Start
    const [checkOutStart, setcheckOutStart] = useState(new Date());
    const SetcheckoutTimeStart = (val) => {
        setcheckOutStart(val)
    }
    //use State For Check Out End
    const [checkOutEnd, setcheckOutEnd] = useState(new Date());
    const SetcheckoutTimeEnd = (val) => {
        setcheckOutEnd(val)
    }
    //use State For Break Start
    const [BreakStart, setBreakStart] = useState(new Date());
    const SetBreakTimestart = (val) => {
        setBreakStart(val)
    }
    //use State For Break End
    const [Breakend, setBreakEnd] = useState(new Date());
    const SetBreakTimeend = (val) => {
        setBreakEnd(val)
    }
    //use State For Early In
    const [EarlyIn, setEarlyIn] = useState(new Date());
    const setEarlyInTime = (val) => {
        setEarlyIn(val)
    }
    //use State For Early Out
    const [EarlyOut, setEarlyOut] = useState(new Date());
    const setEarlyOutTime = (val) => {
        setEarlyOut(val)
    }
    //use State For Allowed Late in
    const [LateIn, setLateIn] = useState(new Date());
    const setlateInTime = (val) => {
        setLateIn(val)
    }
    //use State For Allowed LateOut
    const [LateOut, setLateOut] = useState(new Date());
    const setlateOutTime = (val) => {
        setLateOut(val)
    }
    //use State ForFirst Half Check In
    const [firsthalfcheckin, setfirsthalfcheckin] = useState(new Date());
    const SetfirsthalfcheckinTime = (val) => {
        setfirsthalfcheckin(val)
    }
    //use State ForFirst Half Check Out
    const [firsthalfcheckout, setfirsthalfcheckout] = useState(new Date());
    const SetfirsthalfcheckOutTime = (val) => {
        setfirsthalfcheckout(val)
    }
    //use State For second Half Check In
    const [Secondhalfcheckin, setSecondhalfcheckin] = useState(new Date());
    const SetSecondhalfcheckInTime = (val) => {
        setSecondhalfcheckin(val)
    }
    //use State For second Half Check Out
    const [Secondhalfcheckout, SetSecondhalfcheckout] = useState(new Date());
    const SetSecondhalfcheckOutTime = (val) => {
        SetSecondhalfcheckout(val)
    }
    //use State for Setting Initial State
    const [formData, setFormData] = useState({
        shift_name: "",
        shift_code: "",
        crossday: '0',
        dutyday: '1',
        earlyincalculation: '1',
        earlyoutcalculation: '1',
        shift_status: true
    })
    const { shift_name, shift_code, crossday, dutyday, earlyincalculation, earlyoutcalculation, shift_status } = formData
    const defaultState = {
        shift_name: "",
        shift_code: "",
        crossday: '0',
        dutyday: '1',
        earlyincalculation: '1',
        earlyoutcalculation: '1',
        shift_status: true
    }
    //getting form Data
    const updateShiftmasterData = async (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value })
    }
    //saving Data
    const postData = {
        shft_desc: shift_name,
        shft_code: shift_code,
        shft_chkin_time: moment(checkIn).format('hh:mm'),
        shft_chkout_time: moment(checkOut).format('hh:mm'),
        shft_cross_day: crossday,
        shft_chkin_start: moment(checkInStart).format('hh:mm'),
        shft_chkin_end: moment(checkInEnd).format('hh:mm'),
        shft_chkout_start: moment(checkOutStart).format('hh:mm'),
        shft_chkout_end: moment(checkOutEnd).format('hh:mm'),
        shft_duty_day: dutyday,
        shft_brk_start: moment(BreakStart).format('hh:mm'),
        shft_brk_end: moment(Breakend).format('hh:mm'),
        shft_early_in_criteria: earlyincalculation,
        shft_early_in_mints: moment(EarlyIn).format('mm'),
        shft_late_out_criteria: earlyoutcalculation,
        shft_late_out_mints: moment(EarlyOut).format('mm'),
        shft_latein_allow_time: moment(LateIn).format('mm'),
        shft_earlyout_allow_time: moment(LateOut).format('mm'),
        first_half_in: moment(firsthalfcheckin).format('hh:mm'),
        first_half_out: moment(firsthalfcheckout).format('hh:mm'),
        second_half_in: moment(Secondhalfcheckin).format('hh:mm'),
        second_half_out: moment(Secondhalfcheckout).format('hh:mm'),
        shft_status: shift_status === false ? 0 : 1
    }
    //saving shift master
    const submitFormData = async (e) => {
        e.preventDefault()
        const result = await axioslogin.post('/shift', postData)
        const { success, message } = result.data
        if (success === 1) {
            succesNofity(message)
            setFormData(defaultState)
            setCount(count + 1)
            setCheckIn(new Date())
            setCheckOut(new Date())
            setcheckInStart(new Date())
            setcheckInEnd(new Date())
            setcheckOutStart(new Date())
            setcheckOutEnd(new Date())
            setBreakStart(new Date())
            setBreakEnd(new Date())
            setEarlyIn(new Date())
            setEarlyOut(new Date())
            setLateIn(new Date())
            setLateOut(new Date())
            setfirsthalfcheckin(new Date())
            setfirsthalfcheckout(new Date())
            setSecondhalfcheckin(new Date())
            SetSecondhalfcheckout(new Date())
        }
        else if (success === 2) {
            warningNofity(message)
        }
        else {
            errorNofity('Errror Occured!!!!Please Contact EDP')
        }

    }


    return (
        <Fragment>
            <PageLayoutSave
                heading="Shift Master"
                redirect={toSettings}
                submit={submitFormData}
            >
                <div className="row g-1">
                    <div className="col-md-7" >
                        <div className="card">
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="row g-1">
                                        <div className="col-md-9">
                                            <TextInput
                                                type="text"
                                                classname="form-control form-control-sm mb-2"
                                                Placeholder="Shift Name"
                                                changeTextValue={(e) => updateShiftmasterData(e)}
                                                name="shift_name"
                                                value={shift_name}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <TextInput
                                                type="text"
                                                classname="form-control form-control-sm mb-2"
                                                Placeholder="Shift Code"
                                                changeTextValue={(e) => updateShiftmasterData(e)}
                                                name="shift_code"
                                                value={shift_code}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-1">
                                        <div className="col-md-3" >
                                            <label className="form-label">
                                                Check In
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={checkIn}
                                                changetextvalue={(e) => SetcheckInTime(e)}
                                            />
                                        </div>
                                        <div className="col-md-3" >
                                            <label className="form-label">
                                                Check Out
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={checkOut}
                                                changetextvalue={(e) => SetcheckOutTime(e)}
                                            />
                                        </div>
                                    </div>


                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Check In Start
                                            </label>
                                        </div>
                                        <div className="col-md-3" >
                                            <Timepicker
                                                value={checkInStart}
                                                changetextvalue={(e) => SetcheckInTimeStart(e)}
                                            />
                                        </div>
                                        <div className="col-md-3" >
                                            <label className="form-label">
                                                Check In End
                                            </label>
                                        </div>
                                        <div className="col-md-3" >
                                            <Timepicker
                                                value={checkInEnd}
                                                changetextvalue={(e) => SetcheckInTimeEnd(e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-1">
                                        <div className="col-md-3" >
                                            <label className="form-label">
                                                Check Out Start
                                            </label>
                                        </div>
                                        <div className="col-md-3" >
                                            <Timepicker
                                                value={checkOutStart}
                                                changetextvalue={(e) => SetcheckoutTimeStart(e)}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Check Out End
                                            </label>
                                        </div>
                                        <div className="col-md-3" >
                                            <Timepicker
                                                value={checkOutEnd}
                                                changetextvalue={(e) => SetcheckoutTimeEnd(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Cross Day
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                                className="mt-0"
                                            >
                                                <Select
                                                    name="crossday"
                                                    value={crossday}
                                                    onChange={(e) => updateShiftmasterData(e)}
                                                    fullWidth
                                                    variant="outlined"
                                                    className="ml-1"
                                                    defaultValue={0}
                                                    style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }}
                                                >
                                                    <MenuItem value='0'>0</MenuItem>
                                                    <MenuItem value='1'>1</MenuItem>
                                                    <MenuItem value='2'>2</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Duty Day
                                            </label>
                                        </div>
                                        <div className="col-md-3" >
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                                className="mt-0"
                                            >
                                                <Select
                                                    name="dutyday"
                                                    value={dutyday}
                                                    onChange={(e) => updateShiftmasterData(e)}
                                                    fullWidth
                                                    variant="outlined"
                                                    className="ml-1"
                                                    defaultValue={0}
                                                    style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }}

                                                >
                                                    <MenuItem value='1'>1</MenuItem>
                                                    <MenuItem value='2'>2</MenuItem>
                                                    <MenuItem value='3'>3</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>

                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Break Start
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                mintime={checkIn}
                                                maxtime={checkOut}
                                                value={BreakStart}
                                                changetextvalue={(e) => SetBreakTimestart(e)}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="test" className="form-label">
                                                Break End
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                mintime={checkIn}
                                                maxtime={checkOut}
                                                value={Breakend}
                                                changetextvalue={(e) => SetBreakTimeend(e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Early In Calculation
                                            </label>
                                        </div>
                                        <div className="col-md-6">
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                                className="mt-0"
                                            >
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    name="earlyincalculation"
                                                    fullWidth
                                                    variant="outlined"
                                                    onChange={(e) => updateShiftmasterData(e)}
                                                    value={earlyincalculation}
                                                    style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }}
                                                >

                                                    <MenuItem value='1' >
                                                        Calculate As Normal Work Day
                                                    </MenuItem>
                                                    <MenuItem value='2' >
                                                        Calculate As Over Time
                                                    </MenuItem>
                                                    <MenuItem value='3' >
                                                        Calculate As Weekend Over Time
                                                    </MenuItem>

                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-md-3">
                                            <MinutePicker
                                                value={EarlyIn}
                                                changeMinuteValue={(e) => setEarlyInTime(e)}
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label htmlFor="test" className="form-label">
                                                Early Out Calculation
                                            </label>
                                        </div>
                                        <div className="col-md-6">
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                                className="mt-0"
                                            >
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    name="earlyoutcalculation"
                                                    fullWidth
                                                    variant="outlined"
                                                    style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }}
                                                    onChange={(e) => updateShiftmasterData(e)}
                                                    value={earlyoutcalculation}
                                                >

                                                    <MenuItem value='1' >
                                                        Calculate As Normal Work Day
                                                    </MenuItem>
                                                    <MenuItem value='2' >
                                                        Calculate As Over Time
                                                    </MenuItem>
                                                    <MenuItem value='3' >
                                                        Calculate As Weekend Over Time
                                                    </MenuItem>

                                                </Select>
                                            </FormControl>
                                        </div>
                                        <div className="col-md-3">
                                            <MinutePicker
                                                value={EarlyOut}
                                                changeMinuteValue={(e) => setEarlyOutTime(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Allowed Late In
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <MinutePicker
                                                value={LateIn}
                                                changeMinuteValue={(e) => setlateInTime(e)}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Allowed Late Out
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <MinutePicker
                                                value={LateOut}
                                                changeMinuteValue={(e) => setlateOutTime(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                First Half Check In Time
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={firsthalfcheckin}
                                                changetextvalue={(e) => SetfirsthalfcheckinTime(e)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                First Half Check Out Time
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={firsthalfcheckout}
                                                changetextvalue={(e) => SetfirsthalfcheckOutTime(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-1">
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Second Half Check In Time
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={Secondhalfcheckin}
                                                changetextvalue={(e) => SetSecondhalfcheckInTime(e)}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">
                                                Second Half Check Out Time
                                            </label>
                                        </div>
                                        <div className="col-md-3">
                                            <Timepicker
                                                value={Secondhalfcheckout}
                                                changetextvalue={(e) => SetSecondhalfcheckOutTime(e)}
                                            />
                                        </div>
                                    </div>
                                    <div className="row g-1 d-flex flex-row justify-content-between align-items-center">
                                        <div className="col-md-5 ">
                                            <FormControlLabel
                                                className=""
                                                control={
                                                    <Checkbox
                                                        name="shift_status"
                                                        color="secondary"
                                                        value={shift_status}
                                                        checked={shift_status}
                                                        className="ml-2"
                                                        onChange={(e) => updateShiftmasterData(e)}
                                                    />
                                                }
                                                label="Shift Status"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card">
                            <ShiftMasterTable update={count} />
                        </div>
                    </div>
                </div>
            </PageLayoutSave >
        </Fragment >
    )
}

export default ShiftMaster