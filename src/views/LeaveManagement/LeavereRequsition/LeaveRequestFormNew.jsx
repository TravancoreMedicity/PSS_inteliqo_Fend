import React, { memo, useCallback } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Box, Button, CssVarsProvider, Input, Radio, Table, Tooltip, Typography } from '@mui/joy'
import { Paper, TextField } from '@mui/material'
import { useState } from 'react';
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import { useSelector } from 'react-redux';
import { allLeavesConvertAnArray } from 'src/redux/reduxFun/reduxHelperFun';
import { useMemo } from 'react';
import { screenInnerHeight } from 'src/views/Constant/Constant';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import LeaveRequestTable from './Func/LeaveRequestTable';

const LeaveRequestFormNew = () => {

    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [radioBtnValue, setSelectedValue] = useState('C');
    const [openPage, setOpenPage] = useState(false)
    const [table, setTable] = useState([]);
    const [leaveArray, setLeaveArray] = useState([]);

    const allLeavesArray = useSelector((state) => allLeavesConvertAnArray(state))
    const filterdArray = useMemo(() => allLeavesArray, [allLeavesArray]);

    const handleChangeLeaveProcess = useCallback(async () => {
        const dateDiffrence = eachDayOfInterval({
            start: new Date(fromDate),
            end: new Date(toDate)
        })
        const modifiedTable = dateDiffrence?.map((e) => {
            return {
                date: e,
                leavetype: 0,
                leaveTypeName: '',
                selectedLveSlno: 0
            }
        })
        setTable(modifiedTable)

        const { status, data } = filterdArray;

        (status === true && data?.length > 0) && setLeaveArray(data)

    }, [fromDate, toDate, filterdArray])



    const handleProcessLeaveRequest = async () => {
        console.log(table)

    }




    return (
        <Box>
            <Paper variant="outlined" sx={{ mt: 0.5 }} >
                <Box sx={{ display: 'flex', flexDirection: 'row', p: 0.5 }} >
                    <Box sx={{ display: 'flex', px: 0.5, alignItems: 'center' }} >
                        <Typography color="danger" level="title-sm" variant="plain" flexGrow={1} paddingX={2} >From Date</Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={['day']}
                                minDate={startOfMonth(new Date())}
                                value={fromDate}
                                size="small"
                                onChange={(newValue) => setFromDate(newValue)}
                                renderInput={({ inputRef, inputProps, InputProps }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                        <CssVarsProvider>
                                            <Input ref={inputRef} {...inputProps} style={{ width: '80%' }} size='sm' disabled={true} color='primary' variant='outlined' />
                                        </CssVarsProvider>
                                        {InputProps?.endAdornment}
                                    </Box>
                                )}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ display: 'flex', px: 0.5, alignItems: 'center' }} >
                        <Typography color="danger" level="title-sm" variant="plain" flexGrow={1} paddingX={2} >To Date</Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                views={['day']}
                                maxDate={endOfMonth(new Date(fromDate))}
                                value={toDate}
                                size="small"
                                onChange={(newValue) => setToDate(newValue)}
                                renderInput={({ inputRef, inputProps, InputProps }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                                        <CssVarsProvider>
                                            <Input ref={inputRef} {...inputProps} style={{ width: '80%' }} size='sm' disabled={true} color='primary' />
                                        </CssVarsProvider>
                                        {InputProps?.endAdornment}
                                    </Box>
                                )}
                            />
                        </LocalizationProvider>
                    </Box>
                    <Box sx={{ display: "flex", flex: 1, px: 0.3, pl: 5, gap: 2 }} >
                        <CssVarsProvider>
                            <Tooltip title="Click Here to Request Other Leave Types" followCursor placement='top' arrow >
                                <Button
                                    aria-label="Like"
                                    variant="outlined"
                                    color="success"
                                    onClick={handleChangeLeaveProcess}
                                    size='sm'
                                    endDecorator={<Box>Add Leaves</Box>}
                                >
                                    <ExitToAppOutlinedIcon fontSize='large' />
                                </Button>
                            </Tooltip>
                        </CssVarsProvider>
                        {/* </Box>
                    <Box sx={{ display: "flex", flex: 1, px: 0.3, pl: 5 }} > */}
                        <CssVarsProvider>
                            <Tooltip title="Click Here to Request Other Leave Types" followCursor placement='top' arrow >
                                <Button
                                    aria-label="Like"
                                    variant="outlined"
                                    color="danger"
                                    onClick={handleProcessLeaveRequest}
                                    size='sm'
                                    endDecorator={<Box>Save Request</Box>}
                                >
                                    <ExitToAppOutlinedIcon fontSize='large' />
                                </Button>
                            </Tooltip>
                        </CssVarsProvider>
                    </Box>
                </Box>
                <Paper variant="outlined" sx={{ maxHeight: screenInnerHeight * 40 / 100, p: 1, m: 0.3, overflow: 'auto' }} >
                    <Table
                        aria-label="basic table"
                        // borderAxis="xBetween"
                        color="neutral"
                        size="sm"
                        variant="plain"
                    >
                        <thead>
                            <tr>
                                <th style={{ width: '20%' }}>Requested Leave Date</th>
                                <th>Leave Type</th>
                                <th>Selected Leaves</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                table && table?.map((e, idx) => <LeaveRequestTable key={idx} value={e} leaveArray={leaveArray} seletedLveDates={table} />)
                            }
                        </tbody>
                    </Table>
                </Paper>
            </Paper>
        </Box>
    )
}

export default memo(LeaveRequestFormNew) 