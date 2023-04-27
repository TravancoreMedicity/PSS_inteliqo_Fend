import { Actiontypes } from '../constants/action.type'

const {
    FETCH_ALL_OT_INCHARGE,
    FETCH_ALL_OT_HOD,
    FETCH_ALL_OT_CEO_APPROVAL,
    FETCH_ALL_OT_HR_APPROVAL,
    FETCH_OT_UPDATION_LIST
} = Actiontypes;

const OtApprovaldata = {
    approvalInch: {
        approvalInchList: [],
        approvalInchStatus: false
    },
    approvalHod: {
        approvalHodList: [],
        approvalHodStatus: false
    },
    approvalCeo: {
        approvalCeoList: [],
        approvalCeoStatus: false
    },
    approvalHr: {
        approvalHrList: [],
        approvalHrStatus: false
    },
    otUpdation: {
        otUpdationList: [],
        otUpdationStatus: false
    }
}

export const getOTApprovalData = (state = OtApprovaldata, { type, payload }) => {
    switch (type) {
        case FETCH_ALL_OT_INCHARGE:
            return {
                ...state,
                approvalInch: {
                    ...state.approvalInch,
                    approvalInchList: payload,
                    approvalInchStatus: true
                }
            }
        case FETCH_ALL_OT_HOD:
            return {
                ...state,
                approvalHod: {
                    ...state.approvalHod,
                    approvalHodList: payload,
                    approvalHodStatus: true
                }
            }
        case FETCH_ALL_OT_CEO_APPROVAL:
            return {
                ...state,
                approvalCeo: {
                    ...state.approvalCeo,
                    approvalCeoList: payload,
                    approvalCeoStatus: true
                }
            }
        case FETCH_ALL_OT_HR_APPROVAL:
            return {
                ...state,
                approvalHr: {
                    ...state.approvalHr,
                    approvalHrList: payload,
                    approvalHrStatus: true
                }
            }
        case FETCH_OT_UPDATION_LIST:
            return {
                ...state,
                otUpdation: {
                    ...state.otUpdation,
                    otUpdationList: payload,
                    otUpdationStatus: true
                }
            }
        default:
            return state
    }
}