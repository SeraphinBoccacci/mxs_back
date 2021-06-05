export interface IftttConfig {
  eventName: string;
  triggerKey: string;
}

export interface IftttWebhookData {
  value1: string;
  value2: string;
  value3: string;
}

export interface EventData {
  herotag: string;
  data: string;
  // Amount received, used to check the acceptability of a transaction
  amount: number;
  // Amount to display on end user supports (overlay or ifttt), can be a stringified number or a string
  wordingAmount: string;
}

export interface IftttParticleData {
  eventName: string;
  triggerKey: string;
  isActive: boolean;
}
