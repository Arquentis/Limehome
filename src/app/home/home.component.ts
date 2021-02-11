import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';
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
  private markers: google.maps.Marker[] = [];
  private selectedResult: google.maps.places.PlaceResult;
  placeResults: google.maps.places.PlaceResult[] = [];

  constructor(private _cdr: ChangeDetectorRef) {
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

  selectPlace(place: google.maps.places.PlaceResult) {
    this.selectedResult = place;

    this.markers.forEach((m) => {
      const pos = m.getPosition();
      if (
        this.selectedResult &&
        this.selectedResult.geometry.location === pos
      ) {
        m.setIcon(this.markerIconActive);
      } else {
        m.setIcon(this.markerIcon);
      }
    });
    if (place) {
      this.map.panTo(place.geometry.location);
    }
    setTimeout(() => {
      if (this.selectedResult) {
        const index = this.placeResults.findIndex(
          (x) => x === this.selectedResult
        );
        const element = this.listingContainer.nativeElement.children[index];
        element.scrollIntoView();
      }
    }, 200);
  }

  confirmBooking({ placeResult, amount }) {
    console.log('show confirm modal', {
      placeResult,
      amount,
    });
  }

  createMarker(place: google.maps.places.PlaceResult): google.maps.Marker {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: this.map,
      position: place.geometry.location,
      icon: this.markerIcon,
    });

    google.maps.event.addListener(marker, 'click', () => {
      if (this.selectedResult && this.selectedResult === place) {
        this.selectPlace(null);
      } else {
        this.selectPlace(place);
      }
    });
    this.markers.push(marker);
  }

  searchCurrentLocation(): void {
    const pos = this.map.getCenter();
    this.placesService.nearbySearch(
      {
        location: pos,
        radius: 1000,
        keyword: 'hotel',
        types: ['establishment'],
      },
      (
        results: google.maps.places.PlaceResult[],
        status: google.maps.places.PlacesServiceStatus
      ) => {
        if (status === 'OK') {
          this.selectPlace(null);
          this.placeResults = results;
          console.log('placeResults', this.placeResults);
          this.showMarkers(results);
        } else {
          this.placeResults = [];
          this.selectPlace(null);
          console.log('status not ok', { results, status });
        }
        this._cdr.detectChanges();
      }
    );
  }

  showMarkers(results: google.maps.places.PlaceResult[]) {
    for (let i = 0; i < this.markers.length; i++) {
      const marker = this.markers[i];
      marker.setMap(null);
    }
    results.map((r) => this.createMarker(r));
    if (!this.selectedResult && this.placeResults.length > 0) {
      this.selectPlace(this.placeResults[0]);
    }
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
