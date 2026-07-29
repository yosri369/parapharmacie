import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface GenerationProgress {
  taskId: string;
  step: string;
  progress: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultImageUrl?: string;
  cutoutUrl?: string;
  headline?: string;
  caption?: string;
  hashtags?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;

  // BehaviorSubject keeps the LAST value, so late subscribers get it immediately
  private connectionStatus = new BehaviorSubject<boolean>(false);

  // Map of taskId → ReplaySubject (buffers messages so none are missed)
  private messageSubjects = new Map<string, ReplaySubject<GenerationProgress>>();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => {
        const wsUrl = environment.apiUrl.replace('/api', '') + '/ws';
        console.log('[WS] Connecting to:', wsUrl);
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => console.debug('[STOMP]', msg)
    });

    this.client.onConnect = () => {
      console.log('[WS] Connected!');
      this.connectionStatus.next(true);

      // Re-subscribe any pending topics after reconnect
      this.messageSubjects.forEach((subject, taskId) => {
        this.subscribeToTopic(taskId, subject);
      });
    };

    this.client.onDisconnect = () => {
      console.warn('[WS] Disconnected');
      this.connectionStatus.next(false);
    };

    this.client.onStompError = (frame) => {
      console.error('[WS] STOMP Error:', frame.headers['message'], frame.body);
    };

    this.client.onWebSocketError = (event) => {
      console.error('[WS] WebSocket Error:', event);
    };
  }

  public connect(): void {
    if (!this.client.active) {
      this.client.activate();
    }
  }

  public disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  public isConnected(): boolean {
    return this.client.connected;
  }

  /**
   * Subscribe to live generation progress for a specific task ID.
   * Uses ReplaySubject(10) so messages are buffered if subscriber arrives slightly late.
   */
  public watchGeneration(taskId: string): Observable<GenerationProgress> {
    if (!this.messageSubjects.has(taskId)) {
      // Buffer up to 10 messages in case of slight timing differences
      const subject = new ReplaySubject<GenerationProgress>(10);
      this.messageSubjects.set(taskId, subject);
    }

    const subject = this.messageSubjects.get(taskId)!;

    if (this.client.connected) {
      // Already connected - subscribe immediately
      this.subscribeToTopic(taskId, subject);
    } else {
      // Wait for next connection event
      this.connectionStatus.pipe(
        filter(connected => connected),
        first()
      ).subscribe(() => {
        this.subscribeToTopic(taskId, subject);
      });
    }

    return subject.asObservable();
  }

  private subscribeToTopic(taskId: string, subject: ReplaySubject<GenerationProgress>) {
    const destination = `/topic/generation/${taskId}`;
    console.log('[WS] Subscribing to:', destination);
    this.client.subscribe(destination, (message: Message) => {
      if (message.body) {
        try {
          const payload: GenerationProgress = JSON.parse(message.body);
          console.log('[WS] Received update for task', taskId, payload);
          subject.next(payload);
        } catch (e) {
          console.error('[WS] Failed to parse message:', message.body);
        }
      }
    });
  }
}
