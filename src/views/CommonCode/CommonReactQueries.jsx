import { axioslogin } from "src/views/Axios/Axios";


export const getCommonsettingData = async () => {
    return await axioslogin.get('/commonsettings').then((res) => {
        const { success, data } = res.data
        if (success === 1) {
            return data[0]
        } else return []
    })
}

export const getAllDeptSectList = async () => {
    return await axioslogin.post('/experienceReport/deptsectById/').then((res) => {
        const { success, data } = res.data
        if (success === 1) {
            return data
        } else return []
    })
}

export const getAllDeptList = async () => {
    return await axioslogin.get('/common/getdept').then((res) => {
        const { success, data } = res.data
        if (success === 1) {
            return data
        } else return []
    })
}
