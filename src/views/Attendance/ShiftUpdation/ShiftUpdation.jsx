import { IconButton, LinearProgress } from '@mui/material'
import React, { Fragment, Suspense } from 'react'
import PageLayoutProcess from 'src/views/CommonCode/PageLayoutProcess'
import TextInput from 'src/views/Component/TextInput'
import { FcPlus, FcCancel } from "react-icons/fc";
import ShiftUpdationTable from './ShiftUpdationTable';
const ShiftPunchUpdationTable = React.lazy((() => import('../ShiftUpdation/ShiftUpdationTable')))

const ShiftUpdation = () => {
    return (
        <Fragment>
            <PageLayoutProcess heading="Attendance Details" >
                <div className="col-md-12 mb-2">
                    <div className="row g-2">
                        <div className="col-md-2">
                            <TextInput
                                type="date"
                                classname="form-control form-control-sm custom-datefeild-height"
                                Placeholder="Date"
                                name="endDate"
                            />
                        </div>
                        <div className="col-md-2">
                            <TextInput
                                type="date"
                                classname="form-control form-control-sm custom-datefeild-height"
                                Placeholder="Date"
                                name="endDate"
                            />
                        </div>
                        <div className="col-md-3">
                            <TextInput
                                type="text"
                                classname="form-control form-control-sm custom-datefeild-height"
                                Placeholder="Department Section drop Down box "
                                name="endDate"
                            />
                        </div>
                        <div className="col-md-3">
                            <TextInput
                                type="text"
                                classname="form-control form-control-sm custom-datefeild-height"
                                Placeholder="Employee Name drop Down box"
                                name="endDate"
                            />
                        </div>
                        <div className="col-md-1">
                            <div className='d-flex justify-content-evenly' >
                                <div>
                                    <IconButton
                                        aria-label="add"
                                        style={{ padding: '0rem' }}
                                    >
                                        <FcPlus className="text-info" size={30} />
                                    </IconButton>
                                </div>
                                <div>
                                    <IconButton
                                        aria-label="add"
                                        style={{ padding: '0rem' }}
                                    >
                                        <FcCancel className="text-info" size={30} />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-12">
                    <Suspense fallback={<LinearProgress />} >
                        <ShiftPunchUpdationTable />
                    </Suspense>
                </div>
            </PageLayoutProcess>
        </Fragment>
    )
}

export default ShiftUpdation
