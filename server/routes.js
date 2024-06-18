const mysql = require('mysql')
const config = require('./config.json')

// Creates MySQL connection using database credential provided in config.json

// Do not edit. If the connection fails, make sure to check that config.json is filled out correctly
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const diagnosis_summary = async function(req, res) {
  const lookback = req.query.lookback
    connection.query(`
      SELECT dx.DxCode
      ,dx.DxName
      ,COUNT(DISTINCT enc.BeneID) AS TotalPatients
      ,COUNT(DISTINCT enc.ClaimID) AS TotalEncounters
      ,SUM(enc.AmountReimbursed) AS TotalCost
      ,SUM(CASE WHEN enc.Type = 'Outpatient' THEN enc.AmountReimbursed END) AS OutpatientCost
      ,SUM(CASE WHEN enc.Type = 'Outpatient' THEN enc.AmountReimbursed END)/SUM(enc.AmountReimbursed) AS ProportionOutpatient
      ,SUM(CASE WHEN enc.Type = 'Inpatient' THEN enc.AmountReimbursed END) AS InpatientCost
      ,SUM(CASE WHEN enc.Type = 'Inpatient' THEN enc.AmountReimbursed END)/SUM(enc.AmountReimbursed) AS ProportionInpatient
  FROM Encounter enc
  JOIN EncounterDiagnosis edx
  ON enc.ClaimID = edx.ClaimID
  JOIN DiagnosisReference dx
  ON edx.DxCode = dx.DxCode
  WHERE enc.ClaimStartDate >= DATE_ADD("2009-12-31", INTERVAL -${lookback} DAY)
  AND edx.DxNum = 1
  GROUP BY dx.DxCode, dx.DxName
  HAVING SUM(enc.AmountReimbursed) > 0
  ORDER BY SUM(enc.AmountReimbursed) DESC;
      `,
      (err, data) => {
        if (err) {
          console.log(err);
          res.json({});
        } else {
          console.log(data)
          res.json(data);
        }
      }
    ); // replace this with your implementation
};

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


const financial_impact_fraud = async function(req, res) {
// app.get('/financial-impact-of-fraud', (req, res) => {
  const query = `
      SELECT AgeCategory
          ,AVG(CASE WHEN PotentialFraud = 'Yes' THEN TotalReimbursedAmount END) AS FraudAvgReimbursedAmount
          ,AVG(CASE WHEN PotentialFraud != 'Yes' THEN TotalReimbursedAmount END) AS NoFraudAvgReimbursedAmount
          ,AVG(CASE WHEN PotentialFraud = 'Yes' THEN TotalDeductible END) AS FraudAvgDeductible
          ,AVG(CASE WHEN PotentialFraud != 'Yes' THEN TotalDeductible END) AS NoFraudAvgDeductible
      FROM (
          SELECT BeneID, AgeCategory
              ,MAX(CASE WHEN ProviderRank = 1 THEN PotentialFraud END) AS PotentialFraud
              ,SUM(TotalReimbursedAmount) AS TotalReimbursedAmount
              ,SUM(TotalDeductible) AS TotalDeductible
          FROM  PatientProvider
          GROUP BY BeneID, AgeCategory
      ) summary
      GROUP BY AgeCategory
      ORDER BY AgeCategory
  `;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.json(results);
  });
};

const patient_cohort = async function(req, res) {
  const dxCode = req.query.dxCode;

  const query = `
  WITH PatDx AS (
      SELECT enc.BeneID, dx.DxCode, dx.DxName, MIN(enc.ClaimStartDate) AS DxDate
      FROM Encounter enc
      JOIN EncounterDiagnosis edx ON enc.ClaimID = edx.ClaimID
      JOIN DiagnosisReference dx ON edx.DxCode = dx.DxCode
      LEFT JOIN Comorbidity com ON enc.BeneID = com.BeneID
      AND com.Comorbidity IN ('Alzheimers Disease', 'Chronic Kidney Disease', 'Heart Failure')
      WHERE dx.DxCode = ${dxCode} AND com.BeneID IS NULL
      GROUP BY enc.BeneID, dx.DxCode, dx.DxName
  )
  SELECT pv.BeneID, pv.Age, pv.Gender, pv.Race, pv.LastEncounterDate, pv.ProviderID,
         pdx.DxCode, pdx.DxName, pdx.DxDate
  FROM PatDx pdx
  JOIN PatientView pv ON pdx.BeneID = pv.BeneID
  WHERE pv.DOD IS NULL
  `;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.json(results);
  });
};


// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const provider_info = async function(req, res) {
  // Parse page and pageSize from query parameters
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  // Your SQL query
  const query = `
  SELECT p.ProviderID, p.TotalPatients, p.TotalClaims, p.TotalAmountReimbursed
      ,MAX(CASE WHEN dx3.DxNumber = 1 THEN DiagnosisDescription END) AS Dx_1
      ,MAX(CASE WHEN dx3.DxNumber = 2 THEN DiagnosisDescription END) AS Dx_2
      ,MAX(CASE WHEN dx3.DxNumber = 3 THEN DiagnosisDescription END) AS Dx_3
      ,MAX(CASE WHEN px3.ProcNumber = 1 THEN ProcedureDescription END) AS Proc_1
      ,MAX(CASE WHEN px3.ProcNumber = 2 THEN ProcedureDescription END) AS Proc_2
      ,MAX(CASE WHEN px3.ProcNumber = 3 THEN ProcedureDescription END) AS Proc_3
  FROM TopProviderInfo p
  LEFT JOIN (
      SELECT ProviderID, DiagnosisDescription, TotalClaims, ROW_NUMBER() OVER (PARTITION BY ProviderID ORDER BY TotalClaims DESC) AS DxNumber
      FROM (
      SELECT p.ProviderID, CONCAT(dx.DxName,' [',dx.DxCode,']') AS DiagnosisDescription, COUNT(DISTINCT enc.ClaimID) AS TotalClaims
      FROM TopProviderInfo p
      JOIN Encounter enc
      ON p.ProviderID = enc.ProviderID
      JOIN EncounterDiagnosis edx
      ON enc.ClaimID = edx.ClaimID
      JOIN DiagnosisReference dx
      ON edx.DxCode = dx.DxCode
      GROUP BY enc.ProviderID, CONCAT(dx.DxName,' [',dx.DxCode,']')
      ) dx_all
  ) dx3
  ON p.ProviderID = dx3.ProviderID AND dx3.DxNumber <= 3
  LEFT JOIN (
      SELECT ProviderID, ProcedureDescription, TotalClaims, ROW_NUMBER() OVER (PARTITION BY ProviderID ORDER BY TotalClaims DESC) AS ProcNumber
      FROM (
      SELECT p.ProviderID, CONCAT(px.ProcedureName,' [',px.ProcedureCode,']') AS ProcedureDescription, COUNT(DISTINCT enc.ClaimID) AS TotalClaims
      FROM TopProviderInfo p
      JOIN Encounter enc
      ON p.ProviderID = enc.ProviderID
      JOIN EncounterProcedure epx
      ON enc.ClaimID = epx.ClaimID
      JOIN ProcedureReference px
      ON epx.ProcedureCode = px.ProcedureCode
      GROUP BY enc.ProviderID, CONCAT(px.ProcedureName,' [',px.ProcedureCode,']')
      ) proc_all
  ) px3
  ON p.ProviderID = px3.ProviderID AND px3.ProcNumber <= 3
  GROUP BY p.ProviderID, p.TotalPatients, p.TotalClaims, p.TotalAmountReimbursed
  ORDER BY p.TotalAmountReimbursed DESC
LIMIT ${pageSize} OFFSET ${offset};
  `;

  // Execute the query
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(results);
      res.json(results);
    }
  });
};



// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const encounter_search_results = async function(req, res) {
  // app.get('/encounter-search-results', (req, res) => {
    const {type, min_reimbursement, max_reimbursement, min_deductible, max_deductible } = req.query;

    const query = `
      SELECT DISTINCT E.*, EP.ProcedureCode AS ProcedureCode, ED.DxCode AS DxCode
      FROM Encounter E
      JOIN EncounterDiagnosis ED on E.claimID = ED.ClaimID AND ED.DxNum = 1
      JOIN EncounterProcedure EP ON E.ClaimID = EP.ClaimID AND EP.ProcedureNum = 1
      WHERE
          (E.Type = ? or ? IS NULL or ? = '') AND
          (E.AmountReimbursed BETWEEN ? AND ?) AND
          (E.Deductible BETWEEN ? AND ?)
    `;

    const queryParams = [ type, type, type,
      min_reimbursement, max_reimbursement,
      min_deductible, max_deductible
    ];

    connection.query(query, queryParams, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.json(results);
    });
  };

  // app.listen(port, () => {
  //   console.log(`Server is running on port ${port}`);
  // });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const patient_search_results = async function(req, res) {
  // app.get('/patient-search-results', (req, res) => {
    const { gender, race, state, county } = req.query;

    const query = `
      SELECT P.*, C.Comorbidity, ED.DxCode, EP.ProcedureCode
      FROM Patient P
      JOIN Encounter E ON P.BeneID = E.BeneID
      JOIN EncounterDiagnosis ED ON E.ClaimID = ED.ClaimID AND ED.DxNum = 1
      JOIN EncounterProcedure EP ON E.ClaimID = EP.ClaimID AND EP.ProcedureNum = 1
      JOIN Comorbidity C ON P.BeneID = C.BeneID
      WHERE
          (P.Gender = ? OR ? IS NULL OR ? = '') AND
          (P.Race = ? OR ? IS NULL OR ? = '') AND
          (P.County = ? OR ? IS NULL OR ? = '') AND
          (P.State = ? OR ? IS NULL OR ? = '')
      GROUP BY (P.BeneID)
    `;

    const queryParams = [
      gender, gender, gender,
      race, race, race,
      county, county, county,
      state, state, state
    ];

    connection.query(query, queryParams, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }

      res.json(results);
    });
  };

  // app.listen(port, () => {
  //   console.log(`Server is running on port ${port}`);
  // });

  const procedure_summary = async function(req, res) {
    const lookback = req.query.lookback
    connection.query(`
      SELECT pr.ProcedureCode
      ,pr.ProcedureName
      ,COUNT(DISTINCT en.BeneID) AS TotalPatients
      ,COUNT(DISTINCT en.ClaimID) AS TotalEncounters
      ,COUNT(DISTINCT CASE WHEN en.Type = 'Outpatient' THEN en.ClaimID END) AS OutpatientEncounters
      ,COUNT(DISTINCT CASE WHEN en.Type = 'Inpatient' THEN en.ClaimID END) AS InpatientEncounters
      ,SUM(en.AmountReimbursed) AS TotalCost
      ,SUM(CASE WHEN en.Type = 'Outpatient' THEN en.AmountReimbursed END) AS OutpatientCost
      ,SUM(CASE WHEN en.Type = 'Outpatient' THEN en.AmountReimbursed END)/SUM(en.AmountReimbursed) AS ProportionOutpatient
      ,SUM(CASE WHEN en.Type = 'Inpatient' THEN en.AmountReimbursed END) AS InpatientCost
      ,SUM(CASE WHEN en.Type = 'Inpatient' THEN en.AmountReimbursed END)/SUM(en.AmountReimbursed) AS ProportionInpatient
  FROM EncounterProcedure ep
  JOIN Encounter en
  ON ep.ClaimID = en.ClaimID
  JOIN ProcedureReference pr
  ON ep.ProcedureCode = pr.ProcedureCode
  WHERE en.ClaimStartDate >= DATE_ADD("2009-12-31", INTERVAL -${lookback} DAY)
  AND ep.ProcedureNum = 1
  GROUP BY pr.ProcedureCode
      ,pr.ProcedureName
  HAVING SUM(en.AmountReimbursed) > 0
  ORDER BY SUM(en.AmountReimbursed) DESC;
        `,
        (err, data) => {
          if (err) {
            console.log(err);
            res.json({});
          } else {
            res.json(data);
          }
        }
      ); // replace this with your implementation
  };

