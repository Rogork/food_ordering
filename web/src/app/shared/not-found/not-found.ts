import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.less',
})
export class NotFound {
  private router = inject(Router);

  // Animation data
  foodEmojis = [
    { symbol: '🍕', left: 10, top: 10, delay: 0 },
    { symbol: '🍔', left: 85, top: 20, delay: 2 },
    { symbol: '🍜', left: 15, top: 70, delay: 4 },
    { symbol: '🥗', left: 80, top: 75, delay: 1 },
    { symbol: '🌮', left: 50, top: 15, delay: 3 },
    { symbol: '🍝', left: 25, top: 85, delay: 5 },
  ];

  particles = Array.from({ length: 20 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  quickLinks = [
    { label: 'Orders', path: '/orders' },
    { label: 'Restaurants', path: '/restaurants' },
    { label: 'Groups', path: '/groups' },
    { label: 'Profile', path: '/profile' },
  ];

  mouseOffset = { x: 0, y: 0 };

  ngOnInit() {
    // Add mouse tracking for subtle parallax effect
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  ngOnDestroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
  }

  private handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 10;
    const y = (e.clientY / window.innerHeight) * 10;
    this.mouseOffset = { x: x - 5, y: y - 5 };
  };

  goHome() {
    this.router.navigate(['/']);
  }

  browseRestaurants() {
    this.router.navigate(['/restaurants']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
