import React, { useCallback, useState } from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { addDays, addHours, format, isValid, subHours } from 'date-fns';
import { Box, Chip } from '@mui/joy';
import EmailIcon from '@mui/icons-material/Email';
import { useSelector } from 'react-redux';
import PunchSelect from './PunchSelect';
import { getBreakDutyLateInTimeIntervel } from '../PunchMarkingHR/punchMarkingHrFunc';
import { getBreakDutyAttendance } from './Function';
import { axioslogin } from 'src/views/Axios/Axios';
import { errorNofity, succesNofity } from 'src/views/CommonCode/Commonfunc';

const BreakShiftModal = ({ open, setOpen, data, punchData, punchMast, setTableArray }) => {
    const [firstinTime, setfirstInTime] = useState(null)
    const [firstoutTime, setfirstOutTime] = useState(null)
    const [secondInTime, setSecondInTime] = useState(null)
    const [secondOutTime, setSecondOutTime] = useState(null)
    const [message, setMessage] = useState(false)

    const shiftData = useSelector((state) => state?.getShiftList?.shiftDetails)
    const commonSettings = useSelector((state) => state?.getCommonSettings)

    const {
        cmmn_grace_period, // common grace period for late in time
        week_off_day, // week off SHIFT ID
        notapplicable_shift, //not applicable SHIFT ID
        default_shift, //default SHIFT ID
        noff, // night off SHIFT ID
        punch_taken_hour_count,
        dutyoff,
        extra_off
    } = commonSettings; //COMMON SETTING

    //FIND THE CROSS DAY
    const crossDay = shiftData?.find(shft => shft?.shft_slno === data?.shift_id);
    const crossDayStat = crossDay?.shft_cross_day ?? 0;

    let shiftIn = `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(data?.shiftIn), 'HH:mm')}`;
    let shiftOut = crossDayStat === 0 ? `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(data?.shiftOut), 'HH:mm')}` :
        `${format(addDays(new Date(data?.duty_day), 1), 'yyyy-MM-dd')} ${format(new Date(data?.shiftOut), 'HH:mm')}`;

    const startPunchInTime = subHours(new Date(shiftIn), punch_taken_hour_count); //last 24 hours from shift in time
    const endPunchOutTime = addHours(new Date(shiftOut), punch_taken_hour_count); //last 24 hours from shift out time

    //filter punch data based on in and out time
    const filterdPunchData = punchData
        ?.map((e) => new Date(e?.punch_time))
        ?.filter((el) => startPunchInTime <= el && el <= endPunchOutTime)
        ?.map((e) => format(new Date(e), 'yyyy-MM-dd HH:mm'))

    //FILTERD PUNCH MASTER DATA BETWEEN 24 HOURS
    const filterdPunchMasterDataAll = punchMast
        ?.map((e) => [
            (e.punch_in !== null && isValid(new Date(e.punch_in))) && new Date(e.punch_in),
            (e.punch_in !== null && isValid(new Date(e.punch_out))) && new Date(e.punch_out)
        ])
        ?.flat()
        ?.filter((e) => e !== false)?.filter((el) => startPunchInTime <= el && el <= endPunchOutTime)
        ?.map((e) => format(new Date(e), 'yyyy-MM-dd HH:mm'))

    //FILTERD PUNCH MASTER SEELCTED dATE
    const filterdPunchMasterDataSelectedDate = punchMast
        ?.filter((e) => e?.duty_day === data?.duty_day)
        ?.map((e) => [
            (e.punch_in !== null && isValid(new Date(e.punch_in))) && new Date(e.punch_in),
            (e.punch_in !== null && isValid(new Date(e.punch_out))) && new Date(e.punch_out)
        ])
        ?.flat()
        ?.filter((e) => e !== false)?.filter((el) => startPunchInTime <= el && el <= endPunchOutTime)
        ?.map((e) => format(new Date(e), 'yyyy-MM-dd HH:mm'))

    // FILTER AND REMOVE FROM filterdPunchData ARRAY USING THIS ARRAY filterdPunchMasterDataAll punch master in and out punch 
    const filterData = filterdPunchData?.filter((el) => !filterdPunchMasterDataAll?.includes(el))?.concat(filterdPunchMasterDataSelectedDate)

    const updatePunchInOutData = useCallback(async () => {

        const first_shift_in = `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(crossDay?.first_half_in), 'HH:mm')}`
        const first_shift_out = `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(crossDay?.first_half_out), 'HH:mm')}`
        const second_shift_in = `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(crossDay?.second_half_in), 'HH:mm')}`
        const second_shift_out = `${format(new Date(data?.duty_day), 'yyyy-MM-dd')} ${format(new Date(crossDay?.second_half_out), 'HH:mm')}`

        const break_first_punch_in = new Date(firstinTime)
        const break_first_punch_out = new Date(firstoutTime)
        const break_second_punch_in = new Date(secondInTime)
        const break_second_punch_out = new Date(secondOutTime)

        const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(
            first_shift_in,
            first_shift_out,
            second_shift_in,
            second_shift_out,
            break_first_punch_in,
            break_first_punch_out,
            break_second_punch_in,
            break_second_punch_out
        )

        setMessage(false)

        if (
            break_first_punch_in.getTime() === break_first_punch_out.getTime() ||
            break_first_punch_in.getTime() === break_second_punch_in.getTime() ||
            break_first_punch_in.getTime() === break_second_punch_out.getTime()
        ) {
            setMessage(true);
        } else if (
            break_first_punch_out.getTime() === break_second_punch_in.getTime() ||
            break_first_punch_out.getTime() === break_second_punch_out.getTime()
        ) {
            setMessage(true);
        } else if (
            break_second_punch_in.getTime() === break_second_punch_out.getTime()
        ) {
            setMessage(true);
        }
        else {
            if (isValid(break_first_punch_in) === true && isValid(break_first_punch_out) === true
                && isValid(break_second_punch_in) === true && isValid(break_second_punch_out) === true
                && firstinTime !== null && firstoutTime !== null && secondInTime !== null && secondOutTime !== null) {
                setMessage(false);
                const getAttendance = await getBreakDutyAttendance(
                    first_shift_in, first_shift_out,
                    second_shift_in, second_shift_out,
                    break_first_punch_in, break_first_punch_out,
                    break_second_punch_in, break_second_punch_out,
                    cmmn_grace_period, getBreakDutyLateInTime,
                    data?.shift_id, default_shift, notapplicable_shift,
                    noff, week_off_day, dutyoff, extra_off,
                    crossDay?.break_shift_status
                )
                const postData = {
                    punch_in: format(new Date(break_first_punch_in), 'yyyy-MM-dd HH:mm'),
                    punch_out: format(new Date(break_second_punch_out), 'yyyy-MM-dd HH:mm'),
                    hrs_worked: getBreakDutyLateInTime?.hrsWorked,
                    late_in: getBreakDutyLateInTime?.lateIn,
                    early_out: getBreakDutyLateInTime?.earlyOut,
                    duty_status: getAttendance?.duty_status,
                    duty_desc: getAttendance?.duty_desc,
                    lvereq_desc: getAttendance?.lvereq_desc,
                    punch_slno: data?.punch_slno,
                }
                let result = await axioslogin.post("/attendCal/updatePunchMasterSingleRow", postData);
                const { success } = result.data;
                if (success === 1) {
                    setTableArray([])
                    succesNofity('Punch Data Updated')
                    setOpen(false)
                } else {
                    errorNofity('Punch Data Not Updated ! Contact HR/IT')
                    setOpen(false)
                }
            } else {
                //one of the date or both dates are not a valid dates
                setMessage(true)
            }
        }

    }, [firstinTime, firstoutTime, secondInTime, secondOutTime, data, crossDay, dutyoff,
        extra_off, cmmn_grace_period, default_shift, noff, notapplicable_shift,
        setOpen, setTableArray, week_off_day])
    return (
        <>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                onClose={() => setOpen(false)}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    <ModalClose
                        variant="outlined"
                        sx={{
                            top: 'calc(-1/4 * var(--IconButton-size))',
                            right: 'calc(-1/4 * var(--IconButton-size))',
                            boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                            borderRadius: '50%',
                            bgcolor: 'background.body',
                        }}
                    />
                    <Typography
                        component="h2"
                        id="modal-title"
                        level="h5"
                        textColor="inherit"
                        fontWeight="sm"
                        mb={1}
                    >
                        Punch In and Punch Out Time Marking On {format(new Date(data?.duty_day), 'dd-MM-yyyy')}
                    </Typography>
                    {message && <Chip
                        size="sm"
                        variant="outlined"
                        color="danger"
                        startDecorator={<EmailIcon />}
                    >The Selected times are same</Chip>}
                    <Box sx={{ display: 'flex', flex: 1, py: 1 }} >
                        <Box sx={{ display: 'flex', flex: 1, alignContent: 'center' }} ><Typography textColor="text.tertiary">First In Time</Typography></Box>
                        <Box sx={{ flex: 2 }} >
                            <PunchSelect punchData={filterData} setValue={setfirstInTime} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1, py: 1 }} >
                        <Box sx={{ flex: 1 }} ><Typography textColor="text.tertiary">First Out Time</Typography></Box>
                        <Box sx={{ flex: 2 }}>
                            <PunchSelect punchData={filterData} setValue={setfirstOutTime} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1, py: 1 }} >
                        <Box sx={{ flex: 1 }} ><Typography textColor="text.tertiary">Second In Time</Typography></Box>
                        <Box sx={{ flex: 2 }}>
                            <PunchSelect punchData={filterData} setValue={setSecondInTime} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1, py: 1 }} >
                        <Box sx={{ flex: 1 }} ><Typography textColor="text.tertiary">Second Out Time</Typography></Box>
                        <Box sx={{ flex: 2 }}>
                            <PunchSelect punchData={filterData} setValue={setSecondOutTime} />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flex: 1, py: 1 }} >
                        <Box sx={{ flex: 2 }} ></Box>
                        <Box sx={{ flex: 1 }}>
                            <Button fullWidth onClick={updatePunchInOutData} size="sm">Update</Button>
                        </Box>
                    </Box>
                </Sheet>
            </Modal>
        </>
    )
}

export default React.memo(BreakShiftModal) 