import { Component, Input } from '@angular/core';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-round-initials-chip',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './round-initials-chip.component.html',
  styleUrl: './round-initials-chip.component.css',
})
export class RoundInitialsChipComponent {
  @Input() initials: string = 'N/A';
}
