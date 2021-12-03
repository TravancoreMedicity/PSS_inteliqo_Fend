import { Button, Checkbox, FormControlLabel, TextField } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { axioslogin } from 'src/views/Axios/Axios'
import SessionCheck from 'src/views/Axios/SessionCheck'
import { infoNofity, succesNofity } from 'src/views/CommonCode/Commonfunc'
import { useStyles } from 'src/views/CommonCode/MaterialStyle'
import { employeeNumber } from 'src/views/Constant/Constant'
import BranchMastTable from './BranchMastTable'

const BranchMastTableEdit = () => {
    const classes = useStyles();
    const history = useHistory();
    const { id } = useParams();

    //Initializing
    const [branchData, setBranchData] = useState({
        branch_name: '',
        branch_address: '',
        branch_email: '',
        branch_esi: '',
        branch_pf: '',
        branch_status: false
    });

    //Destructuring
    const { branch_name, branch_address, branch_email, branch_esi, branch_pf, branch_status } = branchData;
    const updateBranchForm = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setBranchData({ ...branchData, [e.target.name]: value })
    }

    //Get data by ID
    useEffect(() => {
        const getBranch = async () => {
            const result = await axioslogin.get(`/branch/${id}`)
            const { success, data } = result.data
            if (success === 1) {
                const { branch_name, branch_address, branch_email, branch_esi, branch_pf, branch_status } = data[0]
                const frmdata = {
                    branch_name: branch_name,
                    branch_address: branch_address === null ? '' : branch_address,
                    branch_email: branch_email === null ? '' : branch_email,
                    branch_esi: branch_esi === null ? '' : branch_esi,
                    branch_pf: branch_pf === null ? '' : branch_pf,
                    branch_status: branch_status === 1 ? true : false
                }
                setBranchData(frmdata)
            }
        }
        getBranch()
    }, [id])

    const postData = {
        branch_name,
        branch_address,
        branch_email,
        branch_esi,
        branch_pf,
        branch_status: branch_status === true ? 1 : 0,
        edit_user: employeeNumber(),
        branch_slno: id
    }
    const resetForm = {
        branch_name: '',
        branch_address: '',
        branch_email: '',
        branch_esi: '',
        branch_pf: '',
        branch_status: false
    }

    //update
    const submitBranchForm = async (e) => {
        e.preventDefault();
        const result = await axioslogin.patch('/branch', postData);
        const { message, success } = result.data;
        if (success === 2) {
            setBranchData(resetForm);
            history.push('/Home/Branch');
            succesNofity(message);
        } else if (success === 0) {
            infoNofity(message.sqlMessage);
        } else {
            infoNofity(message)
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
                    <h5>Branch Master</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <form className={classes.root} onSubmit={submitBranchForm} >
                                <div className="row">
                                    <div className="col-md-12">
                                        <TextField
                                            label="Branch Name"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            name="branch_name"
                                            value={branch_name}
                                            onChange={(e) => updateBranchForm(e)}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <TextField
                                            label="Branch Address"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            name="branch_address"
                                            value={branch_address}
                                            onChange={(e) => updateBranchForm(e)}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <TextField
                                            label="Email Address"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            name="branch_email"
                                            value={branch_email}
                                            onChange={(e) => updateBranchForm(e)}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <TextField
                                            label="ESI Number"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            name="branch_esi"
                                            value={branch_esi}
                                            onChange={(e) => updateBranchForm(e)}
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <TextField
                                            label="PF Number"
                                            fullWidth
                                            size="small"
                                            autoComplete="off"
                                            variant="outlined"
                                            required
                                            name="branch_pf"
                                            value={branch_pf}
                                            onChange={(e) => updateBranchForm(e)}
                                        />
                                    </div>
                                    <div className="col-md-12 pb-0 mb-0">
                                        <FormControlLabel
                                            className="pb-0 mb-0"
                                            control={
                                                <Checkbox
                                                    name="branch_status"
                                                    color="primary"
                                                    value={branch_status}
                                                    checked={branch_status}
                                                    className="ml-2"
                                                    onChange={(e) => updateBranchForm(e)}
                                                />
                                            }
                                            label="Status"
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
                            <BranchMastTable />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default BranchMastTableEdit
