import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConsts, SelectedBooking } from '../app.consts';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, AfterViewInit {
  item: SelectedBooking = null;
  saved: boolean = false;
  bookingForm: FormGroup;
  constructor(
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private formBuilder: FormBuilder
  ) {
    this.bookingForm = this.formBuilder.group({
      dates: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
    });
  }
  ngAfterViewInit(): void {
    if (!this.item) {
      this._router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    console.log('1');
    const data = localStorage.getItem(AppConsts.selectedBooking);
    console.log('2');
    if (data) {
      console.log('3');
      this.item = JSON.parse(data);
      console.log('4');
    }
    console.log('item', this.item);
    this._cdr.detectChanges();
  }

  save(): void {
    if (this.bookingForm.valid) {
      this.saved = true;
      localStorage.removeItem(AppConsts.selectedBooking);
    }
  }

  get datesRef() {
    return this.bookingForm.get('dates');
  }
  get firstNameRef() {
    return this.bookingForm.get('firstName');
  }
  get lastNameRef() {
    return this.bookingForm.get('lastName');
  }
  get emailAddressRef() {
    return this.bookingForm.get('emailAddress');
  }

  get title(): string {
    return this.item.name;
  }

  get imageUrl(): string {
    return this.item.photo;
  }

  get description(): string {
    return this.item.description;
  }

  get price(): string {
    return `€ ${this.item.amount.toFixed(0)}`;
  }
}
