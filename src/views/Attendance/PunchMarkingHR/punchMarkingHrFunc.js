import { addDays, addHours, addMinutes, differenceInDays, differenceInHours, differenceInMinutes, eachDayOfInterval, format, isAfter, isBefore, isValid, max, min, parseISO, subDays, subHours, subMinutes } from "date-fns";
import { axioslogin } from "src/views/Axios/Axios";
import { warningNofity } from "src/views/CommonCode/Commonfunc";
import { isEqual } from "underscore";

export const processPunchMarkingHrFunc = async (
    postData_getPunchData,
    punchaData, //PUNCH DATA
    empList, // EMPLOYEE LIST SECTION WISE
    shiftInformation, // SHIFT INFORMATION
    commonSettings, // COMMON SETTINGS
    holidayList, // HOLIDAY LIST
    // empSalary, // EMPLOYEE_SALARY
    value
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
        holiday_policy_count, //HOLIDAY PRESENT AND ABSENT CHECKING COUNT 
        weekoff_policy_max_count, // WEEK OFF ELIGIBLE MAX DAY COUNT
        weekoff_policy_min_count,
        noff_selct_day_count
    } = commonSettings; //COMMON SETTING

    //GET DUTY PLAN AND CHECK DUTY PLAN IS EXCIST OR NOT
    // const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData); //GET DUTY PLAN DAAT
    // // console.log(getDutyPlan)
    // const { succes, shiftdetail } = getDutyPlan.data;
    // console.log(" succes, shiftdetail", succes, shiftdetail);

    // if (succes === 1 && shiftdetail?.length > 0) {
    //     const dutyplanInfo = shiftdetail; //DUTY PLAN
    //     const dutyPlanSlno = dutyplanInfo?.map(e => e.plan_slno) //FIND THE DUTY PLAN SLNO
    //     // console.log("dutyPlanSlno", dutyPlanSlno)
    //     const { fromDate, toDate } = postData_getPunchData;
    //     const punch_master_data = await axioslogin.post("/attendCal/getPunchMasterDataSectWiseDutyplan/", postData_getPunchData); //GET PUNCH MASTER DATA
    //     const { success, planData } = punch_master_data.data;
    //     // getPunchMasterDataSectionWise
    //     // console.log("planData", planData);
    //     // console.log("prevDutyplan", prevDutyplan);
    //     // console.log(planData?.filter((e) => e.em_no === 4516))
    //     if (success === 1 && planData?.length > 0) {



    try {
        // Step 1: Fetch Duty Plan Data
        const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData);
        const { successStatus, PunchMastDutyPlanDatas } = getDutyPlan.data;

        if (successStatus !== 1) {
            return {
                status: 0,
                message: "Punch Master and Duty Plan Data Not Found! Contact IT",
                errorMessage: "",
                punchMastData: []
            };
        }

        const { punchMasterResults, dutyPlanResults } = PunchMastDutyPlanDatas;

        if (!punchMasterResults?.dataStatus || !dutyPlanResults?.dataStatus) {
            return {
                status: 0,
                message: "Punch Master and Duty Plan Data Not Found! Contact IT",
                errorMessage: "",
                punchMastData: []
            };
        }
        // Step 2: Process Plan Data
        const planData = punchMasterResults?.punchMasterResults || [];
        const dutyPlanDetails = dutyPlanResults?.dutyPlanResults || [];


        // const { fromDate, toDate } = postData_getPunchData;
        // console.log(fromDate, toDate);


        //  const punchMasterFilterData = await planData?.filter((e) => new Date(fromDate) <= new Date(e.duty_day) && new Date(e.duty_day) <= new Date(toDate))
        // console.log(punchMasterFilterData?.filter((e) => e.em_no === 4516))
        // const punchMasterData = punchMasterFilterData; //PUNCHMSTER DATA
        // console.log("planData", planData);

        return Promise.allSettled(
            planData?.map(async (val) => {
                const shiftMergedPunchMaster = {
                    ...val,
                    shft_chkin_start: val.shft_chkin_start,
                    shft_chkin_end: val.shft_chkin_end,
                    shft_chkout_start: val.shft_chkout_start,
                    shft_chkout_end: val.shft_chkout_end,
                    shft_cross_day: val.shft_cross_day || 0,
                    shft_duty_day: val.shft_duty_day || 0,
                    gross_salary: val.gross_salary || 0,
                    earlyGoingMaxIntervl: cmmn_early_out || 0,
                    gracePeriodInTime: cmmn_grace_period || 0,
                    maximumLateInTime: cmmn_late_in || 0,
                    salaryLimit: salary_above || 0,
                    woff: week_off_day || 0,
                    naShift: notapplicable_shift || 0,
                    defaultShift: default_shift || 0,
                    noff: noff || 0,
                    holidayStatus: val.holiday_status,
                    break_shift_status: val.break_shift_status || 0,
                    first_half_in: val.first_half_in,
                    first_half_out: val.first_half_out,
                    second_half_in: val.second_half_in,
                    second_half_out: val.second_half_out,
                    noff_selct_day_count: noff_selct_day_count || 0,
                    shft_slno: val.shft_slno || 0,
                    night_off_flag: val.night_off_flag || 0,
                    noff_max_days: val.noff_max_days || 0,
                    noff_min_days: val.noff_min_days || 0,
                    duty_day: val.duty_day,
                    shift_in: val.shift_in,
                    shift_out: val.shift_out,
                    lve_tble_updation_flag: val.lve_tble_updation_flag,
                    em_no: val.em_no,
                    leave_status: val.leave_status,
                    punch_slno: val.punch_slno
                };

                const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == val.em_no);

                if (shiftMergedPunchMaster?.break_shift_status === 1) {
                    return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData);
                } else {
                    return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData);
                }
            })
        )
            .then((results) => {
                // Filter out fulfilled results and extract values
                const punchMasterMappedData = results.filter((result) => result.status === "fulfilled").map((result) => result.value);

                return Promise.allSettled(
                    punchMasterMappedData?.map(async (val) => {
                        const punch_In = val.punch_in ? new Date(val.punch_in) : null;
                        const punch_out = val.punch_out ? new Date(val.punch_out) : null;
                        const shift_in = new Date(val.shift_in);
                        const shift_out = new Date(val.shift_out);

                        if (val.break_shift_status === 1) {
                            const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(
                                val.first_shift_in,
                                val.first_shift_out,
                                val.second_shift_in,
                                val.second_shift_out,
                                val.break_first_punch_in,
                                val.break_first_punch_out,
                                val.break_second_punch_in,
                                val.break_second_punch_out,
                                val.break_shift_status,
                                val.duty_day
                            );
                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getBreakDutyLateInTime,
                                val.holiday_status,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                val.salaryLimit,
                                val.maximumLateInTime,
                                val.shft_duty_day,
                                val.break_shift_status,
                                val.break_first_punch_in,
                                val.break_first_punch_out,
                                val.break_second_punch_in,
                                val.break_second_punch_out,
                                val.first_shift_in,
                                val.first_shift_out,
                                val.second_shift_in,
                                val.second_shift_out,
                                val.duty_day,
                                val.night_off_flag,
                                val.noff_max_days,
                                val.noff_min_days,
                                val.noff_updation_status,
                                val.em_no
                            );

                            return {
                                ...val,
                                hrs_worked: getBreakDutyLateInTime?.hrsWorked || 0,
                                late_in: getBreakDutyLateInTime?.lateIn || 0,
                                early_out: getBreakDutyLateInTime?.earlyOut || 0,
                                duty_status: getAttendanceStatus?.duty_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc
                            };
                        } else {
                            const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out);

                            const getAttendanceStatus = await getAttendanceCalculation(
                                punch_In,
                                shift_in,
                                punch_out,
                                shift_out,
                                cmmn_grace_period,
                                getLateInTime,
                                val.holiday_status,
                                val.shift_id,
                                val.defaultShift,
                                val.naShift,
                                val.noff,
                                val.woff,
                                val.salaryLimit,
                                val.maximumLateInTime,
                                val.shft_duty_day,
                                val.break_shift_status,
                                val.break_first_punch_in,
                                val.break_first_punch_out,
                                val.break_second_punch_in,
                                val.break_second_punch_out,
                                val.first_shift_in,
                                val.first_shift_out,
                                val.second_shift_in,
                                val.second_shift_out,
                                val.duty_day,
                                val.night_off_flag,
                                val.noff_max_days,
                                val.noff_min_days,
                                val.noff_updation_status,
                                val.em_no
                            );

                            return {
                                ...val,
                                hrs_worked: getLateInTime?.hrsWorked || 0,
                                late_in: getLateInTime?.lateIn || 0,
                                early_out: getLateInTime?.earlyOut || 0,
                                duty_status: getAttendanceStatus?.duty_status,
                                lvereq_desc: getAttendanceStatus?.lvereq_desc,
                                duty_desc: getAttendanceStatus?.duty_desc
                            };
                        }
                    })
                );
            })
            .then((ProcessedAttendanceResults) => {
                const ProcessedAttendanceDatas = ProcessedAttendanceResults.filter((result) => result.status === "fulfilled").map((result) => result.value);
                const EmpAttendanceArray = [...new Set(ProcessedAttendanceDatas.map((e) => e.em_no))].map((emno) => ({
                    emno,
                    data: ProcessedAttendanceDatas.filter(
                        (entry) => entry.em_no === emno && entry.lve_tble_updation_flag === 0
                    )
                }));
                return Promise.allSettled(EmpAttendanceArray?.flatMap((ele) => {
                    return ele?.data?.map(async (e, idx) => {
                        let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await NOffStatus(e, idx, noff_selct_day_count, EmpAttendanceArray, value) : e.duty_desc;
                        return {
                            ...e,
                            lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
                            duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
                            lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0
                        }
                    })
                }))

            }).then(async (results) => {

                const PunchMAsterPolicyBasedFilterResult = results?.map((e) => e.value)
                const punchMaterDataBasedOnPunchSlno = PunchMAsterPolicyBasedFilterResult?.map((e) => e.punch_slno)
                const processedPostData = PunchMAsterPolicyBasedFilterResult?.filter((e) => punchMaterDataBasedOnPunchSlno?.some((el) => el === e.punch_slno))
                const dutyPlanSlno = dutyPlanDetails?.map((e) => e.plan_slno)
                // console.log("dutyPlanSlno", dutyPlanSlno);


                const updatePunchMaster = await axioslogin.post("/attendCal/updatePunchMaster/", processedPostData);
                const { success, message } = updatePunchMaster.data;
                // console.log("updatePunchMaster.data", updatePunchMaster.data);

                if (success === 1) {
                    // PUNCH MARKING HR TABLE UPDATION
                    // console.log("postData_getPunchData", postData_getPunchData)
                    const updatePunchMarkingHR = await axioslogin.post("/attendCal/updatePunchMarkingHR/", postData_getPunchData);
                    const { sus } = updatePunchMarkingHR.data;
                    // console.log("sus", sus);

                    if (sus === 1) {
                        // DUTY PLAN UPDATION
                        const updateDutyPlanTable = await axioslogin.post("/attendCal/updateDutyPlanTable/", dutyPlanSlno);
                        const { susc, message } = updateDutyPlanTable.data;
                        // console.log("updateDutyPlanTable.data", updateDutyPlanTable.data);

                        if (susc === 1) {
                            // console.log("Punch Master Updated SuccessFully", susc);

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


            })






        // return Promise.allSettled(
        //     punchMasterData?.map(async (data, index) => {
        //         // console.log("inside data", data);
        //         // console.log(data)
        //         const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
        //         const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA
        //         // console.log("data", data);

        //         const shiftMergedPunchMaster = {
        //             ...data,
        //             shft_chkin_start: sortedShiftData?.shft_chkin_start,
        //             shft_chkin_end: sortedShiftData?.shft_chkin_end,
        //             shft_chkout_start: sortedShiftData?.shft_chkout_start,
        //             shft_chkout_end: sortedShiftData?.shft_chkout_end,
        //             shft_cross_day: sortedShiftData?.shft_cross_day,
        //             shft_duty_day: sortedShiftData?.shft_duty_day,
        //             gross_salary: sortedSalaryData?.gross_salary,
        //             earlyGoingMaxIntervl: cmmn_early_out,
        //             gracePeriodInTime: cmmn_grace_period,
        //             maximumLateInTime: cmmn_late_in,
        //             salaryLimit: salary_above,
        //             woff: week_off_day,
        //             naShift: notapplicable_shift,
        //             defaultShift: default_shift,
        //             noff: noff,
        //             holidayStatus: sortedShiftData?.holiday_status,
        //             break_shift_status: sortedShiftData?.break_shift_status,
        //             first_half_in: sortedShiftData?.first_half_in,
        //             first_half_out: sortedShiftData?.first_half_out,
        //             second_half_in: sortedShiftData?.second_half_in,
        //             second_half_out: sortedShiftData?.second_half_out,
        //             //noff
        //             shft_slno: sortedShiftData?.shft_slno,
        //             noff_min_days: sortedShiftData?.noff_min_days,
        //             night_off_flag: sortedShiftData?.night_off_flag,
        //             noff_selct_day_count: noff_selct_day_count
        //         }
        //         const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == data.em_no)
        //         // console.log("shiftMergedPunchMaster", shiftMergedPunchMaster);

        //         //FUNCTION FOR MAPPING THE PUNCH IN AND OUT
        //         // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
        //         if (shiftMergedPunchMaster?.break_shift_status === 1) {
        //             return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
        //         }
        //         else {
        //             return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

        //         }
        //     })
        // ).then((datas) => {
        //     //console.log('data', data);
        //     const punchMasterMappedData = datas?.map((e) => e.value)

        //         = console.log("punchMasterMappedData", punchMasterMappedData);

        //     // console.log(punchMasterMappedData?.filter((e) => e.em_no === 4516))
        //     return Promise.allSettled(
        //         punchMasterMappedData?.map(async (val) => {
        //             // console.log(val);

        //             const holidayStatus = val.holiday_status;
        //             const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
        //             const punch_out = val.punch_out === null ? null : new Date(val.punch_out);

        //             const shift_in = new Date(val.shift_in);
        //             const shift_out = new Date(val.shift_out);

        //             //SALARY LINMIT
        //             const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;

        //             const shft_duty_day = val.shft_duty_day;
        //             const duty_day = val.duty_day;
        //             //break duty

        //             const break_shift_status = val.break_shift_status;

        //             //emp punch
        //             const break_first_punch_in = val.break_first_punch_in;
        //             const break_first_punch_out = val.break_first_punch_out;
        //             const break_second_punch_in = val.break_second_punch_in;
        //             const break_second_punch_out = val.break_second_punch_out;

        //             //shift details
        //             const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
        //             const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
        //             const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
        //             const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `
        //             //Noff
        //             const shft_slno = val.shft_slno
        //             const noff_min_days = val.noff_min_days
        //             const night_off_flag = val.night_off_flag
        //             const noff_selct_day_count = val.noff_selct_day_count
        //             const noff_updation_status = val.noff_updation_status
        //             // console.log(noff_updation_status);

        //             if (break_shift_status === 1) {
        //                 const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(first_shift_in, first_shift_out, second_shift_in, second_shift_out, break_first_punch_in, break_first_punch_out, break_second_punch_in, break_second_punch_out, break_shift_status, duty_day)
        //                 const getAttendanceStatus = await getAttendanceCalculation(
        //                     punch_In,
        //                     shift_in,
        //                     punch_out,
        //                     shift_out,
        //                     cmmn_grace_period,
        //                     getBreakDutyLateInTime,
        //                     holidayStatus,
        //                     val.shift_id,
        //                     val.defaultShift,
        //                     val.naShift,
        //                     val.noff,
        //                     val.woff,
        //                     salaryLimit,
        //                     val.maximumLateInTime,
        //                     shft_duty_day,
        //                     break_shift_status,
        //                     break_first_punch_in,
        //                     break_first_punch_out,
        //                     break_second_punch_in,
        //                     break_second_punch_out,
        //                     first_shift_in,
        //                     first_shift_out,
        //                     second_shift_in,
        //                     second_shift_out,
        //                     duty_day,
        //                     shft_slno,
        //                     noff_min_days,
        //                     night_off_flag,
        //                     noff_selct_day_count,
        //                     noff_updation_status
        //                 )
        //                 return {
        //                     punch_slno: val.punch_slno,
        //                     punch_in: val.break_first_punch_in,
        //                     punch_out: val.break_second_punch_out,
        //                     hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.hrsWorked,
        //                     late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.lateIn,
        //                     early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.earlyOut,
        //                     duty_status: getAttendanceStatus?.duty_status,
        //                     holiday_status: val.holiday_status,
        //                     leave_status: val.leave_status,
        //                     lvereq_desc: getAttendanceStatus?.lvereq_desc,
        //                     duty_desc: getAttendanceStatus?.duty_desc,
        //                     lve_tble_updation_flag: val.lve_tble_updation_flag,
        //                     shft_duty_day: val.shft_duty_day,
        //                     shft_slno: shft_slno,
        //                     noff_min_days: noff_min_days !== 0 ? noff_min_days : 0,
        //                     night_off_flag: night_off_flag !== 0 ? night_off_flag : 0,
        //                     noff_selct_day_count: noff_selct_day_count !== 0 ? noff_selct_day_count : 0,
        //                     noff_updation_status: noff_updation_status
        //                 }
        //             }
        //             else {
        //                 const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

        //                 const getAttendanceStatus = await getAttendanceCalculation(
        //                     punch_In,
        //                     shift_in,
        //                     punch_out,
        //                     shift_out,
        //                     cmmn_grace_period,
        //                     getLateInTime,
        //                     holidayStatus,
        //                     val.shift_id,
        //                     val.defaultShift,
        //                     val.naShift,
        //                     val.noff,
        //                     val.woff,
        //                     salaryLimit,
        //                     val.maximumLateInTime,
        //                     shft_duty_day,
        //                     break_shift_status,
        //                     break_first_punch_in,
        //                     break_first_punch_out,
        //                     break_second_punch_in,
        //                     break_second_punch_out,
        //                     first_shift_in,
        //                     first_shift_out,
        //                     second_shift_in,
        //                     second_shift_out,
        //                     duty_day,
        //                     shft_slno,
        //                     noff_min_days,
        //                     night_off_flag,
        //                     noff_selct_day_count,
        //                     noff_updation_status
        //                 )

        //                 return {
        //                     punch_slno: val.punch_slno,
        //                     punch_in: val.punch_in,
        //                     punch_out: val.punch_out,
        //                     hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.hrsWorked,
        //                     late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.lateIn,
        //                     early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.earlyOut,
        //                     duty_status: getAttendanceStatus?.duty_status,
        //                     holiday_status: val.holiday_status,
        //                     leave_status: val.leave_status,
        //                     lvereq_desc: getAttendanceStatus?.lvereq_desc,
        //                     duty_desc: getAttendanceStatus?.duty_desc,
        //                     lve_tble_updation_flag: val.lve_tble_updation_flag,
        //                     shft_duty_day: val.shft_duty_day,
        //                     shft_slno: shft_slno,
        //                     noff_min_days: noff_min_days !== 0 ? noff_min_days : 0,
        //                     night_off_flag: night_off_flag !== 0 ? night_off_flag : 0,
        //                     noff_selct_day_count: noff_selct_day_count !== 0 ? noff_selct_day_count : 0,
        //                     noff_updation_status: noff_updation_status
        //                 }
        //             }

        //         })
        //     ).then(async (element) => {
        //         // REMOVE LEAVE REQUESTED DATA FROM THIS DATA
        //         const elementValue = element?.map((e) => e.value);
        //         // console.log(element);

        //         // console.log(element?.map((e) => e.value));

        //         const processedData = elementValue?.filter((v) => v.lve_tble_updation_flag === 0)
        //         const punchMaterDataBasedOnPunchSlno = processedData?.map((e) => e.punch_slno)

        //         // console.log(elementValue);

        //         // console.log(previous_punch_data)
        //         // const elementValues = previous_punch_data?.map((e) => e.value);
        //         // const previousPunchDatas = previous_punch_data?.filter((v) => v.lve_tble_updation_flag === 0)
        //         // console.log("previousPunchDatas", previousPunchDatas);
        //         // console.log("processedData", processedData);
        //         // PUNCH MASTER UPDATION
        //         // console.log(processedData?.filter(e => e.em_no === 4516))
        //         // console.log(processedData?.filter(e => e.em_no === 13802))
        //         // console.log(planData?.filter(e => e.em_no === 13802))
        //         // const a = planData?.filter(e => e.em_no === 13802)
        //         // console.log(planData);

        //         const filterAndAdditionPlanData = await planData?.map((el) => {
        //             return {
        //                 ...el,
        //                 duty_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc, // filter and update deuty_desc
        //                 lvereq_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc // same as updation in lvereq_desc 
        //             }
        //         })
        //         // console.log("processedData", processedData);

        //         //noff
        //         // const combinedData = [...previousPunchDatas, ...processedData];

        //         // console.log("prevDutyplan", prevDutyplan);

        //         // const filterAndAdditionPlanDataforNoff = await prevDutyplan?.map((el) => {
        //         //     // console.log("el", el);

        //         //     return {
        //         //         ...el,
        //         //         duty_desc: combinedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc, // filter and update deuty_desc
        //         //         lvereq_desc: combinedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc // same as updation in lvereq_desc 
        //         //     }
        //         // })

        //         /**** CALCUALETE HOLIDAY CHEKING AND WEEKLY OFF CHECKING *****/

        //         //FILTER EMPLOYEE NUMBER FROM PUNCHMASTER DATA
        //         const filteredEmNoFromPunMast = [...new Set(filterAndAdditionPlanData?.map((e) => e.em_no))];

        //         // const filteredEmNoFromPunMastForNoff = [...new Set(filterAndAdditionPlanDataforNoff?.map((e) => e.em_no))];


        //         // console.log("filteredEmNoFromPunMastForNoff", filteredEmNoFromPunMastForNoff);

        //         const punchMasterFilterData = filteredEmNoFromPunMast?.map((emno) => {
        //             return {
        //                 em_no: emno,
        //                 data: filterAndAdditionPlanData?.filter((l) => l.em_no === emno)?.sort((a, b) => b.duty_day - a.duty_day)
        //             }
        //         })

        //         // const punchMasterFilterDataForNoff = filteredEmNoFromPunMastForNoff?.map((emno) => {
        //         //     return {
        //         //         em_no: emno,
        //         //         data: filterAndAdditionPlanDataforNoff?.filter((l) => l.em_no === emno)?.sort((a, b) => b.duty_day - a.duty_day)
        //         //     }
        //         // })
        //         // console.log("punchMasterFilterDataForNoff", punchMasterFilterDataForNoff);

        //         // CALCULATION BASED ON WEEEK OF AND HOLIDAY 
        //         return Promise.allSettled(
        //             punchMasterFilterData?.flatMap((ele) => {

        //                 return ele?.data?.map(async (e, idx, array) => {
        //                     let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffStatus(e, idx, array, weekoff_policy_max_count, weekoff_policy_min_count, fromDate) : e.duty_desc;

        //                     return {
        //                         ...e,
        //                         lvereq_desc: e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
        //                         duty_desc: e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
        //                     }
        //                 })
        //             })
        //         ).then(async (results) => {
        //             const arr = punchMasterFilterData.map(filterObj => {
        //                 let key = filterObj.em_no;
        //                 // console.log(results);

        //                 return {
        //                     em_no: key,
        //                     data: results.filter(obj => obj.value.em_no === key)?.map((e) => e.value)
        //                 }
        //             });

        //             return Promise.allSettled(
        //                 arr?.flatMap((ele) => {
        //                     return ele?.data?.map(async (e, idx, array) => {
        //                         let holidayStat = e.duty_desc === 'H' ? await holidayStatus(e, array, holiday_policy_count) : e.duty_desc;

        //                         return {
        //                             ...e,
        //                             lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc,
        //                             duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc

        //                         }
        //                     })
        //                 })

        //             ).then(async (results) => {
        //                 if (results.length !== 0) {
        //                     const arr = punchMasterFilterData.map(filterObj => {
        //                         let key = filterObj.em_no;
        //                         return {
        //                             em_no: key,
        //                             data: results.filter(obj => obj.value.em_no === key)?.map((e) => e.value)
        //                         }
        //                     });

        //                     // return Promise.allSettled(
        //                     //     arr?.flatMap((ele) => {
        //                     //         return ele?.data?.map(async (e, idx) => {
        //                     //             // console.log(arr);
        //                     //             let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await NOffStatus(e, idx, noff_selct_day_count, punchMasterFilterDataForNoff, fromDate) : e.duty_desc;
        //                     //             // console.log(e.duty_day, e.duty_desc, NoffStatus);
        //                     //             // console.log(e.em_no, e.duty_day, NoffStatus);

        //                     //             return {
        //                     //                 ...e,
        //                     //                 lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
        //                     //                 duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
        //                     //                 lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0

        //                     //             }
        //                     //         })
        //                     //     })
        //                     // )
        //                 }


        //             }).then(async (results) => {
        //                 // console.log("results", results);

        //                 // const PunchMAsterPolicyBasedFilterResult = results?.map((e) => e.value)
        //                 // // console.log(PunchMAsterPolicyBasedFilterResult)
        //                 // // console.log(punchMaterDataBasedOnPunchSlno)
        //                 // const processedPostData = PunchMAsterPolicyBasedFilterResult?.filter((e) => punchMaterDataBasedOnPunchSlno?.some((el) => el === e.punch_slno))
        //                 // // console.log("processedPostData", processedPostData);

        //                 // // console.log(processedPostData?.filter(e => e.em_no === 4516))
        //                 // const updatePunchMaster = await axioslogin.post("/attendCal/updatePunchMaster/", processedPostData);
        //                 // const { success, message } = updatePunchMaster.data;
        //                 // if (success === 1) {
        //                 //     // PUNCH MARKING HR TABLE UPDATION
        //                 //     // console.log(postData_getPunchData)
        //                 //     const updatePunchMarkingHR = await axioslogin.post("/attendCal/updatePunchMarkingHR/", postData_getPunchData);
        //                 //     const { sus } = updatePunchMarkingHR.data;
        //                 //     // if (sus === 1) {
        //                 //     //     // DUTY PLAN UPDATION
        //                 //     //     const updateDutyPlanTable = await axioslogin.post("/attendCal/updateDutyPlanTable/", dutyPlanSlno);
        //                 //     //     const { susc, message } = updateDutyPlanTable.data;
        //                 //     //     if (susc === 1) {
        //                 //     //         return { status: 1, message: "Punch Master Updated SuccessFully", errorMessage: '', dta: postData_getPunchData }
        //                 //     //     } else {
        //                 //     //         return { status: 0, message: "Error Updating Duty Plan ! contact IT", errorMessage: message }
        //                 //     //     }
        //                 //     // } else {
        //                 //     //     return { status: 0, message: "Error Updating PunchMaster HR  ! contact IT", errorMessage: message }
        //                 //     // }
        //                 // } else {
        //                 //     return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: message }
        //                 // }

        //             }).catch((error) => {
        //                 return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: error } // if no return all updation
        //             })

        //         })
        //         // return { status: 1, message: "result", data: e }
        //     })
        // }).catch((error) => {
        //     return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: error } // if no return all updation
        // })



        //     } else {
        //         return { status: 0, message: "Punch Master Data Not Found ! contact IT", errorMessage: '' }
        //     }
        // } else {
        //     return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '' }
        // }


    } catch (error) {
        return { status: 0, message: "Duty Plan Not Done! Contact IT", errorMessage: error.message, punchMastData: [] };
    }
}



export const getAttendanceCalculation = async (
    punch_In, shift_in, punch_out, shift_out, cmmn_grace_period, getLateInTime, holidayStatus, shiftId, defaultShift, NAShift, NightOffShift, WoffShift, salaryLimit, maximumLateInTime, shft_duty_day, break_shift_status,
    break_first_punch_in,
    break_first_punch_out,
    break_second_punch_in,
    break_second_punch_out,
    first_shift_in,
    first_shift_out,
    second_shift_in,
    second_shift_out
) => {

    const {
        // hrsWorked, 
        lateIn,
        earlyOut } = getLateInTime;

    //SHIFT ID CHECKING
    // ( !== default shift , !== not applicable shift , !== Night off , !== week off) 
    // if true ==> ( its a working shift ) 
    const checkShiftIdStatus = (shiftId !== defaultShift && shiftId !== NAShift && shiftId !== NightOffShift && shiftId !== WoffShift)
    //HALF DAY CALCULATION
    const totalShiftInMInits = differenceInMinutes(new Date(shift_out), new Date(shift_in))
    const halfDayInMinits = totalShiftInMInits / 2;
    const halfDayStartTime = addMinutes(shift_in, halfDayInMinits - 1)
    // console.log(shift_in);
    // console.log(halfDayInMinits);

    // console.log(halfDayStartTime);

    if (checkShiftIdStatus === true && break_shift_status !== 1) {

        // This condition not included  ( !== default shift , !== not applicable shift , !== Night off , !== week off) 
        if (isValid(punch_In) === true && isValid(punch_out) === true) {

            // *****EMPLOYEE HAVE BOTH THE PUNCH******

            const isBeforeHafDayInTime = isBefore(punch_In, halfDayStartTime); //for check -> punch in before half day start in time
            const isAfterHalfDayOutTime = isAfter(punch_out, halfDayStartTime)

            const workingHours = differenceInHours(new Date(punch_out), new Date(punch_In)) > 6;
            const halfDayWorkingHour = differenceInHours(new Date(punch_out), new Date(punch_In)) >= 4;
            //  isBeforeHafDayInTime === true ==> punch in time greater than half in time (full day not half day)

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
                // console.log(getLateInTime)
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
        // console.log("outside");

        if (
            // isValidPunchTime(break_first_punch_in) &&
            // isValidPunchTime(break_first_punch_out) &&
            (break_second_punch_in === null || isValidPunchTime(break_second_punch_in)) &&
            (break_second_punch_out === null || isValidPunchTime(break_second_punch_out))
        ) {
            // console.log("Inside");

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

            // console.log("FirstIn", FirstIn);
            // console.log("FirstOut", FirstOut);
            // console.log("SecondIn", SecondIn);
            // console.log("SecondOut", SecondOut);

            // Check early go
            // const FirstEarlyGo = second ? differenceInMinutes(new Date(first_shift_out), second) : null;
            // const SecondEarlyGo = fourth ? differenceInMinutes(new Date(second_shift_out), fourth) : null;

            // // Shift duration
            // const firstHalfShiftHour = differenceInMinutes(new Date(first_shift_out), new Date(first_shift_in));
            // const secondHalfShiftHour = differenceInMinutes(new Date(second_shift_out), new Date(second_shift_in));

            // const firstWorkingHour = first && second ? differenceInMinutes(second, first) : 0;
            // const secondWorkingHour = third && fourth ? differenceInMinutes(fourth, third) : 0;

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

            const totalFirstHalf = differenceInMinutes(new Date(first_shift_out), new Date(first_shift_in));
            const FirsthalfDayInMinutes = totalFirstHalf / 2;
            // const FirsthalfDayStartTime = addMinutes(new Date(first_shift_in), FirsthalfDayInMinutes - 1);
            // const FirstisBeforeHalfDayInTime = isBefore(new Date(first_shift_in), FirsthalfDayStartTime);
            // const FirstisAfterHalfDayOutTime = isBefore(new Date(first_shift_out), FirsthalfDayStartTime);

            // const halfBrkDay = differenceInHours(new Date(second_shift_out), new Date(first_shift_in)) / 2;
            // const halfhrs = differenceInHours(new Date(first_shift_out), new Date(first_shift_in));
            // // const halfDayWorkingHour = halfhrs <= halfBrkDay;

            // const SecondtotalFirstHalf = differenceInMinutes(new Date(second_shift_out), new Date(second_shift_in));
            // const SecondhalfDayInMinutes = SecondtotalFirstHalf / 2;
            // const SecondhalfDayStartTime = addMinutes(new Date(second_shift_in), SecondhalfDayInMinutes - 1);
            // const SecondisBeforeHalfDayInTime = isBefore(new Date(second_shift_in), SecondhalfDayStartTime);
            // const SecondisAfterHalfDayOutTime = isBefore(new Date(second_shift_out), SecondhalfDayStartTime);

            // console.log("secondhalf", earlyOut === 0 && lateIn > maximumLateInTime && !FirstHalfIn && !FirstHalfOut && SecondHalfIn && SecondHalfOut);
            // console.log(FirstHalfIn);

            // console.log(!FirstHalfIn && !FirstHalfOut && SecondHalfIn && SecondHalfOut);
            // console.log(FirstIn === false && FirstOut === false && SecondIn === true && SecondOut === true);


            // console.log(earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && FirstHalfIn === true && FirstHalfOut === true && SecondHalfIn === true && SecondHalfOut === true);

            // console.log(FirstIn === true && FirstOut === true);
            // console.log("second", SecondIn === true && SecondOut === true);

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


            // console.log(IsBeforeFirstInPuch === true && IsBeforeFirstOutPuch === true && IsBeforeSecondInPuch === true && earlyGoSecondHalf);


            // const IsBeforeFirstInPuch = isBefore(new Date(break_first_punch_in), new Date(first_shift_in));
            // console.log(break_first_punch_in);
            // console.log(first_shift_in);

            // console.log(IsBeforeFirstInPuch);


            // console.log(SecondhalfDayStartTim);


            // console.log(SecondtotalShiftInMInits / 2);
            // console.log(SecondhalfDayInMinits - 1);
            // console.log(addMinutes(new Date(first_shift_out), 149));



            // console.log(differenceInMinutes(new Date(second_shift_out), new Date(second_shift_in)));

            // console.log(SecondtotalShiftInMInits - 1);

            // console.log(addMinutes(new Date(second_shift_in), SecondhalfDayInMinits - 1));

            // console.log(new Date(break_second_punch_in), SecondhalfDayStartTime);

            // console.log(isBefore(new Date(break_second_punch_in), SecondhalfDayStartTime));
            // console.log(SecondisAfterHalfDayOutTime);

            // console.log(FirstisBeforeHafDayInTime);
            // console.log(FirstisAfterHalfDayOutTime);


            // console.log(SecondisBeforeHafDayInTime);
            // console.log(SecondisAfterHalfDayOutTime);
            // console.log(halfDayStartTime);
            // console.log(isBeforeHafDayInTime);
            // console.log(earlyGoSecondHalf);


            // console.log("******************");


            //***************************************************************************************************** */
            // console.log(FirstHalfIn, FirstHalfOut, SecondHalfIn, SecondHalfOut);



            // earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && isBeforeHafDayInTime === true ?

            // console.log("FirstIn", FirstIn);
            // console.log("FirstOut", FirstOut);
            // console.log("SecondIn", SecondIn);
            // console.log("SecondOut", SecondOut);
            // console.log(earlyOut === 0 && (lateIn === 0 || lateIn <= cmmn_grace_period) && FirstisBeforeHafDayInTime === true && FirstisAfterHalfDayOutTime === true && SecondisBeforeHafDayInTime === true && SecondisAfterHalfDayOutTime === true);

            // console.log(FirstisAfterHalfDayOutTime);

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
        // Default return based on shiftId
        return shiftId === defaultShift
            ? { duty_status: 0, duty_desc: 'A', lvereq_desc: 'A', duty_remark: 'no duty plan' }
            : shiftId === WoffShift
                ? { duty_status: 1, duty_desc: 'WOFF', lvereq_desc: 'WOFF', duty_remark: 'week off' }
                : shiftId === NightOffShift
                    ? { duty_status: 1, duty_desc: 'NOFF', lvereq_desc: 'NOFF', duty_remark: 'night off' }
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
    // console.log("duty_day", duty_day);

    // console.log("break_first_punch_in", break_first_punch_in);
    // console.log("break_first_punch_out", break_first_punch_out);
    // console.log("break_second_punch_in", break_second_punch_in);
    // console.log("break_second_punch_out", break_second_punch_out);


    const BreakFirstPunchIn = break_first_punch_in !== null ? new Date(break_first_punch_in) : null;
    const BreakFirstPunchOut = break_first_punch_out !== null ? new Date(break_first_punch_out) : null;
    const BreakSecondPunchIn = break_second_punch_in !== null ? new Date(break_second_punch_in) : null;
    const BreakSecondPunchOut = break_second_punch_out !== null ? new Date(break_second_punch_out) : null;

    // console.log("BreakFirstPunchIn", BreakFirstPunchIn);
    // console.log("BreakFirstPunchOut", BreakFirstPunchOut);
    // console.log("BreakSecondPunchIn", BreakSecondPunchIn);
    // console.log("BreakSecondPunchOut", BreakSecondPunchOut);

    const FirstShiftIn = new Date(first_shift_in);
    const FirstShiftOut = new Date(first_shift_out);
    const SecondShiftIn = new Date(second_shift_in);
    const SecondShiftOut = new Date(second_shift_out);

    const isValidDate = (date) => date instanceof Date && !isNaN(date);
    // instanceof Date--->  const someDate = new Date();  // Valid Date object  ---someDate instanceof Date   is true
    // const invalidDate = "2024-09-07";  // String, not a Date object----invalidDate instanceof Date  is false
    //!isNaN(date)---> isNaN() function in JavaScript is typically used to check if a value is "Not-a-Number" (NaN) 

    // console.log("gjkgd");
    // console.log("BreakFirstPunchIn", BreakFirstPunchIn);
    if (
        isValidDate(BreakFirstPunchIn) &&
        isValidDate(BreakFirstPunchOut) &&
        BreakFirstPunchIn !== null && BreakFirstPunchOut !== null &&
        BreakFirstPunchIn !== undefined && BreakFirstPunchOut !== undefined

    ) {

        // console.log(differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn));

        const firstShiftHoursWorked = differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn);
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0

        // console.log("firstShiftHoursWorked", firstShiftHoursWorked);

        // console.log("secondShiftHoursWorked", secondShiftHoursWorked);
        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;
        // console.log(totalWorkingHours);


        // console.log("totalWorkingHours", totalWorkingHours);
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

        // console.log(differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn));
        // const CheckFirstPunch = BreakFirstPunchIn === null ? 0 : BreakFirstPunchIn;

        const firstShiftHoursWorked = (BreakFirstPunchIn !== null && BreakFirstPunchOut !== null) ? differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn) : 0;
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0

        // console.log("firstShiftHoursWorked", firstShiftHoursWorked);

        // console.log("secondShiftHoursWorked", secondShiftHoursWorked);
        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;
        // console.log(totalWorkingHours);


        // console.log("totalWorkingHours", totalWorkingHours);
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

        // console.log(differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn));
        // const CheckFirstPunch = BreakFirstPunchIn === null ? 0 : BreakFirstPunchIn;

        const firstShiftHoursWorked = (BreakFirstPunchIn !== null && BreakFirstPunchOut !== null) ? differenceInMinutes(BreakFirstPunchOut, BreakFirstPunchIn) : 0;
        const secondShiftHoursWorked =
            isValidDate(BreakSecondPunchIn) &&
                isValidDate(BreakSecondPunchOut) &&
                BreakSecondPunchIn !== null && BreakSecondPunchOut !== null &&
                BreakSecondPunchIn !== undefined && BreakSecondPunchOut !== undefined
                ? differenceInMinutes(BreakSecondPunchOut, BreakSecondPunchIn)
                : 0

        // console.log("firstShiftHoursWorked", firstShiftHoursWorked);

        // console.log("secondShiftHoursWorked", secondShiftHoursWorked);
        const totalWorkingHours = firstShiftHoursWorked + secondShiftHoursWorked;
        // console.log(totalWorkingHours);


        // console.log("totalWorkingHours", totalWorkingHours);
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
    // console.log("shiftMergedPunchMaster", shiftMergedPunchMaster);
    const crossDay = shiftMergedPunchMaster?.shft_cross_day;
    const shiftInTime = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
    // console.log("shiftInTime ", shiftInTime);

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
    // console.log("inPunch", inPunch);
    // console.log("outPunch", outPunch);

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


};


/* ORIGINAL CODE */
// const punchInOutMapping = async (shiftMergedPunchMaster, employeeBasedPunchData) => {
//     // console.log("punchInOutMapping", punchInOutMapping);
//     console.log(shiftMergedPunchMaster);

//     const crossDay = shiftMergedPunchMaster?.shft_cross_day;
//     const shiftInTime = `${format(shiftMergedPunchMaster?.dutyDay, 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
//     // const shiftInTime = `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_in), 'HH:mm')}`;
//     console.log("shiftInTime ", shiftInTime);

//     const shiftOutTime = crossDay === 0 ? `${format(new Date(shiftMergedPunchMaster?.duty_day), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}` :
//         `${format(addDays(new Date(shiftMergedPunchMaster?.duty_day), crossDay), 'yyyy-MM-dd')} ${format(new Date(shiftMergedPunchMaster?.shift_out), 'HH:mm')}`;

//     //SHIFT MASTER DATA    
//     const shiftIn = new Date(shiftMergedPunchMaster?.shift_in);
//     const shiftOut = new Date(shiftMergedPunchMaster?.shift_out);
//     const shiftInStart = new Date(shiftMergedPunchMaster?.shft_chkin_start);
//     const shiftInEnd = new Date(shiftMergedPunchMaster?.shft_chkin_end);
//     const shiftOutStart = new Date(shiftMergedPunchMaster?.shft_chkout_start);
//     const shiftOutEnd = new Date(shiftMergedPunchMaster?.shft_chkout_end);

//     //Diffrence in Check IN time Intervel in Hours
//     const shiftInStartDiffer = differenceInHours(shiftIn, shiftInStart);
//     const shiftInEndDiffer = differenceInHours(shiftInEnd, shiftIn);

//     //Diffrence in Check OUT time Intervel in Hours
//     const shiftOutStartDiffer = differenceInHours(shiftOut, shiftOutStart);
//     const shiftOutEndDiffer = differenceInHours(shiftOutEnd, shiftOut);

//     const checkInTIme = new Date(shiftInTime);
//     const checkOutTime = new Date(shiftOutTime);

//     const checkInStartTime = subHours(checkInTIme, shiftInStartDiffer);
//     const checkInEndTime = addHours(checkInTIme, shiftInEndDiffer);

//     const checkOutStartTime = subHours(checkOutTime, shiftOutStartDiffer)
//     const checkOutEndTime = addHours(checkOutTime, shiftOutEndDiffer);

//     const empPunchData = employeeBasedPunchData?.map((e) => new Date(e.punch_time));

//     const inTimesArray = empPunchData?.filter((e) => (e >= checkInStartTime && e <= checkInEndTime))
//     // const outTimeArray = empPunchData?.filter((e) => (e >= checkOutStartTime && e <= checkOutEndTime))
//     const outTimeArray = empPunchData?.filter((e) => (e >= checkInEndTime && e <= checkOutEndTime))

//     const inPunch = min(inTimesArray)
//     const outPunch = max(outTimeArray)
//     console.log("inPunch", inPunch);
//     console.log("outPunch", outPunch);



//     return {
//         ...shiftMergedPunchMaster,
//         punch_in: isValid(inPunch) === true ? format(inPunch, 'yyyy-MM-dd HH:mm') : null,
//         punch_out: isValid(outPunch) === true ? format(outPunch, 'yyyy-MM-dd HH:mm') : null,
//         shift_in: checkInTIme,
//         shift_out: checkOutTime,
//         shiftInStart: checkInStartTime,
//         shiftInEnd: checkInEndTime,
//         shiftOutStart: checkOutStartTime,
//         shiftOutEnd: checkOutEndTime,
//         //break duty
//         //break shift punch
//         break_first_punch_in: null,
//         break_first_punch_out: null,
//         break_second_punch_in: null,
//         break_second_punch_out: null,
//         //break shift time
//         first_shift_in: null,
//         first_shift_out: null,
//         second_shift_in: null,
//         second_shift_out: null,
//     }
// }


export const processShiftPunchMarkingHrFunc = async (
    postData_getPunchData,
    punchaData, // PUNCH DATA
    empList, // EMPLOYEE LIST SECTION WISE
    shiftDetails, // SHIFT INFORMATION
    Commonsettings, // COMMON SETTINGS
    holidayList, // HOLIDAY LIST
    value // DATE OF SELECTED MONTH
) => {
    const {
        cmmn_early_out, // Early going time interval
        cmmn_grace_period, // Common grace period for late in time
        cmmn_late_in, // Maximum Late in Time for punch in (after that direct HALF DAY)
        salary_above, // Salary limit for calculating the holiday double wages
        week_off_day, // Week off SHIFT ID
        notapplicable_shift, // Not applicable SHIFT ID
        default_shift, // Default SHIFT ID
        noff, // Night off SHIFT ID
        max_late_day_count,
        break_shift_taken_count,
        noff_selct_day_count
    } = Commonsettings;

    try {
        // Step 1: Fetch Duty Plan Data
        const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData);
        const { successStatus, PunchMastDutyPlanDatas } = getDutyPlan.data;

        if (successStatus !== 1) {
            return {
                status: 0,
                message: "Punch Master and Duty Plan Data Not Found! Contact IT",
                errorMessage: "",
                punchMastData: []
            };
        }

        const { punchMasterResults, dutyPlanResults } = PunchMastDutyPlanDatas;

        if (!punchMasterResults?.dataStatus || !dutyPlanResults?.dataStatus) {
            return {
                status: 0,
                message: "Punch Master and Duty Plan Data Not Found! Contact IT",
                errorMessage: "",
                punchMastData: []
            };
        }

        // Step 2: Process Plan Data
        const planData = punchMasterResults?.punchMasterResults || [];

        // console.log("planData", planData);

        const empArray = [...new Set(planData.map((e) => e.em_no))].map((emno) => {
            return {
                emno,
                shiftMergedPunchMaster: planData
                    .filter((e) => e.em_no === emno)
                    .map((val) => ({
                        ...val,
                        shft_chkin_start: val.shft_chkin_start,
                        shft_chkin_end: val.shft_chkin_end,
                        shft_chkout_start: val.shft_chkout_start,
                        shft_chkout_end: val.shft_chkout_end,
                        shft_cross_day: val.shft_cross_day || 0,
                        shft_duty_day: val.shft_duty_day || 0,
                        gross_salary: val.gross_salary || 0,
                        earlyGoingMaxIntervl: cmmn_early_out || 0,
                        gracePeriodInTime: cmmn_grace_period || 0,
                        maximumLateInTime: cmmn_late_in || 0,
                        salaryLimit: salary_above || 0,
                        woff: week_off_day || 0,
                        naShift: notapplicable_shift || 0,
                        defaultShift: default_shift || 0,
                        noff: noff || 0,
                        holidayStatus: val.holiday_status,
                        break_shift_status: val.break_shift_status || 0,
                        first_half_in: val.first_half_in,
                        first_half_out: val.first_half_out,
                        second_half_in: val.second_half_in,
                        second_half_out: val.second_half_out,
                        noff_selct_day_count: noff_selct_day_count || 0,
                        shft_slno: val.shft_slno || 0,
                        night_off_flag: val.night_off_flag || 0,
                        noff_max_days: val.noff_max_days || 0,
                        noff_min_days: val.noff_min_days || 0,
                        duty_day: val.duty_day,
                        shift_in: val.shift_in,
                        shift_out: val.shift_out,
                        lve_tble_updation_flag: val.lve_tble_updation_flag,
                        em_no: val.em_no,
                        leave_status: val.leave_status,
                        punch_slno: val.punch_slno
                    }))
            }
        })?.map(async ({ emno, shiftMergedPunchMaster }) => {
            const monthlyProcessedShifts = []; // Initialize an array to store processed shifts
            await Promise.all(
                shiftMergedPunchMaster.map(async (punchDetails) => {
                    let processedShifts;
                    if (punchDetails?.break_shift_status === 1) {
                        processedShifts = await BreakDutypunchInOutMapping(punchDetails, punchaData, cmmn_grace_period, break_shift_taken_count);
                    } else {
                        processedShifts = await punchInOutMapping(punchDetails, punchaData);
                    }
                    monthlyProcessedShifts.push(processedShifts); // Add processed shifts to the array
                })
            );
            return {
                emno,
                punchInOutData: monthlyProcessedShifts // Return the aggregated result for this employee
            };


            // shiftMergedPunchMaster?.map(async (punchDetails) => {
            //     if (punchDetails[0]?.break_shift_status === 1) {
            //         const processedShifts = await BreakDutypunchInOutMapping(punchDetails, punchaData, cmmn_grace_period, break_shift_taken_count);
            //         return processedShifts.map((shift) => ({ emno, ...shift }));
            //     }
            //     else {
            //         const processedShifts = await Promise.all(
            //             shiftMergedPunchMaster.map(async (shift) => {
            //                 return await punchInOutMapping(shift, punchaData);
            //             })
            //         );
            //         console.log("processedShifts", processedShifts);

            //         return processedShifts.map((shift) => ({ emno, ...shift }));
            //     }
            // })
            // }).then((punchInOutDatas) => {
            //     console.log("punchInOutDatas", punchInOutDatas)
        })
        return Promise.all(empArray).then(async (results) => {
            const { emno, punchInOutData } = results[0]; // Assuming results[0] contains the needed data

            // Process each punch detail asynchronously
            const processedPunchData = await Promise.all(
                punchInOutData?.map(async (val) => {
                    // Extract relevant values
                    const holidayStatus = val.holiday_status;
                    const punch_In = val.punch_in ? new Date(val.punch_in) : null;
                    const punch_out = val.punch_out ? new Date(val.punch_out) : null;
                    const shift_in = new Date(val.shift_in);
                    const shift_out = new Date(val.shift_out);
                    const salaryLimit = val.gross_salary > val.salaryLimit;
                    const first_shift_in = format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm');
                    const first_shift_out = format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm');
                    const second_shift_in = format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm');
                    const second_shift_out = format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm');

                    if (val.break_shift_status === 1) {
                        const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(
                            first_shift_in,
                            first_shift_out,
                            second_shift_in,
                            second_shift_out,
                            val.break_first_punch_in,
                            val.break_first_punch_out,
                            val.break_second_punch_in,
                            val.break_second_punch_out,
                            val.break_shift_status,
                            val.duty_day
                        );
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
                            val.shft_duty_day,
                            val.break_shift_status,
                            val.break_first_punch_in,
                            val.break_first_punch_out,
                            val.break_second_punch_in,
                            val.break_second_punch_out,
                            first_shift_in,
                            first_shift_out,
                            second_shift_in,
                            second_shift_out,
                            val.duty_day,
                            val.night_off_flag,
                            val.noff_max_days,
                            val.noff_min_days,
                            val.noff_updation_status,
                            val.em_no
                        );
                        return {
                            punch_slno: val.punch_slno,
                            punch_in: val.break_first_punch_in,
                            punch_out: val.break_second_punch_out,
                            hrs_worked: getBreakDutyLateInTime?.hrsWorked || 0,
                            late_in: getBreakDutyLateInTime?.lateIn || 0,
                            early_out: getBreakDutyLateInTime?.earlyOut || 0,
                            duty_status: getAttendanceStatus?.duty_status,
                            holiday_status: val.holiday_status,
                            leave_status: val.leave_status,
                            lvereq_desc: getAttendanceStatus?.lvereq_desc,
                            duty_desc: getAttendanceStatus?.duty_desc,
                            lve_tble_updation_flag: val.lve_tble_updation_flag,
                            shft_duty_day: val.shft_duty_day,
                            night_off_flag: val.night_off_flag,
                            noff_max_days: val.noff_max_days,
                            noff_min_days: val.noff_min_days,
                            noff_updation_status: val.noff_updation_status,
                            em_no: val.em_no
                        };
                    } else {
                        const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out);

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
                            val.shft_duty_day,
                            val.break_shift_status,
                            val.break_first_punch_in,
                            val.break_first_punch_out,
                            val.break_second_punch_in,
                            val.break_second_punch_out,
                            first_shift_in,
                            first_shift_out,
                            second_shift_in,
                            second_shift_out,
                            val.duty_day,
                            val.night_off_flag,
                            val.noff_max_days,
                            val.noff_min_days,
                            val.noff_updation_status,
                            val.em_no
                        );
                        return {
                            punch_slno: val.punch_slno,
                            punch_in: val.punch_in,
                            punch_out: val.punch_out,
                            hrs_worked: getLateInTime?.hrsWorked || 0,
                            late_in: getLateInTime?.lateIn || 0,
                            early_out: getLateInTime?.earlyOut || 0,
                            duty_status: getAttendanceStatus?.duty_status,
                            holiday_status: val.holiday_status,
                            leave_status: val.leave_status,
                            lvereq_desc: getAttendanceStatus?.lvereq_desc,
                            duty_desc: getAttendanceStatus?.duty_desc,
                            lve_tble_updation_flag: val.lve_tble_updation_flag,
                            shft_duty_day: val.shft_duty_day,
                            duty_day: val.duty_day,
                            night_off_flag: val.night_off_flag,
                            noff_max_days: val.noff_max_days,
                            noff_min_days: val.noff_min_days,
                            noff_updation_status: val.noff_updation_status,
                            em_no: val.em_no
                        };
                    }
                })
            );
            return processedPunchData;
        }).then((ProcessedAttendanceDatas) => {
            // Log the filtered data
            const EmpAttendanceArray = [...new Set(ProcessedAttendanceDatas.map((e) => e.em_no))].map((emno) => ({
                emno,
                data: ProcessedAttendanceDatas.filter((e) => e.em_no === emno && e.lve_tble_updation_flag === 0).map((val) => ({ ...val }))

            }));
            return Promise.allSettled(EmpAttendanceArray?.flatMap((ele) => {
                return ele?.data?.map(async (e, idx) => {
                    let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await NOffStatus(e, idx, noff_selct_day_count, EmpAttendanceArray, value) : e.duty_desc;
                    return {
                        ...e,
                        lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
                        duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
                        lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0
                    }
                })
            }))
        }).then(async (element) => {
            // Map the results to prepare data for punch master update
            const processedData = element?.map((e) => e.value)?.filter((v) => (v.lve_tble_updation_flag === 1 && v.duty_desc === "NOFF") || (v.lve_tble_updation_flag === 0 && v.duty_desc !== "NOFF"))
            // Prepare the data to update punch master
            const postDataForUpdatePunchMaster = {
                postData_getPunchData: postData_getPunchData,
                processedData: processedData,
                max_late_day_count: max_late_day_count,
            };
            // console.log("postDataForUpdatePunchMaster", postDataForUpdatePunchMaster);
            try {
                // Update Punch Master
                const updatePunchMaster = await axioslogin.post("/attendCal/monthlyUpdatePunchMaster/", postDataForUpdatePunchMaster);
                const { success, message, data } = updatePunchMaster.data;
                if (success === 1) {
                    return { status: 1, message: "Punch Master Updated Successfully", errorMessage: '', punchMastData: data };
                } else {
                    return { status: 0, message: "Error Updating Punch Master! Contact IT", errorMessage: message, punchMastData: [] };
                }
            } catch (error) {
                return { status: 0, message: "Unhandled Error! Contact IT", errorMessage: error.message, punchMastData: [] };
            }
        }).catch((error) => {
            return { status: 0, message: "Error Updating Punch Master! Contact IT", errorMessage: error.message, punchMastData: [] };
        });
    } catch (error) {
        return { status: 0, message: "Duty Plan Not Done! Contact IT", errorMessage: error.message, punchMastData: [] };
    }
};


