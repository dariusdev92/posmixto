import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ShareReceiverComponent } from './share-receiver';

describe('ShareReceiverComponent', () => {
  let component: ShareReceiverComponent;
  let fixture: ComponentFixture<ShareReceiverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareReceiverComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareReceiverComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
