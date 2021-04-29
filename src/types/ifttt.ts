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
  amount: string;
  data: string;
}

export interface IftttParticleData {
  eventName: string;
  triggerKey: string;
  isActive: boolean;
}
