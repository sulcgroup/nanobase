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

  // Returns true if we should read the file as a data URL, rather than text
  isDataURLFile(fileName?: string): boolean {
    if (fileName === undefined || fileName === null) {
      return;
    }
    const imgFormats = ['.jpg', '.png', '.tiff', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    return imgFormats.some(suffix => fileName.endsWith(suffix));
  }

  isImageFile(fileName?: string): boolean {
    if (fileName === undefined || fileName === null) {
      return;
    }
    const imgFormats = ['.jpg', '.png', '.tiff'];
    return imgFormats.some(suffix => fileName.endsWith(suffix));
  }

}
