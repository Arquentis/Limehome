import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
})
export class ListItemComponent implements OnInit {
  @Input('item') placeResult: google.maps.places.PlaceResult;
  @Input('amount') amount: number;
  @Input('id') id: string;
  @Output() onBookSelect = new EventEmitter<google.maps.places.PlaceResult>();

  constructor() {}

  ngOnInit(): void {}

  get title(): string {
    return this.placeResult.name;
  }

  get imageUrl(): string {
    const { photos } = this.placeResult;
    if (photos && photos.length > 0) {
      return photos[0].getUrl({ maxWidth: 80 });
    }
    return 'https://via.placeholder.com/80/120';
  }

  get description(): string {
    const { vicinity } = this.placeResult;
    if (vicinity) {
      return vicinity;
    }
    return '-';
  }

  get price(): string {
    return `€ ${this.amount.toFixed(0)}`;
  }
}
