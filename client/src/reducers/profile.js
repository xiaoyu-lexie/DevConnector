import {
  CLEAR_PROFILE,
  GET_PROFILE,
  PROFILE_ERROR,
  UPDATE_PROFILE,
} from "../actions/types";

const initialState = {
  profile: null, // when we login, it's going to get all our individual profile data OR when we visit another user's profile page, put the profile info here
  profiles: [],
  repos: [], // git hub repos
  loading: true,
  error: {},
};

const profileReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_PROFILE:
    case UPDATE_PROFILE:
      return {
        ...state,
        profile: payload,
        loading: false,
      };
    case PROFILE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    case CLEAR_PROFILE:
      return {
        ...state,
        profile: null,
        repos: [],
        loading: false,
      };
    default:
      return state;
  }
};

export default profileReducer;
