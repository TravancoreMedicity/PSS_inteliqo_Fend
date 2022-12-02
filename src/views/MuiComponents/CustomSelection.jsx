import React, { Fragment, memo } from 'react'
import { FormControl, MenuItem, Select } from '@material-ui/core'


const CustomSelection = (props) => {
    const { name, value, onchange, defaultvalue, style, array, disable } = props

    return (
        <Fragment>
            <FormControl
                fullWidth
                margin="dense"
                className="mt-1"
            >
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name={name}
                    value={value}
                    onChange={onchange}
                    fullWidth
                    variant="outlined"
                    className="ml-0"
                    defaultValue={defaultvalue}
                    style={style}
                    disabled={disable}
                >
                    <MenuItem value='0' disabled>

                    </MenuItem>
                    {/* {
                        array
                    } */}
                </Select>
            </FormControl>
        </Fragment >
    )
}

export default memo(CustomSelection)