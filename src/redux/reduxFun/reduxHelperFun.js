import { endOfYear, format, subMonths } from "date-fns";

//SELECT ALL DEPARTMENT NAMES
export const getDepartmentAll = (state) => state?.getdept?.departmentlist; //dispatch(setDept())
//SELECT ALL DEPARTMENT SECTION NAME LIST
export const getDepartmentSectionAll = (state) => state?.getDeprtSection?.empDeptSectionList; //dispatch(setdeptSection())
//SELECT DEPARTMENT SECTION BASED ON DEPARTMENT ID // dispatch(setdeptSection())
export const getDepartmentSectBasedDeptID = (state, deptID) => {
    const departmentSectionAll = state?.getDeprtSection?.empDeptSectionList;
    return departmentSectionAll?.filter((e) => e.dept_id === deptID)
};
//get employee information ( em_no,em_id,group_id,hod,incharge) //setProfileData(empid)
export const getEmployeeInformationLimited = (state) => {
    const { hod, incharge, groupmenu, em_no, em_id, em_department, em_dept_section, dept_name, sect_name, em_name } = state?.getProfileData?.ProfileData[0];
    const empInform = { hod, incharge, groupmenu, em_no, em_id, em_department, em_dept_section, dept_name, sect_name, em_name }
    return empInform;
}

export const getCommonSettings = (state, menuno) => {
    const commonState = state?.getCommonSettings?.group_slno;
    const Obj = commonState !== undefined && JSON.parse(commonState);
    const result = Obj && Obj?.find((e) => e === menuno) === undefined ? false : true
    return result
}

export const findBalanceCommonLeveCount = (state) => {
    const commonLeaves = state?.getCreitedCommonLeave?.commonLerave;
    const findBalance = commonLeaves?.map((el) => {
        return {
            type: el.llvetype_slno,
            balance: el.cmn_lv_balance
        }
    })
    return findBalance
}



