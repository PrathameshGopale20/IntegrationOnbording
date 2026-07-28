import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DAY_LABELS } from './scheduler.model';
import { getSelectedDaysArray } from './scheduler-form.builder';

@Component({
  selector: 'app-scheduler-step',
  templateUrl: './scheduler-step.component.html',
  styleUrl: './scheduler-step.component.scss',
  standalone: false,
})
export class SchedulerStepComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  readonly pageTitle = 'Scheduler';
  readonly pageSubtitle = 'Set the schedule frequency and timing for this integration.';
  readonly dayLabels = DAY_LABELS;

  get selectedDays(): FormArray {
    return getSelectedDaysArray(this.formGroup);
  }

  dayControl(index: number): FormControl<boolean> {
    return this.selectedDays.at(index) as FormControl<boolean>;
  }

  toggleDay(index: number): void {
    const control = this.dayControl(index);
    control.setValue(!control.value);
  }
}
