import MaterialTable from 'material-table'
import React, { Fragment, memo, useEffect, useState } from 'react'
import { useHistory } from 'react-router';
import { axioslogin } from 'src/views/Axios/Axios';
import { tableIcons } from 'src/views/Constant/MaterialIcon'
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import { warningNofity } from 'src/views/CommonCode/Commonfunc';

const DistrictMastTable = ({ update }) => {
    const [data, setTableData] = useState();
    const history = useHistory();

    //table
    const title = [
        {
            title: "SlNo", field: "dist_slno", cellStyle: { minWidth: 1, maxWidth: 2 }
        },
        {
            title: "District Name", field: "dist_name", cellStyle: { minWidth: 100, maxWidth: 200 }
        },
        {
            title: "State Name", field: "state_name", cellStyle: { minWidth: 100, maxWidth: 200 }
        },
        {
            title: "Status", field: "dist_status"
        },
    ]

    //Getdata
    useEffect(() => {
        const getTypeList = async () => {
            const result = await axioslogin.get('/district')
            const { success, data } = result.data;
            if (success === 1) {
                setTableData(data);
            } else {
                warningNofity(" Error occured contact EDP")
            }
        }
        getTypeList();
    }, [update]);

    //for edit
    const getDataTable = (data) => {
        const { dist_slno } = data
        history.push(`/Home/DistrictMastEdit/${dist_slno}`)
    }

    return (

        <Fragment>
            <MaterialTable
                title="District"
                icons={tableIcons}
                data={data}
                columns={title}
                actions={[
                    {
                        icon: () => <EditOutlinedIcon />,
                        tooltip: "Click here to Edit",
                        onClick: (e, data) => getDataTable(data)
                    }
                ]}
                options={{
                    paginationType: "stepped",
                    showFirstLastPageButtons: false,
                    padding: "dense",
                    actionsColumnIndex: 0
                }}
            />
        </Fragment>




        // <Fragment>
        //     <MaterialTable
        //         title="District "
        //         data={data}
        //         columns={title}
        //         incons={tableIcons}
        //         actions={[
        //             {
        //                 icon: () => <EditOutlinedIcon />,
        //                 tooltip: " Click here to Edit",
        //                 onClick: (e, data) => getDataTable(data)
        //             }
        //         ]}
        //         options={{
        //             paginationType: "stepped",
        //             showFirstLastPageButtons: false,
        //             padding: "dense",
        //             actionsColumnIndex: 0
        //         }}
        //     />
        // </Fragment>
    )
}

export default memo(DistrictMastTable)
