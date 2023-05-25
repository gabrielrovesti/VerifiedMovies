export async function encryptData(data: string | undefined) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
  
    // Generate a random encryption key
    const key = await crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  
    // Encrypt the data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encodedData
    );
  
    // Return the encrypted data and IV as Uint8Arrays
    return {
      encryptedData,
      iv,
    };
}
  
export async function decryptData(encryptedData: ArrayBuffer, iv: Uint8Array) {
  // Generate the decryption key
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Convert the encrypted data and IV back to Uint8Arrays
  const encryptedDataArray = new Uint8Array(encryptedData);
  const ivArray = new Uint8Array(iv);

  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    key,
    encryptedDataArray
  );

  // Convert the decrypted data to a string
  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedData);

  return decryptedString;
}

  