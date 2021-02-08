import { proxy, dns } from "../services/elrond";

export const getErdAddressFromHerotag = async (herotag: string) => {
  const address = await dns.resolve(herotag);

  return address;
};

export const getHerotagFromErdAddress = async (erdAddress: string) => {
  const { username } = await proxy.getAddress(erdAddress);

  return username || "NO_HEROTAG";
};
