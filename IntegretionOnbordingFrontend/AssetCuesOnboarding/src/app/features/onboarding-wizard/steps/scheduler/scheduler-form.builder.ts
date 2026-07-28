import { FormBuilder, FormGroup } from '@angular/forms';
import { createEmptySchedulerModel } from './scheduler.model';

export function buildSchedulerForm(formBuilder: FormBuilder): FormGroup {
  const defaults = createEmptySchedulerModel();
  return formBuilder.group({
    frequency: [defaults.frequency],
    startTime: [defaults.startTime],
    endTime: [defaults.endTime],
    selectedDays: formBuilder.array(defaults.selectedDays.map((day) => formBuilder.control(day))),
    parameters: [defaults.parameters],
  });
}

export function getSelectedDaysArray(group: FormGroup) {
  return group.get('selectedDays') as import('@angular/forms').FormArray;
}
