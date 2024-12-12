import { axioslogin } from "src/views/Axios/Axios";

export const getcommonSettings = async () => {
    return axioslogin.get('/commonsettings').then((res) => {
        const { success, data } = res.data;
        if (success === 1) {
            return data?.length > 0 ? data[0] : []
        }
    })
}

export const setShiftDetails = async () => {
    return axioslogin.get('/shift').then((res) => {
        const { success, data } = res.data;
        if (success === 1) {
            return data
        }
    })
}





// export const processShiftPunchMarkingHrFunc = async (
//     postData_getPunchData,
//     punchaData, // PUNCH DATA
//     empList, // EMPLOYEE LIST SECTION WISE
//     shiftDetails, // SHIFT INFORMATION
//     Commonsettings, // COMMON SETTINGS
//     holidayList, // HOLIDAY LIST
//     value // DATE OF SELECTED MONTH
// ) => {
//     const {
//         cmmn_early_out, // Early going time interval
//         cmmn_grace_period, // Common grace period for late in time
//         cmmn_late_in, // Maximum Late in Time for punch in (after that direct HALF DAY)
//         salary_above, // Salary limit for calculating the holiday double wages
//         week_off_day, // Week off SHIFT ID
//         notapplicable_shift, // Not applicable SHIFT ID
//         default_shift, // Default SHIFT ID
//         noff, // Night off SHIFT ID
//         max_late_day_count,
//         break_shift_taken_count,
//         noff_selct_day_count
//     } = Commonsettings;

//     try {
//         // Step 1: Fetch Duty Plan Data
//         const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData);
//         const { successStatus, PunchMastDutyPlanDatas } = getDutyPlan.data;

//         if (successStatus !== 1) {
//             return {
//                 status: 0,
//                 message: "Punch Master and Duty Plan Data Not Found! Contact IT",
//                 errorMessage: "",
//                 punchMastData: []
//             };
//         }

//         const { punchMasterResults, dutyPlanResults } = PunchMastDutyPlanDatas;

//         if (!punchMasterResults?.dataStatus || !dutyPlanResults?.dataStatus) {
//             return {
//                 status: 0,
//                 message: "Punch Master and Duty Plan Data Not Found! Contact IT",
//                 errorMessage: "",
//                 punchMastData: []
//             };
//         }

//         // Step 2: Process Plan Data
//         const planData = punchMasterResults?.punchMasterResults || [];

//         // console.log("planData", planData);

//         const empArray = [...new Set(planData.map((e) => e.em_no))].map((emno) => ({
//             emno,
//             shiftMergedPunchMaster: planData
//                 .filter((e) => e.em_no === emno)
//                 .map((val) => ({
//                     ...val,
//                     shft_chkin_start: val.shft_chkin_start,
//                     shft_chkin_end: val.shft_chkin_end,
//                     shft_chkout_start: val.shft_chkout_start,
//                     shft_chkout_end: val.shft_chkout_end,
//                     shft_cross_day: val.shft_cross_day || 0,
//                     shft_duty_day: val.shft_duty_day || 0,
//                     gross_salary: val.gross_salary || 0,
//                     earlyGoingMaxIntervl: cmmn_early_out || 0,
//                     gracePeriodInTime: cmmn_grace_period || 0,
//                     maximumLateInTime: cmmn_late_in || 0,
//                     salaryLimit: salary_above || 0,
//                     woff: week_off_day || 0,
//                     naShift: notapplicable_shift || 0,
//                     defaultShift: default_shift || 0,
//                     noff: noff || 0,
//                     holidayStatus: val.holiday_status,
//                     break_shift_status: val.break_shift_status || 0,
//                     first_half_in: val.first_half_in,
//                     first_half_out: val.first_half_out,
//                     second_half_in: val.second_half_in,
//                     second_half_out: val.second_half_out,
//                     noff_selct_day_count: noff_selct_day_count || 0,
//                     shft_slno: val.shft_slno || 0,
//                     night_off_flag: val.night_off_flag || 0,
//                     noff_max_days: val.noff_max_days || 0,
//                     noff_min_days: val.noff_min_days || 0,
//                     duty_day: val.duty_day,
//                     shift_in: val.shift_in,
//                     shift_out: val.shift_out,
//                     lve_tble_updation_flag: val.lve_tble_updation_flag,
//                     em_no: val.em_no,
//                     leave_status: val.leave_status,
//                     punch_slno: val.punch_slno
//                 }))
//         }).then(empArray).map(async ({ emno, shiftMergedPunchMaster }) => {
//             try {
//                 if (shiftMergedPunchMaster[0]?.break_shift_status === 1) {
//                     // Use BreakDutypunchInOutMapping if break_shift_status is 1
//                     const processedShifts = await BreakDutypunchInOutMapping(
//                         shiftMergedPunchMaster,
//                         punchaData,
//                         cmmn_grace_period,
//                         break_shift_taken_count
//                     );

