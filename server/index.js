// server/index.js
const path = require('path');
const express = require("express");
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors({
  origin: '*',
}));

app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});


app.get('/diagnosis-summary', routes.diagnosis_summary);
app.get('/financial-impact-of-fraud', routes.financial_impact_fraud);
app.get('/patient-cohort', routes.patient_cohort);
app.get('/provider-info', routes.provider_info);
app.get('/encounter-search-results', routes.encounter_search_results);
app.get('/patient-search-results', routes.patient_search_results);
app.get('/procedure-summary', routes.procedure_summary);
app.get('/monthly-claims-summary', routes.monthly_claims_summary);
app.get('/monthly-claims-summary-hist', routes.monthly_claims_summary_hist);
app.get('/top-comorbidities', routes.top_comorbidities);
app.get('/alzheimers-claims-summary', routes.alzheimers_summary);
app.use(express.static(path.join(__dirname, 'client/build')));

// app.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });

app.listen(config.server_port, () => {
  console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

// app.listen(process.env.PORT || 3000, function(){
//   console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
