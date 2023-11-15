import { FormControl, MenuItem, Select } from '@mui/material';
import React, { Fragment, memo, useEffect, useState } from 'react'
import { axioslogin } from '../Axios/Axios';

const DepartmentalTrainingTopics = ({ setTopic, topic, dept }) => {
    const [view, setView] = useState([]);
    useEffect(() => {
        if (dept === 0) {
            const getData = async (dept) => {
                const result = await axioslogin.get(`/TrainingAfterJoining/deptTrainingtopic/${dept}`)
                const { data, success } = result.data
                if (success === 1) {
                    setView(data);
                } else {
                    setView([]);
                }
            }
            getData(dept)
        }
    }, [dept])

    return (
        <Fragment>
            <FormControl fullWidth size='small'>
                <Select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    size="small"
                    fullWidth
                    variant='outlined'
                    sx={{ maxWidth: "100%" }}
                >
                    <MenuItem disabled value={0}>
                        Select Training Topics
                    </MenuItem>
                    {
                        view?.map((val, index) => {
                            return <MenuItem key={index} value={val.topic_slno}>{val.training_topic_name}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>
        </Fragment>
    )
}

export default memo(DepartmentalTrainingTopics)