// export const processShiftPunchMarkingHrFunc = async (
//     postData_getPunchData,
//     punchaData, //PUNCH DATA
//     empList, // EMPLOYEE LIST SECTION WISE
//     setShiftDetail, // SHIFT INFORMATION     ,
//     Commonsettings, // COMMON SETTINGS
//     holidayList, // HOLIDAY LIST
//     value, //DATE OF SELECTED MONTH
//     // previous_punch_data, //Previous Month Punch Data
// ) => {
//     // console.log(postData_getPunchData);

//     const {
//         cmmn_early_out, // Early going time interval
//         cmmn_grace_period, // common grace period for late in time
//         cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY 
//         salary_above, //Salary limit for calculating the holiday double wages
//         week_off_day, // week off SHIFT ID
//         notapplicable_shift, //not applicable SHIFT ID
//         default_shift, //default SHIFT ID
//         noff, // night off SHIFT ID,
//         max_late_day_count,
//         break_shift_taken_count,
//         noff_selct_day_count
//     } = Commonsettings; //COMMON SETTING
//     //GET DUTY PLAN AND CHECK DUTY PLAN IS EXCIST OR NOT

//     /*******************/
//     // 1 -> USE try-catch here

//     try {
//         const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData); //GET DUTY PLAN DAAT