//                     // Flatten the result
//                     return processedShifts.map((shift) => ({ emno, ...shift }));
//                 } else {
//                     // Use punchInOutMapping otherwise
//                     const processedShifts = await Promise.all(
//                         shiftMergedPunchMaster.map(async (shift) => {
//                             return await punchInOutMapping(shift, punchaData);
//                         })
//                     );

//                     // Flatten the result
//                     return processedShifts.map((shift) => ({ emno, ...shift }));
//                 }
//             } catch (err) {
//                 // Catch errors and return the error message for the employee
//                 return { emno, error: err.message };
//             }
//         }).then((resp) => {

//         }
//         ))

//         // const tasks = empArray.map(async ({ emno, shiftMergedPunchMaster }) => {
//         //     try {
//         //         if (shiftMergedPunchMaster[0]?.break_shift_status === 1) {
//         //             // Use BreakDutypunchInOutMapping if break_shift_status is 1
//         //             const processedShifts = await BreakDutypunchInOutMapping(
//         //                 shiftMergedPunchMaster,
//         //                 punchaData,
//         //                 cmmn_grace_period,
//         //                 break_shift_taken_count
//         //             );

//         //             // Flatten the result
//         //             return processedShifts.map((shift) => ({ emno, ...shift }));
//         //         } else {
//         //             // Use punchInOutMapping otherwise
//         //             const processedShifts = await Promise.all(
//         //                 shiftMergedPunchMaster.map(async (shift) => {
//         //                     return await punchInOutMapping(shift, punchaData);
//         //                 })
//         //             );

//         //             // Flatten the result
//         //             return processedShifts.map((shift) => ({ emno, ...shift }));
//         //         }
//         //     } catch (err) {
//         //         // Catch errors and return the error message for the employee
//         //         return { emno, error: err.message };
//         //     }
//         // })

//         return Promise.allSettled(rs).then((results) => {
//             // then((results) => {
//             console.log("kskdjfkjskdjgksj   then result", results);


//             const punchMasterMappedData = results
//                 .flatMap((resp) => (resp.status === "fulfilled" ? resp.value : []));

//             return Promise.all(punchMasterMappedData.map(async (val) => {
//                 // console.log("val", val);

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
//                 // const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
//                 // const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
//                 // const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
//                 // const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `
//                 const first_shift_in = format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')
//                 const first_shift_out = format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')
//                 const second_shift_in = format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')
//                 const second_shift_out = format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')


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
//             );
//         }).then((data) => {
//             const processedData = data?.filter((v) => v.lve_tble_updation_flag === 0);
//             // Log the filtered data
//             // console.log("Processed Data:", processedData);
//             const EmpAttendanceArray = [...new Set(processedData.map((e) => e.em_no))].map((emno) => ({
//                 emno,
//                 data: processedData.filter((e) => e.em_no === emno).map((val) => ({ ...val }))
//                 // data: processedData
//                 //     .filter((e) => e.em_no === emno)
//                 //     .map((val) => ({
//                 //         ...val
//                 //     }))
//             }));
//             // console.log("EmpAttendanceArray", EmpAttendanceArray);
//             return Promise.allSettled(EmpAttendanceArray?.flatMap((ele) => {
//                 return ele?.data?.map(async (e, idx) => {
//                     let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await NOffStatus(e, idx, noff_selct_day_count, EmpAttendanceArray, value) : e.duty_desc;
//                     // console.log(e.duty_day, e.duty_desc, NoffStatus);
//                     // console.log(e.em_no, e.duty_day, NoffStatus);

