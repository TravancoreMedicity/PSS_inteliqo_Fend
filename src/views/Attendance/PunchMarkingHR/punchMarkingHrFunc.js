import { addDays, addHours, addMinutes, differenceInDays, differenceInHours, differenceInMinutes, format, isAfter, isBefore, isValid, max, min, parseISO, subDays, subHours, subMinutes } from "date-fns";
import { axioslogin } from "src/views/Axios/Axios";
import { isEqual } from "underscore";

export const processPunchMarkingHrFunc = async (
    postData_getPunchData,
    punchaData, //PUNCH DATA
    empList, // EMPLOYEE LIST SECTION WISE
    shiftInformation, // SHIFT INFORMATION
    commonSettings, // COMMON SETTINGS
    holidayList, // HOLIDAY LIST
    empSalary // EMPLOYEE_SALARY
) => {
    const {
        cmmn_early_out, // Early going time interval
        cmmn_grace_period, // common grace period for late in time
        cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY 
        salary_above, //Salary limit for calculating the holiday double wages
        week_off_day, // week off SHIFT ID
        notapplicable_shift, //not applicable SHIFT ID
        default_shift, //default SHIFT ID
        noff, // night off SHIFT ID,
        max_late_day_count,
        break_shift_taken_count,
        holiday_policy_count, //HOLIDAY PRESENT AND ABSENT CHECKING COUNT 
        weekoff_policy_max_count, // WEEK OFF ELIGIBLE MAX DAY COUNT
        weekoff_policy_min_count,
        dutyoff,
        extra_off
    } = commonSettings; //COMMON SETTING

    //GET DUTY PLAN AND CHECK DUTY PLAN IS EXCIST OR NOT
    const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData); //GET DUTY PLAN DAAT
    const { succes, shiftdetail } = getDutyPlan.data;

    if (succes === 1 && shiftdetail?.length > 0) {
        const dutyplanInfo = shiftdetail; //DUTY PLAN
        const dutyPlanSlno = dutyplanInfo?.map(e => e.plan_slno) //FIND THE DUTY PLAN SLNO
        const { fromDate, toDate } = postData_getPunchData;
        const punch_master_data = await axioslogin.post("/attendCal/getPunchMasterDataSectionWise/", postData_getPunchData); //GET PUNCH MASTER DATA
        const { success, planData } = punch_master_data.data;
        if (success === 1 && planData?.length > 0) {
            const punchMasterFilterData = await planData?.filter((e) => new Date(fromDate) <= new Date(e.duty_day) && new Date(e.duty_day) <= new Date(toDate))
            const punchMasterData = punchMasterFilterData; //PUNCHMSTER DATA

            return Promise.allSettled(
                punchMasterData?.map(async (data, index) => {
                    const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
                    const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA
                    const shiftMergedPunchMaster = {
                        ...data,
                        shft_chkin_start: sortedShiftData?.shft_chkin_start,
                        shft_chkin_end: sortedShiftData?.shft_chkin_end,
                        shft_chkout_start: sortedShiftData?.shft_chkout_start,
                        shft_chkout_end: sortedShiftData?.shft_chkout_end,
                        shft_cross_day: sortedShiftData?.shft_cross_day,
                        gross_salary: sortedSalaryData?.gross_salary,
                        shft_duty_day: sortedShiftData?.shft_duty_day,
                        earlyGoingMaxIntervl: cmmn_early_out,
                        gracePeriodInTime: cmmn_grace_period,
                        maximumLateInTime: cmmn_late_in,
                        salaryLimit: salary_above,
                        woff: week_off_day,
                        naShift: notapplicable_shift,
                        defaultShift: default_shift,
                        noff: noff,
                        holidayStatus: sortedShiftData?.holiday_status,
                        break_shift_status: sortedShiftData?.break_shift_status,
                        first_half_in: sortedShiftData?.first_half_in,
                        first_half_out: sortedShiftData?.first_half_out,
                        second_half_in: sortedShiftData?.second_half_in,
                        second_half_out: sortedShiftData?.second_half_out,
                        dutyoff: dutyoff,
                        extra_off: extra_off
                    }
                    const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == data.em_no)

                    //FUNCTION FOR MAPPING THE PUNCH IN AND OUT
                    // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
                    if (shiftMergedPunchMaster?.break_shift_status === 1) {
                        return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData, cmmn_grace_period, break_shift_taken_count)
                    }
                    else {
                        return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

                    }
                })
            ).then((data) => {
                const punchMasterMappedData = data?.map((e) => e.value)

                return Promise.allSettled(
                    punchMasterMappedData?.map(async (val) => {

                        const holidayStatus = val.holiday_status;
                        const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
                        const punch_out = val.punch_out === null ? null : new Date(val.punch_out);

                        const shift_in = new Date(val.shift_in);
                        const shift_out = new Date(val.shift_out);

                        //SALARY LINMIT
                        const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;

                        const shft_duty_day = val.shft_duty_day;
                        const duty_day = val.duty_day;
                        //break duty

                        const break_shift_status = val.break_shift_status;

                        //emp punch
                        const break_first_punch_in = val.break_first_punch_in;
                        const break_first_punch_out = val.break_first_punch_out;
                        const break_second_punch_in = val.break_second_punch_in;
                        const break_second_punch_out = val.break_second_punch_out;

                        //shift details
                        const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
                        const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
                        const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
                        const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `

                        if (break_shift_status === 1) {
                            const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(first_shift_in, first_shift_out, second_shift_in, second_shift_out, break_first_punch_in, break_first_punch_out, break_second_punch_in, break_second_punch_out, break_shift_status, duty_day)
                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getBreakDutyLateInTime,
                                holidayStatus,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                salaryLimit,
                                val.maximumLateInTime,
                                shft_duty_day,
                                break_shift_status,
                                break_first_punch_in,
                                break_first_punch_out,
                                break_second_punch_in,
                                break_second_punch_out,
                                first_shift_in,
                                first_shift_out,
                                second_shift_in,
                                second_shift_out,
                                duty_day,
                                val.dutyoff,
                                val.extra_off
                            )
                            return {
                                punch_slno: val.punch_slno,
                                punch_in: val.break_first_punch_in,
                                punch_out: val.break_second_punch_out,
                                hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.hrsWorked,
                                late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.lateIn,
                                early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.earlyOut,
                                duty_status: getAttendanceStatus?.duty_status,
                                holiday_status: val.holiday_status,
                                leave_status: val.leave_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc,
                                lve_tble_updation_flag: val.lve_tble_updation_flag,
                                shft_duty_day: val.shft_duty_day
                            }
                        }
                        else {
                            const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getLateInTime,
                                holidayStatus,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                salaryLimit,
                                val.maximumLateInTime,
                                shft_duty_day,
                                break_shift_status,
                                break_first_punch_in,
                                break_first_punch_out,
                                break_second_punch_in,
                                break_second_punch_out,
                                first_shift_in,
                                first_shift_out,
                                second_shift_in,
                                second_shift_out,
                                duty_day,
                                val.dutyoff,
                                val.extra_off
                            )

                            return {
                                punch_slno: val.punch_slno,
                                punch_in: val.punch_in,
                                punch_out: val.punch_out,
                                hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff) ? 0 : getLateInTime?.hrsWorked,
                                late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff) ? 0 : getLateInTime?.lateIn,
                                early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff) ? 0 : getLateInTime?.earlyOut,
                                duty_status: getAttendanceStatus?.duty_status,
                                holiday_status: val.holiday_status,
                                leave_status: val.leave_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc,
                                lve_tble_updation_flag: val.lve_tble_updation_flag,
                                shft_duty_day: val.shft_duty_day
                            }
                        }

                    })
                ).then(async (element) => {

                    // REMOVE LEAVE REQUESTED DATA FROM THIS DATA
                    const elementValue = element?.map((e) => e.value);
                    const processedData = elementValue?.filter((v) => v.lve_tble_updation_flag === 0)
                    const punchMaterDataBasedOnPunchSlno = processedData?.map((e) => e.punch_slno)
                    // PUNCH MASTER UPDATION
                    const filterAndAdditionPlanData = await planData?.map((el) => {
                        return {
                            ...el,
                            duty_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc, // filter and update deuty_desc
                            lvereq_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc // same as updation in lvereq_desc 
                        }
                    })

                    /**** CALCUALETE HOLIDAY CHEKING AND WEEKLY OFF CHECKING *****/

                    //FILTER EMPLOYEE NUMBER FROM PUNCHMASTER DATA
                    const filteredEmNoFromPunMast = [...new Set(filterAndAdditionPlanData?.map((e) => e.em_no))];

                    const punchMasterFilterData = filteredEmNoFromPunMast?.map((emno) => {
                        return {
                            em_no: emno,
                            data: filterAndAdditionPlanData?.filter((l) => l.em_no === emno)?.sort((a, b) => b.duty_day - a.duty_day)
                        }
                    })

                    // CALCULATION BASED ON WEEEK OF AND HOLIDAY 
                    return Promise.allSettled(
                        punchMasterFilterData?.flatMap((ele) => {
                            return ele?.data?.map(async (e, idx, array) => {

                                const filteredWeekoffList = array?.filter((val) => val.duty_desc === 'WOFF')

                                const filteredPresentList = array?.filter((val) => val.duty_desc === 'P' || val.duty_desc === 'HD' || val.duty_desc === 'EGHD'
                                    || val.duty_desc === 'DP' || val.duty_desc === 'MPP' || val.duty_desc === 'OHP' || val.duty_desc === 'LC')

                                let holidayStat = e.duty_desc === 'H' ? await holidayStatus(e, array, holiday_policy_count) : e.duty_desc;

                                if (filteredPresentList.length >= 24) {
                                    const filteredweekoffArry = filteredWeekoffList.slice(4, filteredWeekoffList?.length)
                                    let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffFunction(e, filteredweekoffArry) : e.duty_desc;
                                    return {
                                        ...e,
                                        lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
                                        duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
                                    }
                                } else if (filteredPresentList.length < 24 && filteredPresentList.length >= 18) {
                                    const filteredweekoffArry = filteredWeekoffList.slice(3, filteredWeekoffList?.length)
                                    let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffFunction(e, filteredweekoffArry) : e.duty_desc;
                                    return {
                                        ...e,
                                        lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
                                        duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
                                    }
                                } else if (filteredPresentList.length < 18 && filteredPresentList.length >= 12) {
                                    const filteredweekoffArry = filteredWeekoffList.slice(2, filteredWeekoffList?.length)
                                    let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffFunction(e, filteredweekoffArry) : e.duty_desc;
                                    return {
                                        ...e,
                                        lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
                                        duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
                                    }
                                } else {
                                    const filteredweekoffArry = filteredWeekoffList.slice(1, filteredWeekoffList?.length)
                                    let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffFunction(e, filteredweekoffArry) : e.duty_desc;
                                    return {
                                        ...e,
                                        lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
                                        duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
                                    }
                                }
                            })
                        })

                    ).then(async (results) => {

                        const PunchMAsterPolicyBasedFilterResult = results?.map((e) => e.value)
                        const processedPostData = PunchMAsterPolicyBasedFilterResult?.filter((e) => punchMaterDataBasedOnPunchSlno?.some((el) => el === e.punch_slno))

                        const updatePunchMaster = await axioslogin.post("/attendCal/updatePunchMaster/", processedPostData);
                        const { success, message } = updatePunchMaster.data;
                        if (success === 1) {
                            // PUNCH MARKING HR TABLE UPDATION
                            const updatePunchMarkingHR = await axioslogin.post("/attendCal/updatePunchMarkingHR/", postData_getPunchData);
                            const { sus } = updatePunchMarkingHR.data;
                            if (sus === 1) {
                                // DUTY PLAN UPDATION
                                const updateDutyPlanTable = await axioslogin.post("/attendCal/updateDutyPlanTable/", dutyPlanSlno);
                                const { susc, message } = updateDutyPlanTable.data;
                                if (susc === 1) {
                                    return { status: 1, message: "Punch Master Updated SuccessFully", errorMessage: '', dta: postData_getPunchData }
                                } else {
                                    return { status: 0, message: "Error Updating Duty Plan ! contact IT", errorMessage: message }
                                }
                            } else {
                                return { status: 0, message: "Error Updating PunchMaster HR  ! contact IT", errorMessage: message }
                            }
                        } else {
                            return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: message }
                        }

                    });
                })
                // return { status: 1, message: "result", data: e }
            })
        } else {
            return { status: 0, message: "Punch Master Data Not Found ! contact IT", errorMessage: '' }
        }
    } else {
        return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '' }
    }
}

export const getAttendanceCalculation = async (
    punch_In, shift_in, punch_out, shift_out, cmmn_grace_period,
    getLateInTime, holidayStatus, shiftId, defaultShift, NAShift,
    NightOffShift, WoffShift, salaryLimit, maximumLateInTime,
    shft_duty_day, break_shift_status, break_first_punch_in,
    break_first_punch_out, break_second_punch_in, break_second_punch_out,
    first_shift_in, first_shift_out, second_shift_in,
    second_shift_out, duty_day, dutyoff, extra_off
) => {
    const {
        // hrsWorked, 
        lateIn,
        earlyOut } = getLateInTime;

    //SHIFT ID CHECKING
    // ( !== default shift , !== not applicable shift , !== Night off , !== week off) 
    // if true ==> ( its a working shift ) 
    const checkShiftIdStatus = (shiftId !== defaultShift && shiftId !== NAShift && shiftId !== NightOffShift && shiftId !== WoffShift && shiftId !== dutyoff && shiftId !== extra_off)
    //HALF DAY CALCULATION
    const totalShiftInMInits = differenceInMinutes(new Date(shift_out), new Date(shift_in))
    const halfDayInMinits = totalShiftInMInits / 2;
    const halfDayStartTime = addMinutes(shift_in, halfDayInMinits - 1)

    if (checkShiftIdStatus === true && break_shift_status !== 1) {

        // This condition not included  ( !== default shift , !== not applicable shift , !== Night off , !== week off) 
        if (isValid(punch_In) === true && isValid(punch_out) === true) {

            // *****EMPLOYEE HAVE BOTH THE PUNCH******

            const isBeforeHafDayInTime = isBefore(punch_In, halfDayStartTime); //for check -> punch in before half day start in time
            const isAfterHalfDayOutTime = isAfter(punch_out, halfDayStartTime)

            const workingHours = differenceInHours(new Date(punch_out), new Date(punch_In)) > 6;
            const halfDayWorkingHour = differenceInHours(new Date(punch_out), new Date(punch_In)) >= 4;

            if (holidayStatus === 0) {
                return earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && isBeforeHafDayInTime === true && shft_duty_day === 2 ?
                    { duty_status: 2, duty_desc: 'DP', lvereq_desc: 'DP', duty_remark: 'Double Present' } :

                    earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && isBeforeHafDayInTime === true ?
                        { duty_status: 1, duty_desc: 'P', lvereq_desc: 'P', duty_remark: 'Present' } :

                        earlyOut === 0 && lateIn > cmmn_grace_period && lateIn < maximumLateInTime ?
                            { duty_status: 1, duty_desc: 'LC', lvereq_desc: 'LC', duty_remark: 'Late Coming' } :

                            // { out time == 0 minit  ~~ intime greater than 30 minits ~~  in time before half day in time === true  } 
                            earlyOut === 0 && lateIn > maximumLateInTime && isBeforeHafDayInTime === true ?
                                { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Late in half day after 30 minits' } :

                                // { out time == 0 minit  ~~ intime greater than 30 minits ~~  in time before half day in time === false  } 
                                earlyOut === 0 && lateIn > maximumLateInTime && isBeforeHafDayInTime === false ?
                                    { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Late in and punch in after half day limit' } :

                                    // { out time greater than 0 minit  ~~ early out less than 30 minits ~~ intime lessthan or equal to 30  ~~ intime  and outtime should be before and after half day in time  } 
                                    (earlyOut > 0 && earlyOut <= maximumLateInTime) && lateIn <= maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true ?
                                        { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'Early going Half day' } :
                                        //completed first half
                                        (earlyOut > 0 && earlyOut > maximumLateInTime) && lateIn > maximumLateInTime && halfDayWorkingHour === true ?
                                            { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'First Half Completed & Early going Half day' } :

                                            // { outtime greater than 0 minit  ~~ early out less than 30 minits ~~ intime greater than 30  ~~ intime  and outtime should be before and after half day in time  } 
                                            (earlyOut > 0 && earlyOut < maximumLateInTime) && lateIn > maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && halfDayWorkingHour === true ?
                                                { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Half day latein and late out' } :

                                                // { outtime greater than 0 minit  ~~ early out greater than 30 minits ~~ intime greater than or equal 30  ~~ intime  and outtime should be before and after half day in time  } 
                                                (earlyOut > 0 && earlyOut > maximumLateInTime) && lateIn <= maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && halfDayWorkingHour === true ?
                                                    { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'Early going Half day latein and late out' } :

                                                    (earlyOut > 0 && earlyOut > maximumLateInTime) && lateIn > maximumLateInTime && isBeforeHafDayInTime === false && halfDayWorkingHour === false ?
                                                        { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'in and out less tha half day time' } :
                                                        { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Lose off Pay' }


            } else {
                // HOLIDAY === YES
                return workingHours === true && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true ? // new Entry by Ajith on  April 24th 2024, 6:31:15 pm
                    {
                        duty_status: salaryLimit === false ? 2 : 1,
                        duty_desc: 'HP',
                        lvereq_desc: salaryLimit === false ? 'HP' : 'H',
                        duty_remark: 'holiday Present'
                    }// new Entry by Ajith on  April 24th 2024, 6:31:15 pm
                    : earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && isBeforeHafDayInTime === true ?
                        {
                            duty_status: salaryLimit === false ? 2 : 1,
                            duty_desc: 'HP',
                            lvereq_desc: salaryLimit === false ? 'HP' : 'H',
                            duty_remark: 'holiday Present'
                        } :
                        earlyOut === 0 && lateIn > cmmn_grace_period && lateIn < maximumLateInTime ?
                            {
                                duty_status: salaryLimit === false ? 2 : 1,
                                duty_desc: 'HP',
                                lvereq_desc: salaryLimit === false ? 'HP' : 'H',
                                duty_remark: 'Late Coming'
                            } :
                            earlyOut > 0 && lateIn > 0 && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && workingHours === true ?
                                {
                                    duty_status: salaryLimit === false ? 2 : 1,
                                    duty_desc: 'HP',
                                    lvereq_desc: salaryLimit === false ? 'HP' : 'H',
                                    duty_remark: 'working hours more than six hours so holiday present'
                                } :
                                earlyOut > 0 && lateIn > 0 && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && workingHours === false ?
                                    {
                                        duty_status: salaryLimit === false ? 1 : 1,
                                        duty_desc: 'H',
                                        lvereq_desc: 'H',
                                        duty_remark: 'working hours less than six hours so holiday only'
                                    } :
                                    earlyOut === 0 && lateIn > maximumLateInTime && isBeforeHafDayInTime === true && workingHours === false ?
                                        {
                                            duty_status: salaryLimit === false && workingHours === true ? 2 : 1,// salary limit > 25000 and working hours should be > 6 hours
                                            duty_desc: 'H',
                                            lvereq_desc: 'H',
                                            duty_remark: 'Late in half day after 30 minits and working hours less than 6 hours'
                                        } :
                                        // new entry addeded by AJITH on Wednesday, April 24, 2024 12:46:09 PM start
                                        earlyOut === 0 && lateIn > maximumLateInTime && isBeforeHafDayInTime === true && workingHours === true ?
                                            {
                                                duty_status: salaryLimit === false && workingHours === true ? 2 : 1,// salary limit > 25000 and working hours should be > 6 hours
                                                duty_desc: 'HP',
                                                lvereq_desc: salaryLimit === false ? 'HP' : 'H',
                                                duty_remark: 'Late in half day after 30 minits and working hours greater than 6 hours'
                                            } :
                                            // new entry addeded by AJITH on Wednesday, April 24, 2024 12:46:09 PM end
                                            earlyOut === 0 && lateIn > maximumLateInTime && isBeforeHafDayInTime === false ?
                                                {
                                                    duty_status: salaryLimit === false ? 1 : 1,
                                                    duty_desc: 'H',
                                                    lvereq_desc: 'H',
                                                    duty_remark: 'Late in and punch in after half day limit'
                                                } :
                                                // (earlyOut > 0 && earlyOut < maximumLateInTime) && lateIn <= maximumLateInTime && isBeforeHafDayInTime === true ?
                                                (earlyOut > 0 && earlyOut <= maximumLateInTime) && lateIn <= maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true ?
                                                    {
                                                        duty_status: salaryLimit === false && workingHours === true ? 2 : 1, // salary limit > 25000 and working hours should be > 6 hours
                                                        duty_desc: 'H',
                                                        lvereq_desc: 'H',
                                                        duty_remark: 'Early going Half day'
                                                    }
                                                    :
                                                    (earlyOut > 0 && earlyOut < maximumLateInTime) && lateIn > maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && halfDayWorkingHour === true ?
                                                        {
                                                            duty_status: salaryLimit === false && workingHours === true ? 2 : 1,
                                                            duty_desc: 'H',
                                                            lvereq_desc: 'H',
                                                            duty_remark: 'Half day latein and late out'
                                                        } :
                                                        // (earlyOut > 0 && earlyOut < maximumLateInTime) && lateIn > maximumLateInTime && isBeforeHafDayInTime === true ?
                                                        (earlyOut > 0 && earlyOut > maximumLateInTime) && lateIn <= maximumLateInTime && isBeforeHafDayInTime === true && isAfterHalfDayOutTime === true && halfDayWorkingHour === true ?
                                                            {
                                                                duty_status: salaryLimit === false && workingHours === true ? 2 : 1, // salary limit > 25000 and working hours should be > 6 hours
                                                                duty_desc: 'H',
                                                                lvereq_desc: 'H',
                                                                duty_remark: 'Early going Half day latein and late out'
                                                            } :
                                                            (earlyOut > 0 && earlyOut > maximumLateInTime) && lateIn > maximumLateInTime && isBeforeHafDayInTime === false ?
                                                                {
                                                                    duty_status: salaryLimit === false ? 1 : 1,
                                                                    duty_desc: 'H',
                                                                    lvereq_desc: 'H',
                                                                    duty_remark: 'in and out less tha half day time'
                                                                } :
                                                                { duty_status: salaryLimit === false ? 1 : 1, duty_desc: 'H', lvereq_desc: 'H', duty_remark: 'Holiday' }
            }
        } else {
            return holidayStatus === 1 ?
                { duty_status: 1, duty_desc: 'H', lvereq_desc: 'H', duty_remark: 'holiday' } :
                { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Absent' }
        }
    }


    if (checkShiftIdStatus === true && parseInt(break_shift_status) === 1) {
        const isValidPunchTime = (punchTime) => punchTime !== null && punchTime !== undefined && isValid(new Date(punchTime));
        if (
            (break_second_punch_in === null || isValidPunchTime(break_second_punch_in)) &&
            (break_second_punch_out === null || isValidPunchTime(break_second_punch_out))
        ) {
            const getValidPunchTime = (punchTime) =>
                (punchTime !== null && punchTime !== undefined && isValid(new Date(punchTime)))
                    ? new Date(punchTime)
                    : false;

            // Using the reusable function for each punch time
            const first = getValidPunchTime(break_first_punch_in);
            const second = getValidPunchTime(break_first_punch_out);
            const third = getValidPunchTime(break_second_punch_in);
            const fourth = getValidPunchTime(break_second_punch_out);


            // Punch time checking with shift time
            const FirstIn = first && (isBefore(first, new Date(first_shift_in)) || isEqual(first, new Date(first_shift_in)));
            const FirstOut = second && (isAfter(second, new Date(first_shift_out)) || isEqual(second, new Date(first_shift_out)));
            const SecondIn = third && (isBefore(third, new Date(second_shift_in)) || isEqual(third, new Date(second_shift_in)));
            const SecondOut = fourth && (isAfter(fourth, new Date(second_shift_out)) || isEqual(fourth, new Date(second_shift_out)));

            // First half of the day
            const FirstHalfIn = isBefore(new Date(break_first_punch_in), new Date(first_shift_in)) ||
                isEqual(new Date(break_first_punch_in), new Date(first_shift_in));
            const FirstHalfOut = isAfter(new Date(break_first_punch_out), new Date(first_shift_out)) ||
                isEqual(new Date(break_first_punch_out), new Date(first_shift_out));

            // Second half of the day
            const SecondHalfIn = isBefore(new Date(break_second_punch_in), new Date(second_shift_in)) ||
                isEqual(new Date(break_second_punch_in), new Date(second_shift_in));
            const SecondHalfOut = isAfter(new Date(break_second_punch_out), new Date(second_shift_out)) ||
                isEqual(new Date(break_second_punch_out), new Date(second_shift_out));

            // Early out and half-day calculations
            const FirstHalfEarlyOut = differenceInMinutes(new Date(first_shift_out), new Date(break_first_punch_out));
            const earlyGoSecondHalf = isBefore(new Date(break_second_punch_out), new Date(second_shift_out));

            // const totalFirstHalf = differenceInMinutes(new Date(first_shift_out), new Date(first_shift_in));
            // const FirsthalfDayInMinutes = totalFirstHalf / 2;

            //********************************************************************************************************* */


            const FirsttotalShiftInMInits = differenceInMinutes(new Date(first_shift_out), new Date(first_shift_in))
            const FirsthalfDayInMinits = FirsttotalShiftInMInits / 2;
            const FirsthalfDayStartTime = addMinutes(new Date(first_shift_in), FirsthalfDayInMinits - 1)

            const FirstisBeforeHafDayInTime = isBefore(new Date(break_first_punch_in), FirsthalfDayStartTime); //for check -> punch in before half day start in time
            const FirstisAfterHalfDayOutTime = isAfter(new Date(break_first_punch_out), FirsthalfDayStartTime)




            const SecondtotalShiftInMInits = differenceInMinutes(new Date(second_shift_out), new Date(second_shift_in))
            const SecondhalfDayInMinits = SecondtotalShiftInMInits / 2;
            const SecondhalfDayStartTime = addMinutes(new Date(second_shift_in), SecondhalfDayInMinits - 1)

            const SecondisBeforeHafDayInTime = isBefore(new Date(break_second_punch_in), SecondhalfDayStartTime); //for check -> punch in before half day start in time
            const SecondisAfterHalfDayOutTime = isAfter(new Date(break_second_punch_out), SecondhalfDayStartTime)

            const SecondtotalShiftInMInit = (differenceInMinutes(new Date(second_shift_out), new Date(second_shift_in)));
            const SecondhalfDayInMinit = SecondtotalShiftInMInit / 2;
            // const SecondhalfDayStartTim = subMinutes(new Date(second_shift_in), SecondhalfDayInMinit - 1)

            //new validation
            const IsBeforeSecondInPuch = isBefore(new Date(break_second_punch_in), new Date(second_shift_in));
            const IsBeforeSecondOutPuch = isAfter(new Date(break_second_punch_out), new Date(second_shift_out));
            const IsBeforeFirstOutPuch = isAfter(new Date(break_first_punch_out), new Date(first_shift_out));
            const IsBeforeFirstInPuch = isBefore(first, new Date(first_shift_in));

            //***************************************************************************************************** */

            // Return duty status based on conditions
            return earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && IsBeforeFirstInPuch === true && IsBeforeFirstOutPuch === true && IsBeforeSecondInPuch === true && SecondisAfterHalfDayOutTime === true
                ? { duty_status: 1, duty_desc: 'P', lvereq_desc: 'P', duty_remark: 'Present' }
                : earlyOut === 0 && lateIn > cmmn_grace_period && lateIn < maximumLateInTime
                    ? { duty_status: 1, duty_desc: 'LC', lvereq_desc: 'LC', duty_remark: 'Late Coming' }
                    : earlyOut === 0 && lateIn > maximumLateInTime && FirstisBeforeHafDayInTime === true
                        ? { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Late in half day after 30 minutes' }
                        : earlyOut === 0 && lateIn > maximumLateInTime && FirstisBeforeHafDayInTime === true && FirstisAfterHalfDayOutTime === true && SecondisBeforeHafDayInTime === false && SecondisAfterHalfDayOutTime === false
                            ? { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'First Half- Second Become Half Day' }
                            : FirstisBeforeHafDayInTime === false && FirstisAfterHalfDayOutTime === false && SecondisBeforeHafDayInTime === true && SecondisAfterHalfDayOutTime === true ?
                                { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Second Half First Become LOP' }
                                : FirstisBeforeHafDayInTime === true && FirstisAfterHalfDayOutTime === true && IsBeforeSecondInPuch === false && IsBeforeSecondOutPuch === true ?
                                    { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Late In Second Half First Punch' }


                                    : FirstisBeforeHafDayInTime === false && IsBeforeFirstOutPuch === false && IsBeforeSecondInPuch === false && IsBeforeSecondOutPuch === false ?
                                        { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Late In and Early Out In First Half' }

                                        : earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && IsBeforeFirstInPuch === false && IsBeforeFirstOutPuch === true && IsBeforeSecondInPuch === true && SecondisAfterHalfDayOutTime === true
                                            ? { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: ' Not Preseent First In Puch' }

                                            // : earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && IsBeforeFirstInPuch === false && IsBeforeFirstOutPuch === true && IsBeforeSecondInPuch === true && IsBeforeSecondOutPuch === false
                                            : earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && FirstIn === false && FirstOut === true && SecondIn === true && SecondOut === false
                                                ? { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: ' First In Last Out Puch Not Updated' }

                                                : earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && FirstIn === true && FirstOut === true && SecondIn === true && SecondOut === false
                                                    ? { duty_status: 0, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: ' First In Last Out Puch Not Updated' }

                                                    : FirstisBeforeHafDayInTime === true && FirstisAfterHalfDayOutTime === true && IsBeforeSecondInPuch === false && IsBeforeSecondOutPuch === false ?
                                                        { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'HD', duty_remark: 'Late In and Early Out In Second Half' }
                                                        : FirstisBeforeHafDayInTime === true && IsBeforeFirstOutPuch === false && IsBeforeSecondInPuch === true && IsBeforeSecondOutPuch === true ?
                                                            { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EG', duty_remark: 'Early Go First Out' }

                                                            : earlyOut === 0 && lateIn > maximumLateInTime && FirstisBeforeHafDayInTime === false && FirstisAfterHalfDayOutTime === false && SecondisBeforeHafDayInTime === false && SecondisAfterHalfDayOutTime === false
                                                                ? { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Late in and punch in after half day limit' }
                                                                //first out only
                                                                : FirstIn === false && FirstOut === true && SecondIn === false && SecondOut === false && IsBeforeSecondInPuch === false && IsBeforeSecondOutPuch === true
                                                                    ? { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Late in and punch in after half day limit' }
                                                                    //fourth out only



                                                                    : FirstIn === false && FirstOut === false && SecondIn === false && SecondOut === true
                                                                        ? { duty_status: 0, duty_desc: 'B', lvereq_desc: 'A', duty_remark: 'Late in and punch in after half day limit' }
                                                                        : earlyOut === 0 && lateIn > maximumLateInTime && FirstHalfEarlyOut >= earlyOut
                                                                            ? { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'Early going First Half' }
                                                                            // : FirstisBeforeHafDayInTime === true && FirstisAfterHalfDayOutTime === true && SecondisBeforeHafDayInTime === true && earlyGoSecondHalf

                                                                            : IsBeforeFirstInPuch === true && IsBeforeFirstOutPuch === true && IsBeforeSecondInPuch === true && earlyGoSecondHalf
                                                                                ? { duty_status: 0.5, duty_desc: 'HD', lvereq_desc: 'EGHD', duty_remark: 'Early going Second Half' }
                                                                                : { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Loss of Pay' };

        } else {
            return { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'Absent' };
        }
    } else {
        // Default return based on shiftId  dutyoff
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


export const getLateInTimeIntervel = async (punch_In, shift_in, punch_out, shift_out) => {

    if ((punch_In !== null && punch_In !== undefined && isValid(punch_In) === true) && (punch_out !== null && punch_out !== undefined && isValid(punch_out) === true)) {
        //HOURS WORKED
        const hoursWorked = differenceInMinutes(punch_out, punch_In)
        if (isAfter(punch_In, shift_in) === true) {
            //GET LATE IN TIME
            const getLateInMinits = differenceInMinutes(punch_In, shift_in)

            const getEarlyOutInMinits = differenceInMinutes(shift_out, punch_out)

            return { hrsWorked: hoursWorked, lateIn: getLateInMinits <= 0 ? 0 : getLateInMinits, earlyOut: getEarlyOutInMinits <= 0 ? 0 : getEarlyOutInMinits }

        } else if (isBefore(punch_out, shift_out) === true) {
            // GET EARLY OUT TIME
            const getEarlyOutInMinits = differenceInMinutes(shift_out, punch_out)
            const getLateInMinits = differenceInMinutes(punch_In, shift_in)
            return { hrsWorked: hoursWorked, lateIn: getLateInMinits <= 0 ? 0 : getLateInMinits, earlyOut: getEarlyOutInMinits <= 0 ? 0 : getEarlyOutInMinits }
        } else {
            const getEarlyOutInMinits = differenceInMinutes(shift_out, punch_out)
            const getLateInMinits = differenceInMinutes(punch_In, shift_in)

            return { hrsWorked: hoursWorked, lateIn: getLateInMinits <= 0 ? 0 : getLateInMinits, earlyOut: getEarlyOutInMinits <= 0 ? 0 : getEarlyOutInMinits };
        }
    } else {
        return { hrsWorked: 0, lateIn: 0, earlyOut: 0 };
    }
}



export const getBreakDutyLateInTimeIntervel = async (
    first_shift_in,
    first_shift_out,
    second_shift_in,
    second_shift_out,
    break_first_punch_in,
    break_first_punch_out,
    break_second_punch_in,
    break_second_punch_out,
    break_shift_status,
    duty_day
) => {

    const BreakFirstPunchIn = break_first_punch_in !== null ? new Date(break_first_punch_in) : null;
    const BreakFirstPunchOut = break_first_punch_out !== null ? new Date(break_first_punch_out) : null;
    const BreakSecondPunchIn = break_second_punch_in !== null ? new Date(break_second_punch_in) : null;
    const BreakSecondPunchOut = break_second_punch_out !== null ? new Date(break_second_punch_out) : null;

    const FirstShiftIn = new Date(first_shift_in);
    const FirstShiftOut = new Date(first_shift_out);
    const SecondShiftIn = new Date(second_shift_in);
    const SecondShiftOut = new Date(second_shift_out);

    const isValidDate = (date) => date instanceof Date && !isNaN(date);
    // instanceof Date--->  const someDate = new Date();  // Valid Date object  ---someDate instanceof Date   is true
    // const invalidDate = "2024-09-07";  // String, not a Date object----invalidDate instanceof Date  is false
    //!isNaN(date)---> isNaN() function in JavaScript is typically used to check if a value is "Not-a-Number" (NaN) 

    if (
        isValidDate(BreakFirstPunchIn) &&
        isValidDate(BreakFirstPunchOut) &&
        BreakFirstPunchIn !== null && BreakFirstPunchOut !== null &&
        BreakFirstPunchIn !== undefined && BreakFirstPunchOut !== undefined

    ) {

        const firstShiftHoursWorked = differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn);
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0

        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;
        const lateInMinutes = isAfter(BreakFirstPunchIn, FirstShiftIn) ? differenceInMinutes(BreakFirstPunchIn, FirstShiftIn) : 0;
        const earlyOutMinutes = isBefore(BreakSecondPunchOut, SecondShiftOut) ? differenceInMinutes(BreakSecondPunchOut, SecondShiftOut) : 0;

        return {
            hrsWorked: totalWorkingHours,
            lateIn: lateInMinutes,
            earlyOut: earlyOutMinutes,
        };
    }

    //first punch is null
    else if (
        // isValidDate(BreakFirstPunchIn) &&
        isValidDate(BreakFirstPunchOut) &&
        BreakFirstPunchIn === null && BreakFirstPunchOut !== null &&
        BreakFirstPunchIn !== undefined && BreakFirstPunchOut !== undefined

    ) {

        const firstShiftHoursWorked = (BreakFirstPunchIn !== null && BreakFirstPunchOut !== null) ? differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn) : 0;
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0
        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;

        const lateInMinutes = isAfter(BreakFirstPunchIn, FirstShiftIn) ? differenceInMinutes(BreakFirstPunchIn, FirstShiftIn) : 0;
        const earlyOutMinutes = isBefore(BreakSecondPunchOut, SecondShiftOut) ? differenceInMinutes(BreakSecondPunchOut, SecondShiftOut) : 0;

        return {
            hrsWorked: totalWorkingHours,
            lateIn: lateInMinutes,
            earlyOut: earlyOutMinutes,
        };
    }
    else if (
        // isValidDate(BreakFirstPunchIn) &&
        isValidDate(BreakFirstPunchOut) &&
        BreakFirstPunchIn !== null && BreakFirstPunchOut === null &&
        BreakFirstPunchIn !== undefined && BreakFirstPunchOut !== undefined
    ) {
        const firstShiftHoursWorked = (BreakFirstPunchIn !== null && BreakFirstPunchOut !== null) ? differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn) : 0;
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0
        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;
        const lateInMinutes = isAfter(BreakFirstPunchIn, FirstShiftIn) ? differenceInMinutes(BreakFirstPunchIn, FirstShiftIn) : 0;
        const earlyOutMinutes = isBefore(BreakSecondPunchOut, SecondShiftOut) ? differenceInMinutes(BreakSecondPunchOut, SecondShiftOut) : 0;

        return {
            hrsWorked: totalWorkingHours,
            lateIn: lateInMinutes,
            earlyOut: earlyOutMinutes,
        };
    }
    else {
        return { hrsWorked: 0, lateIn: 0, earlyOut: 0 };
    }
};


//PUNCH IN OUT MARKING SETTINGS

const BreakDutypunchInOutMapping = async (shiftMergedPunchMaster, employeeBasedPunchData, cmmn_grace_period, break_shift_taken_count) => {

    const BreakTimeformat = (time) => {
        return `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(time), 'HH:mm')}`;
    };
    //BREAK DUTY SHIFT
    const Brk_First_Shift_IN = BreakTimeformat(shiftMergedPunchMaster?.first_half_in);
    const Brk_First_Shift_OUT = BreakTimeformat(shiftMergedPunchMaster?.first_half_out);
    const Brk_Second_Shift_IN = BreakTimeformat(shiftMergedPunchMaster?.second_half_in);
    const Brk_Second_Shift_OUT = BreakTimeformat(shiftMergedPunchMaster?.second_half_out);

    //find start-end time to taken brk duty day punches
    const StartTime = subHours(new Date(Brk_First_Shift_IN), break_shift_taken_count)

    const EndTime = addHours(new Date(Brk_Second_Shift_OUT), break_shift_taken_count)

    //find all punching datas
    const punchesOnDutyDay = employeeBasedPunchData.filter(val =>
        format(new Date(val.punch_time), "yyyy-MM-dd") === shiftMergedPunchMaster?.duty_day
    );

    //filter punch time
    const AllempPunchDatas = punchesOnDutyDay?.map((e) => new Date(e.punch_time));

    //find all punches b/w start and end
    const BrkDutyPunches = AllempPunchDatas?.filter((e) => e >= StartTime && e <= EndTime)

    if (BrkDutyPunches?.length >= 4) {

        const First_Shift_IN_End_Times = addHours(new Date(Brk_First_Shift_IN), break_shift_taken_count)


        const Find_FIRST_IN_Punch = BrkDutyPunches?.filter((e) => e >= StartTime && e <= First_Shift_IN_End_Times)
        const Find_SECOND_OUT_Punch = BrkDutyPunches?.filter((e) => e >= new Date(Brk_Second_Shift_OUT) && e <= EndTime)


        const FIRST_PUNCH = min(Find_FIRST_IN_Punch)
        const FOURTH_PUNCH = max(Find_SECOND_OUT_Punch)

        //To find second and Fourth punch
        const IntermediateTime = differenceInMinutes(new Date(Brk_Second_Shift_IN), new Date(Brk_First_Shift_OUT))

        const halfOfIntermediateTime = IntermediateTime / 2

        const Find_First_Out_End = addMinutes(new Date(Brk_First_Shift_OUT), halfOfIntermediateTime)

        const Find_Second_In_Start = subMinutes(new Date(Brk_Second_Shift_IN), halfOfIntermediateTime)

        const Find_FIRST_OUT_Punch = BrkDutyPunches?.filter((e) => e >= new Date(Brk_First_Shift_IN) && e <= Find_First_Out_End)

        const Find_SECOND_IN_Punch = BrkDutyPunches?.filter((e) => e > Find_Second_In_Start && e <= new Date(Brk_Second_Shift_IN))

        const SECOND_PUNCH = max(Find_FIRST_OUT_Punch)
        const THIRD_PUNCH = min(Find_SECOND_IN_Punch)

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
            //break shift time
            first_shift_in: Brk_First_Shift_IN,
            first_shift_out: Brk_First_Shift_OUT,
            second_shift_in: Brk_Second_Shift_IN,
            second_shift_out: Brk_Second_Shift_OUT,


        }
    }
    else {
        const First_Shift_IN_End_Time = addMinutes(new Date(Brk_First_Shift_IN), cmmn_grace_period)

        const Find_FIRST_IN_Punch = BrkDutyPunches?.filter((e) => e >= StartTime && e <= First_Shift_IN_End_Time)
        const Find_SECOND_OUT_Punch = BrkDutyPunches?.filter((e) => e >= new Date(Brk_Second_Shift_OUT) && e <= EndTime)

        const FIRST_PUNCH = min(Find_FIRST_IN_Punch)
        const FOURTH_PUNCH = max(Find_SECOND_OUT_Punch)

        //To find second and Fourth punch
        const IntermediateTime = differenceInMinutes(new Date(Brk_Second_Shift_IN), new Date(Brk_First_Shift_OUT))

        const halfOfIntermediateTime = IntermediateTime / 2

        const Find_First_Out_End = addMinutes(new Date(Brk_First_Shift_OUT), halfOfIntermediateTime)

        const Find_Second_In_Start = subMinutes(new Date(Brk_Second_Shift_IN), halfOfIntermediateTime)

        const Find_FIRST_OUT_Punch = BrkDutyPunches?.filter((e) => e >= new Date(Brk_First_Shift_IN) && e <= Find_First_Out_End)

        const Find_SECOND_IN_Punch = BrkDutyPunches?.filter((e) => e > Find_Second_In_Start && e <= new Date(Brk_Second_Shift_IN))

        const SECOND_PUNCH = max(Find_FIRST_OUT_Punch)
        const THIRD_PUNCH = min(Find_SECOND_IN_Punch)

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
            //break shift time
            first_shift_in: Brk_First_Shift_IN,
            first_shift_out: Brk_First_Shift_OUT,
            second_shift_in: Brk_Second_Shift_IN,
            second_shift_out: Brk_Second_Shift_OUT

        }
    }
}

const punchInOutMapping = async (shiftMergedPunchMaster, employeeBasedPunchData) => {

    const crossDay = shiftMergedPunchMaster?.shft_cross_day;
    const shiftInTime = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
    const shiftOutTime = crossDay === 0 ? `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}` :
        `${format(addDays(new Date(shiftMergedPunchMaster?.duty_day), crossDay), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}`;

    //SHIFT MASTER DATA    
    const shiftIn = new Date(shiftMergedPunchMaster?.shift_in);
    const shiftOut = new Date(shiftMergedPunchMaster?.shift_out);
    const shiftInStart = new Date(shiftMergedPunchMaster?.shft_chkin_start);
    const shiftInEnd = new Date(shiftMergedPunchMaster?.shft_chkin_end);
    const shiftOutStart = new Date(shiftMergedPunchMaster?.shft_chkout_start);
    const shiftOutEnd = new Date(shiftMergedPunchMaster?.shft_chkout_end);

    //Diffrence in Check IN time Intervel in Hours
    const shiftInStartDiffer = differenceInHours(shiftIn, shiftInStart);
    const shiftInEndDiffer = differenceInHours(shiftInEnd, shiftIn);

    //Diffrence in Check OUT time Intervel in Hours
    const shiftOutStartDiffer = differenceInHours(shiftOut, shiftOutStart);
    const shiftOutEndDiffer = differenceInHours(shiftOutEnd, shiftOut);

    const checkInTIme = new Date(shiftInTime);
    const checkOutTime = new Date(shiftOutTime);

    const checkInStartTime = subHours(checkInTIme, shiftInStartDiffer);
    const checkInEndTime = addHours(checkInTIme, shiftInEndDiffer);

    const checkOutStartTime = subHours(checkOutTime, shiftOutStartDiffer)
    const checkOutEndTime = addHours(checkOutTime, shiftOutEndDiffer);

    const empPunchData = employeeBasedPunchData?.map((e) => new Date(e.punch_time));

    const inTimesArray = empPunchData?.filter((e) => (e >= checkInStartTime && e <= checkInEndTime))
    // const outTimeArray = empPunchData?.filter((e) => (e >= checkOutStartTime && e <= checkOutEndTime))
    const outTimeArray = empPunchData?.filter((e) => (e >= checkInEndTime && e <= checkOutEndTime))

    const inPunch = min(inTimesArray)
    const outPunch = max(outTimeArray)

    return {
        ...shiftMergedPunchMaster,
        punch_in: isValid(inPunch) === true ? format(inPunch, 'yyyy-MM-dd HH:mm') : null,
        punch_out: isValid(outPunch) === true ? format(outPunch, 'yyyy-MM-dd HH:mm') : null,
        shift_in: checkInTIme,
        shift_out: checkOutTime,
        shiftInStart: checkInStartTime,
        shiftInEnd: checkInEndTime,
        shiftOutStart: checkOutStartTime,
        shiftOutEnd: checkOutEndTime,
        //break duty
        //break shift punch
        break_first_punch_in: null,
        break_first_punch_out: null,
        break_second_punch_in: null,
        break_second_punch_out: null,
        //break shift time
        first_shift_in: null,
        first_shift_out: null,
        second_shift_in: null,
        second_shift_out: null,
    }
}



export const processShiftPunchMarkingHrFunc = async (
    postData_getPunchData,
    punchaData, //PUNCH DATA
    empList, // EMPLOYEE LIST SECTION WISE
    shiftInformation, // SHIFT INFORMATION
    commonSettings, // COMMON SETTINGS
    holidayList, // HOLIDAY LIST
    empSalary // EMPLOYEE_SALARY
) => {
    const {
        cmmn_early_out, // Early going time interval
        cmmn_grace_period, // common grace period for late in time
        cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY 
        salary_above, //Salary limit for calculating the holiday double wages
        week_off_day, // week off SHIFT ID
        notapplicable_shift, //not applicable SHIFT ID
        default_shift, //default SHIFT ID
        noff, // night off SHIFT ID,
        max_late_day_count,
        break_shift_taken_count,
        dutyoff,
        extra_off
    } = commonSettings; //COMMON SETTING
    //GET DUTY PLAN AND CHECK DUTY PLAN IS EXCIST OR NOT
    const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData); //GET DUTY PLAN DAAT
    const { succes, shiftdetail } = getDutyPlan.data;
    if (succes === 1 && shiftdetail?.length > 0) {
        const dutyplanInfo = shiftdetail; //DUTY PLAN
        const dutyPlanSlno = dutyplanInfo?.map(e => e.plan_slno) //FIND THE DUTY PLAN SLNO
        const punch_master_data = await axioslogin.post("/attendCal/getPunchMasterDataSectionWise/", postData_getPunchData); //GET PUNCH MASTER DATA
        const { success, planData } = punch_master_data.data;
        if (success === 1 && planData?.length > 0) {
            const punchMasterData = planData; //PUNCHMSTER DATA
            return Promise.allSettled(
                punchMasterData?.map(async (data, index) => {
                    const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
                    const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA
                    const shiftMergedPunchMaster = {
                        ...data,
                        shft_chkin_start: sortedShiftData?.shft_chkin_start,
                        shft_chkin_end: sortedShiftData?.shft_chkin_end,
                        shft_chkout_start: sortedShiftData?.shft_chkout_start,
                        shft_chkout_end: sortedShiftData?.shft_chkout_end,
                        shft_cross_day: sortedShiftData?.shft_cross_day,
                        shft_duty_day: sortedShiftData?.shft_duty_day,
                        gross_salary: sortedSalaryData?.gross_salary,
                        earlyGoingMaxIntervl: cmmn_early_out,
                        gracePeriodInTime: cmmn_grace_period,
                        maximumLateInTime: cmmn_late_in,
                        salaryLimit: salary_above,
                        woff: week_off_day,
                        naShift: notapplicable_shift,
                        defaultShift: default_shift,
                        noff: noff,
                        holidayStatus: sortedShiftData?.holiday_status,
                        break_shift_status: sortedShiftData?.break_shift_status,
                        first_half_in: sortedShiftData?.first_half_in,
                        first_half_out: sortedShiftData?.first_half_out,
                        second_half_in: sortedShiftData?.second_half_in,
                        second_half_out: sortedShiftData?.second_half_out,
                        dutyoff: dutyoff,
                        extra_off: extra_off
                    }
                    const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == data.em_no)
                    //Functions for break duty and Normal duty
                    if (shiftMergedPunchMaster?.break_shift_status === 1) {
                        return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData, cmmn_grace_period, break_shift_taken_count)
                    } else {
                        return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

                    }
                    //FUNCTION FOR MAPPING THE PUNCH IN AND OUT 
                    // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
                })

            ).then((data) => {

                const punchMasterMappedData = data?.map((e) => e.value)
                return Promise.allSettled(
                    punchMasterMappedData?.map(async (val) => {
                        const holidayStatus = val.holiday_status;
                        const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
                        const punch_out = val.punch_out === null ? null : new Date(val.punch_out);

                        const shift_in = new Date(val.shift_in);
                        const shift_out = new Date(val.shift_out);

                        const shft_duty_day = val.shft_duty_day;
                        //SALARY LINMIT
                        const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;

                        const duty_day = val.duty_day;
                        //break duty

                        const break_shift_status = val.break_shift_status;
                        //emp punch
                        const break_first_punch_in = val.break_first_punch_in;
                        const break_first_punch_out = val.break_first_punch_out;
                        const break_second_punch_in = val.break_second_punch_in;
                        const break_second_punch_out = val.break_second_punch_out;

                        //shift details
                        const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
                        const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
                        const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
                        const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `

                        if (break_shift_status === 1) {
                            const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(first_shift_in, first_shift_out, second_shift_in, second_shift_out, break_first_punch_in, break_first_punch_out, break_second_punch_in, break_second_punch_out, break_shift_status, duty_day)

                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getBreakDutyLateInTime,
                                holidayStatus,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                salaryLimit,
                                val.maximumLateInTime,
                                shft_duty_day,
                                break_shift_status,
                                break_first_punch_in,
                                break_first_punch_out,
                                break_second_punch_in,
                                break_second_punch_out,
                                first_shift_in,
                                first_shift_out,
                                second_shift_in,
                                second_shift_out,
                                duty_day,
                                val.dutyoff,
                                val.extra_off
                            )
                            return {
                                punch_slno: val.punch_slno,
                                punch_in: val.break_first_punch_in,
                                punch_out: val.break_second_punch_out,
                                // punch_in: val.break_shift_status === 1 ? val.break_first_punch_in : val.punch_in,
                                // punch_out: val.break_shift_status === 1 ? val.break_second_punch_out : val.punch_out,
                                hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.hrsWorked,
                                late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.lateIn,
                                early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getBreakDutyLateInTime?.earlyOut,
                                duty_status: getAttendanceStatus?.duty_status,
                                holiday_status: val.holiday_status,
                                leave_status: val.leave_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc,
                                lve_tble_updation_flag: val.lve_tble_updation_flag,
                                shft_duty_day: val.shft_duty_day
                            }
                        }
                        else {
                            const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getLateInTime,
                                holidayStatus,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                salaryLimit,
                                val.maximumLateInTime,
                                shft_duty_day,
                                break_shift_status,
                                break_first_punch_in,
                                break_first_punch_out,
                                break_second_punch_in,
                                break_second_punch_out,
                                first_shift_in,
                                first_shift_out,
                                second_shift_in,
                                second_shift_out,
                                duty_day,
                                val.dutyoff,
                                val.extra_off
                            )

                            return {
                                punch_slno: val.punch_slno,
                                punch_in: val.punch_in,
                                punch_out: val.punch_out,
                                hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.hrsWorked,
                                late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.lateIn,
                                early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift || val.shift_id === dutyoff || val.shift_id === extra_off) ? 0 : getLateInTime?.earlyOut,
                                duty_status: getAttendanceStatus?.duty_status,
                                holiday_status: val.holiday_status,
                                leave_status: val.leave_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc,
                                lve_tble_updation_flag: val.lve_tble_updation_flag,
                                shft_duty_day: val.shft_duty_day
                            }
                        }
                    })

                ).then(async (element) => {
                    // REMOVE LEAVE REQUESTED DATA FROM THIS DATA
                    const processedData = element?.map((e) => e.value)?.filter((v) => v.lve_tble_updation_flag === 0)

                    // PUNCH MASTER UPDATION
                    const postDataForUpdatePunchMaster = {
                        postData_getPunchData: postData_getPunchData,
                        processedData: processedData,
                        max_late_day_count: max_late_day_count
                    }
                    const updatePunchMaster = await axioslogin.post("/attendCal/monthlyUpdatePunchMaster/", postDataForUpdatePunchMaster);
                    const { success, message, data } = updatePunchMaster.data;
                    if (success === 1) {
                        return { status: 1, message: "Punch Master Updated SuccessFully", errorMessage: '', punchMastData: data }
                    } else {
                        return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: message, punchMastData: [] }
                    }
                })
            })
        } else {
            return { status: 0, message: "Punch Master Data Not Found ! contact IT", errorMessage: '', punchMastData: [] }
        }
    } else {
        return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '', punchMastData: [] }
    }
}