//         const { successStatus, PunchMastDutyPlanDatas } = getDutyPlan.data;

//         const { punchMasterResults, dutyPlanResults } = PunchMastDutyPlanDatas;

//         if (successStatus === 1 && punchMasterResults.dataStatus === true && dutyPlanResults.dataStatus === true) {
//             const planData = punchMasterResults?.punchMasterResults
//             // console.log("planData", planData);

//             // const shiftdetail = PunchMastDutyPlanDatas?.dutyPlanResults
//             const empArray = [...new Set(planData?.map((e) => e.em_no))]?.map((emno) => {
//                 return {
//                     emno: emno,
//                     shiftMergedPunchMaster: planData?.filter(e => e.em_no === emno)?.map((val) => {
//                         return {
//                             shft_chkin_start: val.shft_chkin_start,
//                             shft_chkin_end: val.shft_chkin_end,
//                             shft_chkout_start: val.shft_chkout_start,
//                             shft_chkout_end: val.shft_chkout_end,
//                             shft_cross_day: (val.shft_cross_day ?? 0) || 0,
//                             shft_duty_day: (val.shft_duty_day ?? 0) || 0,
//                             gross_salary: (val.gross_salary ?? 0) || 0,
//                             earlyGoingMaxIntervl: (cmmn_early_out ?? 0) || 0,
//                             gracePeriodInTime: (cmmn_grace_period ?? 0) || 0,
//                             maximumLateInTime: (cmmn_late_in ?? 0) || 0,
//                             salaryLimit: (salary_above ?? 0) || 0,
//                             woff: (week_off_day ?? 0) || 0,
//                             naShift: (notapplicable_shift ?? 0) || 0,
//                             defaultShift: (default_shift ?? 0) || 0,
//                             noff: (noff ?? 0) || 0,
//                             holidayStatus: val.holiday_status,
//                             break_shift_status: (val.break_shift_status ?? 0) || 0,
//                             first_half_in: val.first_half_in,
//                             first_half_out: val.first_half_out,
//                             second_half_in: val.second_half_in,
//                             second_half_out: val.second_half_out,
//                             noff_selct_day_count: (Commonsettings?.noff_selct_day_count ?? 0) || 0,
//                             shft_slno: (val.shft_slno ?? 0) || 0,
//                             night_off_flag: (val.night_off_flag ?? 0) || 0,
//                             noff_max_days: (val.noff_max_days ?? 0) || 0,
//                             noff_min_days: (val.noff_min_days ?? 0) || 0,
//                             duty_day: val.duty_day,
//                             shift_in: val.shift_in,
//                             shift_out: val.shift_out
//                         }
//                     })
//                 }
//             })