//                     return {
//                         ...e,
//                         lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                         duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                         lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0

//                     }
//                 })
//             })
//             )

//             // Use Promise.all to resolve all promises in the map
//             // return Promise.all(
//             //     processedData?.map(async (e, idx) => {
//             //         let NoffStatus =
//             //             e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1
//             //                 ? await PunchInOutMarkingNOffStatus(e, idx, noff_selct_day_count, processedData, value)
//             //                 : e.duty_desc;
//             //         return {
//             //             ...e,
//             //             lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//             //             duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//             //             lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0,
//             //         };
//             //     })
//             // );
//         }).then(async (element) => {
//             // console.log("element:", element);

//             // Map the results to prepare data for punch master update
//             const processedData = element?.map((e) => e.value)?.filter((v) => (v.lve_tble_updation_flag === 1 && v.duty_desc === "NOFF") || (v.lve_tble_updation_flag === 0 && v.duty_desc !== "NOFF"))

//             // console.log(processedData)
//             // Prepare the data to update punch master
//             const postDataForUpdatePunchMaster = {
//                 postData_getPunchData: postData_getPunchData,
//                 processedData: processedData,
//                 max_late_day_count: max_late_day_count,
//             };
//             // console.log("postDataForUpdatePunchMaster", postDataForUpdatePunchMaster);
//             try {
//                 // Update Punch Master
//                 const updatePunchMaster = await axioslogin.post("/attendCal/monthlyUpdatePunchMaster/", postDataForUpdatePunchMaster);
//                 const { success, message, data } = updatePunchMaster.data;
//                 console.log("updatePunchMaster.data", updatePunchMaster.data);
//                 // console.log(typeof (success));

//                 if (success === 1) {
//                     console.log("If Case");
//                     // status, message, errorMessage, punchMastData
//                     return { status: 1, message: "Punch Master Updated Successfully", errorMessage: '', punchMastData: data };
//                 } else {
//                     // console.log("else Case");
//                     return { status: 0, message: "Error Updating Punch Master! Contact IT", errorMessage: message, punchMastData: [] };
//                 }
//             } catch (error) {
//                 console.error("Error during Punch Master update:", error);
//                 return { status: 0, message: "Unhandled Error! Contact IT", errorMessage: error.message, punchMastData: [] };
//             }
//         }).catch((error) => {
//             console.error("Error processing punch data:", error);
//             return { status: 0, message: "Error Updating Punch Master! Contact IT", errorMessage: "bnc", punchMastData: [] };
//         });

//     } catch (error) {
//         // Step 5: Catch Top-Level Errors
//         console.error("Error during Punch Master update:", error.message);
//         return {
//             status: 0,
//             message: "Duty Plan Not Done! Contact IT",
//             errorMessage: error.message,
//             punchMastData: []
//         };
//     }
// };









/////////////////////////////************************************Punch Marking By HR****************************************************** */









// import { addDays, addHours, addMinutes, differenceInDays, differenceInHours, differenceInMinutes, eachDayOfInterval, format, isAfter, isBefore, isValid, max, min, parseISO, subDays, subHours, subMinutes } from "date-fns";
// import { axioslogin } from "src/views/Axios/Axios";
// import { warningNofity } from "src/views/CommonCode/Commonfunc";
// import { isEqual } from "underscore";

// export const processPunchMarkingHrFunc = async (
//     postData_getPunchData,
//     punchaData, //PUNCH DATA
//     empList, // EMPLOYEE LIST SECTION WISE
//     shiftInformation, // SHIFT INFORMATION
//     commonSettings, // COMMON SETTINGS
//     holidayList, // HOLIDAY LIST
//     empSalary, // EMPLOYEE_SALARY

