import React, { useState, useReducer, useRef } from 'react'
import { Formik, Form } from 'formik'
import CurrencyInput from 'react-currency-input-field'
import { Box, Button, TextField, CircularProgress, Divider, Typography, InputBase, IconButton, Autocomplete, MenuItem } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import BloomLogo from "./assets/bnplogo.png"
import emailjs from '@emailjs/browser';
import theme from './Theme.jsx'; // Import the custom theme
import { ThemeProvider } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';

function App() {
  const isNonMobile = useMediaQuery("(min-width:1200px)");
  const [loading, setLoading] = useState(false)
  const form = useRef();

  const calculateCompoundGrowth = (principal = 0, annualRate = 0, years = 0) => {
    const n = 1;
    const rate = annualRate / n;
    const time = n * years;
    return principal * Math.pow(1 + rate, time) || 0;
  };

  const calculateLoanInterest = (principal = 0, annualRate = 0, time = 0) => {
    return principal * (annualRate / 100) || 0;
  };


  const calculateCashBalanceAtRetirement = (yearsUntilRetirement, superContributions, yearsTilDebtFree, rentalIncome, outgoings) => {

    const cashBalance = ((yearsUntilRetirement - yearsTilDebtFree) * superContributions) + ((yearsUntilRetirement - yearsTilDebtFree) * rentalIncome) - ((yearsUntilRetirement - yearsTilDebtFree) * outgoings)
    return cashBalance
  }

  const handleOnValueChange = (value, name, setValues, values) => {
    const parsedValue = parseFloat(value) || 0; // Parse input value to a number, default to 0 if invalid

    const newValue = {
      ...values,
      [name]: parsedValue,
      loanAmount: parseFloat(values.propertyPurchasePrice) - parseFloat(values.depositFromSuper),
      annualRentalIncome: parseFloat(values.weeklyRentalIncome) * 52,
      rentalYield: ((values.annualRentalIncome / parseFloat(values.propertyPurchasePrice)) * 100) || 0,
      employersContribution: parseFloat(values.grossAnnualIncome) * 0.12,
      taxDepreciationRebates: parseFloat(values.propertyPurchasePrice) * 0.003,
      totalIncomings: parseFloat(values.employersContribution) + parseFloat(values.taxDepreciationRebates)
        + parseFloat(values.annualRentalIncome) + parseFloat(values.salarySacrifice),
      loanInterest: calculateLoanInterest(
        parseFloat(values.loanAmount),
        parseFloat(values.currentInterestRate),
        parseFloat(values.expectedRetirementAge) - parseFloat(values.age)
      ),
      propertyValueAtRetirement: calculateCompoundGrowth(
        parseFloat(values.propertyPurchasePrice),
        0.04,
        65 - parseFloat(values.age)
      ),
      propertyManagementFees: parseFloat(values.annualRentalIncome) * 0.088,
      totalOutgoings: parseFloat(values.loanInterest)
        + parseFloat(values.councilAndWaterRates)
        + parseFloat(values.buildingInsuranceOrBodyCorp)
        + parseFloat(values.propertyManagementFees)
        + parseFloat(values.adminFees),
      annualCashFlow: parseFloat(values.totalIncomings) - parseFloat(values.totalOutgoings),
      yearsTilPropertyDebtFree: (parseFloat(values.loanAmount) / parseFloat(values.annualCashFlow)) * 0.8 || 0,
      cashBalanceAtRetirement: calculateCashBalanceAtRetirement(
        parseFloat(values.expectedRetirementAge) - parseFloat(values.age),
        parseFloat(values.employersContribution),
        parseFloat(values.yearsTilPropertyDebtFree),
        parseFloat(values.annualRentalIncome),
        parseFloat(values.councilAndWaterRates) + parseFloat(values.buildingInsuranceOrBodyCorp)
        + parseFloat(values.propertyManagementFees) + parseFloat(values.adminFees)
      ),
      valueOfRentalIncomeAtRetirement: calculateCompoundGrowth(
        parseFloat(values.weeklyRentalIncome),
        0.025,
        parseFloat(values.expectedRetirementAge) - parseFloat(values.age)
      ),
    };
    setValues(newValue);
  };


  const sendEmail = () => {
    emailjs.init(import.meta.env.VITE_EMAILJS_API_KEY);
    emailjs.sendForm(
      import.meta.env.VITE_EMAIL_SERVICE_ID,
      import.meta.env.VITE_EMAIL_TEMPLATE_ID,
      form.current,
      import.meta.env.VITE_EMAIL_API_KEY
    )
      .then((result) => {
        console.log('Email sent:', result.text);
      })
      .catch((error) => {
        console.error('Email send error:', error.text);
      });
  };

  return (
    <main>
      <header>
        <div className="header">
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
                <div className="flex-container">
                  <div className='flex-item-1'>
                    <div className="card card-1">
                      <div className="section-header">
                        <h3>Scenario</h3>
                      </div>
                      <div className="container item-grid">
                        <div className="item item-1">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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

                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Gross Annual Income (Combined):
                          </Typography>
                          <CurrencyInput
                            customInput={TextField}
                            id="grossAnnualIncome"
                            name="grossAnnualIncome"
                            prefix='$'
                            decimalScale={2}
                            value={values.grossAnnualIncome}
                            onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                          />
                        </div>

                        <div className="currency-input item item-4">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                      </div>
                    </div>

                    <div className="card card-2">
                      <div className="section-header">
                        <h3>Super Fund Earnings</h3>
                      </div>
                      <div className="container item-grid">
                        <div className="currency-input item item1">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Weekly Rental Income:
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Annual Rental Income:
                          </Typography>

                          <CurrencyInput
                            customInput={TextField}
                            id="annualRentalIncome"
                            name="annualRentalIncome"

                            value={values.annualRentalIncome}
                            prefix='$'
                            decimalScale={2}
                            // fixedDecimalScale={true}
                            onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                          />
                        </div>
                        <div className="currency-input item item1">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Employers Super Contribution:
                          </Typography>

                          <Box display="flex" alignItems="center" justifyContent="space-around">

                            <CurrencyInput
                              customInput={TextField}
                              id="employersContribution"
                              name="employersContribution"
                              value={values.employersContribution}
                              prefix='$'
                              decimalScale={2}
                              onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                            />
                            <Tooltip title="Superannuation Guarantee Contribution (SGC) calculated at 12%, to be received by 2025." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </div>
                        <div className="currency-input item item1">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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

                        <Divider
                          sx={{
                            gridColumn: '1 / 3', // Span across column 1 and 2
                            my: 2, // Margin for spacing
                          }}
                        />

                        <div className="currency-input item item1">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Total Earnings:
                          </Typography>
                          <CurrencyInput
                            customInput={TextField}
                            id="totalIncomings"
                            name="totalIncomings"
                            value={values.totalIncomings}
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
                        <h3>Super Fund Expenses</h3>
                      </div>
                      <div className="container item-grid">
                        <div className="item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Current Interest Rate:
                          </Typography>

                          <TextField
                            fullWidth
                            type="text"
                            onBlur={handleBlur}
                            onChange={handleChange}
                            value={values.currentInterestRate}
                            name="currentInterestRate"
                            error={
                              !!touched.currentInterestRate &&
                              !!errors.currentInterestRate
                            }
                            helperText={
                              touched.currentInterestRate && errors.currentInterestRate
                            }
                          />
                        </div>
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Loan Interest:
                          </Typography>
                          <Box display="flex" justifyContent="space-around">
                            <CurrencyInput
                              customInput={TextField}
                              id="loanInterest"
                              name="loanInterest"
                              value={values.loanInterest}
                              prefix='$'
                              decimalScale={2}
                              onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                            />
                            <Tooltip title="Keep in mind, this is the highest amount you'll pay, as the loan interest will decrease as the loan balance reduces." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                        </div>
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Council and Water Rates:
                          </Typography>
                          <Box display="flex">
                            <CurrencyInput
                              customInput={TextField}
                              id="councilAndWaterRates"
                              name="councilAndWaterRates"
                              value={values.councilAndWaterRates}
                              prefix='$'
                              decimalScale={2}
                              onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                            />
                            <Tooltip title="The national average is $2,340 for single occupancy and $3,150 for dual occupancy." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                        </div>
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Building Insurance or Body Corperate:
                          </Typography>
                          <Box display="flex">
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
                            <Tooltip title="The average cost is $1,800 for single freehold, $2,200 for dual freehold, and $2,500 for townhouses or body corporate properties (THBC)." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                        </div>
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                        <Divider
                          sx={{
                            gridColumn: '1 / 3', // Span across column 1 and 2
                            my: 2, // Margin for spacing
                          }}
                        />

                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Total Expenses:
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
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Annual Cashflow Positivity:
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
                      </div>
                    </div>
                    <div className="card card-4">
                      <div className="section-header">
                        <h3>Trajectory of Retirement Portfolio</h3>
                      </div>
                      <div className="container item-grid">
                        <div className="currency-input item item-3">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
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
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Property Valuation at Retirement:
                          </Typography>
                          <Box display="flex">
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
                            <Tooltip title="This calculation assumes a 4% annual compounded growth, although the national average over the past 25 years has been 6.8%." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                        </div>



                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Cash Balance at Retirement:
                          </Typography>
                          <Box display="flex">
                            <CurrencyInput
                              customInput={TextField}
                              id="cashBalanceAtRetirement"
                              name="cashBalanceAtRetirement"
                              value={values.cashBalanceAtRetirement}
                              prefix='$'
                              decimalScale={2}
                              onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                            />
                            <Tooltip title="This calculation assumes the property is fully paid off, with ongoing rental income and employer super contributions, without any increases in rent or salary." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>

                        </div>
                        <div className="currency-input item">
                          <Typography
                            sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                          >
                            Value of Rental Income at Retirement:
                          </Typography>
                          <Box display="flex">
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
                            <Tooltip title="This calculation is based on a conservative 2.5% per annum compounded growth." arrow>
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className='flex-item-2'>
                    <aside>
                      <div className="card card-5">
                        <div className="section-header">
                          <h3>Submit</h3>
                        </div>
                        <div className="container">
                          <div className="currency-input">
                            <Typography
                              sx={{ minWidth: '100px', marginBottom: "10px", fontWeight: 400, fontSize: "14px", color: '#4A4A4A' }}
                            >
                              Interviewing Agent:
                            </Typography>

                            <TextField
                              customInput={TextField}
                              id="agent"
                              name="agent"
                              value={values.agent}
                              onValueChange={(value, name) => handleOnValueChange(value, name, setValues, values)}
                            />

                          </div>
                          <div className="item">
                            <Typography
                              sx={{ minWidth: '100px', fontWeight: 400, marginBottom: "10px", fontSize: "14px", color: '#4A4A4A' }}
                            >
                              Send to:
                            </Typography>

                            <TextField
                              fullWidth
                              // variant="filled"
                              type="text"
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
                          </div>
                          <Divider
                            sx={{
                              gridColumn: '1 / 3', // Span across column 1 and 2
                              my: 2, // Margin for spacing
                            }}
                          />
                          <Box display="flex" justifyContent="space-around">
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
                                "Submit"
                              )}
                            </Button>
                            <Button
                              color="secondary"
                              variant="outlined"
                              disabled={loading}
                              sx={{ mt: "10px", ml: "20px" }}
                              onClick={() => setValues(initialValues)}
                            >
                              Clear Form
                            </Button>
                          </Box>
                        </div>
                      </div>
                    </aside>
                  </div>


                </div>
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
  propertyPurchasePrice: 0,
  depositFromSuper: 0,
  loanAmount: 0,
  weeklyRentalIncome: 0,
  annualRentalIncome: 0,
  rentalYield: 0,
  employersContribution: 0,
  salarySacrifice: 0,
  taxDepreciationRebates: 0,
  totalIncomings: 0,
  councilAndWaterRates: 2340,
  buildingInsuranceOrBodyCorp: 1800,
  adminFees: 2200,
  yearsTilPropertyDebtFree: 0,
  expectedRetirementAge: "65",
  loanInterest: 0,
  propertyValueAtRetirement: 0,
  propertyManagementFees: 0,
  totalOutgoings: 0,
  annualCashFlow: 0,
  cashBalanceAtRetirement: 0,
  valueOfRentalIncomeAtRetirement: 0,
  grossAnnualIncome: 0,
};


export default App
