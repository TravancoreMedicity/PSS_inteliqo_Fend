import React, { Fragment, Suspense, useContext, useState } from 'react'
import DepartmentSelect from 'src/views/CommonCode/DepartmentSelect'
import PageLayoutProcess from 'src/views/CommonCode/PageLayoutProcess'
import DepartmentSectionSelect from 'src/views/CommonCode/DepartmentSectionSelect';
import EmployeeNameSelect from 'src/views/CommonCode/EmployeeNameSelect';
import { MdOutlineAddCircleOutline } from 'react-icons/md'
import { SELECT_CMP_STYLE } from 'src/views/Constant/Constant';
import { IconButton } from '@mui/material'
import { useHistory } from 'react-router-dom'
import { PayrolMasterContext } from 'src/Context/MasterContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { succesNofity } from 'src/views/CommonCode/Commonfunc'
import { axioslogin } from 'src/views/Axios/Axios'
import { LinearProgress } from '@mui/material'
import LeaveCarryRow from './LeaveCarryRow';
import { getYear } from 'date-fns';

const LeaveCarryForwad = () => {
    const { selectDeptSection, selectEmpName } = useContext(PayrolMasterContext);
    const { employeedetails } = useContext(PayrolMasterContext)
    const { em_id } = employeedetails
    const history = useHistory();
    const [edit, setedit] = useState({
        EL: 0,
        CL: 0,
        SL: 0,
        HL: 0
    })
    //getting the leave carry forwad year
    const year = getYear(new Date()) - 1
    const [emp_id, setemp_id] = useState(0)
    const [tableflag, setTableFlag] = useState(0)
    const [name, setname] = useState([])
    const gettable = async () => {
        if ((selectEmpName === 0)) {
            const result = await axioslogin.get(`/common/getEmpName/${selectDeptSection}`)
            const { success, data } = result.data;
            if (success === 1) {
                setname(data)
            }
            setTableFlag(1)
        } else if (selectEmpName !== 0) {
            const result = await axioslogin.get(`/common/getENameLeaveCarry/${selectEmpName}`)
            const { success, data } = result.data;

            if (success === 1) {
                setname(data)
            }
            setTableFlag(1)
        }
    }

    const postdata = {
        emp_id: emp_id,
        cl_carry: 1,
        hdl_carry: 1,
        el_carry: 1,
        sl_carry: 1,
        carry_cl: edit.CL,
        carry_hdl: edit.HL,
        carry_el: edit.EL,
        carry_sl: edit.SL,
        carry_year: year,
        create_user: em_id
    }
    const reset = {
        EL: 0,
        CL: 0,
        SL: 0,
        HL: 0
    }
    const setCarryForwardLeave = async (e) => {
        e.preventDefault()
        const result = await axioslogin.post('/CarryLeave', postdata)
        const { success, message } = result.data
        if (success === 1) {
            succesNofity(message);
            setedit(reset)
        } else if (success === 2) {
            succesNofity(message);
            setedit(reset)
        }
    }
    const redirect = () => {
        history.push('/Home/Settings');
    }

    return (
        <Fragment>
            <PageLayoutProcess
                heading="Leave Carry Forwad"
                redirect={redirect}
            >
                <div className="col-md-12 mb-2">
                    <div className="row g-2">
                        <div className="col-md-3">
                            <DepartmentSelect select="Department" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-3">
                            <DepartmentSectionSelect select="Department" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-3">
                            <EmployeeNameSelect select="Department Section" style={SELECT_CMP_STYLE} />
                        </div>
                        <div className="col-md-1 text-center">
                            <IconButton
                                aria-label="add"
                                style={{ padding: '0rem' }}
                                onClick={() => {
                                    gettable()
                                }}
                            >
                                <MdOutlineAddCircleOutline className="text-info" size={30} />
                            </IconButton>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                    {tableflag === 1 ?
                        <div className="row g-1 ">
                            <div className="card ">
                                <div className="col-md-12 pt-1">
                                    <TableContainer sx={{ maxHeight: 500 }}>
                                        <Table size="small"
                                            stickyHeader aria-label="sticky table">
                                            <TableHead>
                                                <TableRow >
                                                    <TableCell align="center">Employee ID</TableCell>
                                                    <TableCell align="center">Employee Name</TableCell>
                                                    <TableCell align="center">CL</TableCell>
                                                    <TableCell align="center">HDL</TableCell>
                                                    <TableCell align="center">EL</TableCell>
                                                    <TableCell align="center">SL</TableCell>
                                                    <TableCell align="center"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <Suspense fallback={<LinearProgress />} >
                                                    <LeaveCarryRow name={name}
                                                        setedit={setedit}
                                                        edit={edit}
                                                        setCarryForwardLeave={setCarryForwardLeave}
                                                        setemp_id={setemp_id}
                                                    />
                                                </Suspense>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </div>
                        </div>
                        : null
                    }
                </div>
            </PageLayoutProcess>
        </Fragment >
    )
}

export default LeaveCarryForwad