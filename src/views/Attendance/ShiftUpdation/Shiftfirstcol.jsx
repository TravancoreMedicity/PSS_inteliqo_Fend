import React, { Fragment } from 'react'
import { deepOrange, deepPurple, green, brown, cyan, blueGrey } from '@mui/material/colors';
import { Avatar } from '@mui/material';
const Shiftfirstcol = ({ datapunch }) => {
    const { duty_day, early_out, em_no, hrs_worked, late_in, duty_status,
        lvreq_type, over_time, punch_in, punch_out,
        shift_in, shift_out, shift_id } = datapunch;
    return (
        <Fragment>
            <Avatar sx={{
                bgcolor: (punch_in !== null && punch_out !== null) && duty_status === 1 ? green[500] :
                    shift_id == 5 ? blueGrey[200] :
                        duty_status === 0.5 ? deepPurple[500] :
                            lvreq_type != 0 && duty_status !== 0 ? cyan[500] :
                                duty_status === 0 ? deepOrange[500] :
                                    green[500]
                , width: 25, height: 25, fontSize: 10
            }}>
                {(punch_in !== null && punch_out !== null) && duty_status === 1 ? 'P' :
                    shift_id == 5 ? 'WOF' :
                        duty_status === 0.5 ? 'HLP' :
                            lvreq_type != 0 && duty_status !== 0 ? lvreq_type :
                                duty_status === 0 ? 'LOP' : 'P'
                }
            </Avatar>
        </Fragment>
    )
}

export default Shiftfirstcol