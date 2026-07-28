import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  standalone: false,
})
export class FooterComponent {
  readonly companyName = environment.companyName;
  readonly version = environment.version;
  readonly buildNumber = environment.buildNumber;
  readonly currentYear = new Date().getFullYear();
}
