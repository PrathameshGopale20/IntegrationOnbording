import { WizardStepName } from './wizard-step-names.constant';
import { WizardStepDefinition } from '../models/wizard-step.model';

export const WIZARD_STEPS: readonly WizardStepDefinition[] = [
  {
    id: WizardStepName.BasicDetails,
    index: 0,
    title: 'Basic Detail',
    description: 'Enter the core customer and integration information.',
    routePath: 'basic-details',
  },
  {
    id: WizardStepName.Companies,
    index: 1,
    title: 'Companies',
    description: 'Add one or more companies linked to this customer integration.',
    routePath: 'companies',
  },
  {
    id: WizardStepName.Credentials,
    index: 2,
    title: 'Credentials',
    description: 'Authentication details',
    routePath: 'credentials',
  },
  {
    id: WizardStepName.Transactions,
    index: 3,
    title: 'Transaction',
    description: 'Transaction selection',
    routePath: 'transactions',
  },
  {
    id: WizardStepName.Endpoints,
    index: 4,
    title: 'Endpoints',
    description: 'Configure endpoints',
    routePath: 'endpoints',
  },
  {
    id: WizardStepName.CustomerFields,
    index: 5,
    title: 'Fields',
    description: 'Customer specific fields',
    routePath: 'customer-fields',
  },
  {
    id: WizardStepName.FieldMapping,
    index: 6,
    title: 'Field Map',
    description: 'Map customer fields',
    routePath: 'field-mapping',
  },
  {
    id: WizardStepName.MasterMapping,
    index: 7,
    title: 'Master Map',
    description: 'Configure master mappings',
    routePath: 'master-mapping',
  },
  {
    id: WizardStepName.Configurations,
    index: 8,
    title: 'Config',
    description: 'Integration settings',
    routePath: 'configurations',
  },
  {
    id: WizardStepName.Scheduler,
    index: 9,
    title: 'Scheduler',
    description: 'Scheduling options',
    routePath: 'scheduler',
  },
  {
    id: WizardStepName.ReviewSubmit,
    index: 10,
    title: 'Review & Submit',
    description: 'Review and generate SQL',
    routePath: 'review',
  },
] as const;

export const WIZARD_TOTAL_STEPS = WIZARD_STEPS.length;
