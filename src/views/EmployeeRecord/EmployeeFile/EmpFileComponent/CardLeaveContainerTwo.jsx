import { Typography } from '@mui/material'
import React from 'react'
import { CARD_HEADER_COLOR, CARD_SUB_HEADER_COLOR } from 'src/views/Constant/Constant'

const CardLeaveContainerTwo = ({ children, title }) => {
    const { mainHeading, headingOne, headingThee, headingFour, headingFive } = title
    return (
        <div className="card">
            <div className="card-header py-0 d-flex justify-content-between" style={CARD_HEADER_COLOR} >
                <div>{mainHeading}</div>
                <div style={{ color: "#023015" }} >{10}</div>
            </div>
            <div className="card-header py-0" style={CARD_SUB_HEADER_COLOR} >
                <div className="d-sm-flex d-md-flex flex-row justify-content-around">
                    <div className="col-sm-3 py-0 text-start">
                        <Typography variant="caption" display="block" gutterBottom className="py-0 my-0" >
                            {headingOne}
                        </Typography>
                    </div>

                    <div className="col-sm-2 py-0 text-start">
                        <Typography variant="caption" display="block" gutterBottom className="py-0 my-0" >
                            {headingThee}
                        </Typography>
                    </div>
                    <div className="col-sm-1 py-0 text-start">
                        <Typography variant="caption" display="block" gutterBottom className="py-0 my-0" >
                            {headingFour}
                        </Typography>
                    </div>
                    <div className="col-sm-2 py-0 text-start">
                        <Typography variant="caption" display="block" gutterBottom className="py-0 my-0" >
                            {headingFive}
                        </Typography>
                    </div>
                </div>

            </div>
            {children}
        </div>
    )
}

export default CardLeaveContainerTwo
