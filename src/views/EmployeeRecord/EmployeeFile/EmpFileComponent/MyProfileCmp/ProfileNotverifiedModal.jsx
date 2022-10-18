import React, { Fragment } from 'react'
import Box from '@mui/material/Box';
import { Button } from '@mui/material'
import Modal from '@mui/material/Modal';
// import { TextareaAutosize } from '@material-ui/core';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { useState } from 'react';
import { axioslogin } from 'src/views/Axios/Axios';
import { errorNofity, infoNofity, succesNofity } from 'src/views/CommonCode/Commonfunc';
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px',
    boxShadow: 10,
    pt: 3,
    pb: 2,
    pl: 3,
    pr: 2
};

const ProfileNotverifiedModal = ({ open1, handlClose2, modeopen, slno, count, setCount }) => {
    const history = useHistory()
    const [formdata, setFormdata] = useState({
        notverfied_reason: ''
    })
    const defaultState = {
        notverfied_reason: ''
    }
    const { notverfied_reason } = formdata
    const getValue = async (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormdata({ ...formdata, [e.target.name]: value })
    }
    const postData = {
        verification_status: 2,
        verification_Remark: notverfied_reason,
        em_id: modeopen
    }
    const updateVerify = async (e) => {
        e.preventDefault();
        if (notverfied_reason !== '') {
            if (slno === 1) {
                const result = await axioslogin.patch('/empVerification', postData)
                const { success, message } = result.data
                if (success === 2) {
                    setFormdata(defaultState)
                    //history.push('/Home/EmployeeRecordVerification')
                    history.push('/Home/EmpFirstVerification')
                    succesNofity(message)
                    setCount(count + 1)
                }
                else {
                    errorNofity("Error Occured!!!Please Contact EDP")
                }
            }
            else {
                const result = await axioslogin.patch('/empVerification/secondverification', postData)
                const { success, message } = result.data
                if (success === 2) {
                    setFormdata(defaultState)
                    //history.push('/Home/EmpfileFinalVerification')
                    history.push('/Home/EmpSecondVerification')
                    succesNofity(message)
                    setCount(count + 1)
                }
                else {
                    errorNofity("Error Occured!!!Please Contact EDP")
                }
            }
        }
        else {
            infoNofity("Please Enter The Remark")
        }

    }

    return (
        <Fragment>
            <ToastContainer />
            <Modal
                open={open1}
                onClose={handlClose2}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className="row">
                        <div className="col-md-12">
                            <TextareaAutosize
                                aria-label="minimum height"
                                minRows={3}
                                placeholder="Remarks"
                                style={{ width: "100%" }}
                                name="notverfied_reason"
                                value={notverfied_reason}
                                onChange={(e) => getValue(e)}
                            />
                        </div>
                    </div>

                    <div className="col-md-12">
                        <div className="row">
                            <div className="col-md-7"></div>
                            <div className="col-md-2"><Button onClick={updateVerify}>Save</Button></div>
                            <div className="col-md-2"><Button autoFocus onClick={handlClose2}>Close</Button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </Fragment>
    )
}

export default ProfileNotverifiedModal