import { Button, CssVarsProvider, Modal, ModalClose, ModalDialog, Textarea, Typography } from '@mui/joy'
import { Box } from '@mui/material'
import React, { memo, useCallback, useEffect, useState, } from 'react'
import { axioslogin } from 'src/views/Axios/Axios';
import { succesNofity, warningNofity } from 'src/views/CommonCode/Commonfunc';
import { format, lastDayOfMonth, startOfMonth, subDays } from 'date-fns';
import moment from 'moment/moment';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import NightsStayIcon from '@mui/icons-material/NightsStay';


const NOFFCancelModal = ({ SetEmpNoffList, SetNoffdayPunch, SetOpen, open, modalData, em_id, commonSettings, GetNofftableData, setopenDateField }) => {

    const Handleclose = useCallback((e) => {
        SetOpen(false)
        setopenDateField(false)
    }, [SetOpen, setopenDateField])

    const [Remark, setReamrk] = useState('');

    const [data, SetData] = useState({
        dept_name: 0,
        em_dept: 0,
        em_dept_sec: 0,
        em_name: '',
        emp_id: 0,
        emp_no: 0,
        noff_req_date: '',
        slno: 0,
        noff_req_slno: 0
    })

    const { dept_name, em_name, emp_id, emp_no, noff_req_date, noff_req_slno, em_dept_sec } = data

    const handleChange = (event) => {
        setReamrk(event.target.value);
    };
    useEffect(() => {
        if (modalData.length !== 0) {
            const viewData = modalData?.find((val) => val.emp_id !== 0)
            const { dept_name, em_dept, em_dept_sec, em_name, emp_id, emp_no, noff_req_date, slno, noff_req_slno } = viewData;
            const obj = {
                dept_name: dept_name,
                em_dept: em_dept,
                em_dept_sec: em_dept_sec,
                em_name: em_name,
                emp_id: emp_id,
                emp_no: emp_no,
                noff_req_date: noff_req_date,
                slno: slno,
                noff_req_slno: noff_req_slno
            }
            SetData(obj);
        }
    }, [modalData, SetData])

    const handleSubmit = useCallback(async () => {
        const todateValue = subDays(new Date(noff_req_date), 1);
        const fromdateValue = subDays(new Date(noff_req_date), parseInt(commonSettings?.noff_selct_day_count))
        const obj = {
            noff_req_slno: parseInt(noff_req_slno),
            em_no: parseInt(emp_no),
            emp_id: parseInt(emp_id),
            duty_day: noff_req_date,
            Remark: Remark,
            duty_desc: 'A',
            lvereq_desc: 'A',
            duty_status: 0,
            lve_tble_updation_flag: 0,
            frmdate: moment(fromdateValue).format('yyyy-MM-DD'),
            todate: moment(todateValue).format('yyyy-MM-DD'),
            create_user: em_id
        }
        const monthStartDate = format(startOfMonth(new Date(noff_req_date)), 'yyyy-MM-dd')
        const postData = {
            month: monthStartDate,
            section: em_dept_sec
        }
        const checkPunchMarkingHr = await axioslogin.post("/attendCal/checkPunchMarkingHR/", postData);
        const { success, data } = checkPunchMarkingHr.data
        if (success === 0 || success === 1) {
            const lastUpdateDate = data?.length === 0 ? format(startOfMonth(new Date(noff_req_date)), 'yyyy-MM-dd') : format(new Date(data[0]?.last_update_date), 'yyyy-MM-dd')
            const lastDay_month = format(lastDayOfMonth(new Date(noff_req_date)), 'yyyy-MM-dd')
            if ((lastUpdateDate === lastDay_month) || (lastUpdateDate > lastDay_month)) {
                SetOpen(false)
                warningNofity("Punch Marking Monthly Process Done !! Can't Apply No punch Request!!  ")
            } else {
                if (Remark !== '') {
                    const result = await axioslogin.patch('/NightOff/CancelNightOff', obj)
                    const { success } = result.data
                    if (success === 1) {
                        const result = await axioslogin.patch('/NightOff/DeleteNOFF', obj)
                        const { success } = result.data
                        if (success === 1) {
                            succesNofity("NOFF Requested Cancelled Sucessfully");
                            SetOpen(false)
                            GetNofftableData()
                            SetEmpNoffList([])
                            SetNoffdayPunch([])
                            setopenDateField(false)
                        } else {
                            SetOpen(false)
                            warningNofity("Can't Delete Night Off! Contact IT")
                            SetEmpNoffList([])
                            SetNoffdayPunch([])
                            setopenDateField(false)
                        }
                    }
                }
                else {
                    SetOpen(false)
                    warningNofity("Enter the Reason for Deletion")
                    SetEmpNoffList([])
                    setopenDateField(false)
                }
            }
        }
    }, [noff_req_slno, em_dept_sec, SetOpen, noff_req_date, emp_no, emp_id, em_id, Remark, commonSettings, GetNofftableData, setopenDateField])

    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={open}
            onClose={Handleclose}
            sx={{ display: 'flex' }}
        >
            <ModalDialog size="lg" sx={{ width: "30%", height: 300 }}>
                <ModalClose
                    variant="outlined"
                    sx={{
                        top: 'calc(-1/4 * var(--IconButton-size))',
                        right: 'calc(-1/4 * var(--IconButton-size))',
                        boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                        borderRadius: '50%',
                        bgcolor: 'background.body'
                    }}
                />
                <Typography
                    fontSize="xl2"
                    lineHeight={1}
                    color='primary'
                    startDecorator={
                        <NightsStayIcon sx={{ mt: 0.3 }} />
                    }
                    sx={{ display: 'flex', alignItems: 'flex-start', mr: 2, }}
                >
                    Night Off Cancel Request
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
                    <Box>
                        <Typography sx={{ mt: 0.2 }}>Emp No</Typography>
                        <Typography sx={{ mt: 0.2 }}>Name</Typography>
                        <Typography sx={{ mt: 0.2 }}>Department</Typography>
                        <Typography sx={{ mt: 0.2 }}>Requested Date</Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ color: "grey" }}><ArrowRightIcon /></Typography>
                        <Typography sx={{ color: "grey" }}><ArrowRightIcon /></Typography>
                        <Typography sx={{ color: "grey" }}><ArrowRightIcon /></Typography>
                        <Typography sx={{ color: "grey" }}><ArrowRightIcon /></Typography>
                    </Box>
                    <Box>
                        <Typography sx={{ mt: 0.2 }}>{emp_no}</Typography>
                        <Typography sx={{ mt: 0.2 }}>{em_name}</Typography>
                        <Typography sx={{ mt: 0.2 }}>{dept_name}</Typography>
                        <Typography sx={{ mt: 0.2 }}>{noff_req_date}</Typography>
                    </Box>
                </Box>

                <Box>
                    <Textarea
                        placeholder="Reason for Night off deletion"
                        minRows={2}
                        maxRows={4}
                        value={Remark}
                        onChange={handleChange}
                    />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 3 }}>
                    <CssVarsProvider>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleSubmit}
                            size="sm"
                            sx={{ px: 3, }}
                        >
                            Cancel the Request
                        </Button>
                    </CssVarsProvider>
                </Box>
            </ModalDialog>
        </Modal >
    )
}

export default memo(NOFFCancelModal) 
