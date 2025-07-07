import React from 'react';

const OwnerDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1>Owner Dashboard</h1>
            <p>Welcome to the Owner Dashboard. This is where property owners can manage their properties.</p>
            
            <div className="row mt-4">
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Properties</h5>
                    <p className="card-text">Manage your properties</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Tenants</h5>
                    <p className="card-text">View and manage tenants</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Payments</h5>
                    <p className="card-text">Track payments and finances</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Reports</h5>
                    <p className="card-text">View property reports</p>
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

export default OwnerDashboard; 