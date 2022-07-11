import { axioslogin } from 'src/views/Axios/Axios';
import { Actiontypes } from '../constants/action.type'
const { FETCH_EMP_INSTITUTION } = Actiontypes;

export const setInstitution = () => async (dispatch) => {
    const result = await axioslogin.get('/inst');
    const { success, data } = result.data;
    if (success === 1) {
        dispatch({ type: FETCH_EMP_INSTITUTION, payload: data })
    }
}



