import { FormControl, MenuItem, Select } from '@material-ui/core';
import React, { Fragment, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setEmployeeName } from 'src/redux/actions/EmpName.Action';



const EmpNameSelect = ({ name, style, onChange, sect }) => {

    const dispatch = useDispatch();

    useEffect(() => {
        if (sect !== 0) {
            dispatch(setEmployeeName(sect));
        }
    }, [sect])

    //selector for depart_section wise employee list
    const empNameList = useSelector((state) => {
        return state.getEmpNameList.empNameList
    })

    return (
        <Fragment>
            <FormControl
                fullWidth
                margin="dense"
                className="mt-1 mb-2"
            >
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name={name}
                    onChange={(e) => onChange(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="ml-0"
                    defaultValue={0}
                    style={style}
                >
                    <MenuItem value='0'>
                        Employee Name
                    </MenuItem>
                    {
                        empNameList && empNameList.map((val, index) => {
                            return <MenuItem key={index} value={val.em_id}>{val.em_name}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>

        </Fragment>
    )
}

export default EmpNameSelect