import { Container, Divider, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import LazyTable from '../components/LazyTable';
const config = require('../config.json');

export default function ClaimsFraudPage() {
  const fraudColumns = [
    {
      field: 'AgeCategory',
      headerName: 'Age Category',
    },
    {
      field: 'FraudAvgReimbursedAmount',
      headerName: 'Fraud Average Reimbursed Amount',
    },
    {
      field: 'NoFraudAvgReimbursedAmount',
      headerName: 'No Fraud Average Reimbursed Amount',
    },
    {
      field: 'FraudAvgDeductible',
      headerName: 'Fraud Average Deductible',
    },
    {
      field: 'NoFraudAvgDeductible',
      headerName: 'No Fraud Average Deductible',
    }
  ];
  
  const claimsColumns = [
    {
      field: 'Year',
      headerName: 'Year',
    },
    {
      field: 'Month',
      headerName: 'Month',
    },
    {
      field: 'TotalClaims',
      headerName: 'Total Claims',
    },
    {
      field: 'TotalPatients',
      headerName: 'Total Patients',
    }
  ];

  //state determines which table is shown
  const [activeTable, setActiveTable] = useState('claims'); // 'diagnosis' or 'procedure'

  const handleTableChange = (_, newTable) => {
    setActiveTable(newTable);
  };

  const [monthlyClaimsData, setMonthlyClaimsData] = useState([]);

  useEffect(() => {
    // Fetch the monthly claims data
    fetch(`http://${config.server_host}:${config.server_port}/monthly-claims-summary-hist`)
      .then(res => res.json())
      .then(data => setMonthlyClaimsData(data))
      .catch(err => console.error("Failed to fetch monthly claims data:", err));
  }, []);

  return (
    <Container>
      <Divider />
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" flexDirection="row" marginBottom="20px">
          <ToggleButtonGroup
            value={activeTable}
            exclusive
            onChange={handleTableChange}
            style={{ margin: '10px' }}
          >
            <ToggleButton value="claims">Claims Data</ToggleButton>
            <ToggleButton value="fraud">Fraud Data</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {activeTable === 'claims' && (
          <Box width="100%" overflow="auto">
            <h2>Monthly Claims Summary</h2>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/monthly-claims-summary`}
              columns={claimsColumns}
              defaultPageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}
        {activeTable === 'fraud' && (
          <Box width="100%" overflow="auto">
            <h2>Financial Impact of Fraud</h2>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/financial-impact-of-fraud`}
              columns={fraudColumns}
              defaultPageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}
        {activeTable === 'claims' && (
        <>
          <h2>Histogram of Total Claims</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyClaimsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="TotalClaims" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          
          <h2>Histogram of Total Patients</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyClaimsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="TotalPatients" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
      </Box>
      <Divider />
    </Container>
  );
}
