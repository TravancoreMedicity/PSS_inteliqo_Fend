import { FormControl, MenuItem, Select } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'
import { axioslogin } from '../Axios/Axios'

const BankSelectredux = ({ value, setValue }) => {

    const [data, setData] = useState([])
    useEffect(() => {
        const getBankNames = async () => {
            const result = await axioslogin.get('/common/getBankName')
            const { success, data } = result.data
            if (success === 1) {
                setData(data)
            } else {
                setData([])
            }
        }
        getBankNames()
    }, [])

    return (
        <FormControl
            fullWidth
            size='small'   >
            <Select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                size="small"
                fullWidth
                variant='outlined'
            >
                <MenuItem value={0} >
                    Select Bank
                </MenuItem>
                {
                    data && data.map((val, index) => {
                        return <MenuItem key={index} value={val.bank_slno}>{val.bank_name}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    )
}

export default memo(BankSelectredux) 