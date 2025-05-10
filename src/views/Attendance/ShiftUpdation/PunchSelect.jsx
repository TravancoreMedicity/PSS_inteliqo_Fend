import { Option, Select } from '@mui/joy'
import { format } from 'date-fns'
import React, { memo } from 'react'

const PunchSelect = ({ punchData, setValue }) => {
    return (
        <Select
            disabled={false}
            placeholder="Punch In....."
            size="sm"
            variant="outlined"
            onChange={(e) => setValue(e.target.innerText)}
        >
            {punchData?.map((val, idx) => <Option key={idx} value={format(new Date(val), 'yyyy-MM-dd HH:mm')} >{format(new Date(val), 'yyyy-MM-dd HH:mm')}</Option>)}
        </Select>
    )
}

export default memo(PunchSelect) 