// ) => {
//     const {
//         cmmn_early_out, // Early going time interval
//         cmmn_grace_period, // common grace period for late in time
//         cmmn_late_in, //Maximum Late in Time for punch in after that direct HALF DAY
//         salary_above, //Salary limit for calculating the holiday double wages
//         week_off_day, // week off SHIFT ID
//         notapplicable_shift, //not applicable SHIFT ID
//         default_shift, //default SHIFT ID
//         noff, // night off SHIFT ID,
//         holiday_policy_count, //HOLIDAY PRESENT AND ABSENT CHECKING COUNT
//         weekoff_policy_max_count, // WEEK OFF ELIGIBLE MAX DAY COUNT
//         weekoff_policy_min_count,
//         noff_selct_day_count
//     } = commonSettings; //COMMON SETTING

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


//     try {
//         // Step 1: Fetch Duty Plan Data
//         const getDutyPlan = await axioslogin.post("/attendCal/getDutyPlanBySection/", postData_getPunchData);
//         const { successStatus, PunchMastDutyPlanDatas } = getDutyPlan.data;

//         if (successStatus !== 1) {
//             return {
//                 status: 0,
//                 message: "Punch Master and Duty Plan Data Not Found! Contact IT",
//                 errorMessage: "",
//                 punchMastData: []
//             };
//         }

//         const { punchMasterResults, dutyPlanResults } = PunchMastDutyPlanDatas;

//         if (!punchMasterResults?.dataStatus || !dutyPlanResults?.dataStatus) {
//             return {
//                 status: 0,
//                 message: "Punch Master and Duty Plan Data Not Found! Contact IT",
//                 errorMessage: "",
//                 punchMastData: []
//             };
//         }
//         // Step 2: Process Plan Data
//         const planData = punchMasterResults?.punchMasterResults || [];

//         const { fromDate, toDate } = postData_getPunchData;

//         const punchMasterFilterData = await planData?.filter((e) => new Date(fromDate) <= new Date(e.duty_day) && new Date(e.duty_day) <= new Date(toDate))
//         // console.log(punchMasterFilterData?.filter((e) => e.em_no === 4516))
//         const punchMasterData = punchMasterFilterData; //PUNCHMSTER DATA
//         // console.log("punchMasterFilterData", punchMasterFilterData);

//         return Promise.allSettled(
//             punchMasterData?.map(async (data, index) => {
//                 // console.log("inside data", data);
//                 // console.log(data)
//                 const sortedShiftData = shiftInformation?.find((e) => e.shft_slno === data.shift_id)// SHIFT DATA
//                 const sortedSalaryData = empSalary?.find((e) => e.em_no === data.em_no) //SALARY DATA
//                 // console.log("data", data);

//                 const shiftMergedPunchMaster = {
//                     ...data,
//                     shft_chkin_start: sortedShiftData?.shft_chkin_start,
//                     shft_chkin_end: sortedShiftData?.shft_chkin_end,
//                     shft_chkout_start: sortedShiftData?.shft_chkout_start,
//                     shft_chkout_end: sortedShiftData?.shft_chkout_end,
//                     shft_cross_day: sortedShiftData?.shft_cross_day,
//                     shft_duty_day: sortedShiftData?.shft_duty_day,
//                     gross_salary: sortedSalaryData?.gross_salary,
//                     earlyGoingMaxIntervl: cmmn_early_out,
//                     gracePeriodInTime: cmmn_grace_period,
//                     maximumLateInTime: cmmn_late_in,
//                     salaryLimit: salary_above,
//                     woff: week_off_day,
//                     naShift: notapplicable_shift,
//                     defaultShift: default_shift,
//                     noff: noff,
//                     holidayStatus: sortedShiftData?.holiday_status,
//                     break_shift_status: sortedShiftData?.break_shift_status,
//                     first_half_in: sortedShiftData?.first_half_in,
//                     first_half_out: sortedShiftData?.first_half_out,
//                     second_half_in: sortedShiftData?.second_half_in,
//                     second_half_out: sortedShiftData?.second_half_out,
//                     //noff
//                     shft_slno: sortedShiftData?.shft_slno,
//                     noff_min_days: sortedShiftData?.noff_min_days,
//                     night_off_flag: sortedShiftData?.night_off_flag,
//                     noff_selct_day_count: noff_selct_day_count
//                 }
//                 const employeeBasedPunchData = punchaData?.filter((e) => e.emp_code == data.em_no)
//                 // console.log("shiftMergedPunchMaster", shiftMergedPunchMaster);

