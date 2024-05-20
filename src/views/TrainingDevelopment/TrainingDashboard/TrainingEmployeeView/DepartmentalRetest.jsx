import { Box, Table } from '@mui/joy';
import { Paper, Typography } from '@mui/material';
import React, { Fragment, memo, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RestestEmployeeTopicsByemId } from 'src/redux/actions/Training.Action';
import _ from 'underscore';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { IconButton as OpenIcon } from '@mui/material';
import { Tooltip } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TestBySystem from '../../EmployeeDashboard/TestBySystem';
import RetestQRscanPage from '../../EmployeeDashboard/RetestQRscanPage';

const DepartmentalRetest = ({ em_id }) => {

    const dispatch = useDispatch()
    const [Selecteddata, SetSelectedData] = useState([]);
    const [opeQRCodeModal, setopeQRCodeModal] = useState(false);
    const [openTest, setopenTest] = useState(false);
    const [count, Setcount] = useState(0)
    const [show, SetShow] = useState(0)

    useEffect(() => {
        dispatch(RestestEmployeeTopicsByemId(em_id))
        Setcount(0);
    }, [dispatch, em_id, count])

    //login employee topics
    const ResetTopics = useSelector((state) => state?.gettrainingData?.RetestEmpTopics?.RetestEmpTopicsList, _.isEqual);

    const ClickToScanQR = useCallback((val) => {
        const data = val;
        SetSelectedData(data);
        setopeQRCodeModal(true)
    }, [SetSelectedData, setopeQRCodeModal])

    const ClickToTest = useCallback((val) => {
        const data = val;
        setopenTest(true)
        SetSelectedData(data);
    }, [setopenTest, SetSelectedData])

    return (
        <Fragment>
            {openTest === true ? <TestBySystem SetShow={SetShow} show={show} Selecteddata={Selecteddata} />
                :
                <Box>
                    {ResetTopics?.length !== 0 ?

                        <Paper elevation={0} sx={{
                            height: 150,
                            p: 1, boxShadow: 4, backgroundColor: "#FFFFFF", overflow: "auto", '&::-webkit-scrollbar': { display: "none" }
                        }}>
                            <h5>Departmental ReTest</h5>


                            <Box sx={{ p: 1 }}>
                                <Table stickyFooter >
                                    <thead>
                                        <tr style={{}}>
                                            <th style={{ width: "15%", textAlign: "center" }}>SlNo</th>
                                            <th style={{ width: "50%", textAlign: "center" }}>Training Topic</th>
                                            <th style={{ width: "20%", textAlign: "center" }}>Scan Code</th>
                                            <th style={{ width: "20%", textAlign: "center" }}>Use system</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ResetTopics?.map((val, index) => (
                                            <tr key={index}>
                                                <td style={{ width: "15%", textAlign: "center" }}>{val.sn}</td>
                                                <td style={{ width: "50%", textAlign: "center" }}>{val.training_topic_name}</td>
                                                <td style={{ width: "20%", textAlign: "center" }}>
                                                    <Tooltip title="Click to scan the QRcode">
                                                        <OpenIcon onClick={(e) => ClickToScanQR(val)}>
                                                            <QrCodeScannerIcon style={{ color: "#0079FF" }} />
                                                        </OpenIcon>
                                                    </Tooltip>


                                                </td>
                                                <td style={{ width: "20%", textAlign: "center" }}>
                                                    <OpenIcon onClick={(e) => ClickToTest(val)}
                                                        sx={{ paddingY: 0.5 }} >
                                                        <Tooltip title="Exam attend through system">
                                                            <OpenInNewIcon color='primary' />
                                                        </Tooltip>
                                                    </OpenIcon>


                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {opeQRCodeModal === true ? <RetestQRscanPage count={count} Setcount={Setcount} Selecteddata={Selecteddata} opeQRCodeModal={opeQRCodeModal} setopeQRCodeModal={setopeQRCodeModal} /> : null}
                            </Box>

                        </Paper>
                        :
                        <Paper elevation={0} sx={{
                            height: 150, flex: 1,
                            p: 1, boxShadow: 4, backgroundColor: "#FFFFFF", overflow: "auto", '&::-webkit-scrollbar': { display: "none" }
                        }}>
                            <h5>Departmental ReTest   </h5>
                            <Box sx={{ textAlign: "center", color: "#D20062" }}>
                                <Typography>
                                    No Retest
                                </Typography>
                            </Box>
                        </Paper>
                    }
                </Box>

            }
        </Fragment>
    )
}

export default memo(DepartmentalRetest) 