//             // const { emno, shiftMergedPunchMaster } = empArray[0];

//             // const employeeBasedPunchData = punchaData?.filter((e) => parseInt(e.emp_code) === emno);

//             // console.log(employeeBasedPunchData);

//             // Prepare tasks for Promise.allSettled
//             const tasks = empArray.map(async ({ emno, shiftMergedPunchMaster }) => {


//                 if (shiftMergedPunchMaster[0]?.break_shift_status === 1) {

//                     return await BreakDutypunchInOutMapping(
//                         shiftMergedPunchMaster,
//                         punchaData,
//                         cmmn_grace_period,
//                         break_shift_taken_count
//                     );
//                 } else {
//                     return await punchInOutMapping(shiftMergedPunchMaster, punchaData);
//                 }
//             });
//             // console.log("tasks", tasks);

//             //   Await all promises
//             return Promise.allSettled(tasks)
//                 .then((results) => {
//                     console.log("Processing Results:", results);
//                     return { status: 1, message: "Punch Master Updated Successfully", errorMessage: "", punchMastData: results };
//                 })
//                 .catch((error) => {
//                     console.error("Error processing punch data:", error);
//                     return { status: 0, message: "Error in Punch Master Processing", errorMessage: error.message, punchMastData: [] };
//                 });
//         } else {
//             return { status: 0, message: "Punch Master and Duty Plan Data Not Found! Contact IT", errorMessage: "", punchMastData: [] };
//         }

