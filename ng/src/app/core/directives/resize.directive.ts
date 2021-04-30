import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAutowidth]'
})
export class AutowidthDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keyup') onKeyUp(): any {
    this.resize();
  }

  @HostListener('focus') onFocus(): any {
    this.resize();
  }

  private resize(): void {
    this.el.nativeElement.setAttribute('size', this.el.nativeElement.value.length);
  }
}
