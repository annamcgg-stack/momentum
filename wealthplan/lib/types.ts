export type PayFrequency = "annual" | "monthly" | "fortnightly" | "weekly";
export type ExpenseFrequency = "weekly" | "fortnightly" | "monthly" | "quarterly" | "annually";

export type CountryCode = "AU" | "NZ" | "GB" | "US";

export type ExpenseCategory =
  | "rent_mortgage"
  | "utilities"
  | "internet"
  | "phone"
  | "insurance"
  | "car"
  | "fuel"
  | "public_transport"
  | "debt"
  | "subscriptions"
  | "health"
  | "other";

export type GoalType =
  | "house_deposit"
  | "emergency_fund"
  | "holiday"
  | "car"
  | "investment_portfolio"
  | "education"
  | "custom";

export type AssetType =
  | "cash"
  | "savings"
  | "shares_etfs"
  | "superannuation"
  | "property"
  | "vehicles"
  | "other";

export type LiabilityType =
  | "credit_cards"
  | "personal_loans"
  | "hecs_help"
  | "car_loans"
  | "mortgage"
  | "other";

export type ScenarioType =
  | "salary_increase"
  | "salary_decrease"
  | "higher_rent"
  | "new_mortgage"
  | "increased_investment"
  | "reduced_spending";

export interface IncomeSettings {
  salary: number;
  payFrequency: PayFrequency;
  country: CountryCode;
  stateProvince: string;
  includeMedicareLevy: boolean;
  salarySacrifice: number;
  superContribution: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: ExpenseFrequency;
  active: boolean;
}

export interface SinkingFund {
  id: string;
  name: string;
  annualTarget: number;
  currentBalance: number;
}

export interface AllocationBucket {
  id: string;
  name: string;
  percentage: number;
  isDefault: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  targetDate: string;
}

export interface HouseDepositPlan {
  propertyPrice: number;
  depositPercent: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
}

export interface InvestmentProjectionSettings {
  currentValue: number;
  monthlyContribution: number;
  annualReturn: number;
  timeHorizonYears: number;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
}

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  value: number;
}

export interface NetWorthSnapshot {
  id: string;
  date: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  value: number;
  enabled: boolean;
}

export interface FinanceData {
  version: number;
  income: IncomeSettings;
  expenses: FixedExpense[];
  sinkingFunds: SinkingFund[];
  allocationBuckets: AllocationBucket[];
  goals: FinancialGoal[];
  houseDeposit: HouseDepositPlan;
  investmentProjection: InvestmentProjectionSettings;
  assets: Asset[];
  liabilities: Liability[];
  netWorthSnapshots: NetWorthSnapshot[];
  scenarios: Scenario[];
  emergencyFundBalance: number;
  darkMode: boolean;
}

export interface TaxResult {
  grossIncome: number;
  taxableIncome: number;
  taxPayable: number;
  medicareLevy: number;
  netIncome: number;
  monthlyTakeHome: number;
  fortnightlyTakeHome: number;
  weeklyTakeHome: number;
  effectiveTaxRate: number;
}
