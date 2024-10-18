import React, { useState, useReducer, useRef } from 'react'
import { Formik, Form } from 'formik'
import CurrencyInput from 'react-currency-input-field'
import { Box, Button, TextField, useTheme, FormGroup, Alert, Checkbox, FormControlLabel, CircularProgress, Divider, Typography, InputBase, IconButton, Autocomplete, MenuItem } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import BloomLogo from "./assets/bnplogo.png"
import emailjs from '@emailjs/browser';
import theme from './Theme.jsx'; // Import the custom theme
import { ThemeProvider } from '@mui/material/styles';


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
    <main>
      <header>
        <div className="flex-container header">
          <img src={BloomLogo} alt="Bloom Logo" />
          <h1>SMSF CASHFLOW CALCULATOR</h1>
        </div>
      </header>

      <section className="form-section">
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

            <ThemeProvider theme={theme}>
              <Form ref={form}>
                <div className="card card-1">
                  <div className="section-header">
                    <h3>Earnings</h3>
                  </div>
                  <div className="container item-grid">
                    <div className="item item-1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Name:
                      </Typography>

                      <TextField
                        fullWidth
                        // variant="filled"
                        type="text"
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
                    </div>
                    <div className="currency-input item item-3">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Age:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="age"
                        name="age"
                        value={values.age}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>


                    <div className="currency-input item item-4">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Property Purchase Price:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="propertyPurchasePrice"
                        name="propertyPurchasePrice"
                        value={values.propertyPurchasePrice}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item item-5">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Deposit from Super:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="depositFromSuper"
                        name="depositFromSuper"
                        value={values.depositFromSuper}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>

                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Loan Amount:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="loanAmount"
                        name="loanAmount"
                        value={values.loanAmount}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Weekly Rental Income
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="weeklyRentalIncome"
                        name="weeklyRentalIncome"
                        value={values.weeklyRentalIncome}
                        prefix='$'
                        // suffix=" per week"
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Annual Rental Income:
                      </Typography>

                      <CurrencyInput
                        customInput={TextField}
                        id="annualRentalIncome"
                        name="annualRentalIncome"

                        value={values.annualRentalIncome}
                        prefix='$'
                        sx={{ width: "45%" }}
                        decimalScale={2}
                        // fixedDecimalScale={true}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Rental Yield:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="rentalYield"
                        name="rentalYield"
                        value={values.rentalYield}
                        sx={{ width: "45%" }}
                        suffix='%'
                        decimalScale={2}
                        // fixedDecimalLength={true}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Employers Contribution:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="employersContribution"
                        name="employersContribution"
                        value={values.employersContribution}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                      <Typography sx={{ fontWeight: '200', fontSize: '12px' }}>SGC - Calculated at 12%; amount being received by 2025</Typography>
                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Salary Sacrifice:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="salarySacrifice"
                        name="salarySacrifice"
                        value={values.salarySacrifice}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Tax Depreciation Rebates:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="taxDepreciationRebates"
                        name="taxDepreciationRebates"
                        value={values.taxDepreciationRebates}
                        prefix='$'
                        decimalScale={2}
                        // fixedDecimalScale={true}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item item1">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Total Incomings:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="totalIncomings"
                        name="totalIncomings"
                        value={values.totalIncomings}
                        // variant="filled"
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                  </div>
                </div>

                <div className="card card-2">
                  <div className="section-header">
                    <h3>Outgoings</h3>
                  </div>
                  <div className="container item-grid">
                    <div className="currency-input item item-4">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Current Interest Rates
                      </Typography>

                      <CurrencyInput
                        customInput={TextField}
                        id="currentInterestRate"
                        name="currentInterestRate"
                        value={values.currentInterestRate}
                        suffix='%'
                        // fixedDecimalScale={2}
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Loan Interest
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="loanInterest"
                        name="loanInterest"
                        value={values.loanInterest}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Council and Water Rates:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="councilAndWaterRates"
                        name="councilAndWaterRates"

                        value={values.councilAndWaterRates}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Building Insurance or Body Corp:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="buildingInsuranceOrBodyCorp"
                        name="buildingInsuranceOrBodyCorp"

                        value={values.buildingInsuranceOrBodyCorp}
                        prefix='$'
                        decimalScale={2}
                        // fixedDecimalScale={true}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Rental & Property Management Fees:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="propertyManagementFees"
                        name="propertyManagementFees"

                        value={values.propertyManagementFees}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Admin, Accounting, Auditing & Registration Fees
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="adminFees"
                        name="adminFees"

                        value={values.adminFees}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Total Outgoings
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="totalOutgoings"
                        name="totalOutgoings"
                        value={values.totalOutgoings}
                        variant="filled"
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                  </div>
                </div>
                <div className="card card-3">
                  <div className="section-header">
                    <h3>Potential Retirement Portfolio</h3>
                  </div>
                  <div className="container item-grid">
                    <div className="currency-input item item-4">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Expected Retirement Age:
                      </Typography>

                      <CurrencyInput
                        customInput={TextField}
                        id="expectedRetirementAge"
                        name="expectedRetirementAge"
                        value={values.expectedRetirementAge}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />

                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Years Until Property Debt Free:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="yearsTilPropertyDebtFree"
                        name="yearsTilPropertyDebtFree"
                        value={values.yearsTilPropertyDebtFree}
                        suffix=' years'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Property Valuation at Retirement:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="propertyValueAtRetirement"
                        name="propertyValueAtRetirement"
                        value={values.propertyValueAtRetirement}
                        width="100%"
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Cash Balance at Retirement:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="cashBalanceAtRetirement"
                        name="cashBalanceAtRetirement"
                        value={values.cashBalanceAtRetirement}
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Value of Rental Income at Retirement:
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="valueOfRentalIncomeAtRetirement"
                        name="valueOfRentalIncomeAtRetirement"
                        value={values.valueOfRentalIncomeAtRetirement}
                        prefix='$'
                        suffix=' per week'
                        decimalScale={0}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Annual Cashflow:
                      </Typography>
                      <CurrencyInput
                      customInput={TextField}
                      id="annualCashFlow"
                      name="annualCashFlow"
                      value={values.annualCashFlow}
                      prefix='$'
                      decimalScale={2}
                      variant="filled"
                      sx={{ "& label.Mui-focused": { color: "#78777", backgroundColor: "#78777" } }}
                      onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                    />
                    </div>
                    <div className="currency-input item">
                      <Typography
                        sx={{ minWidth: '100px', fontWeight: 500, color: '#4A4A4A' }}
                      >
                        Total Outgoings
                      </Typography>
                      <CurrencyInput
                        customInput={TextField}
                        id="totalOutgoings"
                        name="totalOutgoings"
                        value={values.totalOutgoings}
                        variant="filled"
                        prefix='$'
                        decimalScale={2}
                        onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                      />
                    </div>
                  </div>
                </div>

                <Box display="flex" alignContent="center" height="auto" justifyContent="center" flexDirection={isNonMobile ? "row" : "column"}
                  sx={{ "& label.Mui-focused": { color: "#778777" } }}
                >
                  <Box display="flex" backgroundColor="white" padding="20px 10px 0px 10px" width={isNonMobile ? "33%" : "100%"} height="100%" justifyContent="center" alignContent="center" flexDirection="column"
                    sx={{ "& > div": { margin: "10px 0px 10px 0px" } }}
                  >





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





                    <Box display="flex" flexDirection="column">

                    </Box>


                  </Box>
                  <Box display="flex" backgroundColor="white" padding="20px 10px 0px 10px" width={isNonMobile ? "33%" : "100%"} flexDirection="column" sx={{ "& > div": { margin: "10px 0px 10px 0px" } }}>
                    <Typography variant='h6' >Outgoings</Typography>

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

                      <Typography>National Average is $2340 for single occupation & $3150 for dual occupation</Typography>
                    </Box>
                    <Box display="flex" flexDirection="column">

                      <Typography>Average freehold single = $1800 or freehold dual occupation = $2200 Average THBC = $2500</Typography>
                    </Box>



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


                    <Box display="flex" flexDirection="column">

                      <Typography>This calculation is based on a 4% per annum compounded growth (although the national average for the last 25 years is 6.8%)</Typography>
                    </Box>

                    <Box display="flex" flexDirection="column">

                      <Typography>After the property has been paid off & you've continued to receive rent & super contributions from your employer.
                        This calculation is based on you never having a rent or pay increase.</Typography>
                    </Box>

                    <Box display="flex" flexDirection="column">


                      <Typography>This calculation is based on a conservative 2.5% per annum compounded growth</Typography>
                    </Box>

                    
                  </Box>
                </Box>
                <Box display="flex" flexDirection="column" backgroundColor="#eee" alignContent="center" pt="20px" sx={{ "& > div": { mt: "10px", color: "green" } }}>
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
                    sx={{ mt: "10px" }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Submit Calculator"
                    )}
                  </Button>
                </Box>
              </Form>
            </ThemeProvider>
          )}
        </Formik>
      </section>
    </main>
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
  salarySacrifice: 0,
  buildingInsuranceOrBodyCorp: 2500,
  adminFees: 2800
}


export default App
