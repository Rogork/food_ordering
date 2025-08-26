import { Component, signal } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { calcIPrice, EOrderStatus, IOrder } from '../ordering/ordering.types';
import { DatePipe, CommonModule } from '@angular/common';
import { Countdown } from './countdown/countdown';
import { LoadingState } from './loading-state/loading-state';
import moment from 'moment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TuiIcon, DatePipe, Countdown, LoadingState],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {
  isLoading = signal(false);
  orders = signal<Partial<IOrder>[]>([
    {
      _id:  '12352132',
      status: EOrderStatus.Active,
      createdAt:  new Date(),
      createdBy:  { name: 'Aradi' },
      restaurant:  { name: 'Lebanese Restaurant' },
      group: { name: 'Array Al Baraka Office' },
      closing: moment().add(1, 'hours').toDate(),
      orders:  [],
      delivery:  0,
      calc: { ...calcIPrice(0), amount: 15 },
    },
    {
      _id:  '5214124',
      status: EOrderStatus.Active,
      createdAt:  moment().subtract(30, 'minutes').toDate(),
      createdBy:  { name: 'Sarah' },
      restaurant:  { name: 'Adam Subs' },
      group: { name: 'Array Al Baraka Office' },
      closing: moment().add(45, 'minutes').toDate(),
      orders:  [],
      delivery:  0,
      calc: { ...calcIPrice(0), amount: 8 },
    },
    {
      _id:  '65634563',
      status: EOrderStatus.Closed,
      createdAt:  moment().subtract(2, 'hours').toDate(),
      createdBy:  { name: 'Ahmed' },
      restaurant:  { name: 'Alaqriba' },
      group: { name: 'Array Al Baraka Office' },
      closing: moment().subtract(5, 'minutes').toDate(),
      orders:  [],
      delivery:  0,
      calc: { ...calcIPrice(0), amount: 23 },
    }
  ]);

  isToday(date: Date) {
    return moment().isSame(date, 'day');
  }

  dayString(date: Date) {
    const momentDate = moment(date);
    if (moment().isSame(momentDate, 'day')) return 'today';
    return momentDate.format('DD/MM/YYYY');
  }

  getParticipantCount(order: Partial<IOrder>): number {
    return order.calc?.amount || 0;
  }

  getItemCount(order: Partial<IOrder>): number {
    return order.orders?.length || 0;
  }

  onOrderClick(order: Partial<IOrder>) {
    if (order.status === EOrderStatus.Active) {
      console.log('Navigate to order:', order._id);
    }
  }

  isOrderActive(order: Partial<IOrder>): boolean {
    return order.status === EOrderStatus.Active || order.closing! > new Date();
  }

  getOrderStatusText(order: Partial<IOrder>): string {
    if (this.isOrderActive(order)) {
      return 'Active order - click to join';
    }
    return 'Order is closed';
  }

  refreshOrders() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 1000);
  }
}
