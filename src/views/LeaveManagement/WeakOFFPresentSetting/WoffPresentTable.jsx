import { Paper } from '@mui/material'
import React, { useMemo, useState } from 'react'
import CommonAgGrid from 'src/views/Component/CommonAgGrid'

const WoffPresentTable = ({ EmpWoffData }) => {

    const data = useMemo(() => EmpWoffData, [EmpWoffData])

    const [columnDef] = useState([
        { headerName: 'Sl No', field: 'slNo', filter: true },
        { headerName: 'Emp. ID', field: 'em_no', filter: true },
        { headerName: 'Emp. Name', field: 'em_name', filter: true },
        { headerName: 'Dept. Section', field: 'sect_name', filter: true },
        { headerName: 'Duty Date', field: 'WoffPresent', filter: true },
        { headerName: 'Shift', field: 'shft_desc', filter: true },
        { headerName: 'Reason', field: 'remark', },
        { headerName: 'Requested On', field: 'reqstOn', filter: true },
    ])

    return (
        <Paper square elevation={0} sx={{ p: 1, mt: 0.5, display: 'flex', flexDirection: "column", width: "100%" }} >
            <CommonAgGrid
                columnDefs={columnDef}
                tableData={data}
                sx={{
                    height: 400,
                    width: "100%"
                }}
                rowHeight={30}
                headerHeight={30}
            />
        </Paper>
    )
}

export default WoffPresentTable
