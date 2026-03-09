import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareReceiver } from './share-receiver';

describe('ShareReceiver', () => {
  let component: ShareReceiver;
  let fixture: ComponentFixture<ShareReceiver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareReceiver],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReceiver);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
