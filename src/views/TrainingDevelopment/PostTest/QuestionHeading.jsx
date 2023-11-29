import { Box, Paper, Typography } from '@mui/material'
import React, { Fragment, memo, useCallback, useEffect, useState } from 'react'
import FileOptions from './FileOptions';

const QuestionHeading = ({ data, order, clrFlagA, SetclrFlagA, clrFlagB, SetclrFlagB, clrFlagC, SetclrFlagC, clrFlagD, SetclrFlagD, setRightAns, setDisright }) => {

    const [incmentCount, setincmentCount] = useState(0)
    // const [writtenAnswer, setWrittenAnswer] = useState('')
    const [filestatus, setFilestatus] = useState(0);
    const [disQuestn, setDisQuestn] = useState({
        Questn: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        writtenStatus: 0,
        upload_status: 0,
        oder: 0,
        marks: 0,
        handwrite_answer: '',
        right_answer: '',
        q_slno: 0,
        topic_slno: 0
    })

    const { Questn, optionA, optionB, optionC, optionD } = disQuestn;

    useEffect(() => {
        if (data.length !== 0) {
            const questDetails = data?.find((val) => val.oder === order)
            const { questions, answer_a, answer_b, answer_c, answer_d, writtenStatus, upload_status, oder, marks, handwrite_answer, right_answer, q_slno, topic_slno } = questDetails;
            const obj = {
                Questn: questions,
                optionA: answer_a,
                optionB: answer_b,
                optionC: answer_c,
                optionD: answer_d,
                writtenStatus: writtenStatus,
                upload_status: upload_status,
                oder: oder,
                marks: marks,
                handwrite_answer: handwrite_answer,
                right_answer: right_answer,
                q_slno: q_slno,
                topic_slno: topic_slno
            }
            setDisQuestn(obj);
            setRightAns(right_answer)
            setFilestatus(upload_status)
        }
    }, [data, order, setDisQuestn, setRightAns])

    const HandleOptionA = useCallback(() => {
        if (incmentCount === 0) {
            SetclrFlagA(1)
            SetclrFlagB(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setincmentCount(incmentCount + 1)
            setDisright(1)
        } else if (incmentCount === 1) {
            setincmentCount(0)
            SetclrFlagA(0)
            SetclrFlagB(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setDisright(0)
        }
        else {
            setincmentCount(0)
            SetclrFlagA(0)
            SetclrFlagB(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setDisright(0)
        }
    }, [SetclrFlagA, SetclrFlagB, SetclrFlagC, SetclrFlagD, setincmentCount, incmentCount, setDisright])

    //Option B
    const HandleOptionB = useCallback(() => {
        if (incmentCount === 0) {
            SetclrFlagB(1)
            SetclrFlagA(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setincmentCount(incmentCount + 1)
            setDisright(2)

        } else if (incmentCount === 1) {
            setincmentCount(0)
            SetclrFlagB(0)
            SetclrFlagA(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setDisright(0)
        }
        else {
            setincmentCount(0)
            SetclrFlagB(0)
            SetclrFlagA(0)
            SetclrFlagC(0)
            SetclrFlagD(0)
            setDisright(0)
        }

    }, [SetclrFlagA, SetclrFlagB, SetclrFlagC, SetclrFlagD, setincmentCount, incmentCount, setDisright])

    //Option C
    const HandleOptionC = useCallback(() => {
        if (incmentCount === 0) {
            SetclrFlagC(1)
            SetclrFlagB(0)
            SetclrFlagD(0)
            SetclrFlagA(0)
            setincmentCount(incmentCount + 1)
            setDisright(3)
        }
        else if (incmentCount === 1) {
            setincmentCount(0)
            SetclrFlagC(0)
            SetclrFlagB(0)
            SetclrFlagD(0)
            SetclrFlagA(0)
            setDisright(0)
        }
        else {
            setincmentCount(0)
            SetclrFlagC(0)
            SetclrFlagB(0)
            SetclrFlagD(0)
            SetclrFlagA(0)
            setDisright(0)
        }
    }, [SetclrFlagA, SetclrFlagB, SetclrFlagC, SetclrFlagD, setincmentCount, incmentCount, setDisright])


    //Option D
    const HandleOptionD = useCallback(() => {

        if (incmentCount === 0) {
            SetclrFlagD(1)
            SetclrFlagA(0)
            SetclrFlagB(0)
            SetclrFlagC(0)
            setincmentCount(incmentCount + 1)
            setDisright(4)
        }
        else if (incmentCount === 1) {
            setincmentCount(0)
            SetclrFlagD(0)
            SetclrFlagA(0)
            SetclrFlagB(0)
            SetclrFlagC(0)
            setDisright(0)
        }
        else {
            setincmentCount(0)
            SetclrFlagD(0)
            SetclrFlagA(0)
            SetclrFlagB(0)
            SetclrFlagC(0)
            setDisright(0)
        }
    }, [SetclrFlagA, SetclrFlagB, SetclrFlagC, SetclrFlagD, setincmentCount, incmentCount, setDisright])

    return (
        <Fragment>
            <Box sx={{ display: "flex", flexDirection: "row" }}>
                <Typography sx={{ fontSize: "large", fontWeight: "bold" }}>Q. {Questn}</Typography>
            </Box>
            {/* Written Answer */}
            {/* {
                writtenStatus === 1 ?
                    <Box sx={{ mt: 2, display: "flex", flexDirection: "row", gap: 3 }}>
                        <CssVarsProvider>
                            <Textarea
                                label="Outlined"
                                placeholder="Written Answer"
                                variant="outlined"
                                size="md"
                                value={writtenAnswer}
                                minRows={3}
                                maxRows={4}
                                onChange={(e) => setWrittenAnswer(e.target.value)}
                                style={{ flex: 1 }}
                            />
                        </CssVarsProvider>
                    </Box> 

            {/* : */}

            {
                filestatus === 0 ?
                    <Box>
                        {
                            clrFlagA === 1 ?
                                <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer", backgroundColor: "#F1EAFF" }}
                                    onClick={HandleOptionA}
                                >
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>1</Box>
                                    <Box sx={{ width: "80%" }}>{optionA}</Box>
                                </Paper>
                                :
                                <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer" }} onClick={HandleOptionA}>
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>1</Box>
                                    <Box sx={{ width: "80%" }}>{optionA}</Box>
                                </Paper>
                        }
                        {
                            clrFlagB === 1 ?
                                <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer", backgroundColor: "#F1EAFF" }}
                                    onClick={HandleOptionB}
                                >
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>2</Box>
                                    <Box sx={{ width: "80%" }}>{optionB}</Box>
                                </Paper>
                                : <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer" }} onClick={HandleOptionB}>
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>2</Box>
                                    <Box sx={{ width: "80%" }}>{optionB}</Box>
                                </Paper>
                        }
                        {
                            clrFlagC === 1 ?
                                <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer", backgroundColor: "#F1EAFF" }}
                                    onClick={HandleOptionC}
                                >
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>3</Box>
                                    <Box sx={{ width: "80%" }}>{optionC}</Box>
                                </Paper>
                                : <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer" }} onClick={HandleOptionC}>
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>3</Box>
                                    <Box sx={{ width: "80%" }}>{optionC}</Box>
                                </Paper>
                        }
                        {
                            clrFlagD === 1 ?
                                <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer", backgroundColor: "#F1EAFF" }}
                                    onClick={HandleOptionD}
                                >
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>4</Box>
                                    <Box sx={{ width: "80%" }}>{optionD}</Box>
                                </Paper>
                                : <Paper sx={{ mt: 2, p: 3, display: "flex", flexDirection: "row", gap: 3, cursor: "pointer" }} onClick={HandleOptionD}>
                                    <Box sx={{ width: "2%", borderRadius: 5, textAlign: "center", border: 2, borderColor: "#674188" }}>4</Box>
                                    <Box sx={{ width: "80%" }}>{optionD}</Box>
                                </Paper>
                        }
                    </Box>
                    : <FileOptions clrFlagA={clrFlagA} clrFlagB={clrFlagB} clrFlagC={clrFlagC} clrFlagD={clrFlagD}
                        optionA={optionA} optionB={optionB} optionC={optionC} optionD={optionD}
                        SetclrFlagA={SetclrFlagA} SetclrFlagB={SetclrFlagB} SetclrFlagC={SetclrFlagC} SetclrFlagD={SetclrFlagD}
                        incmentCount={incmentCount} setincmentCount={setincmentCount} setDisright={setDisright} disQuestn={disQuestn}
                        setDisQuestn={setDisQuestn} Questn={Questn} />
            }
            {/* } */}
        </Fragment>
    )
}

export default memo(QuestionHeading)