const monthly_claims_summary = async function(req, res) {
  // Extract page and pageSize from query parameters
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default page size of 10

  // Calculate the offset
  const offset = (page - 1) * pageSize;

  const query = `
    SELECT
        YEAR(en.ClaimStartDate) AS Year,
        MONTH(en.ClaimStartDate) AS Month,
        COUNT(DISTINCT en.ClaimID) AS TotalClaims,
        COUNT(DISTINCT en.BeneID) AS TotalPatients
    FROM
        Encounter en
    WHERE en.ClaimStartDate >= "2009-01-01"
        AND en.ClaimStartDate < "2010-01-01"
    GROUP BY
        YEAR(en.ClaimStartDate),
        MONTH(en.ClaimStartDate)
    ORDER BY
        YEAR(en.ClaimStartDate),
        MONTH(en.ClaimStartDate)
    LIMIT ${pageSize}
    OFFSET ${offset};
  `;
  connection.query(query, [pageSize, offset], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.json(results);
  });

}
  const monthly_claims_summary_hist = async function(req, res) {

    const query = `
      SELECT
          YEAR(en.ClaimStartDate) AS Year,
          MONTH(en.ClaimStartDate) AS Month,
          COUNT(DISTINCT en.ClaimID) AS TotalClaims,
          COUNT(DISTINCT en.BeneID) AS TotalPatients
      FROM
          Encounter en
      WHERE en.ClaimStartDate >= "2009-01-01"
          AND en.ClaimStartDate < "2010-01-01"
      GROUP BY
          YEAR(en.ClaimStartDate),
          MONTH(en.ClaimStartDate)
      ORDER BY
          YEAR(en.ClaimStartDate),
          MONTH(en.ClaimStartDate);
    `;

    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log(results);
        res.json(results);
    });
};



// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

const top_comorbidities = async function(req, res) {

// app.get('/top-comorbidities', (req, res) => {
  const query = `
  SELECT com.Comorbidity, COUNT(DISTINCT p.BeneID) AS PatientCount, SUM(p.TotalClaims) AS ClaimCount, SUM(p.TotalReimbursedAmount) AS TotalSpending
  FROM PatientView p
  JOIN Comorbidity com ON p.BeneID = com.BeneID
  GROUP BY Comorbidity
  ORDER BY ClaimCount DESC
  LIMIT 5;

  `;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.json(results);
  });
};

const alzheimers_summary = async function(req, res) {
// app.get('/alzheimers-claims-summary', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 10; // Default page size of 10

  // Calculate the offset
  const offset = (page - 1) * pageSize;
  const query = `
    SELECT
      CASE
        WHEN Comorbidity =  'Alzheimers Disease' THEN 'Alzheimer''s Disease'
        ELSE 'No Alzheimer''s'
      END AS HealthCondition,
      COUNT(DISTINCT enc.ClaimID) AS ClaimCount
    FROM
      Patient p
      LEFT JOIN Comorbidity com ON p.BeneID = com.BeneID
      LEFT JOIN Encounter enc ON p.BeneID = enc.BeneID
      #LEFT JOIN InpatientData I ON B.BeneficiaryID = I.BeneficiaryID
      #LEFT JOIN OutpatientData O ON B.BeneficiaryID = O.BeneficiaryID
    GROUP BY
      HealthCondition
    ORDER BY
      ClaimCount DESC
      LIMIT ${pageSize}
      OFFSET ${offset};
  `;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.json(results);
  });
};

module.exports = {
  diagnosis_summary,
  financial_impact_fraud,
  patient_cohort,
  provider_info,
  encounter_search_results,
  patient_search_results,
  procedure_summary,
  monthly_claims_summary,
  monthly_claims_summary_hist,
  top_comorbidities,
  alzheimers_summary,
}
