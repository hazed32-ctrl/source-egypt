/**
 * Mortgage/Installment Calculator
 * Professional calculator with charts
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface MortgageCalculatorProps {
  propertyPrice: number;
  currency?: 'EGP' | 'USD';
  paymentPlan?: {
    downPayment: number;
    installmentYears: number;
    monthlyPayment?: number;
  };
}

const formatCurrency = (value: number, currency: string): string => {
  if (currency === 'EGP') {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
};

const CHART_COLORS = {
  downPayment: 'hsl(43, 74%, 49%)', // Gold
  installments: 'hsl(220, 70%, 50%)', // Blue
  interest: 'hsl(0, 72%, 51%)', // Red
};

const MortgageCalculator = ({
  propertyPrice,
  currency = 'EGP',
  paymentPlan,
}: MortgageCalculatorProps) => {
  // State
  const [price, setPrice] = useState(propertyPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(
    paymentPlan?.downPayment || 20
  );
  const [years, setYears] = useState(paymentPlan?.installmentYears || 10);
  const [interestEnabled, setInterestEnabled] = useState(false);
  const [interestRate, setInterestRate] = useState(10);

  // Calculations
  const calculations = useMemo(() => {
    const downPaymentAmount = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPaymentAmount;
    const months = years * 12;

    let monthlyPayment: number;
    let totalInterest: number;
    let totalPaid: number;

    if (interestEnabled && interestRate > 0) {
      // Amortizing loan calculation
      const monthlyRate = interestRate / 100 / 12;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / months;
        totalInterest = 0;
      } else {
        monthlyPayment =
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);
        totalInterest = monthlyPayment * months - loanAmount;
      }
    } else {
      // Simple installment (no interest)
      monthlyPayment = loanAmount / months;
      totalInterest = 0;
    }

    totalPaid = downPaymentAmount + monthlyPayment * months;

    return {
      downPaymentAmount,
      loanAmount,
      months,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      totalPaid: isNaN(totalPaid) ? 0 : totalPaid,
    };
  }, [price, downPaymentPercent, years, interestEnabled, interestRate]);

  // Pie chart data
  const pieData = useMemo(() => {
    const data = [
      {
        name: 'Down Payment',
        value: calculations.downPaymentAmount,
        color: CHART_COLORS.downPayment,
      },
      {
        name: 'Installments',
        value: calculations.loanAmount,
        color: CHART_COLORS.installments,
      },
    ];

    if (calculations.totalInterest > 0) {
      data.push({
        name: 'Interest',
        value: calculations.totalInterest,
        color: CHART_COLORS.interest,
      });
    }

    return data;
  }, [calculations]);

  // Bar chart data (yearly breakdown)
  const barData = useMemo(() => {
    const yearlyData = [];
    const yearlyPayment = calculations.monthlyPayment * 12;
    let remainingBalance = calculations.loanAmount;
    const monthlyRate = interestEnabled ? interestRate / 100 / 12 : 0;

    for (let year = 1; year <= years; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 0; month < 12; month++) {
        if (remainingBalance <= 0) break;

        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(
          calculations.monthlyPayment - interestPayment,
          remainingBalance
        );

        yearlyPrincipal += principalPayment;
        yearlyInterest += interestPayment;
        remainingBalance -= principalPayment;
      }

      yearlyData.push({
        year: `Y${year}`,
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
      });
    }

    return yearlyData;
  }, [calculations, years, interestEnabled, interestRate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border border-border/20"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            Payment Calculator
          </h3>
          <p className="text-sm text-muted-foreground">
            Calculate your monthly installments
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Price */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Property Price
            </Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="input-luxury text-lg font-semibold"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-primary" />
                Down Payment
              </Label>
              <span className="text-sm font-medium text-primary">
                {downPaymentPercent}% ({formatCurrency(calculations.downPaymentAmount, currency)})
              </span>
            </div>
            <Slider
              value={[downPaymentPercent]}
              onValueChange={([value]) => setDownPaymentPercent(value)}
              min={0}
              max={100}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Payment Duration
              </Label>
              <span className="text-sm font-medium text-primary">
                {years} years ({calculations.months} months)
              </span>
            </div>
            <Slider
              value={[years]}
              onValueChange={([value]) => setYears(value)}
              min={1}
              max={20}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 year</span>
              <span>10 years</span>
              <span>20 years</span>
            </div>
          </div>

          {/* Interest Toggle */}
          <div className="glass-card p-4 border border-border/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="interest-toggle">Include Interest</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Enable this for bank financing calculations
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id="interest-toggle"
                checked={interestEnabled}
                onCheckedChange={setInterestEnabled}
              />
            </div>

            {interestEnabled && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Interest Rate</Label>
                  <span className="text-sm font-medium text-primary">
                    {interestRate}% per year
                  </span>
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={([value]) => setInterestRate(value)}
                  min={1}
                  max={25}
                  step={0.5}
                  className="py-4"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results & Charts */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Monthly Payment</p>
                <p className="text-xl font-display font-bold text-gold-gradient">
                  {formatCurrency(calculations.monthlyPayment, currency)}
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/20">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
                <p className="text-xl font-display font-bold text-foreground">
                  {formatCurrency(calculations.totalPaid, currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {calculations.totalInterest > 0 && (
            <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-muted-foreground">Total Interest</p>
              <p className="text-lg font-semibold text-destructive">
                {formatCurrency(calculations.totalInterest, currency)}
              </p>
            </div>
          )}

          {/* Pie Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card p-2 text-xs">
                        <p className="text-foreground font-medium">{data.name}</p>
                        <p className="text-muted-foreground">
                          {formatCurrency(data.value, currency)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Yearly Breakdown */}
          {years > 1 && (
            <div className="h-[180px]">
              <p className="text-xs text-muted-foreground mb-2">
                Yearly Payment Breakdown
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickFormatter={(v) => `${Math.round(v / 1000)}K`}
                  />
                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-card p-2 text-xs">
                          <p className="text-foreground font-medium mb-1">{label}</p>
                          {payload.map((p, i) => (
                            <p key={i} style={{ color: p.color }}>
                              {p.name}: {formatCurrency(p.value as number, currency)}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="principal"
                    name="Principal"
                    stackId="a"
                    fill={CHART_COLORS.installments}
                  />
                  {interestEnabled && (
                    <Bar
                      dataKey="interest"
                      name="Interest"
                      stackId="a"
                      fill={CHART_COLORS.interest}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MortgageCalculator;
