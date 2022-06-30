import { v4 as uuid } from "uuid";

import { SET_ALERT, REMOVE_ALERT } from "./types";

// we can insert dispatch here because of thunk
const setAlert =
  (msg, alertType, timeout = 5000) =>
  (dispatch) => {
    // uuid version 4
    const id = uuid();

    dispatch({
      type: SET_ALERT,
      payload: { msg, alertType, id },
    });

    setTimeout(
      () =>
        dispatch({
          type: REMOVE_ALERT,
          payload: id,
        }),
      timeout
    );
  };

export default setAlert;