//FIND AND CHECK THE HOLIDAY STATUS 
const holidayStatus = async (e, array, holiday_policy_count) => {
    const sortedArray = array.sort((a, b) => new Date(a.duty_day) - new Date(b.duty_day))
    if (e.duty_desc === 'H') {
        const holidayFIlterArray = sortedArray.filter((val) => subDays(new Date(val.duty_day), holiday_policy_count) <= new Date(e.duty_day) && addDays(new Date(val.duty_day), holiday_policy_count) >= new Date(e.duty_day))?.map((r) => r.duty_desc)
        //for checking absent -> A H A
        const Absent = holidayFIlterArray?.filter((m) => m === 'A').length
        // for checking LWP -> LWP H LWP
        const lwp = holidayFIlterArray?.filter((m) => m === 'LWP').length
        // for checking ESI -> ESI H ESI
        const ESI = holidayFIlterArray?.filter((m) => m === 'ESI').length
        //both absent and lwp -> LWP H A || A H LWP
        const absentlwp = holidayFIlterArray?.filter((m) => m === 'A' || m === 'LWP' || m === 'ESI' || m === 'LOP').length
        return await Absent === 2 ? 'A' : lwp === 2 ? 'A' : absentlwp === 2 ? 'A' : ESI === 2 ? 'A' : 'H'
    } else {
        return e.duty_desc
    };
}