//     } catch (er) {
//         console.error("Error during Punch Master update:", er);
//         return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '', punchMastData: [] }
//     }
// }

// console.log(shiftMergedPunchMaster);

// const { emno, shiftMergedPunchMaster } = shiftMergedPunchMaster[0]

// const employeeBasedPunchData = punchaData?.filter((e) => parseInt(e.emp_code) === emno)

// console.log(employeeBasedPunchData);

// if (shiftMergedPunchMaster?.break_shift_status === 1) {
//     return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, punchaData, cmmn_grace_period, break_shift_taken_count)
// }
// else {
//     return await punchInOutMapping(shiftMergedPunchMaster, punchaData)
// }


//     return { status: 1, message: "Punch Master Updated Successfully", errorMessage: '', punchMastData: [] }

// }
// else {
//     return { status: 0, message: "Punch Master and Duty Plan Data Not Found ! contact IT", errorMessage: '', punchMastData: [] }
// }










// if (succes === 1 && shiftdetail?.length > 0) {



// const dutyplanInfo = shiftdetail; //DUTY PLAN
// const dutyPlanSlno = dutyplanInfo?.map(e => e.plan_slno) //FIND THE DUTY PLAN SLNO
// const punch_master_data = await axioslogin.post("/attendCal/getPunchMasterDataSectWiseDutyplan/", postData_getPunchData); //GET PUNCH MASTER DATA
// const { success, planData } = punch_master_data.data;

