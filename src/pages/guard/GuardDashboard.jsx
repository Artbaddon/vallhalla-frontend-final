import React from 'react';

const GuardDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>Guard Dashboard</h1>
            <p>Welcome to the Guard Dashboard. This is where security guards can manage access and security.</p>
            
            <div className="row mt-4">
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Visitors</h5>
                    <p className="card-text">Register and manage visitors</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Parking</h5>
                    <p className="card-text">Manage parking access</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Reports</h5>
                    <p className="card-text">Submit security reports</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Profile</h5>
                    <p className="card-text">Update your profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardDashboard; 