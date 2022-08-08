import { Button, Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import React, { Fragment, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router'
import { ToastContainer } from 'react-toastify';
import { axioslogin } from 'src/views/Axios/Axios';
import SessionCheck from 'src/views/Axios/SessionCheck';
import { errorNofity, infoNofity, succesNofity } from 'src/views/CommonCode/Commonfunc';
import { useStyles } from 'src/views/CommonCode/MaterialStyle';
import { employeeNumber } from 'src/views/Constant/Constant';
import EmployeeTypeTable from 'src/views/Master/EmployeeType/EmployeeTypeTable';

const EmployeeTypeTableEdit = () => {

    const history = useHistory()
    const classes = useStyles()
    const { id } = useParams()
    const [count, setCount] = useState(0)
    //state declaration
    const [formData, setFormData] = useState({
        empType: "",
        elApplicable: false
    })

    const defaultState = {
        empType: "",
        elApplicable: false
    }

    const { empType, elApplicable } = formData

    useEffect(() => {
        const getEmployeeTypeData = async () => {
            const result = await axioslogin.get(`/emptype/${id}`)
            const { success, data } = result.data
            if (success === 1) {
                const { emptype_name, status } = data[0]
                const frmData = {
                    empType: emptype_name,

                    elApplicable: status === 1 ? true : false
                }
                setFormData(frmData)
            }
        }
        getEmployeeTypeData()

    }, [id])

    //update Edit details
    const updateStateFormInput = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value })
    }
    //submiiting edit form data
    const submitEditFormData = async (e) => {
        e.preventDefault();
        const updateData = {
            emptype_name: empType,
            el_aplicable: elApplicable === true ? 1 : 0,
            edit_user: employeeNumber(),
            emptype_slno: id
        }
        const result = await axioslogin.patch('/emptype', updateData)
        const { success, message } = result.data
        if (success === 2) {
            succesNofity(message)
            setFormData(defaultState)
            setCount(count + 1)
            history.push('/Home/EmployeeType')

        }
        else if (success === 7) {
            infoNofity(message)
        }
        else {
            errorNofity("Error Occured Please Contact EDP")
        }
    }

    //Back to home
    const toSettings = () => {
        history.push('/Home/Settings');
    }

    return (
        <Fragment>
            <SessionCheck />
            <ToastContainer />
            <div className="card">
                <div className="card-header bg-dark pb-0 border border-dark text-white">
                    <h5 >Employee Type</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <form className={classes.root} onSubmit={submitEditFormData}>
                                <div className="row">
                                    <div className="col-md-12">
                                        <TextField
                                            label="Employee Type"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            name="empType"
                                            value={empType}
                                            onChange={(e) => updateStateFormInput(e)}
                                        />
                                    </div>

                                    <div className="col-md-12">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    name="elApplicable"
                                                    color="secondary"
                                                    value={elApplicable}
                                                    checked={elApplicable}
                                                    className="ml-2"
                                                    onChange={(e) => updateStateFormInput(e)}
                                                />
                                            }
                                            label="STATUS"
                                        />
                                    </div>
                                    <div className="row col-md-12">
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
                            <EmployeeTypeTable update={count} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default EmployeeTypeTableEdit

