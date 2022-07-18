import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// https://stackoverflow.com/questions/69864165/error-privateroute-is-not-a-route-component-all-component-children-of-rou
const PrivateRoute = ({ auth: { isAuthenticated, loading } }) =>
  !isAuthenticated && !loading ? <Navigate to="/login" /> : <Outlet />;

// the following writing style has been out of date
// return (
//   <Route
//     {...rest}
//     render={(props) =>
//       !isAuthenticated && !loading ? (
//         <Navigate tp="/login" />
//       ) : (
//         <Component {...props} />
//       )
//     }
//   />
// );

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapToStateProps = (state) => ({
  auth: state.auth,
});

export default connect(mapToStateProps)(PrivateRoute);
