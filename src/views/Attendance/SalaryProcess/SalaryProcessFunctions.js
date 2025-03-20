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

    const finalDataArry = employeeData?.map((val) => {
        const empwise = data.filter((value) => value.emp_id === val.em_id)
        const totalHD = (empwise?.filter(val => val.lvereq_desc === 'HD' || val.lvereq_desc === 'CHD' || val.lvereq_desc === 'EGHD')).length
        const totalWork = (empwise?.filter(val => val.lvereq_desc === 'P' || val.lvereq_desc === 'OHP' || val.lvereq_desc === 'OBS'
            || val.lvereq_desc === 'LC')).length
        const totalOff = (empwise?.filter(val => val.lvereq_desc === 'WOFF' || val.lvereq_desc === 'NOFF' || val.lvereq_desc === 'EOFF')).length

        const totalWOFF = (empwise?.filter(val => val.lvereq_desc === 'WOFF')).length
        const totalLWP = (empwise?.filter(val => val.lvereq_desc === 'LWP')).length

        const totalDp = (empwise?.filter(val => val.lvereq_desc === 'DP')).length
        const totaldpOff = (empwise?.filter(val => val.lvereq_desc === 'DOFF')).length

        const onedaySalary = val.gross_salary / getDaysInMonth(new Date(value))

        const extraDp = totalDp === totaldpOff ? 0 : totalDp - totaldpOff;

        const totalDays = getDaysInMonth(new Date(value))
        const presentDays = totalWork + (totalHD * 0.5) + totalOff + (totalDp * 2)
        const totallopCount = getDaysInMonth(new Date(value)) - presentDays;
        const paydaySalary = (val.gross_salary / totalDays) * presentDays

        const egWOFF = presentDays >= 24 ? commonSettings?.week_off_count :
            presentDays < 24 && presentDays >= 18 ? commonSettings?.week_off_count - 1 :
                presentDays < 18 && presentDays >= 12 ? commonSettings?.week_off_count - 2 :
                    presentDays < 12 && presentDays >= 6 ? commonSettings?.week_off_count - 3 : 0

        return {
            em_no: val.em_no,
            em_name: val.em_name,
            branch_name: val.branch_name,
            dept_name: val.dept_name,
            sect_name: val.sect_name,
            ecat_name: val.ecat_name,
            desg_name: val.desg_name,
            inst_emp_type: val.inst_emp_type,
            empSalary: val.gross_salary,
            em_account_no: val.em_account_no,
            em_ifsc: val.em_ifsc,
            totalDays: getDaysInMonth(new Date(value)),
            totalLWP: totalLWP,
            totallopCount: presentDays === 0 ? getDaysInMonth(new Date(value)) : totallopCount,
            totalHD: totalHD,
            elgibleWOFF: egWOFF,
            takenWOFF: totalWOFF,
            remainingOff: egWOFF - totalWOFF,
            totalDp: totalDp,
            eligibledoff: totalDp,
            takendoff: totaldpOff,
            remainingDoff: extraDp,
            paydays: presentDays,
            lopAmount: Math.round(onedaySalary * totallopCount),
            totalSalary: paydaySalary < 0 ? 0 : Math.round(paydaySalary),
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