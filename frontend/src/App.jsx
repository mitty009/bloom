import React, { useState, useReducer, useRef } from 'react'
import { Formik, Form } from 'formik'
import CurrencyInput from 'react-currency-input-field'
import { Box, Button, TextField, useTheme, FormGroup, Alert, Checkbox, FormControlLabel, CircularProgress, Divider, Typography, InputBase, IconButton, Autocomplete, MenuItem } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import BloomLogo from "./assets/bnplogo.png"
import './App.css'
import emailjs from '@emailjs/browser';

function App() {
  const isNonMobile = useMediaQuery("(min-width:1200px)");
  const [loading, setLoading] = useState(false)
  const form = useRef();

  const calculateCompoundGrowth = (principal, annualRate, years) => {
    const n = 1
    const rate = annualRate / n
    const time = n * years

    const finalAmount = principal * Math.pow(1 + rate, time)
    return finalAmount
  }

  const calculateLoanInterest = (principal, annualRate, time) => {
    const interest = principal * (annualRate / 100)
    return interest
  }

  const calculateCashBalanceAtRetirement = (yearsUntilRetirement, superContributions, yearsTilDebtFree, rentalIncome, outgoings) => {

    const cashBalance = ((yearsUntilRetirement - yearsTilDebtFree) * superContributions) + ((yearsUntilRetirement - yearsTilDebtFree) * rentalIncome) - ((yearsUntilRetirement - yearsTilDebtFree) * outgoings)
    return cashBalance
  }

  const handleOnValueChange = (value, name, setValues, values) => {

    const newValue = {
      ...values,
      [name]: value,
      loanAmount: values.propertyPurchasePrice - values.depositFromSuper,
      annualRentalIncome: values.weeklyRentalIncome * 52,
      rentalYield: (values.annualRentalIncome / Number(values.propertyPurchasePrice)) * 100,
      employersContribution: values.grossAnnualIncome * 0.12,
      taxDepreciationRebates: values.propertyPurchasePrice * 0.003,
      totalIncomings: values.employersContribution + values.taxDepreciationRebates + values.annualRentalIncome + Number(values.salarySacrifice),
      loanInterest: calculateLoanInterest(values.loanAmount, values.currentInterestRate, (values.expectedRetirementAge - values.age)),
      propertyValueAtRetirement: calculateCompoundGrowth(Number(values.propertyPurchasePrice), 0.04, (65 - Number(values.age))),
      propertyManagementFees: values.annualRentalIncome * 0.088,
      totalOutgoings: parseFloat(values.loanInterest) + parseFloat(values.councilAndWaterRates) + parseFloat(values.buildingInsuranceOrBodyCorp) + parseFloat(values.propertyManagementFees) + parseFloat(values.adminFees),
      annualCashFlow: values.totalIncomings - values.totalOutgoings,
      yearsTilPropertyDebtFree: (values.loanAmount / values.annualCashFlow) * 0.8,
      cashBalanceAtRetirement: calculateCashBalanceAtRetirement((Number(values.expectedRetirementAge) - Number(values.age)), parseFloat(values.employersContribution), parseFloat(values.yearsTilPropertyDebtFree), parseFloat(values.annualRentalIncome), (parseFloat(values.councilAndWaterRates) + parseFloat(values.buildingInsuranceOrBodyCorp) + parseFloat(values.propertyManagementFees) + parseFloat(values.adminFees))),
      valueOfRentalIncomeAtRetirement: calculateCompoundGrowth(values.weeklyRentalIncome, 0.025, (Number(values.expectedRetirementAge) - Number(values.age)))
    }
    setValues(newValue)
  };

  const sendEmail = (values) => {
    emailjs.sendForm('service_x50jj6n', 'template_y6lr7wd', form.current, import.meta.env.VITE_EMAIL_API_KEY)
      .then((result) => {
          console.log(result.text);
      }, (error) => {
          console.log(error.text);
      });
  }


  return (
    <Box alignItems="center" display="flex" flexDirection="column" alignContent="center" backgroundColor="#778777"
    >
      <Box display="flex" flexDirection="row" width="100%" justifyContent="center" alignContent="center" alignItems="center">
        <Box>
          <img src={BloomLogo} alt="Bloom Logo" style={{ width: "100%", maxWidth: "90%", height: "auto" }} />
        </Box>
        <Typography variant='h5' color="white" alignContent="center" >SMSF Cashflow Calculator</Typography>
      </Box>
      <Formik
        onSubmit={(values) => {
          setLoading(true)
          sendEmail(values)
          setLoading(false)
        }}
        validateOnMount
        initialValues={initialValues}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          setValues,
        }) => (

          <Form ref={form}>
            <Box display="flex" alignContent="center" height="auto"justifyContent="center" flexDirection={isNonMobile ? "row" : "column"}
            sx={{"& label.Mui-focused": { color: "#778777"}}}
            >
              <Box display="flex" backgroundColor="white" padding="20px 10px 0px 10px" width={isNonMobile ? "33%" : "100%"} height="100%" justifyContent="center" alignContent="center" flexDirection="column"
                sx={{ "& > div": { margin: "10px 0px 10px 0px" } }}
              >
                <Typography variant='h6'>Earnings</Typography>
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Name"
                  size='medium'
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  name="name"
                  error={
                    !!touched.name &&
                    !!errors.name
                  }
                  helperText={
                    touched.name && errors.name
                  }
                />

                <CurrencyInput
                  customInput={TextField}
                  id="grossAnnualIncome"
                  name="grossAnnualIncome"
                  label="Gross Annual Income (Combined)"
                  value={values.grossAnnualIncome}
                  prefix='$'
                  decimalScale={2}
                  // fixedDecimalScale={true}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />

                <CurrencyInput
                  customInput={TextField}
                  id="propertyPurchasePrice"
                  name="propertyPurchasePrice"
                  label="Property Purchase Price"
                  value={values.propertyPurchasePrice}
                  prefix='$'
                  decimalScale={2}
                  // fixedDecimalScale={true}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="depositFromSuper"
                  name="depositFromSuper"
                  label="Deposit from Super"
                  value={values.depositFromSuper}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="loanAmount"
                  name="loanAmount"
                  label="Loan Amount"
                  value={values.loanAmount}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />

                <CurrencyInput
                  customInput={TextField}
                  id="weeklyRentalIncome"
                  name="weeklyRentalIncome"
                  label="Weekly Rental Income"
                  value={values.weeklyRentalIncome}
                  prefix='$'
                  // suffix=" per week"
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <Box display="flex" width="100%" justifyContent="space-between" flexWrap="wrap">
                  <CurrencyInput
                    customInput={TextField}
                    id="annualRentalIncome"
                    name="annualRentalIncome"
                    label="Annual Rental Income"
                    value={values.annualRentalIncome}
                    prefix='$'
                    sx={{ width: "45%" }}
                    decimalScale={2}
                    // fixedDecimalScale={true}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <p>@</p>
                  <CurrencyInput
                    customInput={TextField}
                    id="rentalYield"
                    name="rentalYield"
                    label="Rental Yield"
                    value={values.rentalYield}
                    sx={{ width: "45%" }}
                    suffix='%'
                    decimalScale={2}
                    // fixedDecimalLength={true}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                </Box>

                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="employersContribution"
                    name="employersContribution"
                    label="Employers Contribution"
                    value={values.employersContribution}
                    prefix='$'
                    decimalScale={2}
                    // fixedDecimalScale={true}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>SGC - Calculated at 12%; amount being received by 2025</Typography>
                </Box>
                <CurrencyInput
                  customInput={TextField}
                  id="salarySacrifice"
                  name="salarySacrifice"
                  label="Salary Sacrifice"
                  value={values.salarySacrifice}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="taxDepreciationRebates"
                  name="taxDepreciationRebates"
                  label="Tax Depreciation Rebates"
                  value={values.taxDepreciationRebates}
                  prefix='$'
                  decimalScale={2}
                  // fixedDecimalScale={true}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="totalIncomings"
                  name="totalIncomings"
                  label="Total Incomings"
                  value={values.totalIncomings}
                  variant="filled"
                  sx={{ "& label.Mui-focused": { color: "#78777", backgroundColor: "#78777" } }}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
              </Box>
              <Box display="flex" backgroundColor="white" padding="20px 10px 0px 10px" width={isNonMobile ? "33%" : "100%"} flexDirection="column" sx={{ "& > div": { margin: "10px 0px 10px 0px" } }}>
                <Typography variant='h6' >Outgoings</Typography>
                <CurrencyInput
                  customInput={TextField}
                  id="currentInterestRate"
                  name="currentInterestRate"
                  label="Current Interest Rate"
                  value={values.currentInterestRate}
                  suffix='%'
                  // fixedDecimalScale={2}
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <Box display='flex' flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="loanInterest"
                    name="loanInterest"
                    label="Loan Interest"
                    value={values.loanInterest}
                    prefix='$'
                    decimalScale={2}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>Remember this will be the most you will ever pay because as you pay down the loan, the interest decreases</Typography>
                </Box>

                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="councilAndWaterRates"
                    name="councilAndWaterRates"
                    label="Council And Water Rates"
                    value={values.councilAndWaterRates}
                    prefix='$'
                    decimalScale={2}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>National Average is $2340 for single occupation & $3150 for dual occupation</Typography>
                </Box>
                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="buildingInsuranceOrBodyCorp"
                    name="buildingInsuranceOrBodyCorp"
                    label="Building Insurance or Body Corporate"
                    value={values.buildingInsuranceOrBodyCorp}
                    prefix='$'
                    decimalScale={2}
                    // fixedDecimalScale={true}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>Average freehold single = $1800 or freehold dual occupation = $2200 Average THBC = $2500</Typography>
                </Box>
                <CurrencyInput
                  customInput={TextField}
                  id="propertyManagementFees"
                  name="propertyManagementFees"
                  label="Rental & Property Management Fees"
                  value={values.propertyManagementFees}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="adminFees"
                  name="adminFees"
                  label="Admin, Accounting, Auditing & Registration Fees"
                  value={values.adminFees}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="totalOutgoings"
                  name="totalOutgoings"
                  label="Total Outgoings"
                  value={values.totalOutgoings}
                  prefix='$'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
              </Box>
              <Box display="flex" backgroundColor="white" padding="20px 10px 0px 10px" width={isNonMobile ? "33%" : "100%"} flexDirection="column" sx={{ "& > div": { margin: "10px 0px 10px 0px" } }}>
                <Typography variant='h6'>Potential Retirement Portfolio</Typography>
                <CurrencyInput
                  customInput={TextField}
                  id="age"
                  name="age"
                  label="Age"
                  value={values.age}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="expectedRetirementAge"
                  name="expectedRetirementAge"
                  label=" Expected Retirement Age"
                  value={values.expectedRetirementAge}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <CurrencyInput
                  customInput={TextField}
                  id="yearsTilPropertyDebtFree"
                  name="yearsTilPropertyDebtFree"
                  label="Years until property debt free"
                  value={values.yearsTilPropertyDebtFree}
                  suffix=' years'
                  decimalScale={2}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="propertyValueAtRetirement"
                    name="propertyValueAtRetirement"
                    label="Property Valuation at Retirement"
                    value={values.propertyValueAtRetirement}
                    width="100%"
                    prefix='$'
                    decimalScale={2}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>This calculation is based on a 4% per annum compounded growth (although the national average for the last 25 years is 6.8%)</Typography>
                </Box>

                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="cashBalanceAtRetirement"
                    name="cashBalanceAtRetirement"
                    label="Cash Balance at Retirement"
                    value={values.cashBalanceAtRetirement}
                    prefix='$'
                    decimalScale={2}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />
                  <Typography>After the property has been paid off & you've continued to receive rent & super contributions from your employer.
                    This calculation is based on you never having a rent or pay increase.</Typography>
                </Box>

                <Box display="flex" flexDirection="column">
                  <CurrencyInput
                    customInput={TextField}
                    id="valueOfRentalIncomeAtRetirement"
                    name="valueOfRentalIncomeAtRetirement"
                    label="Value of Rental Income at Retirement"
                    value={values.valueOfRentalIncomeAtRetirement}
                    prefix='$'
                    suffix=' per week'
                    decimalScale={0}
                    onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                  />

                  <Typography>This calculation is based on a conservative 2.5% per annum compounded growth</Typography>
                </Box>

                <CurrencyInput
                  customInput={TextField}
                  id="annualCashFlow"
                  name="annualCashFlow"
                  label="Annual Cashflow"
                  value={values.annualCashFlow}
                  prefix='$'
                  decimalScale={2}
                  sx={{ "& label.Mui-focused": { color: "#78777", backgroundColor: "#78777" } }}
                  onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                />
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" backgroundColor="#eee" alignContent="center" pt="20px"  sx={{ "& > div": { mt:"10px", color: "green"} }}>
              <TextField
                variant="filled"
                type="text"
                label="Agent"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.agent}
                name="agent"
                error={
                  !!touched.agent &&
                  !!errors.agent
                }
                helperText={
                  touched.agent && errors.agent
                }
              />
              <TextField
                variant="filled"
                type="email"
                label="Email Address to Send Results"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"

                error={
                  !!touched.email &&
                  !!errors.email
                }
                helperText={
                  touched.email && errors.email
                }
              />
              <Button
                type="submit"
                color="primary"
                name="createClientButton"
                variant="outlined"
                disabled={loading}
                sx={{mt: "10px"}}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Submit Calculator"
                )}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>

  )
}

const initialValues = {
  name: "",
  email: "",
  currentInterestRate: 7.09,
  councilAndWaterRates: 2340,
  buildingInsuranceOrBodyCorp: 1800,
  adminFees: 2200,
  yearsTilPropertyDebtFree: "",
  expectedRetirementAge: "65",
}


export default App
