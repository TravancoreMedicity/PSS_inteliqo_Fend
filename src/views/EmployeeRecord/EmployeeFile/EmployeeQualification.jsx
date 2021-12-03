import { DatePicker, LocalizationProvider } from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import React, { Fragment, useState, useContext } from 'react'
import { useHistory, useParams } from 'react-router'
import { PayrolMasterContext } from 'src/Context/MasterContext'
import { axioslogin } from 'src/views/Axios/Axios'
import { infoNofity, succesNofity } from 'src/views/CommonCode/Commonfunc'
import CourseSelection from 'src/views/CommonCode/CourseSelection'
import EducationSelection from 'src/views/CommonCode/EducationSelection'
import { useStyles } from 'src/views/CommonCode/MaterialStyle'
import PageLayout from 'src/views/CommonCode/PageLayout'
import RegistrationTypeSelection from 'src/views/CommonCode/RegistrationTypeSelection'
import SpecializationSelection from 'src/views/CommonCode/SpecializationSelection'
import { UniversitySelection } from 'src/views/CommonCode/UniversitySelection'
import { employeeNumber } from 'src/views/Constant/Constant'
import moment from 'moment';
import QualificationTable from './EmployeeFileTable/QualificationTable'
import FooterSaveClosebtn from 'src/views/CommonCode/FooterSaveClosebtn'
import TextInput from 'src/views/Component/TextInput'
import { TextField } from '@material-ui/core'

const EmployeeQualification = () => {
    const classes = useStyles();
    const history = useHistory();
    const { id, no } = useParams();
    const [count, setcount] = useState(0);
    const { selectEducation, updateEducation,
        selectCourse, updateCourse,
        selectSpec, updateSpec,
        selectUniversity, updateUniversity,
        selectreg, updatereg
    } = useContext(PayrolMasterContext)
    const [year, setYear] = useState(null);

    //Initializing
    const [qualification, setQualification] = useState({
        em_education: '',
        em_course: '',
        em_specialization: '',
        em_univ_institute: '',
        em_year: '',
        em_mark_grade: '',
        em_reg_type: '',
        em_reg_no: ''
    })

    //destructuring
    const { em_mark_grade, em_reg_no } = qualification
    const updateQualification = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.value : e.target.value;
        setQualification({ ...qualification, [e.target.name]: value })
    }

    //Year update function
    const updateYear = (val) => {
        setYear(val)
    }

    //moment passout year
    const qual_year = moment(year).format('YYYY')

    //Post data
    const postData = {
        em_no: employeeNumber(),
        em_education: selectEducation,
        em_course: selectCourse,
        em_specialization: selectSpec,
        em_univ_institute: selectUniversity,
        em_year: qual_year,
        em_mark_grade,
        em_reg_type: selectreg,
        em_reg_no,
        create_user: employeeNumber(),
    }

    //Form reset
    const resetForm = {
        em_education: '',
        em_course: '',
        em_specialization: '',
        em_univ_institute: '',
        em_year: '',
        em_mark_grade: '',
        em_reg_type: '',
        em_reg_no: ''
    }
    const reset = () => {
        updateEducation(0)
        updateCourse(0)
        updateSpec(0)
        updateUniversity(0)
        updatereg(0)
        setYear(null)
    }

    //Form Submitting
    const submitQualification = async (e) => {
        e.preventDefault();
        const result = await axioslogin.post('/qualify', postData)
        const { message, success } = result.data;
        if (success === 1) {
            succesNofity(message);
            setcount(count + 1)
            setQualification(resetForm);
            reset();
        } else if (success === 0) {
            infoNofity(message.sqlMessage);
        } else {
            infoNofity(message)
        }
    }

    //Back to home page
    const toSettings = () => {
        history.push(`/Home/Profile/${id}/${no}`);
    }

    return (
        <Fragment>
            <PageLayout heading="Qualification">
                <form className={classes.root} onSubmit={submitQualification}>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4">

                                <div className="row">
                                    <div className="col-md-12 pt-1">
                                        <EducationSelection style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }} />
                                    </div>
                                    <div className="col-md-12 pt-1">
                                        <CourseSelection style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }} />
                                    </div>
                                    <div className="col-md-12 pt-1">
                                        <SpecializationSelection style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }} />
                                    </div>
                                    <div className="col-md-12 pt-1">
                                        <UniversitySelection style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }} />
                                    </div>
                                    <div className="col-md-6 col-xs-12 pt-1" style={{
                                        paddingLeft: '0.5rem', paddingRight: '-0.5rem'
                                    }} >
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                views={['year']}
                                                name="year"
                                                value={year}
                                                onChange={(e) => { updateYear(e) }}
                                                InputProps={{
                                                    className: classes.customInputFeild
                                                }}
                                                renderInput={(params) => <TextField {...params}
                                                    fullWidth
                                                    size="small"
                                                    name="datepick"
                                                    autoComplete="off"
                                                    variant="outlined"
                                                    helperText={null} />}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                    <div className="col-md-6 pt-1">
                                        <TextInput
                                            type="text"
                                            classname="form-control form-control-sm"
                                            Placeholder="Mark/Grade"
                                            value={em_mark_grade}
                                            name="em_mark_grade"
                                            changeTextValue={(e) => updateQualification(e)}
                                        />
                                    </div>
                                    <div className="col-md-12 pt-1">
                                        <RegistrationTypeSelection style={{ minHeight: 10, maxHeight: 27, paddingTop: 0, paddingBottom: 4 }} />
                                    </div>
                                    <div className="col-md-12 pt-1">
                                        <TextInput
                                            type="text"
                                            classname="form-control form-control-sm"
                                            Placeholder="Registration No"
                                            value={em_reg_no}
                                            name="em_reg_no"
                                            changeTextValue={(e) => updateQualification(e)}
                                        />
                                    </div>

                                </div>

                            </div>
                            <div className="col-md-8">
                                <QualificationTable update={count} />
                            </div>
                            <div className="col-md-12 pt-1">
                                <div className="card-footer  text-muted ">
                                    <FooterSaveClosebtn
                                        redirect={toSettings}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </PageLayout >
        </Fragment >
    )
}

export default EmployeeQualification