//                 //FUNCTION FOR MAPPING THE PUNCH IN AND OUT
//                 // return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
//                 if (shiftMergedPunchMaster?.break_shift_status === 1) {
//                     return await BreakDutypunchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)
//                 }
//                 else {
//                     return await punchInOutMapping(shiftMergedPunchMaster, employeeBasedPunchData)

//                 }
//             })
//         ).then((data) => {
//             //console.log('data', data);
//             const punchMasterMappedData = data?.map((e) => e.value)

//             // console.log("punchMasterMappedData", punchMasterMappedData);

//             // console.log(punchMasterMappedData?.filter((e) => e.em_no === 4516))
//             return Promise.allSettled(
//                 punchMasterMappedData?.map(async (val) => {
//                     // console.log(val);

//                     const holidayStatus = val.holiday_status;
//                     const punch_In = val.punch_in === null ? null : new Date(val.punch_in);
//                     const punch_out = val.punch_out === null ? null : new Date(val.punch_out);

//                     const shift_in = new Date(val.shift_in);
//                     const shift_out = new Date(val.shift_out);

//                     //SALARY LINMIT
//                     const salaryLimit = val.gross_salary > val.salaryLimit ? true : false;

//                     const shft_duty_day = val.shft_duty_day;
//                     const duty_day = val.duty_day;
//                     //break duty

//                     const break_shift_status = val.break_shift_status;

//                     //emp punch
//                     const break_first_punch_in = val.break_first_punch_in;
//                     const break_first_punch_out = val.break_first_punch_out;
//                     const break_second_punch_in = val.break_second_punch_in;
//                     const break_second_punch_out = val.break_second_punch_out;

//                     //shift details
//                     const first_shift_in = `${format(new Date(val.first_shift_in), 'yyyy-MM-dd HH:mm')} `
//                     const first_shift_out = `${format(new Date(val.first_shift_out), 'yyyy-MM-dd HH:mm')} `
//                     const second_shift_in = `${format(new Date(val.second_shift_in), 'yyyy-MM-dd HH:mm')} `
//                     const second_shift_out = `${format(new Date(val.second_shift_out), 'yyyy-MM-dd HH:mm')} `
//                     //Noff
//                     const shft_slno = val.shft_slno
//                     const noff_min_days = val.noff_min_days
//                     const night_off_flag = val.night_off_flag
//                     const noff_selct_day_count = val.noff_selct_day_count
//                     const noff_updation_status = val.noff_updation_status
//                     // console.log(noff_updation_status);

//                     if (break_shift_status === 1) {
//                         const getBreakDutyLateInTime = await getBreakDutyLateInTimeIntervel(first_shift_in, first_shift_out, second_shift_in, second_shift_out, break_first_punch_in, break_first_punch_out, break_second_punch_in, break_second_punch_out, break_shift_status, duty_day)
//                         const getAttendanceStatus = await getAttendanceCalculation(
//                             punch_In,
//                             shift_in,
//                             punch_out,
//                             shift_out,
//                             cmmn_grace_period,
//                             getBreakDutyLateInTime,
//                             holidayStatus,
//                             val.shift_id,
//                             val.defaultShift,
//                             val.naShift,
//                             val.noff,
//                             val.woff,
//                             salaryLimit,
//                             val.maximumLateInTime,
//                             shft_duty_day,
//                             break_shift_status,
//                             break_first_punch_in,
//                             break_first_punch_out,
//                             break_second_punch_in,
//                             break_second_punch_out,
//                             first_shift_in,
//                             first_shift_out,
//                             second_shift_in,
//                             second_shift_out,
//                             duty_day,
//                             shft_slno,
//                             noff_min_days,
//                             night_off_flag,
//                             noff_selct_day_count,
//                             noff_updation_status
//                         )
//                         return {
//                             punch_slno: val.punch_slno,
//                             punch_in: val.break_first_punch_in,
//                             punch_out: val.break_second_punch_out,
//                             hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.hrsWorked,
//                             late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.lateIn,
//                             early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getBreakDutyLateInTime?.earlyOut,
//                             duty_status: getAttendanceStatus?.duty_status,
//                             holiday_status: val.holiday_status,
//                             leave_status: val.leave_status,
//                             lvereq_desc: getAttendanceStatus?.lvereq_desc,
//                             duty_desc: getAttendanceStatus?.duty_desc,
//                             lve_tble_updation_flag: val.lve_tble_updation_flag,
//                             shft_duty_day: val.shft_duty_day,
//                             shft_slno: shft_slno,
//                             noff_min_days: noff_min_days !== 0 ? noff_min_days : 0,
//                             night_off_flag: night_off_flag !== 0 ? night_off_flag : 0,
//                             noff_selct_day_count: noff_selct_day_count !== 0 ? noff_selct_day_count : 0,
//                             noff_updation_status: noff_updation_status
//                         }
//                     }
//                     else {
//                         const getLateInTime = await getLateInTimeIntervel(punch_In, shift_in, punch_out, shift_out)

