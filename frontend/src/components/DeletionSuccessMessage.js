import React from 'react';
import { Alert } from 'react-bootstrap';

const DeletionSuccessMessage = ({ userRole }) => (
  <Alert variant="success">
    <Alert.Heading>Account Deletion Request Successful</Alert.Heading>
    <p>
      Your {userRole} account has been marked for deletion.
      {userRole !== 'tourist' && " Any pending activities or transactions will be handled accordingly."}
    </p>
    <p>You will be redirected to the login page in a few moments.</p>
  </Alert>
);

export default DeletionSuccessMessage;