// /********REVIEW - AJITH */
// // SINGLE API TO GET DUTY PLAN AND PUNCH MASTER DATA AND ALSO GET PREVIOUS 15 DAY MASTER DATA


// // console.log("planData", planData)
// if (success === 1 && planData?.length > 0) {
//     const punchMasterData = planData; //PUNCHMSTER DATA
//     // console.log("punchMasterData", punchMasterData);

//     return Promise.allSettled(
//         punchMasterData?.map(async (data, index) => {
//             // console.log(data)
//             const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == data.em_no)
//             const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
//             // console.log(sortedShiftData);
//             const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA

//             const shiftMergedPunchMaster = {
//                 ...data,
//                 shft_chkin_start: sortedShiftData?.shft_chkin_start,
//                 shft_chkin_end: sortedShiftData?.shft_chkin_end,
//                 shft_chkout_start: sortedShiftData?.shft_chkout_start,
//                 shft_chkout_end: sortedShiftData?.shft_chkout_end,
//                 shft_cross_day: sortedShiftData?.shft_cross_day,
//                 shft_duty_day: sortedShiftData?.shft_duty_day,
//                 gross_salary: (sortedSalaryData?.gross_salary ?? 0) || 0,
//                 earlyGoingMaxIntervl: cmmn_early_out,
//                 gracePeriodInTime: cmmn_grace_period,
//                 maximumLateInTime: cmmn_late_in,
//                 salaryLimit: salary_above,
//                 woff: week_off_day,
//                 naShift: notapplicable_shift,
//                 defaultShift: default_shift,
//                 noff: noff,
//                 holidayStatus: sortedShiftData?.holiday_status,
//                 break_shift_status: sortedShiftData?.break_shift_status,
//                 first_half_in: sortedShiftData?.first_half_in,
//                 first_half_out: sortedShiftData?.first_half_out,
//                 second_half_in: sortedShiftData?.second_half_in,
//                 second_half_out: sortedShiftData?.second_half_out,
//                 // noff_max_days: sortedShiftData?.noff_max_days,
//                 // night_off_flag: sortedShiftData?.night_off_flag,
//                 noff_selct_day_count: commonSettings?.noff_selct_day_count,
//                 shft_slno: sortedShiftData?.shft_slno,
//                 night_off_flag: sortedShiftData?.night_off_flag,
//                 noff_max_days: sortedShiftData?.noff_max_days,
//                 noff_min_days: sortedShiftData?.noff_min_days,
//             }