//                         const getAttendanceStatus = await getAttendanceCalculation(
//                             punch_In,
//                             shift_in,
//                             punch_out,
//                             shift_out,
//                             cmmn_grace_period,
//                             getLateInTime,
//                             holidayStatus,
//                             val.shift_id,
//                             val.defaultShift,
//                             val.naShift,
//                             val.noff,
//                             val.woff,
//                             salaryLimit,
//                             val.maximumLateInTime,
//                             shft_duty_day,
//                             break_shift_status,
//                             break_first_punch_in,
//                             break_first_punch_out,
//                             break_second_punch_in,
//                             break_second_punch_out,
//                             first_shift_in,
//                             first_shift_out,
//                             second_shift_in,
//                             second_shift_out,
//                             duty_day,
//                             shft_slno,
//                             noff_min_days,
//                             night_off_flag,
//                             noff_selct_day_count,
//                             noff_updation_status
//                         )

//                         return {
//                             punch_slno: val.punch_slno,
//                             punch_in: val.punch_in,
//                             punch_out: val.punch_out,
//                             hrs_worked: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.hrsWorked,
//                             late_in: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.lateIn,
//                             early_out: (val.shift_id === week_off_day || val.shift_id === noff || val.shift_id === notapplicable_shift || val.shift_id === default_shift) ? 0 : getLateInTime?.earlyOut,
//                             duty_status: getAttendanceStatus?.duty_status,
//                             holiday_status: val.holiday_status,
//                             leave_status: val.leave_status,
//                             lvereq_desc: getAttendanceStatus?.lvereq_desc,
//                             duty_desc: getAttendanceStatus?.duty_desc,
//                             lve_tble_updation_flag: val.lve_tble_updation_flag,
//                             shft_duty_day: val.shft_duty_day,
//                             shft_slno: shft_slno,
//                             noff_min_days: noff_min_days !== 0 ? noff_min_days : 0,
//                             night_off_flag: night_off_flag !== 0 ? night_off_flag : 0,
//                             noff_selct_day_count: noff_selct_day_count !== 0 ? noff_selct_day_count : 0,
//                             noff_updation_status: noff_updation_status
//                         }
//                     }

//                 })
//             ).then(async (element) => {
//                 // REMOVE LEAVE REQUESTED DATA FROM THIS DATA
//                 const elementValue = element?.map((e) => e.value);
//                 // console.log(element);

//                 // console.log(element?.map((e) => e.value));

//                 const processedData = elementValue?.filter((v) => v.lve_tble_updation_flag === 0)
//                 const punchMaterDataBasedOnPunchSlno = processedData?.map((e) => e.punch_slno)

//                 // console.log(elementValue);

//                 // console.log(previous_punch_data)
//                 // const elementValues = previous_punch_data?.map((e) => e.value);
//                 // const previousPunchDatas = previous_punch_data?.filter((v) => v.lve_tble_updation_flag === 0)
//                 // console.log("previousPunchDatas", previousPunchDatas);
//                 // console.log("processedData", processedData);
//                 // PUNCH MASTER UPDATION
//                 // console.log(processedData?.filter(e => e.em_no === 4516))
//                 // console.log(processedData?.filter(e => e.em_no === 13802))
//                 // console.log(planData?.filter(e => e.em_no === 13802))
//                 // const a = planData?.filter(e => e.em_no === 13802)
//                 // console.log(planData);

