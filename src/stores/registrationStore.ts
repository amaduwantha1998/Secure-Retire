import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersonalInfo {
  fullName: string;
  dateOfBirth: Date | null;
  ssn: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
}

export interface IncomeSource {
  id: string;
  sourceType: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface Asset {
  id: string;
  type: 'checking' | 'savings' | 'investment' | 'retirement' | 'crypto' | 'other';
  institutionName: string;
  amount: number;
  currency: string;
  accountNumber?: string;
}

export interface Debt {
  id: string;
  debtType: 'mortgage' | 'credit_card' | 'auto_loan' | 'student_loan' | 'personal_loan' | 'other';
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate?: Date;
}

export interface RetirementSaving {
  id: string;
  accountType: '401k' | '403b' | 'ira' | 'roth_ira' | 'pension' | 'sep_ira' | 'simple_ira';
  institutionName: string;
  balance: number;
  contributionAmount: number;
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
}

export interface Beneficiary {
  id: string;
  fullName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'other';
  dateOfBirth: Date | null;
  percentage: number;
  isPrimary: boolean;
  contactEmail?: string;
}

export interface FinancialDetails {
  incomeSources: IncomeSource[];
  assets: Asset[];
  debts: Debt[];
  retirementSavings: RetirementSaving[];
}

export interface PricingInfo {
  selectedPlan: 'free' | 'pro';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  onepayTransactionId?: string;
}

export interface RegistrationData {
  personalInfo: PersonalInfo;
  financialDetails: FinancialDetails;
  beneficiaries: Beneficiary[];
  pricingInfo: PricingInfo;
  currentStep: number;
  isCompleted: boolean;
}

interface RegistrationStore {
  data: RegistrationData;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateFinancialDetails: (details: Partial<FinancialDetails>) => void;
  addIncomeSource: (source: IncomeSource) => void;
  updateIncomeSource: (id: string, source: Partial<IncomeSource>) => void;
  removeIncomeSource: (id: string) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  removeDebt: (id: string) => void;
  addRetirementSaving: (saving: RetirementSaving) => void;
  updateRetirementSaving: (id: string, saving: Partial<RetirementSaving>) => void;
  removeRetirementSaving: (id: string) => void;
  addBeneficiary: (beneficiary: Beneficiary) => void;
  updateBeneficiary: (id: string, beneficiary: Partial<Beneficiary>) => void;
  removeBeneficiary: (id: string) => void;
  updatePricingInfo: (info: Partial<PricingInfo>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeRegistration: () => void;
  resetRegistration: () => void;
}

const initialData: RegistrationData = {
  personalInfo: {
    fullName: '',
    dateOfBirth: null,
    ssn: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'LK',
    },
    phone: '',
  },
  financialDetails: {
    incomeSources: [],
    assets: [],
    debts: [],
    retirementSavings: [],
  },
  beneficiaries: [],
  pricingInfo: {
    selectedPlan: 'free',
  },
  currentStep: 1,
  isCompleted: false,
};

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set, get) => ({
      data: initialData,
      
      updatePersonalInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
          },
        })),

      updateFinancialDetails: (details) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: { ...state.data.financialDetails, ...details },
          },
        })),

      addIncomeSource: (source) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              incomeSources: [...state.data.financialDetails.incomeSources, source],
            },
          },
        })),

      updateIncomeSource: (id, source) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              incomeSources: state.data.financialDetails.incomeSources.map((item) =>
                item.id === id ? { ...item, ...source } : item
              ),
            },
          },
        })),

      removeIncomeSource: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              incomeSources: state.data.financialDetails.incomeSources.filter((item) => item.id !== id),
            },
          },
        })),

      addAsset: (asset) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              assets: [...state.data.financialDetails.assets, asset],
            },
          },
        })),

      updateAsset: (id, asset) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              assets: state.data.financialDetails.assets.map((item) =>
                item.id === id ? { ...item, ...asset } : item
              ),
            },
          },
        })),

      removeAsset: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              assets: state.data.financialDetails.assets.filter((item) => item.id !== id),
            },
          },
        })),

      addDebt: (debt) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              debts: [...state.data.financialDetails.debts, debt],
            },
          },
        })),

      updateDebt: (id, debt) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              debts: state.data.financialDetails.debts.map((item) =>
                item.id === id ? { ...item, ...debt } : item
              ),
            },
          },
        })),

      removeDebt: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              debts: state.data.financialDetails.debts.filter((item) => item.id !== id),
            },
          },
        })),

      addRetirementSaving: (saving) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              retirementSavings: [...state.data.financialDetails.retirementSavings, saving],
            },
          },
        })),

      updateRetirementSaving: (id, saving) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              retirementSavings: state.data.financialDetails.retirementSavings.map((item) =>
                item.id === id ? { ...item, ...saving } : item
              ),
            },
          },
        })),

      removeRetirementSaving: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            financialDetails: {
              ...state.data.financialDetails,
              retirementSavings: state.data.financialDetails.retirementSavings.filter((item) => item.id !== id),
            },
          },
        })),

      addBeneficiary: (beneficiary) =>
        set((state) => ({
          data: {
            ...state.data,
            beneficiaries: [...state.data.beneficiaries, beneficiary],
          },
        })),

      updateBeneficiary: (id, beneficiary) =>
        set((state) => ({
          data: {
            ...state.data,
            beneficiaries: state.data.beneficiaries.map((item) =>
              item.id === id ? { ...item, ...beneficiary } : item
            ),
          },
        })),

      removeBeneficiary: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            beneficiaries: state.data.beneficiaries.filter((item) => item.id !== id),
          },
        })),

      updatePricingInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            pricingInfo: { ...state.data.pricingInfo, ...info },
          },
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          data: { ...state.data, currentStep: step },
        })),

      nextStep: () =>
        set((state) => ({
          data: { ...state.data, currentStep: Math.min(state.data.currentStep + 1, 5) },
        })),

      prevStep: () =>
        set((state) => ({
          data: { ...state.data, currentStep: Math.max(state.data.currentStep - 1, 1) },
        })),

      completeRegistration: () =>
        set((state) => ({
          data: { ...state.data, isCompleted: true },
        })),

      resetRegistration: () => set({ data: initialData }),
    }),
    {
      name: 'registration-storage',
    }
  )
);