//             // console.log("employeeBasedPunchData", employeeBasedPunchData);
//             //Functions for break duty and Normal duty
//             if (shiftMergedPunchMaster?.break_shift_status === 1) {
//                 return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData, cmmn_grace_period, break_shift_taken_count)
//             }
//             else {
//                 return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

//             }

//             //FUNCTION FOR MAPPING THE PUNCH IN AND OUT
//             // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
//         })

//     ).then((data) => {
//         // console.log(data);

//         const punchMasterMappedData = data?.map((e) => e.value)
//         // console.log(punchMasterMappedData);

//         return Promise.allSettled(
//             punchMasterMappedData?.map(async (val) => {
//                 // console.log("consoled", val);
//                 const holidayStatus = val.holiday_status;
//                 const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
//                 const punch_out = val.punch_out === null ? null : new Date(val.punch_out);
//                 // console.log("punch_in", punch_In);
//                 // console.log("punch_out", punch_out);

//                 const shift_in = new Date(val.shift_in);
//                 const shift_out = new Date(val.shift_out);

//                 const shft_duty_day = val.shft_duty_day;
//                 //SALARY LINMIT
//                 const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;

//                 const duty_day = val.duty_day;
//                 //break duty

//                 const break_shift_status = val.break_shift_status;
//                 //emp punch
//                 const break_first_punch_in = val.break_first_punch_in;
//                 const break_first_punch_out = val.break_first_punch_out;
//                 const break_second_punch_in = val.break_second_punch_in;
//                 const break_second_punch_out = val.break_second_punch_out;

//                 // console.log(break_first_punch_in);
//                 // console.log(break_first_punch_out);
//                 // console.log(break_second_punch_in);
//                 // console.log(break_second_punch_out);

//                 //shift details
//                 const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
//                 const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
//                 const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
//                 const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `


//                 // console.log(first_shift_in);
//                 // console.log(first_shift_out);
//                 // console.log(second_shift_in);
//                 // console.log(second_shift_out);
//                 // console.log("**************************");

//                 const night_off_flag = val.night_off_flag;
//                 const noff_max_days = val.noff_max_days;
//                 const noff_min_days = val.noff_min_days;
//                 const noff_updation_status = val.noff_updation_status;
//                 const em_no = val.em_no;


//                 if (break_shift_status === 1) {
//                     const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(first_shift_in, first_shift_out, second_shift_in, second_shift_out, break_first_punch_in, break_first_punch_out, break_second_punch_in, break_second_punch_out, break_shift_status, duty_day)
//                     // console.log(getBreakDutyLateInTime?.hrsWorked);

//                     const getAttendanceStatus = await getAttendanceCalculation(
//                         punch_In,
//                         shift_in,
//                         punch_out,
//                         shift_out,
//                         cmmn_grace_period,
//                         getBreakDutyLateInTime,
//                         holidayStatus,
//                         val.shift_id,
//                         val.defaultShift,
//                         val.naShift,
//                         val.noff,
//                         val.woff,
//                         salaryLimit,
//                         val.maximumLateInTime,
//                         shft_duty_day,
//                         break_shift_status,
//                         break_first_punch_in,
//                         break_first_punch_out,
//                         break_second_punch_in,
//                         break_second_punch_out,
//                         first_shift_in,
//                         first_shift_out,
//                         second_shift_in,
//                         second_shift_out,
//                         duty_day,
//                         night_off_flag,
//                         noff_max_days,
//                         noff_min_days,
//                         noff_updation_status,
//                         em_no
//                     )
//                     return {
//                         punch_slno: val.punch_slno,
//                         punch_in: val.break_first_punch_in,
//                         punch_out: val.break_second_punch_out,
//                         // punch_in: val.break_shift_status === 1 ? val.break_first_punch_in : val.punch_in,
//                         // punch_out: val.break_shift_status === 1 ? val.break_second_punch_out : val.punch_out,
//                         hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.hrsWorked,
//                         late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.lateIn,
//                         early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.earlyOut,
//                         duty_status: getAttendanceStatus?.duty_status,
//                         holiday_status: val.holiday_status,
//                         leave_status: val.leave_status,
//                         lvereq_desc: getAttendanceStatus?.lvereq_desc,
//                         duty_desc: getAttendanceStatus?.duty_desc,
//                         lve_tble_updation_flag: val.lve_tble_updation_flag,
//                         shft_duty_day: val.shft_duty_day,
//                         night_off_flag: val.night_off_flag,
//                         noff_max_days: val.noff_max_days,
//                         noff_min_days: val.noff_min_days,
//                         noff_updation_status: noff_updation_status,
//                         em_no: em_no
//                     }
//                 }
//                 else {
//                     const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

//                     const getAttendanceStatus = await getAttendanceCalculation(
//                         punch_In,
//                         shift_in,
//                         punch_out,
//                         shift_out,
//                         cmmn_grace_period,
//                         getLateInTime,
//                         holidayStatus,
//                         val.shift_id,
//                         val.defaultShift,
//                         val.naShift,
//                         val.noff,
//                         val.woff,
//                         salaryLimit,
//                         val.maximumLateInTime,
//                         shft_duty_day,
//                         break_shift_status,
//                         break_first_punch_in,
//                         break_first_punch_out,
//                         break_second_punch_in,
//                         break_second_punch_out,
//                         first_shift_in,
//                         first_shift_out,
//                         second_shift_in,
//                         second_shift_out,
//                         duty_day,
//                         night_off_flag,
//                         noff_max_days,
//                         noff_min_days,
//                         noff_updation_status,
//                         em_no
//                     )
//                     // console.log(getAttendanceStatus);