//GET AND FILTER ALL LEAVE AND CONVERT TO AN ARRAY
export const allLeavesConvertAnArray = (state) => {
    let creditedLeavesArray = {
        status: false,
        data: []
    }
    const casualLeaves = state?.getCreditedCasualLeave?.casualLeave;
    const earnLeaves = state?.getCreditedEarnLeave?.earnLeave;
    const compansatoryOff = state?.getCreitedCompansatoryOffLeave?.compansatory;
    const commonLeaves = state?.getCreitedCommonLeave?.commonLerave;

    // Push casual leaves to the array if available
    if (casualLeaves?.length > 0) {
        const newCasualLeavesAttay = casualLeaves?.map((e) => {
            let leveCount = e.cl_lv_taken === 0 ? 1 : e.cl_lv_taken;
            return {
                type: 'CL',
                name: 'Casual Leave',
                leavetype: 1,
                slno: e.hrm_cl_slno,
                month: e.cl_lv_mnth + '-' + leveCount,
                count: leveCount,
                lveRequest: e.hl_lv_tkn_status, // Leave requested status not approved status
                common_slno: 0,
                cmn: 0
            }
        })?.filter((e) => e.lveRequest === 0) //REQUESTED LEAVE STATUS CHANGED TO 1 AFTER APPROVAL IT BECOME 1
        creditedLeavesArray.data.push(...newCasualLeavesAttay)
    }

    // Push earned leaves to the array if available
    if (earnLeaves?.length > 0) {
        const newErnLeaves = earnLeaves?.map((e) => {
            let leveCount = e.ernlv_taken === 0 ? 1 : e.ernlv_taken;
            return {
                type: 'EL',
                name: 'Earn Leave',
                leavetype: 8,
                slno: e.hrm_ernlv_slno,
                month: e.ernlv_mnth + '-' + leveCount,
                count: leveCount,
                lveRequest: e.hl_lv_tkn_status, // Leave requested status not approved status
                common_slno: 0,
                cmn: 0
            }
        })?.filter((e) => e.lveRequest === 0) //REQUESTED LEAVE STATUS CHANGED TO 1 AFTER APPROVAL IT BECOME 1
        creditedLeavesArray.data.push(...newErnLeaves)
    }

    // Push compensatory off leaves to the array if available
    if (compansatoryOff?.length > 0) {
        const newCompanSatoryLeaves = compansatoryOff?.map((e) => {
            return {
                type: 'CO',
                name: 'Compansatory Off',
                leavetype: 11,
                slno: e.hrm_calc_holiday,
                month: e.calculated_date,
                count: e.credited,
                taken: e.taken,
                credited: e.credited_date,
                remark: e.specail_remark,
                lveRequest: e.hl_lv_tkn_status, // Leave requested status not approved status,
                common_slno: 0,
                cmn: 0
            }
        })?.filter((e) => e.lveRequest === 0)//REQUESTED LEAVE STATUS CHANGED TO 1 AFTER APPROVAL IT BECOME 1
        creditedLeavesArray.data.push(...newCompanSatoryLeaves)
    }

    // Push common leaves to the array if available
    if (commonLeaves?.length > 0) {
        const findSickLeave = commonLeaves.find((e) => e.llvetype_slno === 7);
        if (findSickLeave !== undefined) {
            let count = findSickLeave.cmn_lv_balance;

            const integerPart = Math.floor(count);
            const fractionalPart = count - integerPart;
            const resultArray = Array(integerPart).fill(1);
            const sickLeave = fractionalPart > 0 ? [...resultArray, fractionalPart] : resultArray;

            const sickLeaveArray = sickLeave?.map((e, index) => {

                return {
                    type: 'SL',
                    name: 'Sick Leave',
                    leavetype: 7,
                    slno: index + 1,
                    month: format(subMonths(endOfYear(new Date()), index + 1), 'MMMM') + ' ' + e,
                    count: e,
                    taken: 0,
                    common_slno: findSickLeave?.hrm_lv_cmn,
                    cmn: 1
                }
            })
            creditedLeavesArray.data.push(...sickLeaveArray); // Push the newly created array to creditedLeavesArray
        }
    }

    if (commonLeaves?.length > 0) {
        const findSickLeave = commonLeaves.find((e) => e.llvetype_slno === 2);
        if (findSickLeave !== undefined) {
            const array = [{
                type: 'ML',
                name: 'Maternity Leave',
                leavetype: 2,
                slno: 1,
                month: `MATERNITY LEAVE`,
                count: findSickLeave?.cmn_lv_allowed,
                taken: findSickLeave?.cmn_lv_taken,
                common_slno: findSickLeave?.hrm_lv_cmn,
                cmn: 1
            }]

            creditedLeavesArray.data.push(...array); // Push the newly created array to creditedLeavesArray
        }
    }

    if (commonLeaves?.length > 0) {
        const findSickLeave = commonLeaves.find((e) => e.llvetype_slno === 5);
        if (findSickLeave !== undefined) {
            const array = [{
                type: 'LWP',
                name: 'LWP',
                leavetype: 5,
                slno: 1,
                month: `LWP`,
                count: findSickLeave?.cmn_lv_allowed,
                taken: findSickLeave?.cmn_lv_taken,
                common_slno: findSickLeave?.hrm_lv_cmn,
                cmn: 1
            }]

            creditedLeavesArray.data.push(...array); // Push the newly created array to creditedLeavesArray
        }
    }

    if (commonLeaves?.length > 0) {
        const findSickLeave = commonLeaves.find((e) => e.llvetype_slno === 6);
        if (findSickLeave !== undefined) {
            const array = [{
                type: 'ESI',
                name: 'ESI',
                leavetype: 6,
                slno: 1,
                month: `ESI`,
                count: findSickLeave?.cmn_lv_allowed,
                taken: findSickLeave?.cmn_lv_taken,
                common_slno: findSickLeave?.hrm_lv_cmn,
                cmn: 1
            }]

            creditedLeavesArray.data.push(...array); // Push the newly created array to creditedLeavesArray
        }
    }

    creditedLeavesArray.status = true
    // Return the array with all credited leaves
    return creditedLeavesArray;

}


// AANUAL LEAVES INFORMATIOM COUNT FOR SHOWING IN THE TABLE

export const getLeavesCountEMIDwise = (state) => state?.getPrifileDateEachEmp?.empLeaveData;

//GET SELECTED EMPLOYEE DATA FROM THE DATABASE 
export const getSelectedEmpInformation = (state) => state?.getEmployeeInformationState?.empData[0];

export const getCaualLeaveDetl = (state) => {
    const casualLeave = state?.getCreditedCasualLeave?.casualLeave;
    return casualLeave?.map((e) => {
        let leveCount = e.cl_lv_taken === 0 ? 1 : e.cl_lv_taken;
        return {
            slno: e.hrm_cl_slno,
            month: e.cl_lv_mnth + '-' + leveCount,
            count: leveCount,
            status: e.hl_lv_tkn_status
        }
    })?.filter(e => e.status === 0)
}


