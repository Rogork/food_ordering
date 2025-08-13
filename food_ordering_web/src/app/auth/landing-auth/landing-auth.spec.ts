import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAuth } from './landing-auth';

describe('LandingAuth', () => {
  let component: LandingAuth;
  let fixture: ComponentFixture<LandingAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingAuth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingAuth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
