// this is redux store boilerplate a lot of the store files we're going to see, and they are very similar

import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
// we are going to have several reducers, like auth, profile, alert. We want to combine them in a root reducer and that's what we bring in here
import rootReducer from "./reducers";

const initialState = {};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

//once finish set up like this,  we will never touch this file ever again

export default store;
