import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noWhitespaceValidator } from '../../validators/no-whitespace.validator';

const CUSTOMER_ID_PATTERN = /^[0-9]+$/;
const TENANT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Form controls aligned to:
 * - integration.in_integrationcustomerapplications
 * - integration.in_customerintegrations (accessapproach)
 */
export function buildBasicDetailsForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    customerId: [
      '',
      [
        Validators.required,
        Validators.maxLength(10),
        noWhitespaceValidator(),
        Validators.pattern(CUSTOMER_ID_PATTERN),
      ],
    ],
    customerName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
        noWhitespaceValidator(),
      ],
    ],
    tenantId: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        noWhitespaceValidator(),
        Validators.pattern(TENANT_ID_PATTERN),
      ],
    ],
    integrationTypeId: [null, [Validators.required]],
    applicationId: [{ value: null, disabled: true }, [Validators.required]],
    accessApproach: [{ value: '', disabled: true }],
    isEnabled: [true],
  });
}
