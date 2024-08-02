
import React, { memo, useEffect, useMemo, } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setEmpUnderDeptSec } from 'src/redux/actions/EmpUnderDeptSec.Action';
import { Option, Select } from '@mui/joy';

const EmployeeUderDeptSec = ({ value, setValue, deptSect }) => {

    const dispatch = useDispatch()
    const EmpUnderDeptSec = useSelector((state) => state.getEmpUnderDeptsecList.empNamesList)
    const employeeLIst = useMemo(() => EmpUnderDeptSec, [EmpUnderDeptSec]);

    useEffect(() => {
        dispatch(setEmpUnderDeptSec(deptSect))
    }, [deptSect, dispatch])

    return (
        <Select
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            size='md'
            variant='outlined'
        >
            <Option disabled value={0}>All Employees</Option>
            {
                employeeLIst && employeeLIst.map((val, index) => {
                    return <Option key={index} value={val.em_no}>{val.em_name}</Option>
                })
            }
        </Select>
    )
}

export default memo(EmployeeUderDeptSec) 
