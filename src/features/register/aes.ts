import type { RegisterAesKeyData, RegisterAesParams } from "./types";

export async function decodeRegisterAesParams(keyData: RegisterAesKeyData): Promise<RegisterAesParams> {
  const decrypted = await decryptByAes(keyData.key_data, {
    key: keyData.key_str,
    iv: keyData.key_str
  });
  const parsed = JSON.parse(decrypted) as Partial<{ aes_key: string; aes_iv: string }>;

  if (!parsed.aes_key || !parsed.aes_iv) {
    throw new Error("加密参数格式错误");
  }

  return {
    key: parsed.aes_key,
    iv: parsed.aes_iv
  };
}

export async function encryptRegisterPayload(plainText: string, params: RegisterAesParams): Promise<string> {
  return encryptByAes(plainText, params);
}

async function encryptByAes(plainText: string, params: RegisterAesParams): Promise<string> {
  const cryptoKey = await importAesKey(params.key, ["encrypt"]);
  const encoded = new TextEncoder().encode(plainText);
  const encrypted = await globalThis.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: utf8Bytes(params.iv)
    },
    cryptoKey,
    encoded
  );

  return bytesToBase64(new Uint8Array(encrypted));
}

async function decryptByAes(encryptedText: string, params: RegisterAesParams): Promise<string> {
  const cryptoKey = await importAesKey(params.key, ["decrypt"]);
  const decrypted = await globalThis.crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: utf8Bytes(params.iv)
    },
    cryptoKey,
    base64ToBytes(encryptedText)
  );

  return new TextDecoder().decode(decrypted);
}

async function importAesKey(key: string, usages: KeyUsage[]) {
  return globalThis.crypto.subtle.importKey("raw", utf8Bytes(key), { name: "AES-CBC" }, false, usages);
}

function utf8Bytes(value: string) {
  return new TextEncoder().encode(value);
}

function base64ToBytes(value: string) {
  const binary = globalThis.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return globalThis.btoa(binary);
}
