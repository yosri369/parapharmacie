import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService, Announcement } from '../../core/services/announcement.service';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (announcements().length > 0) {
      <div class="ticker-wrap">

        <!-- Static left label -->
        <div class="ticker-label">
          <span class="ticker-label__dot"></span>
          <span class="ticker-label__text">ANNONCES</span>
        </div>

        <!-- Scrolling track -->
        <div class="ticker-track">
          <div class="ticker-inner" [style.animation-duration]="duration() + 's'">

            <!-- Repeated 4 times to ensure full screen width coverage -->
            @for (repeat of [1,2,3,4]; track $index) {
              @for (a of announcements(); track $index) {
                <span class="ticker-item">
                  <span class="ticker-item__pill" [attr.data-type]="a.type">{{ typeLabel(a.type) }}</span>
                  <span class="ticker-item__msg">{{ a.message }}</span>
                  @if (a.linkUrl) {
                    <a [href]="a.linkUrl" class="ticker-item__link">
                      {{ a.linkLabel || 'En savoir plus' }}
                      <svg width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </a>
                  }
                  <span class="ticker-item__sep">✦</span>
                </span>
              }
            }

          </div>
        </div>

      </div>
    }

    <style>
      /* ── Wrapper ── */
      .ticker-wrap {
        display: flex;
        align-items: stretch;
        height: 36px;
        width: 100%;
        background: #071a12;
        border-bottom: 1px solid rgba(74,222,128,0.12);
        position: relative;
        z-index: 60;
      }

      /* ── Left label pill ── */
      .ticker-label {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0 1.25rem 0 1rem;
        background: linear-gradient(135deg, #16a34a, #059669);
        flex-shrink: 0;
        clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%);
        padding-right: 1.6rem;
      }
      .ticker-label__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #fff;
        opacity: 0.9;
        animation: tickerPulse 1.6s ease-in-out infinite;
        flex-shrink: 0;
      }
      .ticker-label__text {
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.2em;
        color: white;
        white-space: nowrap;
        text-transform: uppercase;
      }

      /* ── Scrolling track ── */
      .ticker-track {
        flex: 1;
        overflow: hidden;
        display: flex;
        align-items: center;
        mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%);
      }

      /* ── Inner strip — animates from 0 → -50% so the duplicate fills in seamlessly ── */
      .ticker-inner {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        will-change: transform;
        animation: tickerScroll linear infinite;
      }
      @keyframes tickerScroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      /* ── Each item ── */
      .ticker-item {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0 2.5rem;
      }

      .ticker-item__pill {
        display: inline-block;
        padding: 0.1rem 0.45rem;
        border-radius: 9999px;
        font-size: 0.58rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .ticker-item__pill[data-type="INFO"]  { background: rgba(74,222,128,0.15); color: #4ade80; }
      .ticker-item__pill[data-type="PROMO"] { background: rgba(8,145,178,0.2);   color: #38bdf8; }
      .ticker-item__pill[data-type="ALERT"] { background: rgba(239,68,68,0.2);   color: #f87171; }

      .ticker-item__msg {
        font-size: 0.8rem;
        font-weight: 500;
        color: rgba(255,255,255,0.82);
        letter-spacing: 0.01em;
      }

      .ticker-item__link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: #4ade80;
        text-decoration: none;
        border-bottom: 1px solid rgba(74,222,128,0.35);
        transition: border-color 0.2s;
      }
      .ticker-item__link:hover { border-color: #4ade80; }

      .ticker-item__sep {
        font-size: 0.5rem;
        color: rgba(74,222,128,0.25);
      }

      @keyframes tickerPulse {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50%       { opacity: 0.35; transform: scale(0.65); }
      }
    </style>
  `
})
export class AnnouncementBarComponent implements OnInit {
  announcements = signal<Announcement[]>([]);
  duration      = signal(20);

  constructor(private svc: AnnouncementService) {}

  ngOnInit() {
    this.svc.getActive().subscribe({
      next: list => {
        this.announcements.set(list);
        // Adjust speed to message length — more text = slightly slower
        const chars = list.reduce((s, a) => s + a.message.length, 0);
        this.duration.set(Math.max(12, Math.min(45, chars * 0.2)));
      },
      error: () => {}
    });
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = { PROMO: 'Promo', ALERT: 'Alerte', INFO: 'Info' };
    return map[type] ?? type;
  }
}
