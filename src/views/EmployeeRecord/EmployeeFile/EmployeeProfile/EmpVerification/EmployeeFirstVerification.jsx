import { Paper } from '@mui/material'
import { Box } from '@mui/system'
import React, { Fragment, useState, useEffect, } from 'react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import { useHistory } from 'react-router-dom'
import { axioslogin } from 'src/views/Axios/Axios'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { CssVarsProvider, Typography } from '@mui/joy'
import CommonAgGrid from 'src/views/Component/CommonAgGrid'
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/joy/IconButton';
import EmployeeVerificationView from './EmployeeVerificationView'
import SquareIcon from '@mui/icons-material/Square';

const EmployeeFirstVerification = () => {

    const [data, setdata] = useState([])
    const history = useHistory()
    const [flag, setflag] = useState(0)
    const [no, setno] = useState(0)
    const [id, setid] = useState(0)
    const [slno, setslno] = useState(0)
    const [count, setCount] = useState(0)

    const ToProfile = (params) => {
        const data = params.api.getSelectedRows()
        const { em_no, em_id } = data[0]
        if (em_id !== 0) {
            setflag(1)
        }
        setno(em_no)
        setid(em_id)
        setslno(1)
        //const value = 1
        // // history.push(`/Home/Profile/${em_no}/${em_id}`)
        //history.push(`/Home/Prfle/${em_no}/${em_id}/${value}`)
    }

    const [columnDef] = useState([
        { headerName: 'ID', field: 'em_no', filter: true },
        { headerName: 'Emp Name ', field: 'em_name', filter: true, minWidth: 200 },
        // { headerName: 'Branch ', field: 'branch_name' },
        { headerName: 'Department ', field: 'dept_name', filter: true, minWidth: 200 },
        { headerName: 'Dept Section ', field: 'sect_name', filter: true, minWidth: 200 },
        { headerName: 'Date of Join ', field: 'em_doj' },
        { headerName: 'Verification Remark ', field: 'verification_Remark' },
        {
            headerName: 'Action',
            cellRenderer: params =>
                <IconButton sx={{ pb: 1 }} onClick={() => ToProfile(params)}>
                    <CheckCircleRoundedIcon color='primary' />
                </IconButton>
        },
    ])

    useEffect(() => {
        const getempverification = async () => {
            const result = await axioslogin.get('/empVerification')
            const { success, data } = result.data
            if (success === 1) {
                setdata(data)
            }
            else {
                setdata([])
            }
        }
        getempverification()
    }, [count])
    const rowStyle = { background: '#CE7D78' };
    const getRowStyle = params => {
        if (params.data.verification_status === 2) {
            return { background: '#CE7D78' };
        }
    };

    const toSettings = () => {
        setflag(0)
        history.push('/Home')
    }

    return (
        <Fragment>
            <Box sx={{ width: "100%" }} >
                <Paper square elevation={2} sx={{ p: 0.5, }}>
                    <Paper square elevation={3} sx={{
                        display: "flex",
                        p: 1,
                        alignItems: "center",
                    }}  >
                        <Box sx={{ flex: 1 }} >
                            <CssVarsProvider>
                                <Typography startDecorator={<DragIndicatorOutlinedIcon color='success' />} textColor="neutral.400" sx={{ display: 'flex', }} >
                                    Employee First Level Verification
                                </Typography>
                            </CssVarsProvider>
                        </Box>
                        <Box sx={{ display: "flex" }}>
                            <CssVarsProvider>
                                <IconButton variant="outlined" size='xs' color="danger" onClick={toSettings}  >
                                    <CloseIcon />
                                </IconButton>
                            </CssVarsProvider>
                        </Box>
                    </Paper>
                    <Paper square elevation={0} sx={{
                        pt: 1,
                        mt: 0.5,
                        display: 'flex',
                        flexDirection: "column"
                    }} >
                        {
                            flag === 1 ? <EmployeeVerificationView id={id} no={no} slno={slno} count={count} setCount={setCount} /> : <Box sx={{ flex: 1, p: 1 }} >
                                <CommonAgGrid columnDefs={columnDef} tableData={data} sx={{
                                    height: 600,
                                    width: "100%"
                                }} rowHeight={30} headerHeight={30} rowStyle={rowStyle} getRowStyle={getRowStyle} />
                            </Box>
                        }
                    </Paper>
                    <Paper square sx={{
                        display: "flex",
                        p: 1,
                        alignItems: "center",
                    }}  >
                        <Box sx={{ display: "flex" }}>
                            <CssVarsProvider>
                                <IconButton size='xs' sx={{ color: "#CE7D78" }}  >
                                    <SquareIcon />
                                </IconButton>
                            </CssVarsProvider>
                        </Box>
                        <Box sx={{ display: "flex", width: "98%", fontWeight: 500, pl: 5 }}>
                            <CssVarsProvider>
                                <Typography sx={{ display: 'flex', }} >
                                    Profile Not Completed or Need Correction
                                </Typography>
                            </CssVarsProvider>
                        </Box>
                    </Paper>
                </Paper>
            </Box>
        </Fragment>
    )
}

export default EmployeeFirstVerification