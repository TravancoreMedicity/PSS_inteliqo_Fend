export const Actiontypes = {
    FETCH_LOGIN_CRED: "FETCH_LOGIN_CRED",
    APP_SIDEBAR_SHOW: "set",
    FETCH_EMP_PROFILE_DATA: "FETCH_EMP_PROFILE_DATA",

    //For the each employee prifile listing in the employee record list
    FETCH_ACADEMIC_DATA: "FETCH_ACADEMIC_DATA",
    FETCH_EXPERIENCE_DATA: "FETCH_EXPERIENCE_DATA",
    FETCH_WAGE_DATA: "FETCH_WAGE_DATA",
    FETCH_LEAVE_DATA: "FETCH_LEAVE_DATA",
    FETCH_EMP_PERSONAL_INFOM: "FETCH_EMP_PERSONAL_INFOM",
    FETCH_DEPT_SHIFT_DATA: "FETCH_DEPT_SHIFT_DATA",
    FETCH_EMP_LEAVE_LIST: "FETCH_EMP_LEAVE_LIST",
    FETCH_DEPARTMENT_LIST: "FETCH_DEPARTMENT_LIST",//department list dropdown
    FETCH_DEPARTSEC_LIST: "FETCH_DEPARTSEC_LIST",//dept section list dropdown
    FETCH_LEAVE_AVAIL_LIST: "FETCH_LEAVE_AVAIL_LIST",
    FETCH_NOTIFYDETL: "FETCH_NOTIFYDETL",

    //For the employee record list in the Employee File From
    FETCH_EMP_RECORD_LIST: "FETCH_EMP_RECORD_LIST",

    //for getting employee details in duty plan
    FETCH_EMP_DETAILS: "FETCH_EMP_DETAILS",
    FETCH_ALERT_MESSAGE: "FETCH_ALERT_MESSAGE",
    FETCH_EMP_MESSAGE: "FETCH_EMP_MESSAGE",
    FETCH_ANNOUNCEMENT_MESSAGE: "FETCH_ANNOUNCEMENT_MESSAGE",
    GET_MODULE_RIGHTS: "GET_MODULE_RIGHTS",
    FETCH_EMP_LEAVE_PROCESS_DETL: "FETCH_EMP_LEAVE_PROCESS_DETL",
    FETCH_EMP_LEAVE_PROCESS_DETL_DEFAULT: "FETCH_EMP_LEAVE_PROCESS_DETL_DEFAULT",
    FETCH_REGION_DATA: "FETCH_REGION_DATA",
    FETCH_PROFFESSIONAL_TAX: "FETCH_PROFFESSIONAL_TAX",
    FETCH_JOB_DESCRIPTION: "FETCH_JOB_DESCRIPTION",
    //for getting employee bloodgroup
    FETCH_EMP_BLOODGROUP: "FETCH_EMP_BLOODGROUP ",
    FETCH_EMP_DEPTSECT: "FETCH_EMP_DEPTSECT ",
    //for getting employee district wise region
    FETCH_EMP_DISTREGION: "FETCH_EMP_DISTREGION",
    //to get employee district
    FETCH_EMP_DISTRICT: "FETCH_EMP_DISTRICT",
    //to get employee name
    FETCH_EMP_NAME: "FETCH_EMP_NAME",
    //to get employee religion
    FETCH_EMP_RELIGION: "FETCH_EMP_RELIGION",
    FETCH_CHANGE_STATE: "FETCH_CHANGE_STATE",
    FETCH_CONTRACT_DETL: "FETCH_CONTRACT_DETL",
    FETCH_SALARY_DETL: "FETCH_SALARY_DETL",
    // to get employee institution type
    FETCH_EMP_INSTITUTION: "FETCH_EMP_INSTITUTION",
    FETCH_EMP_CATEGORY: "FETCH_EMP_CATEGORY",
    FETCH_EMP_DESIGNATION: "FETCH_EMP_DESIGNATION",
    FETCH_EMP_EDUCATION: "FETCH_EMP_EDUCATION",
    FETCH_EMP_COURSE: "FETCH_EMP_COURSE",
    FETCH_EMP_SPECILIZATION: "FETCH_EMP_SPECILIZATION",

    // Dash Board Alert Reducer
    FETCH_RESIGN_COUNT: "FETCH_RESIGN_COUNT",
    FETCH_CONTRACT_CLOSE: "FETCH_CONTRACT_CLOSE",
    FETCH_OVERTIME_COUNT: "FETCH_OVERTIME_COUNT",
    FETCH_OVERTIME_INCHARGE: "FETCH_OVERTIME_INCHARGE",
    FETCH_OVERTIME_COUNT_HOD: "FETCH_OVERTIME_COUNT_HOD",
    FETCH_OVERTIME_COUNT_CEO: "FETCH_OVERTIME_COUNT_CEO",
    FETCH_OVERTIME_COUNT_USER: "FETCH_OVERTIME_COUNT_USER",
    FETCH_LEAVE_REQ_COUNT_INCHARGE: "FETCH_LEAVE_REQ_COUNT_INCHARGE",
    FETCH_LEAVE_REQ_COUNT_HOD: "FETCH_LEAVE_REQ_COUNT_HOD",
    FETCH_LEAVE_REQ_COUNT_CEO: "FETCH_LEAVE_REQ_COUNT_CEO",
    FETCH_GET_LEAVE_REQ_COUNT_HR: "FETCH_GET_LEAVE_REQ_COUNT_HR",
    FETCH_LEAVE_REQ_COUNT_USER: "FETCH_LEAVE_REQ_COUNT_USER",
    FETCH_RESIGN_REQ_COUNT_INCHARGE: "FETCH_RESIGN_REQ_COUNT_INCHARGE",
    FETCH_RESIGN_REQ_COUNT_HOD: "FETCH_RESIGN_REQ_COUNT_HOD",
    FETCH_RESIGN_REQ_COUNT_CEO: "FETCH_RESIGN_REQ_COUNT_CEO",
    FETCH_CONTRACT_RENEW_COUNT: "FETCH_CONTRACT_RENEW_COUNT",
    FETCH_TRAIN_COUNT: "FETCH_TRAIN_COUNT",
    FETCH_REGISTER_RENEW: "FETCH_REGISTER_RENEW",
    FETCH_EMP_ACTIVECOUNT: "FETCH_EMP_ACTIVECOUNT",
    FETCH_EMP_PUNCHCOUNT: "FETCH_EMP_PUNCHCOUNT",
    FETCH_PROBATION: "FETCH_PROBATION",
    FETCH_ANNUAL: "FETCH_ANNUAL",

    //employee registration type
    FETCH_EMP_REGISTRATION_TYPE: "FETCH_EMP_REGISTRATION_TYPE",
    FETCH_EMP_BRANCH: "FETCH_EMP_BRANCH",
    FETCH_EMP_SUBSECTION: "FETCH_EMP_SUBSECTION",
    FETCH_EMP_SECTIONTYPE: "FETCH_EMP_SECTIONTYPE",
    FETCH_EMP_TRAININPROBA: "FETCH_EMP_TRAININPROBA",

    //MENU LIST SLNO TYPE
    FETCH_EMP_MENU_SLNO: "FETCH_EMP_MENU_SLNO",

    FETCH_EMP_BIRTHDAY: "FETCH_EMP_BIRTHDAY",
    FETCH_GRADE_LIST: "FETCH_GRADE_LIST",
    FETCH_HOD_INCHARGE: "FETCH_HOD_INCHARGE",

    FETCH_CONTRACT_CLOSE_DATA: "FETCH_CONTRACT_CLOSE_DATA",
    FETCH_CONT_CLOSE_ATTENDANCE: "FETCH_CONT_CLOSE_ATTENDANCE",
    FETCH_CONTRACT_ARREAR: "FETCH_CONTRACT_ARREAR",
    FETCH_OLD_DATA_TO_COPY: "FETCH_OLD_DATA_TO_COPY",
    FETCH_OLD_PERSONAL_DATA: "FETCH_OLD_PERSONAL_DATA",
    FETCH_OLD_QUALIFICATION: "FETCH_OLD_QUALIFICATION",
    FETCH_OLD_EXPERIENCE: "FETCH_OLD_EXPERIENCE",
    FETCH_OLD_SALARYINFORM: "FETCH_OLD_SALARYINFORM",
    FETCH_EMP_USERRIGHTS: "FETCH_EMP_USERRIGHTS",
    FETCH_HIGHLEVEL_DATA: "FETCH_HIGHLEVEL_DATA",
    FETCH_DEPARTMENT: "FETCH_DEPARTMENT",
    //FOR SET  THE NEW CATGEOTY FROM CONTR-RENEW FORM
    FETCH_NEW_CATEGORY: "FETCH_NEW_CATEGORY",
    FETCH_NEW_CAT: "FETCH_NEW_CAT",
    //FOR GETTING DEPARTMENT WISE DEPARTMENT SECTION
    FETCH_DEPARTMENTSECTION: "FETCH_DEPARTMENTSECTION",

    //for getting shift hours from databse
    FETCH_SHIFT_DATA: "FETCH_SHIFT_DATA",

    //for getting the Common Settig 
    FETCH_COMMON_SETTING: "FETCH_COMMON_SETTING",
    //FETCH_LEAVES TABLE DATA 
    FETCH_CASUAL_LEAVE_DATA: "FETCH_CASUAL_LEAVE_DATA",
    //for job Description details
    FETCH_JOB_SUMMARY: "FETCH_JOB_SUMMARY",
    FETCH_JOB_DUTIES: "FETCH_JOB_DUTIES",
    FETCH_JOB_PERFORMANCE: "FETCH_JOB_PERFORMANCE",
    FETCH_JOB_COMPETENCY: "FETCH_JOB_COMPETENCY",
    FETCH_JOB_GENERIC: "FETCH_JOB_GENERIC",
    FETCH_JOB_QUALIFICATION: "FETCH_JOB_QUALIFICATION",

    FETCH_HOLIDAY_LIST: "FETCH_HOLIDAY_LIST",
    FETCH_COMMON__LIST: "FETCH_COMMON_LIST",

    FETCH_HOLIDAY_LEAVE_LIST: "FETCH_HOLIDAY_LEAVE_LIST",
    FETCH_COMMON_LEAVE_LIST: "FETCH_COMMON_LEAVE_LIST",
    FETCH_CASUAL_LEAVE_LIST: "FETCH_CASUAL_LEAVE_LIST",
    FETCH_PRIVILEGE_LEAVE_LIST: "FETCH_PRIVILEGE_LEAVE_LIST",
    FETCH_CARRY_FORWARD_LEAVE_LIST: "FETCH_CARRY_FORWARD_LEAVE_LIST",
    FETCH_CREDIT_LEAVE_LIST: "FETCH_CREDIT_LEAVE_LIST",


    UPDATE_CASUAL_LEAVE: "UPDATE_CASUAL_LEAVE",

    FETCH_CONTRACT_APPRAISAL: "FETCH_CONTRACT_APPRAISAL",
    GET_SHIFT_PLAN_DETL: "GET_SHIFT_PLAN_DETL",
    GET_SHIFT_DATE_FORMAT: "GET_SHIFT_DATE_FORMAT",
    FETCH_UPDATED_SHIFT_ID: "FETCH_UPDATED_SHIFT_ID",
    FETCH_UPDATED_PLAN: "FETCH_UPDATED_PLAN",
    FETCH_HOD_INCAHRGE_SECTION: "FETCH_HOD_INCAHRGE_SECTION",
    FETCH_HOD_INCAHRGE_SECT_EMP_NAME: "FETCH_HOD_INCAHRGE_SECT_EMP_NAME",
    FETCH_LEAVE_REQUEST: "FETCH_LEAVE_REQUEST",
    FETCH_COMMON_LEAVES_DATA: "FETCH_COMMON_LEAVES_DATA",
    CHNAGE_REQ_LVE_TYPE: "CHNAGE_REQ_LVE_TYPE",
    FETCH_SINGLE_LEAVE_REQ_FORM_DATA: "FETCH_SINGLE_LEAVE_REQ_FORM_DATA",
    FETCH_EMPLOYEE_INFORMATION_FOR_LVE_REQ: "FETCH_EMPLOYEE_INFORMATION_FOR_LVE_REQ",
    LEAVE_REQ_DEFAULT: "LEAVE_REQ_DEFAULT",
    GET_EMPLOYEE_APPROVAL_LEVEL: "GET_EMPLOYEE_APPROVAL_LEVEL"
}