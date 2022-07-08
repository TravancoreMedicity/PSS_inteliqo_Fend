import { axioslogin } from 'src/views/Axios/Axios';
import { Actiontypes } from '../constants/action.type'

const { FETCH_EMP_DEPTSECT } = Actiontypes;

export const setDeptWiseSection = (dept) => async (dispatch) => {
    const result = await axioslogin.get(`/section/sect/${dept}`);
    const { success, data } = result.data;
    if (success === 1) {
        dispatch({ type: FETCH_EMP_DEPTSECT, payload: data })
    }
}