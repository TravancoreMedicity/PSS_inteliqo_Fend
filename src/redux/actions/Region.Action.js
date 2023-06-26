import { axioslogin } from 'src/views/Axios/Axios';
import { Actiontypes } from '../constants/action.type'
const { FETCH_REGION_DATA, FETCH_PIN_WISE_REGION } = Actiontypes;

export const setRegionList = () => async (dispatch) => {
    /** to get region slno, name lsit from databse */
    const result = await axioslogin.get('/region')
    const { success, data } = result.data;
    if (success === 1) {
        dispatch({ type: FETCH_REGION_DATA, payload: data, loadingStatus: true })
    } else {
        dispatch({ type: FETCH_REGION_DATA, payload: [], loadingStatus: false })
    }
}

export const setRegionByPin = (id) => async (dispatch) => {
    const result = await axioslogin.get(`/RegionReport/region/bypin/${id}`)
    const { success, data } = result.data;
    if (success === 1) {
        dispatch({ type: FETCH_PIN_WISE_REGION, payload: data, loadingStatus: true })
    } else {
        dispatch({ type: FETCH_PIN_WISE_REGION, payload: [], loadingStatus: false })
    }
}
