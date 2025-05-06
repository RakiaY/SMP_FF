import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetsitterComponent } from './petsitter.component';

describe('PetsitterComponent', () => {
  let component: PetsitterComponent;
  let fixture: ComponentFixture<PetsitterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PetsitterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetsitterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
