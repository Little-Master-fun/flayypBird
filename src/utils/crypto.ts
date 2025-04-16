// utils/crypto.ts

/**
 * 将 PEM 格式的公钥转成 ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem.replace(/-----.*?-----/g, '').replace(/\s/g, '');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * 加载公钥为 CryptoKey
   */
  async function loadPublicKey(pem: string): Promise<CryptoKey> {
    const arrayBuffer = pemToArrayBuffer(pem);
    return await window.crypto.subtle.importKey(
      'spki',
      arrayBuffer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }
  
  /**
   * 使用公钥加密数据
   */
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const base64abc = [
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    ];
    let result = '', i;
    const l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += base64abc[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
      result += base64abc[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 0x03) << 4];
      result += '==';
    }
    if (i === l) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
      result += base64abc[(bytes[i - 1] & 0x0f) << 2];
      result += '=';
    }
    return result;
  }
    
  export async function encryptWithPublicKey(data: string): Promise<string> {
    const pem = await fetch('/key/public_key.pem').then(res => res.text());
    const publicKey = await loadPublicKey(pem);
  
    const encoded = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoded
    );
  
    return arrayBufferToBase64(encrypted);
  }
    
// 数据发送函数
export async function sendScore(data: {score: number; session: string}): Promise<void> {
    const encryptedData = await encryptWithPublicKey(JSON.stringify(data));

    const formBody = new URLSearchParams();
  formBody.append("data", encryptedData);  // ✅ 注意：字段名必须和后端一致
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: formBody.toString(),
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
  }


  /**
 * 计算数据的 SHA-256 哈希值
 */
  async function calculateHash(data: object): Promise<string> {
    const encoder = new TextEncoder();
    const dataStr = stableStringify(data);  // 用稳定 stringify
    const dataBytes = encoder.encode(dataStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));  // 👈 Base64 输出
  }
  function stableStringify(obj: any): string {
    if (typeof obj !== 'object' || obj === null) return JSON.stringify(obj);
    if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  
    const keys = Object.keys(obj).sort(); // 排序字段
    const entries = keys.map(key => `"${key}":${stableStringify(obj[key])}`);
    return `{${entries.join(',')}}`;
  }
/**
 * 检测数据的哈希是否与传入的哈希一致
 * @param data - 数据对象
 * @param hash - 传入的哈希值
 * @returns 是否一致
 */
export async function verifyDataHash(data: object, hash: string): Promise<boolean> {
    const calculatedHash = await calculateHash(data);
    return calculatedHash === hash;  // 比较计算出的哈希值和传入的哈希值
}