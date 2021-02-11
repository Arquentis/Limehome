import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  @ViewChild('menuCheckbox') menuCheckbox: ElementRef;

  uncheckMenu() {
    this.menuCheckbox.nativeElement.checked = false;
  }
  constructor() {}

  ngOnInit(): void {}
}
