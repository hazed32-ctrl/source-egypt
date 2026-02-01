/**
 * Mortgage / Installment Calculator
 * Production-grade with charts and accurate formulas
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calculator, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface MortgageCalculatorProps {
  price: number;
  currency?: 'EGP' | 'USD';
}

const MortgageCalculator = ({ price, currency = 'EGP' }: MortgageCalculatorProps) => {
  const { t } = useTranslation();
  
  // Calculator state
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [years, setYears] = useState(10);
  const [interestRate, setInterestRate] = useState(0);
  const [includeInterest, setIncludeInterest] = useState(false);

  // Calculations
  const calculations = useMemo(() => {
    const downPaymentAmount = (price * downPaymentPercent) / 100;
    const loanAmount = price - downPaymentAmount;
    const months = years * 12;

    let monthlyPayment: number;
    let totalInterest: number;
    let totalPaid: number;

    if (includeInterest && interestRate > 0) {
      // With interest - using standard amortization formula
      const monthlyRate = interestRate / 100 / 12;
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      totalPaid = monthlyPayment * months + downPaymentAmount;
      totalInterest = totalPaid - price;
    } else {
      // Without interest - simple division
      monthlyPayment = loanAmount / months;
      totalPaid = price;
      totalInterest = 0;
    }

    // Handle edge cases
    if (!isFinite(monthlyPayment) || isNaN(monthlyPayment)) {
      monthlyPayment = 0;
    }
    if (!isFinite(totalInterest) || isNaN(totalInterest)) {
      totalInterest = 0;
    }
    if (!isFinite(totalPaid) || isNaN(totalPaid)) {
      totalPaid = price;
    }

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPaid,
      months,
    };
  }, [price, downPaymentPercent, years, interestRate, includeInterest]);

  // Chart data
  const pieData = useMemo(() => {
    const data = [
      { name: 'Down Payment', value: calculations.downPaymentAmount, color: 'hsl(var(--primary))' },
      { name: 'Installments', value: calculations.loanAmount, color: 'hsl(var(--chart-2))' },
    ];
    
    if (calculations.totalInterest > 0) {
      data.push({ name: 'Interest', value: calculations.totalInterest, color: 'hsl(var(--chart-5))' });
    }
    
    return data;
  }, [calculations]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShortPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          {/* Property Price (Read-only) */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Property Price
            </Label>
            <div className="input-luxury h-12 flex items-center bg-secondary/30 px-4 rounded-lg">
              <span className="text-foreground font-medium">
                {formatPrice(price)} {currency}
              </span>
            </div>
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">
                Down Payment
              </Label>
              <span className="text-sm font-medium text-foreground">
                {downPaymentPercent}% ({formatShortPrice(calculations.downPaymentAmount)} {currency})
              </span>
            </div>
            <Slider
              value={[downPaymentPercent]}
              onValueChange={([val]) => setDownPaymentPercent(val)}
              min={5}
              max={50}
              step={5}
              className="py-4"
            />
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm text-muted-foreground">
                Duration
              </Label>
              <span className="text-sm font-medium text-foreground">
                {years} Years ({calculations.months} months)
              </span>
            </div>
            <Slider
              value={[years]}
              onValueChange={([val]) => setYears(val)}
              min={1}
              max={15}
              step={1}
              className="py-4"
            />
          </div>

          {/* Interest Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Label className="text-sm text-foreground">
                Include Interest
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle to calculate with bank interest rates</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={includeInterest}
              onCheckedChange={setIncludeInterest}
            />
          </div>

          {/* Interest Rate */}
          {includeInterest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">
                  Annual Interest Rate
                </Label>
                <span className="text-sm font-medium text-foreground">
                  {interestRate}%
                </span>
              </div>
              <Slider
                value={[interestRate]}
                onValueChange={([val]) => setInterestRate(val)}
                min={0}
                max={25}
                step={0.5}
                className="py-4"
              />
            </motion.div>
          )}
        </div>

        {/* Results & Charts */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
              <p className="text-2xl font-semibold text-gold-gradient">
                {formatPrice(calculations.monthlyPayment)}
              </p>
              <p className="text-xs text-muted-foreground">{currency}</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatShortPrice(calculations.totalPaid)}
              </p>
              <p className="text-xs text-muted-foreground">{currency}</p>
            </div>
          </div>

          {calculations.totalInterest > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
              <p className="text-xl font-semibold text-destructive">
                {formatPrice(calculations.totalInterest)} {currency}
              </p>
            </div>
          )}

          {/* Pie Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => formatPrice(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MortgageCalculator;