const weekOffStatus = async (e, idx, array, weekoff_policy_max_count, weekoff_policy_min_count, fromDate) => {
    const sortedArray = array.sort((a, b) => new Date(a.duty_day) - new Date(b.duty_day))
    if (fromDate <= e.duty_day && e.duty_desc === 'WOFF') {
        const policyLimit = weekoff_policy_max_count - weekoff_policy_min_count;
        const toIndex = idx - 1;
        const fromIndex = idx - weekoff_policy_max_count;
        const FilterArray = sortedArray.filter((val, index) => fromIndex <= index && index <= toIndex)?.map((e) => e.duty_desc)
        const filterBasedOnDutyDesc = FilterArray?.filter((dutydesc) => dutydesc === 'LWP' || dutydesc === 'A' || dutydesc === 'ESI' || dutydesc === 'LOP' || dutydesc === 'WOFF').length
        return await filterBasedOnDutyDesc > policyLimit ? 'A' : 'WOFF'
    } else {
        return e.duty_desc
    }
}

export const punchInOutChecking = async (shiftMergedPunchMaster, employeeBasedPunchData) => {

    const crossDay = shiftMergedPunchMaster?.shft_cross_day;
    const shiftInTime = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
    const shiftOutTime = crossDay === 0 ? `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}` :
        `${format(addDays(new Date(shiftMergedPunchMaster?.duty_day), crossDay), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}`;

    //SHIFT MASTER DATA    
    const shiftIn = new Date(shiftMergedPunchMaster?.shift_in);
    const shiftOut = new Date(shiftMergedPunchMaster?.shift_out);
    const shiftInStart = new Date(shiftMergedPunchMaster?.shft_chkin_start);
    const shiftInEnd = new Date(shiftMergedPunchMaster?.shft_chkin_end);
    const shiftOutStart = new Date(shiftMergedPunchMaster?.shft_chkout_start);
    const shiftOutEnd = new Date(shiftMergedPunchMaster?.shft_chkout_end);

    //Diffrence in Check IN time Intervel in Hours
    const shiftInStartDiffer = differenceInHours(shiftIn, shiftInStart);
    const shiftInEndDiffer = differenceInHours(shiftInEnd, shiftIn);

    //Diffrence in Check OUT time Intervel in Hours
    const shiftOutStartDiffer = differenceInHours(shiftOut, shiftOutStart);
    const shiftOutEndDiffer = differenceInHours(shiftOutEnd, shiftOut);

    const checkInTIme = new Date(shiftInTime);
    const checkOutTime = new Date(shiftOutTime);

    const checkInStartTime = subHours(checkInTIme, shiftInStartDiffer);
    const checkInEndTime = addHours(checkInTIme, shiftInEndDiffer);

    const checkOutStartTime = subHours(checkOutTime, shiftOutStartDiffer)
    const checkOutEndTime = addHours(checkOutTime, shiftOutEndDiffer);

    const empPunchData = employeeBasedPunchData?.map((e) => new Date(e.punch_time));

    const inTimesArray = empPunchData?.filter((e) => (e >= checkInStartTime && e <= checkInEndTime))
    const outTimeArray = empPunchData?.filter((e) => (e >= checkOutStartTime && e <= checkOutEndTime))
    const inPunch = min(inTimesArray)
    const outPunch = max(outTimeArray)

    return {
        ...shiftMergedPunchMaster,
        punch_in: isValid(inPunch) === true ? format(inPunch, 'yyyy-MM-dd HH:mm') : null,
        punch_out: isValid(outPunch) === true ? format(outPunch, 'yyyy-MM-dd HH:mm') : null,
        shift_in: checkInTIme,
        shift_out: checkOutTime,
        shiftInStart: checkInStartTime,
        shiftInEnd: checkInEndTime,
        shiftOutStart: checkOutStartTime,
        shiftOutEnd: checkOutEndTime
    }
}

const weekOffFunction = async (e, filteredweekoffArry,) => {
    if (filteredweekoffArry.some((item) => item.duty_day === e.duty_day)) {
        return 'A'
    } else {
        return e.duty_desc
    }
}