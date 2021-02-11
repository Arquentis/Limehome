import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';
import * as faker from 'faker';
import { Router } from '@angular/router';
import { AppConsts, SelectedBooking } from '../app.consts';
interface PlaceItem {
  id: string;
  placeResult: google.maps.places.PlaceResult;
  marker: google.maps.Marker;
  amount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('container') listingContainer: ElementRef;
  private loader: Loader;
  private map: google.maps.Map;
  private placesService: google.maps.places.PlacesService;
  private markerIcon = '/assets/images/svg/home-icon.svg';
  private markerIconActive = '/assets/images/svg/home-icon-active.svg';
  // private markers: google.maps.Marker[] = [];
  private selectedItem: PlaceItem;

  placeItems: PlaceItem[] = [];

  constructor(private _cdr: ChangeDetectorRef, private _router: Router) {
    const { googleApiKey } = environment;
    this.loader = new Loader({
      apiKey: googleApiKey,
      version: 'weekly',
      libraries: ['places'],
    });
  }

  getUserPosition(): Promise<google.maps.LatLng> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (resp) => {
          resolve(
            new google.maps.LatLng({
              lng: resp.coords.longitude,
              lat: resp.coords.latitude,
            })
          );
        },
        (err) => {
          resolve(null);
        }
      );
    });
  }

  tryGetSelectedBooking() {
    const data = localStorage.getItem(AppConsts.selectedBooking);
    if (data) {
      const item: SelectedBooking = JSON.parse(data);
      if (item) {
        this.selectPlace(item.id);
      } else if (this.placeItems.length > 0) {
        this.selectPlace(this.placeItems[0].id);
      }
    }
  }

  selectPlace(placeid: string) {
    this.selectedItem = placeid
      ? this.placeItems.find((x) => x.id == placeid)
      : null;

    this.placeItems.forEach((m) => {
      const pos = m.marker.getPosition();
      if (
        this.selectedItem &&
        this.selectedItem.placeResult.geometry.location === pos
      ) {
        m.marker.setIcon(this.markerIconActive);
      } else {
        m.marker.setIcon(this.markerIcon);
      }
    });
    if (this.selectedItem) {
      this.map.panTo(this.selectedItem.placeResult.geometry.location);
    }
    setTimeout(() => {
      if (this.selectedItem) {
        const index = this.placeItems.findIndex((x) => x === this.selectedItem);
        const element = this.listingContainer.nativeElement.children[index];
        element.scrollIntoView();
      }
    }, 200);
  }

  confirmBooking({ id }) {
    const selectedItem = this.placeItems.find((x) => x.id === id);

    if (selectedItem) {
      const { photos, name, vicinity } = selectedItem.placeResult;
      const selectedBooking: SelectedBooking = {
        id: id,
        amount: selectedItem.amount,
        name: name,
        photo:
          photos && photos.length > 0
            ? photos[0].getUrl({})
            : 'https://via.placeholder.com/80/120',
        description: vicinity,
      };
      localStorage.setItem(
        AppConsts.selectedBooking,
        JSON.stringify(selectedBooking)
      );
      this._router.navigate(['/checkout']);
    } else {
      alert('Something went wrong');
    }
  }

  createMarker(place: google.maps.places.PlaceResult): google.maps.Marker {
    if (!place.geometry || !place.geometry.location) return null;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      icon: this.markerIcon,
    });

    google.maps.event.addListener(marker, 'click', () => {
      if (this.selectedItem && this.selectedItem.id === place.place_id) {
        this.selectPlace(null);
      } else {
        this.selectPlace(place.place_id);
      }
    });
    return marker;
  }

  searchCurrentLocation(): void {
    const pos = this.map.getCenter();
    this.placesService.nearbySearch(
      {
        location: pos,
        radius: 1500,
        keyword: 'hotel',
        types: ['establishment'],
      },
      (
        results: google.maps.places.PlaceResult[],
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === 'OK') {
          this.addPlaces(results);
          // this.showMarkers(results);
        }
        this._cdr.detectChanges();
      }
    );
  }

  addPlaces(results: google.maps.places.PlaceResult[]) {
    const newResults = results.filter((x) => {
      const index = this.placeItems.findIndex((p) => p.id === x.place_id);
      return index < 0;
    });
    newResults.forEach((x) => {
      const newPlace: PlaceItem = {
        id: x.place_id,
        amount: faker.random.number({ min: 50, max: 300 }),
        marker: this.createMarker(x),
        placeResult: x,
      };
      this.placeItems.push(newPlace);
    });
    if (!this.selectedItem) {
      this.tryGetSelectedBooking();
      // this.selectPlace(this.placeItems[0].id);
    }

    // for (let i = 0; i < this.markers.length; i++) {
    //   const marker = this.markers[i];
    //   marker.setMap(null);
    // }
    // this.markers = [];
  }

  ngOnInit(): void {
    this.loader
      .load()
      .then(this.getUserPosition)
      .then((userPos: google.maps.LatLng) => {
        if (userPos) {
          return userPos;
        } else {
          return new google.maps.LatLng(48.13152236526011, 11.581659547821536);
        }
      })
      .then((pos: google.maps.LatLng) => {
        this.map = new google.maps.Map(
          document.getElementById('map') as HTMLElement,
          {
            center: pos,
            zoom: 11,
            disableDefaultUI: true,
          }
        );
        this.placesService = new google.maps.places.PlacesService(this.map);
        this.searchCurrentLocation();
        google.maps.event.addListener(this.map, 'dragend', () => {
          this.searchCurrentLocation();
        });
      });
  }
}
