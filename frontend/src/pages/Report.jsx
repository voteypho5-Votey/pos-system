import React from "react";
import "./report.css";

function Report() {
  return (
    <div className="report-page">
      <div className="page-header">
        <h2>របាយការណ៍</h2>
      </div>

      <div className="report-grid">
        <div className="report-card income">
          <p>ប្រាក់ចំណូលសរុប</p>
          <h3>$0</h3>
        </div>

        <div className="report-card product">
          <p>ចំនួនទំនិញសរុប</p>
          <h3>0</h3>
        </div>

        <div className="report-card sale">
          <p>ចំនួនការលក់</p>
          <h3>1</h3>
        </div>

        <div className="report-card customer">
          <p>ចំនួនអតិថិជន</p>
          <h3>1</h3>
        </div>
      </div>
    </div>
  );
}

export default Report;