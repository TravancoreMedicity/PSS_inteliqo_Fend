import { FormControl, MenuItem, Select } from '@material-ui/core';
import React, { Fragment, useContext, useEffect, useState } from 'react'
import { PayrolMasterContext } from 'src/Context/MasterContext';
import { axioslogin } from '../Axios/Axios';

const RegionSelect = (props) => {
    // intializing use state
    const [regiondata, setregion] = useState([]);

    // useContext
    const { getregion, udateregion } = useContext(PayrolMasterContext)

    // useeffect 
    useEffect(() => {
        const getregiondata = async () => {
            const result = await axioslogin.get('/region')
            const { success, data } = result.data;
            if (success === 1) {
                setregion(data)
            }
        }
        getregiondata()
        return (
            udateregion(0)
        )


    }, [udateregion]);
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
                    name="selectregiontype"
                    value={getregion}
                    onChange={(e) => udateregion(e.target.value)}
                    fullWidth
                    variant="outlined"
                    className="ml-0"
                    defaultValue={0}
                    style={props.style}
                // SelectDisplayProps={{ style: { paddingTop: 4, paddingBottom: 4 } }}
                >
                    <MenuItem value='0' disabled>
                        Region
                    </MenuItem>
                    {
                        regiondata && regiondata.map((val, index) => {
                            return <MenuItem key={index} value={val.reg_slno}>{val.reg_name}</MenuItem>
                        })
                    }

                </Select>
            </FormControl>
        </Fragment>
    )
}

export default RegionSelect
