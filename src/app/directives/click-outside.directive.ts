import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[sparrowClickOutside]'
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    const clickedInside = this.elementRef.nativeElement === targetElement || this.elementRef.nativeElement.contains(targetElement);
    console.log(clickedInside);
    if (!clickedInside) {
      this.clickOutside.emit(event);
    }
  }
}
