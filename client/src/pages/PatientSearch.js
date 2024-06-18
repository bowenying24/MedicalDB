import React, { useState } from 'react';
import { Container, Divider, Grid, TextField, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const config = require('../config.json');

export default function PatientSearchPage() {
  //state variables for search parameters
  const [gender, setGender] = useState('');
  const [race, setRace] = useState('');
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [data, setData] = useState([]);

  const columns = [
    { field: 'BeneID', headerName: 'Benefits ID'  },
    { field: 'DOB', headerName: 'Date of Birth'  },
    { field: 'DOD', headerName: 'Date of Death'  },
    { field: 'Gender', headerName: 'Gender'  },
    { field: 'Race', headerName: 'Race'  },
    { field: 'State', headerName: 'State'  },
    { field: 'County', headerName: 'County' },
    { field: 'Comorbidity', headerName: 'Comorbidity'  },
    { field: 'DxCode', headerName: 'DxCode'  },
    { field: 'ProcedureCode', headerName: 'Procedure Code' },
  ];

  //executes query with given parameters, sets unique IDs for DataTable
  const handleSearch = () => {
    const route = `http://${config.server_host}:${config.server_port}/patient-search-results?gender=${gender}&race=${race}&state=${state}&county=${county}`;

    fetch(route)
      .then((res) => res.json())
      .then((resJson) => {const rowsWithId = resJson.map((row, index) => ({ id: index + 1, ...row }));
      setData(rowsWithId);})
      .catch((error) => {
        console.error(error);
      });
  };

  //Renders page, input fields to set query parameters
  return (
    <Container>
      <Divider />
      <h2>Patient Search</h2>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField type="number"
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField type="number"
            label="Race"
            value={race}
            onChange={(e) => setRace(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField type="number"
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField type="number"
            label="County"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={handleSearch} variant="contained">
            Search
          </Button>
        </Grid>
      </Grid>
      <h2>Search Results</h2>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={data} columns={columns} pageSize={10} />
      </div>
      <Divider />
    </Container>
  );
}
