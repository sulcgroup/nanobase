import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  // Used for creating a validator based on a condition
  conditionalValidator(predicate: () => boolean, validator: ValidatorFn, errorNamespace?: string): ValidatorFn {
    return formControl => {
      if (!formControl.parent) {
        return null;
      }
      let error = null;
      if (predicate()) {
        error = validator(formControl);
      }
      if (errorNamespace && error) {
        const customError = {};
        customError[errorNamespace] = error;
        error = customError;
      }
      return error;
    };
  }

}
