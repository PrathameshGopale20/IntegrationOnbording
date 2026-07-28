import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { getEndpointsArray } from './endpoints-form.builder';
import { EndpointItemModel } from './endpoints.model';

@Component({
  selector: 'app-endpoints-step',
  templateUrl: './endpoints-step.component.html',
  styleUrl: './endpoints-step.component.scss',
  standalone: false,
})
export class EndpointsStepComponent implements OnInit, OnDestroy {
  @Input({ required: true }) formGroup!: FormGroup;

  private readonly subscriptions = new Subscription();

  readonly pageTitle = 'Endpoints';
  readonly pageSubtitle =
    'Review and configure endpoints generated from enabled Transactions. Endpoint records are managed by the Transactions step.';
  readonly authOptions = ['None', 'Basic', 'OAuth2', 'API Key'] as const;
  readonly displayedColumns = [
    'transaction',
    'endpointType',
    'endpointUrl',
    'assetcuesEndpoint',
    'authentication',
    'payload',
    'timeout',
    'retryCount',
    'headers',
    'status',
  ] as const;

  readonly dataSource = new MatTableDataSource<FormGroup>([]);
  readonly controlNotice = 'This Endpoint is controlled by the Transactions step.';

  ngOnInit(): void {
    this.refreshDataSource();
    this.subscriptions.add(
      this.endpoints.valueChanges.subscribe(() => {
        this.touchUpdatedDates();
        this.refreshDataSource();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get endpoints(): FormArray {
    return getEndpointsArray(this.formGroup);
  }

  get hasEndpoints(): boolean {
    return this.endpoints.length > 0;
  }

  asEndpoint(group: FormGroup): EndpointItemModel {
    return group.getRawValue() as EndpointItemModel;
  }

  private refreshDataSource(): void {
    this.dataSource.data = this.endpoints.controls as FormGroup[];
  }

  private touchUpdatedDates(): void {
    const now = new Date().toISOString();
    for (const control of this.endpoints.controls) {
      const group = control as FormGroup;
      if (group.dirty) {
        group.get('updatedDate')?.setValue(now, { emitEvent: false });
      }
    }
  }
}
