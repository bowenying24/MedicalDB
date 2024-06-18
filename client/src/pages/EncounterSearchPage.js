import React, { useState } from 'react';
import { Container, Divider, Button, Grid, TextField, Slider } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');

export default function EncounterSearchPage() {
  //set query parameters
  const [type, setType] = useState(null);
  const [minReimbursement, setMinReimbursement] = useState(0);
  const [maxReimbursement, setMaxReimbursement] = useState(100000);
  const [minDeductible, setMinDeductible] = useState(0);
  const [maxDeductible, setMaxDeductible] = useState(1100);

  const [searchResults, setSearchResults] = useState([]);

  //run querry with given parameters
  const handleSearch = () => {
    const searchEndpoint = `http://${config.server_host}:${config.server_port}/encounter-search-results?type=${type}&min_reimbursement=${minReimbursement}&max_reimbursement=${maxReimbursement}&min_deductible=${minDeductible}&max_deductible=${maxDeductible}`;

    //unique IDs for DataTable
    fetch(searchEndpoint)
      .then((res) => res.json())
      .then((resJson) => {
        const rowsWithId = resJson.map((row, index) => ({ id: index + 1, ...row }));
        setSearchResults(rowsWithId);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const columns = [
    { field: 'ClaimID', headerName: 'Claim ID' },
    { field: 'BeneID', headerName: 'Beneficiary ID' },
    { field: 'Type', headerName: 'Encounter Type' },
    { field: 'ClaimStartDate', headerName: 'Claim Start Date' },
    { field: 'ClaimEndDate', headerName: 'Claim End Date' },
    { field: 'ProviderID', headerName: 'Provider ID' },
    { field: 'AmountReimbursed', headerName: 'Amount Reimbursed' },
    { field: 'Deductible', headerName: 'Deductible' },
    { field: 'DxCode', headerName: 'Diagnosis Code' },
    { field: 'ProcedureCode', headerName: 'Procedure Code' },
  ];

  //Renders Page: Fields for adjusting parameters, display table of results
  return (
    <Container>
      <Divider />
      <h2>Encounter Search</h2>
      <Grid container spacing={6}>
      <Grid item xs={4}>
          <TextField
            label="Patient Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <p>Reimbursement Range</p>
          <Slider
            value={[minReimbursement, maxReimbursement]}
            min={0}
            max={100000}
            step={1000}
            onChange={(_, newValue) => {
              setMinReimbursement(newValue[0]);
              setMaxReimbursement(newValue[1]);
            }}
            valueLabelDisplay='auto'
          />
        </Grid>
        <Grid item xs={6}>
          <p>Deductible Range</p>
          <Slider
            value={[minDeductible, maxDeductible]}
            min={0}
            max={1100}
            step={25}
            onChange={(_, newValue) => {
              setMinDeductible(newValue[0]);
              setMaxDeductible(newValue[1]);
            }}
            valueLabelDisplay='auto'
          />
        </Grid>
      </Grid>
      <Button onClick={handleSearch} style={{ left: '50%', transform: 'translateX(-50%)', marginTop: '20px' }}>
        Search
      </Button>
      <h2>Results</h2>
      <DataGrid
        rows={searchResults}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        autoHeight
      />
      <Divider />
    </Container>
  );
}
