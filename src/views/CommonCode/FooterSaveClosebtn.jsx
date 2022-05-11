import React, { memo } from 'react'
import { IconButton } from '@material-ui/core';
import ReactTooltip from 'react-tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const FooterSaveClosebtn = (props) => {
    return (
        <div className="col-md-2">
            <div className="row">
                <div className="col-md-1 col-sm-4 d-flex flex-row justify-content-md-between" data-tip="Save" data-for='toolTip1' data-place='top'>
                    <div style={{ marginRight: "0.5rem" }}>
                        <ReactTooltip id="toolTip1" />
                        <IconButton type="submit" className="p-1" color="primary" clickable="true" onClick={props.submit}>
                            <SaveIcon size={25} sx={{ color: "#37575f" }} />

                        </IconButton>
                    </div>
                    <div style={{ marginRight: "0.5rem" }} data-tip="Close" data-for='toolTip1' data-place='top'>
                        <ReactTooltip id="toolTip1" />
                        <IconButton className="p-1" onClick={props.redirect} clickable="true" >
                            <CancelIcon size={22} sx={{ color: "#37575f" }} />
                        </IconButton>
                    </div>
                </div >
            </div>
        </div>
    )
}

export default memo(FooterSaveClosebtn)
