import { Address, Dns, ProxyProvider } from "elrondjs";

export const proxy = new ProxyProvider("https://gateway.elrond.com");
export const dns = new Dns({ provider: proxy });
