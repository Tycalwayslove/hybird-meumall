export type AddressEntry = {
  areaId?: number | string;
  addrId: string;
  receiver: string;
  mobile: string;
  province: string;
  provinceId?: number | string;
  city: string;
  cityId?: number | string;
  area: string;
  addr: string;
  commonAddr: 0 | 1;
  lat?: number | string;
  lng?: number | string;
};

export function formatAddressLine(address: AddressEntry) {
  return `${address.province}${address.city}${address.area}`;
}

export function formatFullAddress(address: AddressEntry) {
  return `${formatAddressLine(address)}${address.addr}`;
}
