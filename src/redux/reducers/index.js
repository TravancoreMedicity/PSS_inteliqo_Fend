import { combineReducers } from 'redux';
import { changeState } from '../reducers/Layoutreducer'
import { getProfileData, getPrifileDateEachEmp } from '../reducers/ProfileDataReducer'
import { LoginCredential } from '../reducers/LoginReducer'
import { getEmployeeRecordList } from '../reducers/EmployeeRecod.reducer'
import { getDepartmentShiftData } from '../reducers/Departmentshift'
import { leavedata } from '../reducers/Leavereqdata'
import { getDepartmentList } from '../reducers/DepartmentReducer'
import { getDeprtSection } from '../reducers/DepartSecReducer'
import { getEmployeedetailsDutyplan } from '../reducers/EmployeeDetails'
import { getAlertList } from '../reducers/AlertReducres'
import { getMsgList } from '../reducers/MessageReducres'
import { getAnnouncementList } from '../reducers/AnnouncementReducers'
import { getModuleRightList } from '../reducers/GetModulerights'
import { getEmployeeProcessRecord } from './LeaveProcessDetl.reducer';
import { getRegionList } from '../reducers/RegionReducers'
import { getProTaxList } from '../reducers/ProffessionalTaxReducer'
import { changeStateAggrid } from '../reducers/StatechangeAgGrid'

const reducer = combineReducers({
    changeState,
    getProfileData,
    LoginCredential,
    getEmployeeRecordList,
    getPrifileDateEachEmp,
    getDepartmentShiftData,
    leavedata,
    getDepartmentList,
    getDeprtSection,
    getEmployeedetailsDutyplan,
    getAlertList,
    getMsgList,
    getAnnouncementList,
    getModuleRightList,
    getEmployeeProcessRecord,
    getRegionList,
    getProTaxList,
    changeStateAggrid
})

export default reducer;