import { Component, signal } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { calcIPrice, IOrder } from '../ordering/types';
import { DatePipe } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-home',
  imports: [TuiIcon, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.less'
})
export class Home {
  orders = signal<Partial<IOrder>[]>([
    {
      _id:  '12352132',
      createdAt:  new Date(),
      createdBy:  { name: 'Aradi' },
      restaurant:  { name: 'Lebanese Restaurant' },
      orders:  [],
      delivery:  0,
      calc: { ...calcIPrice(0), amount: 0 },
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
}
