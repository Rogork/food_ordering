import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

@Component({
  selector: 'app-countdown',
  imports: [],
  templateUrl: './countdown.html',
  styleUrl: './countdown.less'
})
export class Countdown implements OnInit, OnDestroy {
  @Input() targetDate!: Date;
  
  timeLeft = signal<CountdownTime>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  progressPercentage = signal<number>(100);
  
  private subscription?: Subscription;
  private originalDuration = 0;

  ngOnInit() {
    if (!this.targetDate) return;
    
    this.originalDuration = this.targetDate.getTime() - Date.now();
    this.updateCountdown();
    
    this.subscription = interval(1000).pipe(
      map(() => this.calculateTimeLeft())
    ).subscribe(timeLeft => {
      this.timeLeft.set(timeLeft);
      this.updateProgress(timeLeft.total);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private calculateTimeLeft(): CountdownTime {
    const total = this.targetDate.getTime() - Date.now();
    
    if (total <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const hours = Math.floor(total / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, total };
  }

  private updateCountdown() {
    const timeLeft = this.calculateTimeLeft();
    this.timeLeft.set(timeLeft);
    this.updateProgress(timeLeft.total);
  }

  private updateProgress(timeLeft: number) {
    if (this.originalDuration <= 0) {
      this.progressPercentage.set(0);
      return;
    }
    
    const percentage = Math.max(0, Math.min(100, (timeLeft / this.originalDuration) * 100));
    this.progressPercentage.set(percentage);
  }

  formatTime(): string {
    const time = this.timeLeft();
    if (time.total <= 0) return '00:00';
    
    if (time.hours > 0) {
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
    return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  }

  isExpired(): boolean {
    return this.timeLeft().total <= 0;
  }
}
