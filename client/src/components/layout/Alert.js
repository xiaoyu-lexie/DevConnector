import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired,
};

// we want to fetch the alert state from reduxdev tool array, so we will have props.alerts
const mapStateToProps = (state) => ({
  // the alert of state.alert is from rootReducer(reducers/index.js)
  alerts: state.alert,
});

export default connect(mapStateToProps)(Alert);
