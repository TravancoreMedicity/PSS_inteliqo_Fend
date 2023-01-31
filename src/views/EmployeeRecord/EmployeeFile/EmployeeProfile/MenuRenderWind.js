import { CircularProgress } from '@mui/material'
import React, { Fragment, memo, Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify';
import SessionCheck from 'src/views/Axios/SessionCheck';
import _ from 'underscore';


const ProfileMenus = React.lazy(() => import('./EmpMenus/Profile/ProfileMenus'));
const PersonalInformation = React.lazy(() => import('./EmpMenus/PersonalInformation/PersonalInfrom'));
const Qualification = React.lazy(() => import('./EmpMenus/Qualification/QualificationDetails'))
const Experience = React.lazy(() => import('./EmpMenus/Experience/ExperienceDetails'))
const Statutory = React.lazy(() => import('./EmpMenus/Statutory/StatutoryInformation'))
const CompanyInformation = React.lazy(() => import('./EmpMenus/CompanyInformation/CompanyInformtion'))
const FineorDeduction = React.lazy(() => import('./EmpMenus/FineorDeduction/FineorDeduction'))
const EarnDeductionDetails = React.lazy(() => import('./EmpMenus/EarnDeductionDetails/EarnDeductionDetails'))
//const ContractInformation = React.lazy(() => import('src/views/EmployeeRecord/EmployeeFile/ContractInformation'))
const SalaryInformation = React.lazy(() => import('./EmpMenus/SalaryInformation/SalaryInformationDetail'))
const AnnualLeave = React.lazy(() => import('./EmpMenus/AnnualLeaveInformation/AnnualLeaveInformation'))
const SalaryIncrement = React.lazy(() => import('./EmpMenus/SalaryIncrementProcess/SalaryIncrementProcess'))
const JobDescription = React.lazy(() => import('src/views/EmployeeRecord/EmployeeFile/JobDescriptionEmployee'))
const ContrtInfrmtion = React.lazy(() => import('./EmpMenus/ContractInformation/ContractInformation'))
const JobDcrptn = React.lazy(() => import('./EmpMenus/JobDescription/JobDescriptionList'))
const DocumentList = React.lazy(() => import('./EmpMenus/DocumentScanned/ScannedDoc'));
const DocumentCheckList = React.lazy(() => import('./EmpMenus/DocumentChecklist/DocumentChecklist'))
const Vaccine = React.lazy(() => import('./EmpMenus/VaccinationInformation/VaccinationInformation'))
const EndofService = React.lazy(() => import('./EmpMenus/EndofService/EndofService'))
const TrainingInfo = React.lazy(() => import('./EmpMenus/TrainingInformation/TrainingInformation'))
const LeaveProcess = React.lazy(() => import('./EmpMenus/LeaveProcess/LeaveProcessMainCard'))


const MenuRenderWind = ({ slno, count, setCount, redirect }) => {
    const state = useSelector((state) => state.getMenuRenderCompRights.slno, _.isEqual)
    const displayComp = (state) => {
        return state === 105 ? <PersonalInformation /> :
            state === 106 ? <Qualification /> :
                state === 107 ? <Experience /> :
                    state === 108 ? <Statutory /> :
                        state === 109 ? <ContrtInfrmtion /> :
                            state === 110 ? <CompanyInformation /> :
                                state === 111 ? <EarnDeductionDetails /> :
                                    state === 112 ? <SalaryInformation /> :
                                        state === 113 ? <AnnualLeave /> :
                                            state === 103 ? <LeaveProcess /> :
                                                state === 114 ? <FineorDeduction /> :
                                                    state === 115 ? <SalaryIncrement /> :
                                                        state === 116 ? <DocumentList /> :
                                                            state === 117 ? <Vaccine /> :
                                                                state === 118 ? <TrainingInfo /> :
                                                                    state === 119 ? <JobDcrptn /> :
                                                                        state === 120 ? <EndofService /> :
                                                                            <ProfileMenus slno={slno} count={count} setCount={setCount} redirect={redirect} />
        //state === 104 ? < ProfileMenus slno={slno} count={count} setCount={setCount} redirect={redirect} /> : null
        //< ProfileMenus slno={slno} count={count} setCount={setCount} redirect={redirect} />
    }

    return (
        <Fragment>
            <ToastContainer />
            <SessionCheck />
            <Suspense fallback={<CircularProgress />} >
                {
                    // state === 105 ? <SecondMenu /> : <ProfileMenus />
                    displayComp(state)
                }
            </Suspense>
        </Fragment>
    )
}

export default memo(MenuRenderWind)