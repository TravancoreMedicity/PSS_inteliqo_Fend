import { addHours, addMinutes, differenceInHours, differenceInMinutes, format, isAfter, isBefore, isEqual, isValid, max, min, subHours, subMinutes } from "date-fns";

export const getBreakDutyAttendance = async (
    first_shift_in, first_shift_out,
    second_shift_in, second_shift_out,
    break_first_punch_in, break_first_punch_out,
    break_second_punch_in, break_second_punch_out,
    cmmn_grace_period, getBreakDutyLateInTime,
    shiftId, defaultShift, NAShift, NightOffShift,
    WoffShift, dutyoff, extra_off, break_shift_status,
) => {

    const { firstLateIn, secondLateIn, firstEarlyOut, secondEarlyOut } = getBreakDutyLateInTime;

    //SHIFT ID CHECKING
    // ( !== default shift , !== not applicable shift , !== Night off , !== week off, !==dutyoff, !==extra off) 
    // if true ==> ( its a working shift ) 
    const checkShiftIdStatus = (shiftId !== defaultShift && shiftId !== NAShift && shiftId !== NightOffShift && shiftId !== WoffShift && shiftId !== dutyoff && shiftId !== extra_off)

    if (checkShiftIdStatus === true && parseInt(break_shift_status) === 1) {

        //new validation
        // Check if the "break_first_punch_in" time is before or equal to the "first_shift_in" time
        const IsBeforeFirstInPuch = break_first_punch_in === null ? false : isBefore(new Date(break_first_punch_in), new Date(first_shift_in)) ||
            isEqual(new Date(break_first_punch_in), new Date(first_shift_in));

        // Check if the "break_second_punch_in" time is before or equal to the "second_shift_in" time
        const IsBeforeSecondInPuch = break_second_punch_in === null ? false : isBefore(new Date(break_second_punch_in), new Date(second_shift_in)) ||
            isEqual(new Date(break_second_punch_in), new Date(second_shift_in));

        // Check if the "break_first_punch_out" time is after or equal to the "first_shift_out" time
        const IsAfterFirstOutPuch = break_first_punch_out === null ? false : isAfter(new Date(break_first_punch_out), new Date(first_shift_out)) ||
            isEqual(new Date(break_first_punch_out), new Date(first_shift_out));

        // Check if the "break_second_punch_out" time is after or equal to the "second_shift_out" time
        const IsAfterSecondOutPuch = break_second_punch_out === null ? false : isAfter(new Date(break_second_punch_out), new Date(second_shift_out)) ||
            isEqual(new Date(break_second_punch_out), new Date(second_shift_out));

        return firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
            && IsBeforeFirstInPuch === true && IsBeforeSecondInPuch === true && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === true ?
            { duty_status: 1, duty_desc: 'P', lvereq_desc: 'P', duty_remark: 'Present' }

            //first punch btw 5 to 5.10 && second btw 18 to 18.10
            : firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === true ?
                { duty_status: 1, duty_desc: 'P', lvereq_desc: 'P', duty_remark: 'second Present' }

                //first punch greater than 5.10 
                : firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn > cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                    && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === true ?
                    { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'first halfday ' }

                    //second punch in greater than 18.10
                    : firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn > cmmn_grace_period)
                        && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === true ?
                        { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'second halfday' }

                        //second two punch ok, no first two punch
                        : firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                            && (IsBeforeFirstInPuch === false || IsAfterFirstOutPuch === false) && IsBeforeSecondInPuch === true && IsAfterSecondOutPuch === true ?
                            { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'second half punch only' }

                            //first punch out early before 12 pm and ( first late in & second late in btw 10 minut)
                            : firstEarlyOut < 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                                && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === false && IsAfterSecondOutPuch === true ?
                                { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'First early out' }

                                //second punch out early before 12 pm and ( first late in & second late in btw 10 minut)
                                : firstEarlyOut === 0 && secondEarlyOut < 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                                    && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === false ?
                                    { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'second early out' }

                                    //first punch after 5.10 & first punch out before 12pm
                                    : firstEarlyOut < 0 && secondEarlyOut === 0 && (firstLateIn > cmmn_grace_period) && (secondLateIn === 0 || secondLateIn <= cmmn_grace_period)
                                        && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === false && IsAfterSecondOutPuch === true ?
                                        { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'second two punch ok' }

                                        //second in punch after 18.10 & second punch out before 21 pm
                                        : firstEarlyOut === 0 && secondEarlyOut < 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn > cmmn_grace_period)
                                            && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === false ?
                                            { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'first two punch ok' }

                                            : firstEarlyOut === 0 && secondEarlyOut === 0 && (firstLateIn === 0 || firstLateIn <= cmmn_grace_period) && (secondLateIn > cmmn_grace_period)
                                                && (IsBeforeFirstInPuch === false || IsBeforeSecondInPuch === false) && IsAfterFirstOutPuch === true && IsAfterSecondOutPuch === false ?
                                                { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'first punch in late two punch ok' }

                                                : { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Absent' };
    } else {
        return shiftId === defaultShift
            ? { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'no duty plan' }
            : shiftId === WoffShift
                ? { duty_status: 1, duty_desc: 'WOFF', lvereq_desc: 'WOFF', duty_remark: 'week off' }
                : shiftId === NightOffShift
                    ? { duty_status: 1, duty_desc: 'NOFF', lvereq_desc: 'NOFF', duty_remark: 'night off' }
                    : shiftId === dutyoff
                        ? { duty_status: 1, duty_desc: 'DOFF', lvereq_desc: 'DOFF', duty_remark: 'day off' }
                        : shiftId === extra_off
                            ? { duty_status: 1, duty_desc: 'EOFF', lvereq_desc: 'EOFF', duty_remark: 'extra off' }
                            : { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'no applicable' };
    }
}
export const breakDutyPunchChecking = async (shiftMergedPunchMaster, employeeBasedPunchData, break_shift_taken_count) => {

    //BREAK DUTY SHIFT
    const first_shift_in = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.first_half_in), 'HH:mm')}`;
    const first_shift_out = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.first_half_out), 'HH:mm')}`;
    const second_shift_in = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.second_half_in), 'HH:mm')}`;
    const second_shift_out = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.second_half_out), 'HH:mm')}`;

    //find start-end time to taken brk duty day punches
    const first_punch_start_time = subHours(new Date(first_shift_in), break_shift_taken_count)
    const second_punch_end_time = addHours(new Date(second_shift_out), break_shift_taken_count)

    //filter punch time
    const punchBasedonDutyday = employeeBasedPunchData?.map((e) => new Date(e.punch_time))?.filter((e) => e >= first_punch_start_time && e <= second_punch_end_time);

    const first_shift_differ = differenceInHours(new Date(first_shift_out), new Date(first_shift_in)) / 2;
    const second_shift_differ = differenceInHours(new Date(second_shift_out), new Date(second_shift_in)) / 2;

    const first_punch_in_end_time = addHours(new Date(first_shift_in), new Date(first_shift_differ));
    const second_punch_out_start_time = subHours(new Date(second_shift_out), new Date(second_shift_differ));

    const sorted_first_punch_in = punchBasedonDutyday?.filter((e) => e >= first_punch_start_time && e <= first_punch_in_end_time)
    const sorted_second_punch_out = punchBasedonDutyday?.filter((e) => e >= new Date(second_punch_out_start_time) && e <= second_punch_end_time)

    const FIRST_PUNCH = min(sorted_first_punch_in)
    const FOURTH_PUNCH = max(sorted_second_punch_out)

    //to find second and third punch
    const intermediateTime = differenceInMinutes(new Date(second_shift_in), new Date(first_shift_out))
    const halfOfintermediateTime = intermediateTime / 2;
    const first_punch_out_end_time = addMinutes(new Date(first_shift_out), halfOfintermediateTime)
    const second_punch_in_start_time = subMinutes(new Date(second_shift_in), halfOfintermediateTime)

    const sorted_first_punch_out = punchBasedonDutyday?.filter((e) => e >= new Date(first_shift_in) && e <= first_punch_out_end_time)
    const soted_second_punch_in = punchBasedonDutyday?.filter((e) => e > second_punch_in_start_time && e <= new Date(second_shift_out))

    const SECOND_PUNCH = max(sorted_first_punch_out)
    const THIRD_PUNCH = min(soted_second_punch_in)

    return {
        ...shiftMergedPunchMaster,
        punch_in: null,
        punch_out: null,
        shift_in: null,
        shift_out: null,
        shiftInStart: null,
        shiftInEnd: null,
        shiftOutStart: null,
        shiftOutEnd: null,
        break_first_punch_in: isValid(FIRST_PUNCH) === true ? format(FIRST_PUNCH, 'yyyy-MM-dd HH:mm') : null,
        break_first_punch_out: isValid(SECOND_PUNCH) === true ? format(SECOND_PUNCH, 'yyyy-MM-dd HH:mm') : null,
        break_second_punch_in: isValid(THIRD_PUNCH) === true ? format(THIRD_PUNCH, 'yyyy-MM-dd HH:mm') : null,
        break_second_punch_out: isValid(FOURTH_PUNCH) === true ? format(FOURTH_PUNCH, 'yyyy-MM-dd HH:mm') : null,
        first_shift_in: first_shift_in,
        first_shift_out: first_shift_out,
        second_shift_in: second_shift_in,
        second_shift_out: second_shift_out

    }
}


