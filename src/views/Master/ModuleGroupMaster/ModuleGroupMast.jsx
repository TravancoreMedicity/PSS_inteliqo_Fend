import React, { Fragment, useState } from 'react'
import { TextField, Button, FormControlLabel, Checkbox } from '@material-ui/core'
import { useHistory } from 'react-router'
import { ToastContainer } from 'react-toastify'
import SessionCheck from 'src/views/Axios/SessionCheck'
import { useStyles } from 'src/views/CommonCode/MaterialStyle'
import { axioslogin } from 'src/views/Axios/Axios'
import { errorNofity, infoNofity, succesNofity } from 'src/views/CommonCode/Commonfunc'
import ModuleGroupMastTable from './ModuleGroupMastTable'

const ModuleGroupMast = () => {

    const classes = useStyles();
    const history = useHistory();
    const [count, setCount] = useState(0)
    const [formData, setFormData] = useState({
        module_group_name: '',
        module_recruitment: false,
        module_emprecord: false,
        module_attenmangemnt: false,
        module_leavemangment: false,
        module_payroll: false,
        module_performanceApp: false,
        module_trainAndDevolp: false,
        module_resignation: false,
        module_dashboard: false,
        module_reports: false
    })

    // destructuring the form element vlaues
    const { module_group_name, module_recruitment, module_emprecord, module_attenmangemnt, module_leavemangment,
        module_payroll, module_performanceApp, module_trainAndDevolp, module_resignation, module_dashboard, module_reports } = formData;

    // Get the value from the element to variables
    const getModuleGroupFormData = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    // Redirect to the Setting Page 
    const toSettings = () => {
        history.push('/Home/Settings');
    }

    // COnvert Data For Submitting false to 1 and 0 
    const postData = {
        module_group_name,
        module_slno: {
            module_home: 1,
            module_recruitment: module_recruitment === true ? 2 : 0,
            module_emprecord: module_emprecord === true ? 3 : 0,
            module_attenmangemnt: module_attenmangemnt === true ? 4 : 0,
            module_leavemangment: module_leavemangment === true ? 5 : 0,
            module_payroll: module_payroll === true ? 6 : 0,
            module_performanceApp: module_performanceApp === true ? 7 : 0,
            module_trainAndDevolp: module_trainAndDevolp === true ? 8 : 0,
            module_resignation: module_resignation === true ? 9 : 0,
            module_dashboard: module_dashboard === true ? 11 : 0,
            module_reports: module_reports === true ? 12 : 0,
        },
    }

    const resetForm = {
        module_group_name: '',
        module_recruitment: false,
        module_emprecord: false,
        module_attenmangemnt: false,
        module_leavemangment: false,
        module_payroll: false,
        module_performanceApp: false,
        module_trainAndDevolp: false,
        module_resignation: false,
        module_dashboard: false,
        module_reports: false
    }

    const submitModuleGroupMast = async (e) => {
        e.preventDefault();
        const result = await axioslogin.post('/modulegroup', postData)
        const { success, message } = result.data;
        if (success === 1) {
            succesNofity(message);
            setFormData(resetForm);
            setCount(count + 1)
        } else if (success === 0) {
            errorNofity(message);
        } else if (success === 2) {
            infoNofity(message.sqlMessage);
        }
    }

    return (
        <Fragment>
            <SessionCheck />
            <ToastContainer />
            <div className="card">
                <div className="card-header bg-dark pb-0 border border-dark text-white">
                    <h5>Module Group Master</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <form className={classes.root} onSubmit={submitModuleGroupMast} >
                                <div className="col-md-12 row">
                                    <div className="col-md-12">
                                        <TextField
                                            label="Module Group Name"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            value={module_group_name}
                                            name="module_group_name"
                                            onChange={(e) => getModuleGroupFormData(e)}
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_recruitment"
                                                    color="secondary"
                                                    value={module_recruitment}
                                                    checked={module_recruitment}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Recruitment"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_emprecord"
                                                    color="secondary"
                                                    value={module_emprecord}
                                                    checked={module_emprecord}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Employee Record"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_attenmangemnt"
                                                    color="secondary"
                                                    value={module_attenmangemnt}
                                                    checked={module_attenmangemnt}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Attendance Management    "
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_leavemangment"
                                                    color="secondary"
                                                    value={module_leavemangment}
                                                    checked={module_leavemangment}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Leave Management"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_payroll"
                                                    color="secondary"
                                                    value={module_payroll}
                                                    checked={module_payroll}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Payroll"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_performanceApp"
                                                    color="secondary"
                                                    value={module_performanceApp}
                                                    checked={module_performanceApp}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Performance Apprarisal"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_trainAndDevolp"
                                                    color="secondary"
                                                    value={module_trainAndDevolp}
                                                    checked={module_trainAndDevolp}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Training & Deveolopment"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_resignation"
                                                    color="secondary"
                                                    value={module_resignation}
                                                    checked={module_resignation}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Resignation"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_dashboard"
                                                    color="secondary"
                                                    value={module_dashboard}
                                                    checked={module_dashboard}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Dash Board"
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="module_reports"
                                                    color="secondary"
                                                    value={module_reports}
                                                    checked={module_reports}
                                                    className="ml-2"
                                                    onChange={(e) => getModuleGroupFormData(e)}
                                                />
                                            }
                                            label="Reports"
                                        />
                                    </div>
                                    <div className="row col-md-12 mt-2 ">
                                        <div className="col-md-6 col-sm-12 col-xs-12 mb-1">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                fullWidth
                                                type="Submit"
                                                className="ml-2"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                        <div className="col-md-6 col-sm-12 col-xs-12">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                fullWidth
                                                className="ml-2"
                                                onClick={toSettings}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="col-md-8">
                            <ModuleGroupMastTable update={count} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default ModuleGroupMast
