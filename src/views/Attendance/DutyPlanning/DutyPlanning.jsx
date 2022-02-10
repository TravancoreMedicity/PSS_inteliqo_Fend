import { IconButton } from '@mui/material'
import React, { Fragment, useEffect } from 'react'
import TextInput from 'src/views/Component/TextInput'
import { SELECT_CMP_STYLE } from 'src/views/Constant/Constant'
import PageLayoutCloseOnly from '../../CommonCode/PageLayoutCloseOnly'
import { MdOutlineAddCircleOutline } from 'react-icons/md'
import '../Att_Style.css'
import Moment from 'moment'
import { extendMoment } from 'moment-range';
import { addDays, eachDayOfInterval, format } from 'date-fns'
import { useState, useContext } from 'react'
import { PayrolMasterContext } from 'src/Context/MasterContext'
import DepartmentSelect from 'src/views/CommonCode/DepartmentSelect'
import DepartmentSectionSelect from 'src/views/CommonCode/DepartmentSectionSelect'
import { axioslogin } from 'src/views/Axios/Axios'
import { errorNofity, warningNofity } from 'src/views/CommonCode/Commonfunc'
import DutyPlanningMainCard from './DutyPlanningMainCard'
import { useHistory } from 'react-router'
const moment = extendMoment(Moment);

const DutyPlanning = () => {
  const history = useHistory()
  const { selectedDept, selectDeptSection } = useContext(PayrolMasterContext)
  //use state for employee details
  const [empData, setempData] = useState([])
  //use State for Date Format
  const [dateFormat, setdateFormat] = useState([])
  const [duty, setDuty] = useState(0)
  const [count, setCount] = useState(0)
  const [disable, setdisable] = useState(true)
  //use state for initial start date and end date
  const [formData, setFormData] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  })
  //de structuring
  const { startDate, endDate } = formData
  //getting form data
  const updateDutyPlanning = async (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value })
  }
  //date validations
  const maxdate = addDays(new Date(startDate), 30)
  const maxdatee = moment(maxdate).format('YYYY-MM-DD')

  //use effect getting the employee details of the selected department and department section
  useEffect(() => {
    //post data for getting employee details
    const getempdetl = async () => {
      if (selectedDept !== 0 && selectDeptSection !== 0) {
        const postData = {
          em_department: selectedDept,
          em_dept_section: selectDeptSection
        }
        const result = await axioslogin.post("/plan/create", postData);
        const { success, data } = result.data
        if (success === 1) {
          setempData(data)
          setdisable(false)
        }
        else {
          warningNofity("There is No employees In This Department And Department Section")
          setDuty(0)
          setdisable(true)
        }
      }
    }
    getempdetl()
  }, [selectedDept, selectDeptSection])


  //insert duty planning
  const insertDutyPlanning = async (e) => {
    setCount(count + 1)
    //finding the dates between start date and end date
    const rage = eachDayOfInterval(
      { start: new Date(startDate), end: new Date(endDate) }
    )
    //finding the dates between start date and end date
    const newDateFormat = rage.map((val) => { return { date: moment(val).format('MMM-D-dd'), sunday: moment(val).format('d') } })
    setdateFormat(newDateFormat)
    const newDateFormat2 = rage.map((val) => { return { date: moment(val).format('YYYY-MM-DD') } })
    //checking wheher duty plan is already setted in thse dates
    const empidata = empData && empData.map((val) => {
      return val.em_id
    })
    const postDate = {
      start_date: moment(startDate).format('YYYY-MM-DD'),
      end_date: moment(endDate).format('YYYY-MM-DD'),
      empData: empidata
    }
    const result = await axioslogin.post("/plan/check", postDate)
    const { success, data } = result.data
    if (success === 1) {
      const dutyday = empData.map((val) => {
        const dutydate = newDateFormat2.map((value) => {
          return { date: value.date, emp_id: val.em_id }
        })
        return dutydate
      })
      const dutyplanarray = dutyday.flat(Infinity)

      //filtering the data from the data base and inserting dates and finding the new array to insert
      const newdutyplanarray = dutyplanarray.filter((val) => {
        return data.filter((data) => {
          return val.emp_id === data.emp_id && val.date === moment(data.duty_day).format('YYYY-MM-DD')
        }).length === 0
      })
      //if new array lenth is zero no need to inset
      if (newdutyplanarray.length === 0) {
        setDuty(1)
      }

      //if new array length not eqal to zero inserting the new array
      else {
        //inserting the duty plan
        const results = await axioslogin.post("/plan/insert", newdutyplanarray)
        const { success1 } = results.data
        if (success1 === 1) {
          setDuty(1)
        }
        else {
          errorNofity("Error Occured!!Please Contact EDP")
        }
      }
    }
    //if the no dates are inserted betwen the start date and end date inserting the dates
    else {
      const dutyday = empData.map((val) => {
        const dutydate = newDateFormat2.map((value) => {
          return { date: value.date, emp_id: val.em_id }
        })
        return dutydate
      })
      const dutyplanarray = dutyday.flat(Infinity)
      //inserting the duty plan
      const results = await axioslogin.post("/plan/insert", dutyplanarray)
      const { success1 } = results.data
      if (success1 === 1) {
        setDuty(1)
      }
      else {
        errorNofity("Error Occured!!Please Contact EDP")
      }
    }
  }
  const redirecting = () => {
    history.push('/Home')
  }

  return (
    <Fragment>
      <PageLayoutCloseOnly heading="Duty Planning"
        redirect={redirecting}>
        <div className="col-md-12 mb-2">
          <div className="row g-2">
            <div className="col-md-2">
              <TextInput
                type="date"
                classname="form-control form-control-sm custom-datefeild-height"
                Placeholder="Date"
                name="startDate"
                value={startDate}
                changeTextValue={(e) => updateDutyPlanning(e)}
              />
            </div>
            <div className="col-md-2">
              <TextInput
                type="date"
                classname="form-control form-control-sm custom-datefeild-height"
                Placeholder="Date"
                name="endDate"
                value={endDate}
                min={startDate}
                max={maxdatee}
                changeTextValue={(e) => updateDutyPlanning(e)}
              />
            </div>
            <div className="col-md-3">
              <DepartmentSelect select="Department" style={SELECT_CMP_STYLE} />
            </div>
            <div className="col-md-3">
              <DepartmentSectionSelect select="Department Section" style={SELECT_CMP_STYLE} />
            </div>
            <div className="col-md-1 text-center">
              <IconButton
                aria-label="add"
                style={{ padding: '0rem' }}
                onClick={insertDutyPlanning}
                disabled={disable}
              >
                <MdOutlineAddCircleOutline className="text-info" size={30} />
              </IconButton>
            </div>
          </div>
        </div>
        <div>{
          duty === 1 ?
            <DutyPlanningMainCard
              dateformat={dateFormat}
              employeedata={empData}
              startdate={startDate}
              enddate={endDate}
              duty={duty}
              count={count}
              selectedDept={selectedDept}
              selectDeptSection={selectDeptSection}
            /> : null
        }
        </div>
      </PageLayoutCloseOnly >
    </Fragment>
  )


}

export default DutyPlanning
