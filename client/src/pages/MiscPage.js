import { Container, Divider, Box, ToggleButton, ToggleButtonGroup, Grid, TextField, Button } from '@mui/material';
import { useState , useEffect} from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

import LazyTable from '../components/LazyTable';
import { DataGrid } from '@mui/x-data-grid';
const config = require('../config.json');

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];





export default function HomePage() {
  //Stores query parameter in state, executes query w/ parameter and returns results
  const [dxCode, setDxCode] = useState(41401);
  const [searchResults, setSearchResults] = useState([]);
  //Execute patient cohort query with given dxCode
  const handleSearch = () => {
    const searchEndpoint = `http://${config.server_host}:${config.server_port}/patient-cohort?dxCode=${dxCode}`;
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
  // Define columns for each table
  const patientCohortColumns = [{ field: 'BeneID', headerName: 'Beneficiary ID'},
                                  {field: 'Age', headerName: 'Age'},
                                  {field: 'Gender', headerName: 'Gender'},
                                  {field: 'Race', headerName: 'Race'},
                                  {field: 'LastEncounterDate', headerName: 'Last Encounter Date'},
                                  {field: 'ProviderID', headerName: 'Provider ID'},
                                  {field: 'DxCode', headerName: 'Diagnose Code'},
                                  {field: 'DxName', headerName: 'Diagnose Name'},
                                  {field: 'DxDate', headerName: 'Diagnose Date'}];
  const providerInfoColumns = [{ field: 'ProviderID', headerName: 'Provider ID' },
                                { field: 'TotalPatients', headerName: 'Total Patients' },
                                { field: 'TotalClaims', headerName: 'Total Claims' },
                                { field: 'TotalAmountReimbursed', headerName: 'Total Amount Reimbursed' },
                                { field: 'Dx_1', headerName: 'Common Diagnose 1' },
                                { field: 'Dx_2', headerName: 'Common Diagnose 2' },
                                { field: 'Dx_3', headerName: 'Common Diagnose 3' },
                                { field: 'Proc_1', headerName: 'Common Procedure 1' },
                                { field: 'Proc_2', headerName: 'Common Procedure 2' },
                                { field: 'Proc_3', headerName: 'Common Procedure 3' }];
  const comorbiditiesColumns = [{ field: 'Comorbidity', headerName: 'Comorbidity' },
                                { field: 'PatientCount', headerName: 'Patient Count' },
                                { field: 'ClaimCount', headerName: 'Claim Count'},
                                { field: 'TotalSpending', headerName: 'Total Spending' }];
  const alzheimersColumns = [{ field: 'HealthCondition', headerName: 'Health Condition'},
                            { field: 'ClaimCount', headerName: 'Claim Count'}];

  const [activeTable, setActiveTable] = useState('patientCohort'); // Default table
  const [comorbidityData, setComorbidityData] = useState([]);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top-comorbidities`)
      .then(response => response.json())
      .then(data => setComorbidityData(data))
      .catch(error => console.error('Error fetching comorbidity data:', error));
  }, []);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x  = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy  + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
        );
    };
    //Renders visualizations of the data
    const renderCharts = () => {
        if (activeTable === 'comorbidities') {
        return (
            <Box display="flex" justifyContent="space-around" flexWrap="wrap" flexDirection="column" alignItems="center">
            <Box>
                <h3>Patient Count by Comorbidity</h3>
                <ResponsiveContainer width={400} height={400}>
                <PieChart width={400} height={400}>
                    <Pie
                    data={comorbidityData}
                    dataKey="PatientCount"
                    nameKey="Comorbidity"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={renderCustomizedLabel}
                    >
                    {comorbidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box>
                <h3>Claim Count by Comorbidity</h3>
                <ResponsiveContainer width={400} height={400}>
                <PieChart width={400} height={400}>
                    <Pie
                    data={comorbidityData}
                    dataKey="ClaimCount"
                    nameKey="Comorbidity"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                    >
                    {comorbidityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box>
                <h3>Total Spending by Comorbidity</h3>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comorbidityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Comorbidity" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="TotalSpending" fill="#8884d8" />
                </BarChart>
                </ResponsiveContainer>
            </Box>
            </Box>
        );
        }
    };

  const handleTableChange = (_, newTable) => {
    setActiveTable(newTable);
  };

  return (
    //Toggle Buttons determine which page is shown
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
            <ToggleButton value="patientCohort">Patient Cohort</ToggleButton>
            <ToggleButton value="providerInfo">Provider Info</ToggleButton>
            <ToggleButton value="comorbidities">Comorbidities</ToggleButton>
            <ToggleButton value="alzheimers">Alzheimer's</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {activeTable === 'patientCohort' && (
          //Contains entry field to set DxCode Parameter, search button to execute query
          <Box width="100%" overflow="auto">
            <Grid container spacing={6}>
              <Grid item xs={4}>
              <TextField
                label="Diagnosis Code"
                value={dxCode}
                onChange={(e) => setDxCode(e.target.value)}
                fullWidth
              />
              </Grid>
              <Button onClick={handleSearch} style={{ left: '50%', transform: 'translateX(-50%)', marginTop: '20px' }}>
                Search
              </Button>
            </Grid>
            <h2>Patient Cohort Information</h2>
            <DataGrid
              rows={searchResults}
              columns={patientCohortColumns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
            />
          </Box>
        )}
        {activeTable === 'providerInfo' && (
          <Box width="100%" overflow="auto">
            <h2>Provider Information</h2>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/provider-info`}
              columns={providerInfoColumns}
              defaultPageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}
        {activeTable === 'comorbidities' && (
          <Box width="100%" overflow="auto">
            <h2>Top Comorbidities</h2>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/top-comorbidities`}
              columns={comorbiditiesColumns}
              defaultPageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}
        {activeTable === 'alzheimers' && (
          <Box width="100%" overflow="auto">
            <h2>Alzheimer's Claims Summary</h2>
            <LazyTable
              route={`http://${config.server_host}:${config.server_port}/alzheimers-claims-summary`}
              columns={alzheimersColumns}
              defaultPageSize={10}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
        )}

        {renderCharts()}
      </Box>
      <Divider />
    </Container>
  );
}