//                 const filterAndAdditionPlanData = await planData?.map((el) => {
//                     return {
//                         ...el,
//                         duty_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc, // filter and update deuty_desc
//                         lvereq_desc: processedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc // same as updation in lvereq_desc
//                     }
//                 })
//                 // console.log("processedData", processedData);

//                 //noff
//                 // const combinedData = [...previousPunchDatas, ...processedData];

//                 // console.log("prevDutyplan", prevDutyplan);

//                 // const filterAndAdditionPlanDataforNoff = await prevDutyplan?.map((el) => {
//                 //     // console.log("el", el);

//                 //     return {
//                 //         ...el,
//                 //         duty_desc: combinedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc, // filter and update deuty_desc
//                 //         lvereq_desc: combinedData?.find((e) => e.punch_slno === el.punch_slno)?.duty_desc ?? el.duty_desc // same as updation in lvereq_desc
//                 //     }
//                 // })

//                 /**** CALCUALETE HOLIDAY CHEKING AND WEEKLY OFF CHECKING *****/

//                 //FILTER EMPLOYEE NUMBER FROM PUNCHMASTER DATA
//                 const filteredEmNoFromPunMast = [...new Set(filterAndAdditionPlanData?.map((e) => e.em_no))];

//                 // const filteredEmNoFromPunMastForNoff = [...new Set(filterAndAdditionPlanDataforNoff?.map((e) => e.em_no))];


//                 // console.log("filteredEmNoFromPunMastForNoff", filteredEmNoFromPunMastForNoff);

//                 const punchMasterFilterData = filteredEmNoFromPunMast?.map((emno) => {
//                     return {
//                         em_no: emno,
//                         data: filterAndAdditionPlanData?.filter((l) => l.em_no === emno)?.sort((a, b) => b.duty_day - a.duty_day)
//                     }
//                 })

//                 // const punchMasterFilterDataForNoff = filteredEmNoFromPunMastForNoff?.map((emno) => {
//                 //     return {
//                 //         em_no: emno,
//                 //         data: filterAndAdditionPlanDataforNoff?.filter((l) => l.em_no === emno)?.sort((a, b) => b.duty_day - a.duty_day)
//                 //     }
//                 // })
//                 // console.log("punchMasterFilterDataForNoff", punchMasterFilterDataForNoff);

//                 // CALCULATION BASED ON WEEEK OF AND HOLIDAY
//                 return Promise.allSettled(
//                     punchMasterFilterData?.flatMap((ele) => {

//                         return ele?.data?.map(async (e, idx, array) => {
//                             let weekDayStat = e.duty_desc === 'WOFF' ? await weekOffStatus(e, idx, array, weekoff_policy_max_count, weekoff_policy_min_count, fromDate) : e.duty_desc;

//                             return {
//                                 ...e,
//                                 lvereq_desc: e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc,
//                                 duty_desc: e.duty_desc === 'WOFF' ? weekDayStat : e.duty_desc
//                             }
//                         })
//                     })
//                 ).then(async (results) => {
//                     const arr = punchMasterFilterData.map(filterObj => {
//                         let key = filterObj.em_no;
//                         // console.log(results);

//                         return {
//                             em_no: key,
//                             data: results.filter(obj => obj.value.em_no === key)?.map((e) => e.value)
//                         }
//                     });

//                     return Promise.allSettled(
//                         arr?.flatMap((ele) => {
//                             return ele?.data?.map(async (e, idx, array) => {
//                                 let holidayStat = e.duty_desc === 'H' ? await holidayStatus(e, array, holiday_policy_count) : e.duty_desc;

//                                 return {
//                                     ...e,
//                                     lvereq_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc,
//                                     duty_desc: e.duty_desc === 'H' ? holidayStat : e.duty_desc

//                                 }
//                             })
//                         })

