import React, { Fragment } from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux'
import { setBloodgrp } from 'src/redux/actions/Bloodgrp.Action';
import { axioslogin } from 'src/views/Axios/Axios';
import CustomReport from 'src/views/Component/CustomReport'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'
import { Actiontypes } from 'src/redux/constants/action.type'
import { ToastContainer } from 'react-toastify';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';


const BloodReports = () => {

    /** Initiliazing values */
    const [TableData, setTableData] = useState([]);
    const [value, setValue] = useState(0);

    /** To get stored blood groups values in redux */
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setBloodgrp());
    }, [])

    const empBloodgrp = useSelector((state) => {
        return state.getEmployeeBloodgrp.empBlood
    })

    /** Selction checkbox for bloodgroup  */
    const [columnDefs] = useState([
        {
            headerName: 'Blood Group',
            field: 'group_name',
            checkboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            headerCheckboxSelection: true,
            resizable: true,
        },
    ])

    /** to get checked bloodgroup slno from selection checkbox  */
    const onSelectionChanged = (event) => {
        dispatch({ type: Actiontypes.FETCH_CHANGE_STATE, aggridstate: 0 })
        setValue(event.api.getSelectedRows())
    }

    /** Intializing slno for getting checked bloodgroup slno */
    const [slno, setslno] = useState([])
    useEffect(() => {
        const arr = value && value.map((val, index) => {
            return val.group_slno
        })
        setslno(arr)
    }, [value])

    /** Selected bloodgroup slno sumbit to get corresponding data from databse */
    const getEmployeeBloodgrp = async (e) => {
        e.preventDefault();
        dispatch({ type: Actiontypes.FETCH_CHANGE_STATE, aggridstate: 0 })
        if (slno !== 0) {
            const result = await axioslogin.post('/reports/bloodgroup/byid', slno)
            const { success, data } = result.data;
            if (success === 1) {
                setTableData(data)
            }
            else {
                setTableData([])
            }
        }
        else {
            warningNofity("Please Select Any Bloodgroup!")
        }
    }

    /** Bloodgroup wise report ag grid table heading */
    const [columnDefMain] = useState([
        {
            headerName: '#',
            //field: 'slno',
            // filter: true,
            filterParams: {
                buttons: ['reset', 'apply'],
                debounceMs: 200,
            },
            // filter: 'agTextColumnFilter',
            // filter: 'agNumberColumnFilter',
            // checkboxSelection: true,
            // headerCheckboxSelectionFilteredOnly: true,
            // headerCheckboxSelection: true,
            // resizable: false,
            width: 30,
        },
        { headerName: 'ID', field: 'em_no' },
        { headerName: 'Name ', field: 'em_name' },
        { headerName: 'Age ', field: 'em_age_year' },
        { headerName: 'Mobile ', field: 'em_mobile' },
        { headerName: 'Blood_group ', field: 'group_name' },
        { headerName: 'Dept Name ', field: 'dept_name' },
        { headerName: 'Dept Section ', field: 'sect_name' },
        { headerName: 'Branch ', field: 'branch_name' },
        { headerName: 'Technical/Non technical ', field: 'inst_emp_type' },
        { headerName: 'Designation ', field: 'desg_name' },
        { headerName: 'Date of joining ', field: 'em_doj' },
        { headerName: 'Category ', field: 'ecat_name' },
        { headerName: 'Gender ', field: 'gender' },
        { headerName: 'Marital Status ', field: 'marital_status' },
    ])
    return (
        <Fragment>
            <ToastContainer />
            <CustomReport
                onSelectionChanged={onSelectionChanged}
                onClick={getEmployeeBloodgrp}
                columnDefMain={columnDefMain}
                tableData={empBloodgrp}
                columnDefs={columnDefs}
                tableDataMain={TableData}
            />
        </Fragment>
    )
}

export default BloodReports