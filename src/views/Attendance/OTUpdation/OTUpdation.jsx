import React, { Fragment } from 'react'
import PageLayoutSave from 'src/views/CommonCode/PageLayoutSave'
import { useHistory } from 'react-router'

const OTUpdation = () => {
    const history = useHistory()


    const RedirectToProfilePage = () => {
        history.push(`/Home`)
    }
    return (
        <Fragment>
            <PageLayoutSave
                heading="Over Time Updation"
                redirect={RedirectToProfilePage}
            //submit={submitFine}
            >

            </PageLayoutSave>
        </Fragment>
    )
}

export default OTUpdation
