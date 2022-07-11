import { Paper } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import CusIconButton from './CusIconButton'
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import CustomeToolTip from './CustomeToolTip'
import DownloadIcon from '@mui/icons-material/Download'
import CustomAgGridMenuSelection from './CustomAgGridMenuSelection'
import CustomAgGridRptFormatOne from './CustomAgGridRptFormatOne'
import { useDispatch } from 'react-redux'
import { Actiontypes } from 'src/redux/constants/action.type'
import { warningNofity } from '../CommonCode/Commonfunc'
import { ToastContainer } from 'react-toastify'
import { useHistory } from 'react-router-dom'

const CustomReport = ({ columnDefs, tableData, onSelectionChanged, tableDataMain, columnDefMain, onClick }) => {

    const dispatch = useDispatch()
    const history = useHistory()


    const onExportClick = () => {
        if (tableDataMain.length === 0) {
            warningNofity("Please Click The Search Button After Selecting the Options")
        }
        dispatch({ type: Actiontypes.FETCH_CHANGE_STATE, aggridstate: 1 })
    }
    /** To close the report page and back to the report list */
    const CloseReport = async () => {
        dispatch({ type: Actiontypes.FETCH_CHANGE_STATE, aggridstate: 0 })
        history.push(`/Home/Reports`)
    }
    return (
        <Box>
            <ToastContainer />
            <Paper
                square
                sx={{
                    height: { xs: 550, sm: 550, md: 550, lg: 558, xl: 850 },
                    p: 0.5,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    {/* Left Side Section Start */}
                    <Paper
                        square
                        sx={{
                            backgroundColor: 'lightBlue',
                            width: { md: '20%', lg: '20%', xl: '15%' },
                            height: { xs: 540, sm: 540, md: 540, lg: 548, xl: 840 },
                        }}
                    >
                        {/* Top Left Menu Section Start */}
                        <Paper
                            square
                            sx={{
                                backgroundColor: '#f0f3f5',
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 0.1,
                                p: 0.3,
                            }}
                        >
                            <CusIconButton variant="outlined" size="sm" color="success" onClick={onClick}>
                                <SearchIcon />
                            </CusIconButton>
                            {/* <CustomeToolTip title="Department Name" placement="bottom">
                                <Box>
                                    <CusIconButton variant="outlined" size="sm" color="success">
                                        <ContentPasteSearchIcon />
                                    </CusIconButton>
                                </Box>
                            </CustomeToolTip>
                            <CustomeToolTip title="Department Section" placement="bottom">
                                <Box>
                                    <CusIconButton variant="outlined" size="sm" color="success">
                                        <ContentPasteSearchIcon />
                                    </CusIconButton>
                                </Box>
                            </CustomeToolTip>
                             <CustomeToolTip title="Department Master" placement="bottom">
                                <Box>
                                    <CusIconButton variant="outlined" size="sm" color="success">
                                        <ContentPasteSearchIcon />
                                    </CusIconButton>
                                </Box>
                            </CustomeToolTip> */}
                        </Paper>
                        {/* Table Component */}
                        <CustomAgGridMenuSelection columnDefs={columnDefs} onSelectionChanged={onSelectionChanged} tableData={tableData} />

                        {/* Top Left Menu Section End */}
                    </Paper>
                    {/* Left Side Section End */}

                    {/* Rigth Side Section Start */}
                    <Paper
                        square
                        sx={{
                            backgroundColor: 'lightGrey',
                            width: { md: '80%', lg: '80%', xl: '85%' },
                            height: { xs: 540, sm: 540, md: 540, lg: 548, xl: 840 },
                        }}
                    >
                        {/* Rigth Side Menu  */}
                        <Paper
                            square
                            sx={{
                                backgroundColor: '#f0f3f5',
                                display: 'flex',
                                flexWrap: 'wrap',
                                flexDirection: 'row-reverse',
                                // alignItems: "",
                                gap: 0.1,
                                p: 0.3,
                                borderLeft: 2,
                                borderColor: '#d3d3d3',
                            }}
                        >
                            <CustomeToolTip title="Close" placement="bottom">
                                <Box>
                                    <CusIconButton variant="outlined" size="sm" color="success" onClick={CloseReport}>
                                        <CloseIcon />
                                    </CusIconButton>
                                </Box>
                            </CustomeToolTip>

                            <CustomeToolTip title="Download" placement="bottom">
                                <Box>
                                    <CusIconButton variant="outlined" size="sm" color="success" onClick={onExportClick}>
                                        <DownloadIcon />
                                    </CusIconButton>
                                </Box>
                            </CustomeToolTip>
                        </Paper>
                        <Box
                            sx={{
                                borderLeft: 2,
                                borderColor: '#d3d3d3',
                            }}
                        >
                            {/* Table Component */}
                            <CustomAgGridRptFormatOne tableDataMain={tableDataMain} columnDefMain={columnDefMain} />
                        </Box>
                        {/* Rigth Side Menu  */}
                    </Paper>
                    {/* Rigth Side Section End */}
                </Box>
                {/* <Paper square sx={{ backgroundColor: "lightpink" }}  >sdfsdfsdf</Paper> */}
            </Paper >
        </Box >
    )
}

export default CustomReport