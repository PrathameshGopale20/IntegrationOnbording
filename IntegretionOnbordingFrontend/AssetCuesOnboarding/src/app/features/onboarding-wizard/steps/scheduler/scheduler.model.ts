export interface SchedulerStepModel {
  frequency: string;
  startTime: string;
  endTime: string;
  selectedDays: boolean[];
  parameters: string;
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function createEmptySchedulerModel(): SchedulerStepModel {
  return {
    frequency: '',
    startTime: '',
    endTime: '',
    selectedDays: [false, false, false, false, false, false, false],
    parameters: '{}',
  };
}

/** Decode bitmask selecteddays (127 = all days) into Mon-Sun flags. */
export function daysFromBitmask(mask: number | null | undefined): boolean[] {
  const value = mask ?? 0;
  return Array.from({ length: 7 }, (_, index) => ((value >> index) & 1) === 1);
}
