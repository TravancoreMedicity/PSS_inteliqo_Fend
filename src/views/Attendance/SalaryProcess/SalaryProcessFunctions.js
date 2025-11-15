import { format, getDaysInMonth, startOfMonth } from "date-fns"
import { axioslogin } from "src/views/Axios/Axios"

export const getAllPunchmastData = async (postdata) => {
    let dataObj = { status: 0, data: [] }
    const result = await axioslogin.post("/payrollprocess/punchbiId", postdata);
    const { data, success } = result.data
    if (success === 1) {
        return { ...dataObj, status: 1, data: data }
    } else if (success === 0) {
        return { ...dataObj, status: 0, data: [] }
    }
    else {
        return { ...dataObj, status: 0, data: [] }
    }
}


export const attendnaceCountCalculationFunc = async (employeeData, data, value, commonSettings) => {

     const totalDays = getDaysInMonth(new Date(value))

     // Process and calculate attendance and salary details for each employee
    const finalDataArry = employeeData?.map((val) => {
      // Filter punch data specific to current employee
      const empwise = data?.filter((entry) => entry?.emp_id === val?.em_id)

      // Count half-day leaves (HD, CHD, EGHD)
      const totalHD =
        empwise?.filter((val) => ['HD', 'CHD', 'EGHD'].includes(val?.lvereq_desc))?.length || 0

      // Count extra night duties that are eligible for night-off
      const extranight =
        empwise?.filter(
          (val) =>
            val?.night_off_flag === 1 &&
            val?.shft_duty_day === 1 &&
            ['P', 'OHP', 'OBS', 'LC'].includes(val?.lvereq_desc),
        )?.length || 0

      // Count normal present days (non-night duties)
      const totalnormalpresent =
        empwise?.filter(
          (val) =>
            val?.night_off_flag === 0 &&
            val?.shft_duty_day === 1 &&
            ['P', 'OHP', 'OBS', 'LC'].includes(val?.lvereq_desc),
        )?.length || 0

      // Total present days = normal + extra night shifts
      const totalPresent = totalnormalpresent + extranight

      // Calculate eligible night-off count (if extra night > 8)
      const caluculatedEligibleNightoffCount = extranight > 8 ? (extranight - 8) * 0.5 : 0

      // DP (Double Present) counts
      const totalDp =
        empwise?.filter(
          (val) =>
            val?.lvereq_desc === 'DP' && val?.shft_duty_day === 2 && val?.night_off_flag === 0,
        )?.length || 0

      // DP with night off flag
      const noOFFDp =
        empwise?.filter(
          (val) =>
            val?.lvereq_desc === 'DP' && val?.shft_duty_day === 2 && val?.night_off_flag === 1,
        )?.length || 0

      // Days taken as day off (DOFF) or week off (WOFF)
      const takenDOFF = empwise?.filter((val) => val?.lvereq_desc === 'DOFF')?.length || 0
      const takenWOFF = empwise?.filter((val) => val?.lvereq_desc === 'WOFF')?.length || 0

      // Calculate eligible week off for normal duty based on present days
      const egWOFFforNormalduty =
        totalPresent >= 24
          ? commonSettings?.week_off_count
          : totalPresent >= 18
          ? commonSettings?.week_off_count - 1
          : totalPresent >= 12
          ? commonSettings?.week_off_count - 2
          : totalPresent >= 6
          ? commonSettings?.week_off_count - 3
          : 0

      // Calculate eligible week off for DP duty
      const egWOFFforDp =
        totalDp * 2 >= 24
          ? commonSettings?.week_off_count
          : totalDp * 2 >= 18
          ? commonSettings?.week_off_count - 1
          : totalDp * 2 >= 12
          ? commonSettings?.week_off_count - 2
          : totalDp * 2 >= 6
          ? commonSettings?.week_off_count - 3
          : 0

      // Total eligible week offs
      const totalEGWOFF = egWOFFforNormalduty + egWOFFforDp

      // Extra DOFFs remaining after taken ones
      const extraDp = (totalDp || noOFFDp) === takenDOFF ? 0 : (totalDp || noOFFDp) - takenDOFF

      // Calculate total payable days
      const presentDays =
        totalPresent +
        totalHD * 0.5 +
        totalDp +
        takenDOFF +
        takenWOFF +
        (totalEGWOFF - takenWOFF) +
        noOFFDp +
        caluculatedEligibleNightoffCount

      // Calculate Loss of Pay (LOP)
      const totallopCount = totalDays - presentDays

      // Salary calculations
      const onedaySalary = val?.gross_salary / totalDays
      const paydaySalary = (val?.gross_salary / totalDays) * presentDays

      // Return final computed data object for the employee
      return {
        em_no: val?.em_no,
        em_name: val?.em_name,
        branch_name: val?.branch_name,
        dept_name: val?.dept_name,
        sect_name: val?.sect_name,
        ecat_name: val?.ecat_name,
        inst_emp_type: val?.inst_emp_type,
        empSalary: val?.gross_salary,
        em_account_no: val?.em_account_no,
        em_ifsc: val.em_ifsc,
        totalDays,
        totallopCount,
        totalHD,

        elgibleWOFF: totalEGWOFF,
        takenWOFF: takenWOFF,
        remainingOff: totalEGWOFF - takenWOFF,

        totalDp: noOFFDp || totalDp,
        eligibledoff: noOFFDp || totalDp,
        takendoff: takenDOFF,
        remainingDoff: extraDp,

        paydays: presentDays,
        lopAmount: Math.round((onedaySalary * totallopCount) / 10) * 10,
        totalSalary: Math.round(paydaySalary / 10) * 10,
        branch_slno: val.branch_slno,
        category_slno: val.category_slno,
        dept_id: val.dept_id,
        desg_slno: val.desg_slno,
        em_id: val.em_id,
        inst_slno: val.inst_slno,
        sect_id: val.sect_id,
        processed_month: format(startOfMonth(new Date(value)), 'yyyy-MM-dd'),
      }
    })
    return { data: finalDataArry, status: 1 }
}