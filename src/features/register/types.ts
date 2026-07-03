export type RegisterAesKeyData = {
  key_data: string;
  key_str: string;
};

export type RegisterAesParams = {
  key: string;
  iv: string;
};

export type RegisterPlainPayload = {
  phone: string;
  code: string;
  password: string;
  inviter: string;
  nickname: string;
};

export type RegisterEncryptedPayload = {
  data: string;
};

export type RegisterBackendEnvelope<T = unknown> = {
  data?: T;
  msg?: string;
  status?: string;
};
