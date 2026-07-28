import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noWhitespaceValidator } from '../../validators/no-whitespace.validator';

const COMPANY_ID_PATTERN = /^[0-9]+$/;
const COMPANY_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Form controls aligned to integration.in_customerintcompanies:
 * companyid, companycode, fileextension, delimeter, qualifier, isintegrationactive
 */
export function buildCompanyFormGroup(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    companyId: [
      '',
      [
        Validators.required,
        Validators.maxLength(10),
        noWhitespaceValidator(),
        Validators.pattern(COMPANY_ID_PATTERN),
      ],
    ],
    companyName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(255),
        noWhitespaceValidator(),
      ],
    ],
    companyCode: [
      '',
      [
        Validators.required,
        Validators.maxLength(50),
        noWhitespaceValidator(),
        Validators.pattern(COMPANY_CODE_PATTERN),
      ],
    ],
    fileExtension: [''],
    delimiter: [''],
    qualifier: [''],
    isActive: [true],
  });
}

export function buildCompaniesForm(formBuilder: FormBuilder): FormGroup {
  return formBuilder.group({
    companies: formBuilder.array([buildCompanyFormGroup(formBuilder)]),
  });
}

export function getCompaniesArray(formGroup: FormGroup): FormArray {
  return formGroup.get('companies') as FormArray;
}