//                     return {
//                         punch_slno: val.punch_slno,
//                         punch_in: val.punch_in,
//                         punch_out: val.punch_out,
//                         hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.hrsWorked,
//                         late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.lateIn,
//                         early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.earlyOut,
//                         duty_status: getAttendanceStatus?.duty_status,
//                         holiday_status: val.holiday_status,
//                         leave_status: val.leave_status,
//                         lvereq_desc: getAttendanceStatus?.lvereq_desc,
//                         duty_desc: getAttendanceStatus?.duty_desc,
//                         lve_tble_updation_flag: val.lve_tble_updation_flag,
//                         shft_duty_day: val.shft_duty_day,
//                         duty_day: duty_day,
//                         night_off_flag: night_off_flag,
//                         noff_max_days: noff_max_days,
//                         noff_min_days: noff_min_days,
//                         noff_updation_status: noff_updation_status,
//                         em_no: em_no
//                     }
//                 }
//             })

//         ).then(async (element) => {
//             // REMOVE LEAVE REQUESTED DATA FROM THIS DATA
//             // console.log("element", element);

//             const processedData = element?.map((e) => e.value)?.filter((v) => v.lve_tble_updation_flag === 0)
//             // console.log(processedData);

//             const punchMasterFilterDataForNoff = [...previous_punch_data, ...processedData]
//             return Promise.allSettled(
//                 processedData?.map(async (e, idx) => {
//                     // console.log(e);

//                     let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await PunchInOutMarkingNOffStatus(e, idx, noff_selct_day_count, punchMasterFilterDataForNoff, value) : e.duty_desc;
//                     return {
//                         ...e,
//                         lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                         duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                         lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0
//                     }
//                 })
//             )
//         }).then(async (results) => {

//             const PunchMasterPolicyBasedFilterResult = results?.map((e) => e.value);

//             // PUNCH MASTER UPDATION
//             const postDataForUpdatePunchMaster = {
//                 postData_getPunchData: postData_getPunchData,
//                 processedData: PunchMasterPolicyBasedFilterResult,
//                 max_late_day_count: max_late_day_count
//             };



//             try {
//                 // Update Punch Master
//                 const updatePunchMaster = await axioslogin.post("/attendCal/monthlyUpdatePunchMaster/", postDataForUpdatePunchMaster);
//                 const { success, message, data } = updatePunchMaster.data;
//                 if (success === 1) {
//                     return { status: 1, message: "Punch Master Updated Successfully", errorMessage: '', punchMastData: data };

//                 } else {
//                     return { status: 0, message: "Error Updating Punch Master! Contact IT", errorMessage: message, punchMastData: [] };
//                 }
//             } catch (error) {
//                 console.error("Error during Punch Master update:", error);
//                 return { status: 0, message: "Unhandled Error! Contact IT", errorMessage: error.message, punchMastData: [] };
//             }
//         })
//     }).catch((err) => {
//         console.error("Error during Punch Master update:", err);
//         return { status: 0, message: "Unhandled Error! Contact IT", errorMessage: err.message, punchMastData: [] };
//     })
// } else {
//     return { status: 0, message: "Punch Master Data Not Found ! contact IT", errorMessage: '', punchMastData: [] }
// }




// } else {
//     return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '', punchMastData: [] }
// }



// }
// catch {
//     return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '', punchMastData: [] }
// }
//     } catch (er) {
//         console.error("Error during Punch Master update:", er);
//         return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '', punchMastData: [] }
//     }
// }

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
    // console.log("array", array);

    const sortedArray = array.sort((a, b) => new Date(a.duty_day) - new Date(b.duty_day))
    if (fromDate <= e.duty_day && e.duty_desc === 'WOFF') {
        const policyLimit = weekoff_policy_max_count - weekoff_policy_min_count;
        const toIndex = idx - 1;
        const fromIndex = idx - weekoff_policy_max_count;
        // console.log("toIndex");
        // console.log("fromIndex", fromIndex);
        const FilterArray = sortedArray.filter((val, index) => fromIndex <= index && index <= toIndex)?.map((e) => e.duty_desc)
        const filterBasedOnDutyDesc = FilterArray?.filter((dutydesc) => dutydesc === 'LWP' || dutydesc === 'A' || dutydesc === 'ESI' || dutydesc === 'LOP' || dutydesc === 'WOFF').length
        return await filterBasedOnDutyDesc > policyLimit ? 'A' : 'WOFF'
    } else {
        return e.duty_desc
    }
}

const NOffStatus = async (e, idx, noff_selct_day_count, punchMasterFilterDataForNoff, fromDate) => {
    // console.log("punchMasterFilterDataForNoff", punchMasterFilterDataForNoff);

    // **-------Night Off-------**

    // Path:Attendance-->PunchMarkingHR-->Update Attendance
    // Api:-UpdatedNoffStatusInDutyPlan
    // plan_update: '2024-11-16 00:00:00',
    //     noff_updation_status: 1,                    //Noff status (0 or 1 or 2)
    //         em_no: 50139,                            //who took Night duty
    //             duty_day: '2024-10-12'                     //duty date


    // *-------Update Punch Marking HR-------**
    // deptID: 107
    // empList: [50135, 50169, 50200, 50360, 50139]
    // fromDate: "2024-10-01"
    // fromDate_dutyPlan: "2024-10-01"
    // fromDate_punchMaster: "2024-10-01"
    // loggedEmp: 1
    // preFromDate: "2024-09-29 00:00:00"
    // preToDate: "2024-11-01 23:59:59"
    // section: 229
    // toDate: "2024-10-31"
    // toDate_dutyPlan: "2024-10-31"
    // toDate_punchMaster: "2024-10-31"
    //         toDayeForUpdatePunchMast: "2024-10-31"



    const sortedArray = punchMasterFilterDataForNoff.sort((a, b) => new Date(a.duty_day) - new Date(b.duty_day))
    if (e.duty_desc === 'NOFF') {
        const filteredData = sortedArray.flatMap((ele) => {
            return ele?.data.filter((val) => {
                return (
                    e.em_no === val.em_no
                );
            });
        });
        const NoffArray = punchMasterFilterDataForNoff.flatMap((ele) => {
            return ele?.data.filter((val) => val.duty_desc === "NOFF" && e.em_no === val.em_no).map((val) => val.duty_day);
        });

        // const fromDateObj = new Date(fromDate);
        // const formatIndex = format(addDays(fromDateObj, idx), 'yyyy-MM-dd');
        // const toIndex = format(subDays(fromDateObj, noff_selct_day_count), 'yyyy-MM-dd');
        // const FilterArray = filteredData.filter((val) => toIndex <= val.duty_day && val.duty_day <= formatIndex
        // )?.map((e) => e)
        const frmDate = format(subDays(new Date(e.duty_day), noff_selct_day_count), 'yyyy-MM-dd')
        const FilterArray = filteredData.filter((val) => frmDate <= val.duty_day && val.duty_day <= e.duty_day
        )?.map((e) => e)
        const FindNightDays = FilterArray?.filter((val) => val.night_off_flag === 1 && val.duty_status === 1 && val.noff_updation_status < 2 && val.duty_desc === "P")
        const minDaysCount = FindNightDays?.find((dta) => dta)?.noff_min_days;

        const updateData = FindNightDays.map((val) => ({
            plan_update: format(new Date(), "yyyy-MM-dd 00:00:00"),
            noff_updation_status: NoffArray?.length > 1 ? 2 :
                val.noff_updation_status === 0
                    ? 1
                    : val.noff_updation_status === 1
                        ? 2
                        : val.noff_updation_status,
            em_no: parseInt(val.em_no),
            duty_day: format(new Date(val.duty_day), "yyyy-MM-dd"),
        }));
        if (FindNightDays.length >= minDaysCount) {
            const response = await axioslogin.patch(
                "/attendCal/UpdatedNoffStatusInDutyPlan/",
                updateData
            );
            const { success } = response.data;
            return success === 1 ? "NOFF" : "A";
        } else {

            return 'A';
        }
    } else {
        return 'A';
    }
}


const PunchInOutMarkingNOffStatus = async (e, idx, noff_selct_day_count, punchMasterFilterDataForNoff, fromDate) => {
    // console.log("PunchInOutMarkingNOffStatus", punchMasterFilterDataForNoff);
    const sortedArray = punchMasterFilterDataForNoff.sort((a, b) => new Date(a.duty_day) - new Date(b.duty_day))


    // const fromDateObj = new Date(fromDate);
    // const formatIndex = format(addDays(fromDateObj, idx), 'yyyy-MM-dd');
    // const toIndex = format(subDays(fromDateObj, noff_selct_day_count), 'yyyy-MM-dd');
    // const FilterArray = sortedArray.filter((val) => toIndex <= val.duty_day && val.duty_day <= formatIndex
    // )?.map((e) => e)

    const frmDate = format(subDays(new Date(e.duty_day), noff_selct_day_count), 'yyyy-MM-dd')
    const FilterArray = sortedArray.filter((val) => frmDate <= val.duty_day && val.duty_day <= e.duty_day
    )?.map((e) => e)
    const FindNightDays = FilterArray?.filter((val) => val.night_off_flag === 1 && val.duty_status === 1 && val.noff_updation_status < 2 && val.duty_desc === "P")


    if (e.duty_desc === 'NOFF' && FindNightDays?.length !== 0) {

        const NoffArray = punchMasterFilterDataForNoff?.filter((val) => val.duty_desc === "NOFF").map((val) => val.duty_day);
        const minDaysCount = FindNightDays?.find((dta) => dta)?.noff_min_days;

        const updateData = FindNightDays?.map((val) => ({
            plan_update: format(new Date(), "yyyy-MM-dd 00:00:00"),
            noff_updation_status: NoffArray?.length > 1 ? 2 :
                val.noff_updation_status === 0
                    ? 1
                    : val.noff_updation_status === 1
                        ? 2
                        : val.noff_updation_status,
            em_no: parseInt(val.em_no),
            duty_day: format(new Date(val.duty_day), "yyyy-MM-dd"),
        }));
        // console.log("updateData", updateData);
        if (FindNightDays.length >= minDaysCount) {
            const response = await axioslogin.patch(
                "/attendCal/UpdatedNoffStatusInDutyPlan/",
                updateData
            );
            const { success } = response.data;
            return success === 1 ? "NOFF" : "A";
        } else {
            return 'A';
        }
    } else {
        return "A"
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
