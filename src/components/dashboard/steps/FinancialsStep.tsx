import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FinancialsStepProps {
  formData?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const YEARS = ["2025", "2024", "2023", "2022", "2021"];

export const FinancialsStep = ({ formData: parentFormData, onNext, onBack }: FinancialsStepProps) => {
  const [financialType, setFinancialType] = useState<"monthly" | "yearly">(parentFormData?.financialType || "monthly");
  const [selectedYear, setSelectedYear] = useState<string>(parentFormData?.year || "2024");
  const [monthlyData, setMonthlyData] = useState<Record<string, { revenue: string; revenue2: string; cost: string; profit: string }>>({});
  const [yearlyData, setYearlyData] = useState<Record<string, Record<string, { revenue: string; revenue2: string; cost: string; profit: string }>>>({});

  useEffect(() => {
    if (parentFormData) {
      if (parentFormData.financialType) {
        setFinancialType(parentFormData.financialType);
      }
      if (parentFormData.year) {
        setSelectedYear(parentFormData.year);
      }
      if (parentFormData.months && Array.isArray(parentFormData.months)) {
        if (parentFormData.financialType === "monthly") {
          const monthly: Record<string, { revenue: string; revenue2: string; cost: string; profit: string }> = {};
          parentFormData.months.forEach((month: any) => {
            if (month.month) {
              monthly[month.month] = {
                revenue: month.revenue || "",
                revenue2: month.revenue2 || "",
                cost: month.cost || "",
                profit: month.profit || "",
              };
            }
          });
          setMonthlyData(monthly);
        } else {
          const yearly: Record<string, Record<string, { revenue: string; revenue2: string; cost: string; profit: string }>> = {};
          parentFormData.months.forEach((month: any) => {
            if (month.year && month.period) {
              if (!yearly[month.year]) {
                yearly[month.year] = {};
              }
              yearly[month.year][month.period] = {
                revenue: month.revenue || "",
                revenue2: month.revenue2 || "",
                cost: month.cost || "",
                profit: month.profit || "",
              };
            }
          });
          setYearlyData(yearly);
        }
      }
    }
  }, [parentFormData]);

  const handleTypeSelect = (type: "monthly" | "yearly") => {
    setFinancialType(type);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const handleDataChange = (period: string, field: "revenue" | "revenue2" | "cost" | "profit", value: string) => {
    if (financialType === "monthly") {
      setMonthlyData(prev => ({
        ...prev,
        [period]: {
          ...prev[period],
          [field]: value,
        },
      }));
    } else {
      setYearlyData(prev => ({
        ...prev,
        [selectedYear]: {
          ...prev[selectedYear] || {},
          [period]: {
            ...prev[selectedYear]?.[period] || {},
            [field]: value,
          },
        },
      }));
    }
  };

  const handleClear = () => {
    if (financialType === "monthly") {
      setMonthlyData({});
    } else {
      setYearlyData(prev => ({
        ...prev,
        [selectedYear]: {},
      }));
    }
  };

  const calculateProfit = (period: string) => {
    if (financialType === "monthly") {
      const data = monthlyData[period] || {};
      const revenue = parseFloat(data.revenue || "0");
      const revenue2 = parseFloat(data.revenue2 || "0");
      const cost = parseFloat(data.cost || "0");
      return (revenue + revenue2 - cost).toFixed(2);
    } else {
      const data = yearlyData[selectedYear]?.[period] || {};
      const revenue = parseFloat(data.revenue || "0");
      const revenue2 = parseFloat(data.revenue2 || "0");
      const cost = parseFloat(data.cost || "0");
      return (revenue + revenue2 - cost).toFixed(2);
    }
  };

  const validateFinancials = (): { isValid: boolean; error?: string } => {
    if (financialType === "monthly") {
      // Check if at least one month has data
      const hasData = MONTHS.some(month => {
        const data = monthlyData[month];
        return data && (
          (data.revenue && parseFloat(data.revenue) > 0) ||
          (data.revenue2 && parseFloat(data.revenue2) > 0) ||
          (data.cost && parseFloat(data.cost) > 0)
        );
      });
      
      if (!hasData) {
        return { isValid: false, error: "Please enter financial data for at least one month" };
      }
    } else {
      // Check if at least one month has data for selected year
      const hasData = MONTHS.some(month => {
        const period = `${month} ${selectedYear}`;
        const data = yearlyData[selectedYear]?.[period];
        return data && (
          (data.revenue && parseFloat(data.revenue) > 0) ||
          (data.revenue2 && parseFloat(data.revenue2) > 0) ||
          (data.cost && parseFloat(data.cost) > 0)
        );
      });
      
      if (!hasData) {
        return { isValid: false, error: `Please enter financial data for at least one month in ${selectedYear}` };
      }
    }
    
    return { isValid: true };
  };

  const handleContinue = () => {
    const validation = validateFinancials();
    
    if (!validation.isValid) {
      toast.error(validation.error || "Please enter financial data");
      return;
    }
    
    if (financialType === "monthly") {
      const months = MONTHS.map(month => ({
        month,
        revenue: monthlyData[month]?.revenue || "0",
        revenue2: monthlyData[month]?.revenue2 || "0",
        cost: monthlyData[month]?.cost || "0",
        profit: calculateProfit(month),
      }));

      onNext({
        financialType: "monthly",
        months,
      });
    } else {
      const months = MONTHS.map(month => {
        const period = `${month} ${selectedYear}`;
        return {
          period,
          month,
          year: selectedYear,
          revenue: yearlyData[selectedYear]?.[period]?.revenue || "0",
          revenue2: yearlyData[selectedYear]?.[period]?.revenue2 || "0",
          cost: yearlyData[selectedYear]?.[period]?.cost || "0",
          profit: calculateProfit(period),
        };
      });

      onNext({
        financialType: "yearly",
        year: selectedYear,
        months,
      });
    }
  };

  const getCurrentData = (period: string) => {
    if (financialType === "monthly") {
      return monthlyData[period] || { revenue: "", revenue2: "", cost: "", profit: "" };
    } else {
      return yearlyData[selectedYear]?.[period] || { revenue: "", revenue2: "", cost: "", profit: "" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Select Category Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Select Category</h2>
        <p className="text-muted-foreground text-lg">Are you able to provide monthly financials?</p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-4 mb-6">
        <Button
          type="button"
          onClick={() => handleTypeSelect("monthly")}
          variant={financialType === "monthly" ? "default" : "outline"}
          className={`flex-1 h-12 rounded-full ${
            financialType === "monthly"
              ? "bg-accent hover:bg-accent/90 text-black font-semibold"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Monthly
        </Button>
        <Button
          type="button"
          onClick={() => handleTypeSelect("yearly")}
          variant={financialType === "yearly" ? "default" : "outline"}
          className={`flex-1 h-12 rounded-full ${
            financialType === "yearly"
              ? "bg-accent hover:bg-accent/90 text-black font-semibold"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Yearly
        </Button>
      </div>

      {/* Year Filter Buttons */}
      <div className="flex gap-2 flex-wrap mb-8">
        {YEARS.map((year) => (
          <Button
            key={year}
            type="button"
            onClick={() => handleYearSelect(year)}
            variant={selectedYear === year ? "default" : "outline"}
            className={`${
              selectedYear === year
                ? "bg-accent hover:bg-accent/90 text-black font-semibold"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            } rounded-lg`}
          >
            {year}
          </Button>
        ))}
        <Button
          type="button"
          variant="default"
          className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg"
        >
          Add
        </Button>
      </div>

      {/* Financial Data Table */}
      <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            {financialType === "monthly" ? "Monthly Financials" : `Yearly Financials - ${selectedYear}`}
          </h3>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground"></th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Revenue</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Revenue</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Cost</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month) => {
                const period = financialType === "monthly" ? month : `${month} ${selectedYear}`;
                const data = getCurrentData(period);
                const profit = calculateProfit(period);

                return (
                  <tr key={month} className="border-b border-border last:border-b-0">
                    <td className="py-4 px-4 font-medium text-foreground">
                      {financialType === "monthly" ? month : `${month} ${selectedYear}`}
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={data.revenue}
                          onChange={(e) => handleDataChange(period, "revenue", e.target.value)}
                          placeholder="5000"
                          className="pl-8 bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={data.revenue2}
                          onChange={(e) => handleDataChange(period, "revenue2", e.target.value)}
                          placeholder="5000"
                          className="pl-8 bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={data.cost}
                          onChange={(e) => handleDataChange(period, "cost", e.target.value)}
                          placeholder="5000"
                          className="pl-8 bg-gray-50 border-gray-200 rounded-lg focus:bg-white"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          type="number"
                          value={profit !== "0.00" ? profit : ""}
                          readOnly
                          placeholder="0"
                          className="pl-8 bg-gray-50 border-gray-200 rounded-lg"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        <Button variant="outline" onClick={onBack} className="px-8">
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="bg-accent hover:bg-accent/90 text-accent-foreground ml-auto px-16"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
