import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from "@angular/material/snack-bar";

@Component({
  selector: 'error-messages',
  templateUrl: './error-messages.component.html',
  styleUrl: './error-messages.component.css'
})
export class ErrorMessagesComponent {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public errorMessages: string[]) {
  }
}
