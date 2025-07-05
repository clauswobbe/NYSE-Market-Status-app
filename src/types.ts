export enum MarketStatus {
  PREMARKET = 'Premarket',
  OPEN = 'Open',
  AFTERMARKET = 'Aftermarket',
  CLOSED = 'Closed',
}

export interface MarketEvent {
  name: string;
  dateTime: Date;
  statusOnEvent: MarketStatus;
}
