import { Container, Divider, Box, ToggleButton, ToggleButtonGroup, Grid, TextField, Button } from '@mui/material';
import { useState } from 'react';

import { DataGrid } from '@mui/x-data-grid';
const config = require('../config.json');

export default function HomePage() {
  //state variables for lookup interval, execute query w/ parameters for both top diagnoses and top procedures, set unique IDs for DataTable
  const [lookback, setLookback] = useState(30);
  const [searchResults, setSearchResults] = useState([]);
  const handleSearchDiagnosis = () => {
    const searchEndpoint = `http://${config.server_host}:${config.server_port}/diagnosis-summary?lookback=${lookback}`;

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
  const handleSearchProcedure = () => {
    const searchEndpoint = `http://${config.server_host}:${config.server_port}/procedure-summary?lookback=${lookback}`;

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

  const diagnosisColumns = [
    {
      field: 'DxCode',
      headerName: 'Dx Code',
       width: 160,
    },
    {
      field: 'DxName',
      headerName: 'Dx Name',
       width: 160,
    },
    {
      field: 'TotalPatients',
      headerName: 'Total Patients',
       width: 160,
    },
    {
      field: 'TotalEncounters',
      headerName: 'Total Encounters',
       width: 160,
    },
    {
      field: 'TotalCost',
      headerName: 'Total Cost',
       width: 160,
    },
    {
      field: 'OutpatientCost',
      headerName: 'Outpatient Cost',
       width: 160,
    },
    {
      field: 'InpatientCost',
      headerName: 'Inpatient Cost',
       width: 160,
    },
  ];
  
  const procedureColumns = [
    {
      field: 'ProcedureCode',
      headerName: 'Procedure Code',
    },
    {
      field: 'ProcedureName',
      headerName: 'Procedure Name',
    },
    {
      field: 'TotalPatients',
      headerName: 'Total Patients',
    },
    {
      field: 'TotalEncounters',
      headerName: 'Total Encounters',
    },
    {
      field: 'OutpatientEncounters',
      headerName: 'Outpatient Encounters',
    },
    {
      field: 'InpatientEncounters',
      headerName: 'Inpatient Encounters',
    },
    {
      field: 'TotalCost',
      headerName: 'Total Cost',
    },
    {
      field: 'OutpatientCost',
      headerName: 'Outpatient Cost',
    },
    {
      field: 'ProportionOutpatient',
      headerName: 'Proportion Outpatient',
    },
    {
      field: 'InpatientCost',
      headerName: 'Inpatient Cost',
    },
    {
      field: 'ProportionInpatient',
      headerName: 'Proportion Inpatient',
    },
  ];

  const [activeTable, setActiveTable] = useState('diagnosis'); // 'diagnosis' or 'procedure', determines which table is displayed

  const handleTableChange = (_, newTable) => {
    setActiveTable(newTable);
  };

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
            <ToggleButton value="diagnosis">Top Diagnoses</ToggleButton>
            <ToggleButton value="procedure">Top Procedures</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {activeTable === 'diagnosis' && (
          <Box width="100%" overflow="auto">
            <Box display="flex" justifyContent="center" alignItems="center">
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  {/* Your TextField */}
                  <TextField
                    type="number"
                    label="Set Time Interval"
                    value={lookback}
                    onChange={(e) => setLookback(e.target.value)}
                  />
                </Grid>
                <Grid item>
                  <Button onClick={handleSearchDiagnosis} style={{ marginTop: '20px' }}>
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <h2>Top Diagnoses</h2>
            <DataGrid
              rows={searchResults}
              columns={diagnosisColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
            />
          </Box>
        )}
        {activeTable === 'procedure' && (
          <Box width="100%" overflow="auto">
            <Box display="flex" justifyContent="center" alignItems="center">
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  {/* Your TextField */}
                  <TextField
                    type="number"
                    label="Set Time Interval"
                    value={lookback}
                    onChange={(e) => setLookback(e.target.value)}
                  />
                </Grid>
                <Grid item>
                  <Button onClick={handleSearchProcedure} style={{ marginTop: '20px' }}>
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
            <h2>Top Procedures</h2>
            <DataGrid
              rows={searchResults}
              columns={procedureColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
            />
          </Box>
        )}
      </Box>
      <Divider />
    </Container>
  );
}