//                     ).then(async (results) => {
//                         if (results.length !== 0) {
//                             const arr = punchMasterFilterData.map(filterObj => {
//                                 let key = filterObj.em_no;
//                                 return {
//                                     em_no: key,
//                                     data: results.filter(obj => obj.value.em_no === key)?.map((e) => e.value)
//                                 }
//                             });

//                             // return Promise.allSettled(
//                             //     arr?.flatMap((ele) => {
//                             //         return ele?.data?.map(async (e, idx) => {
//                             //             // console.log(arr);
//                             //             let NoffStatus = e.duty_desc === 'NOFF' && e.lve_tble_updation_flag !== 1 ? await NOffStatus(e, idx, noff_selct_day_count, punchMasterFilterDataForNoff, fromDate) : e.duty_desc;
//                             //             // console.log(e.duty_day, e.duty_desc, NoffStatus);
//                             //             // console.log(e.em_no, e.duty_day, NoffStatus);

//                             //             return {
//                             //                 ...e,
//                             //                 lvereq_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                             //                 duty_desc: e.duty_desc === 'NOFF' ? NoffStatus : e.duty_desc,
//                             //                 lve_tble_updation_flag: NoffStatus === 'NOFF' ? 1 : 0

//                             //             }
//                             //         })
//                             //     })
//                             // )
//                         }


//                     }).then(async (results) => {
//                         console.log("results", results);

//                         // const PunchMAsterPolicyBasedFilterResult = results?.map((e) => e.value)
//                         // // console.log(PunchMAsterPolicyBasedFilterResult)
//                         // // console.log(punchMaterDataBasedOnPunchSlno)
//                         // const processedPostData = PunchMAsterPolicyBasedFilterResult?.filter((e) => punchMaterDataBasedOnPunchSlno?.some((el) => el === e.punch_slno))
//                         // // console.log("processedPostData", processedPostData);

//                         // // console.log(processedPostData?.filter(e => e.em_no === 4516))
//                         // const updatePunchMaster = await axioslogin.post("/attendCal/updatePunchMaster/", processedPostData);
//                         // const { success, message } = updatePunchMaster.data;
//                         // if (success === 1) {
//                         //     // PUNCH MARKING HR TABLE UPDATION
//                         //     // console.log(postData_getPunchData)
//                         //     const updatePunchMarkingHR = await axioslogin.post("/attendCal/updatePunchMarkingHR/", postData_getPunchData);
//                         //     const { sus } = updatePunchMarkingHR.data;
//                         //     // if (sus === 1) {
//                         //     //     // DUTY PLAN UPDATION
//                         //     //     const updateDutyPlanTable = await axioslogin.post("/attendCal/updateDutyPlanTable/", dutyPlanSlno);
//                         //     //     const { susc, message } = updateDutyPlanTable.data;
//                         //     //     if (susc === 1) {
//                         //     //         return { status: 1, message: "Punch Master Updated SuccessFully", errorMessage: '', dta: postData_getPunchData }
//                         //     //     } else {
//                         //     //         return { status: 0, message: "Error Updating Duty Plan ! contact IT", errorMessage: message }
//                         //     //     }
//                         //     // } else {
//                         //     //     return { status: 0, message: "Error Updating PunchMaster HR  ! contact IT", errorMessage: message }
//                         //     // }
//                         // } else {
//                         //     return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: message }
//                         // }

//                     }).catch((error) => {
//                         return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: error } // if no return all updation
//                     })

//                 })
//                 // return { status: 1, message: "result", data: e }
//             })
//         }).catch((error) => {
//             return { status: 0, message: "Error Processing and Updating Punch Master ! contact IT", errorMessage: error } // if no return all updation
//         })



//         //     } else {
//         //         return { status: 0, message: "Punch Master Data Not Found ! contact IT", errorMessage: '' }
//         //     }
//         // } else {
//         //     return { status: 0, message: "Duty Plan Not Done! contact IT", errorMessage: '' }
//         // }


//     } catch (error) {
//         return { status: 0, message: "Duty Plan Not Done! Contact IT", errorMessage: error.message, punchMastData: [] };
//     }
// }