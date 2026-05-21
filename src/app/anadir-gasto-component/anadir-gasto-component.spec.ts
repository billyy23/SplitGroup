import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnadirGastoComponent } from './anadir-gasto-component';

describe('AnadirGastoComponent', () => {
  let component: AnadirGastoComponent;
  let fixture: ComponentFixture<AnadirGastoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnadirGastoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnadirGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
