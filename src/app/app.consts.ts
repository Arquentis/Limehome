export const AppConsts = {
  selectedBooking: 'selected_booking',
};

export interface SelectedBooking {
  id: string;
  amount: number;
  name: string;
  photo: string;
  description: string;
}
