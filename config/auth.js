// import CryptoJS from "crypto-js";

// const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Must match backend

// const encryptData = (data) => {
//   if (!SECRET_KEY) {
//     throw new Error("Missing frontend SECRET_KEY.");
//   }

//   // 🔐 Encrypt Data
//   // const encrypted = CryptoJS.AES.encrypt(
//   //   JSON.stringify(data),
//   //   SECRET_KEY
//   // ).toString();

//   // ✅ Encode to Base64 (Fixes corrupted transmission issues)
//   const base64Encrypted = Buffer.from(SECRET_KEY+data).toString("base64");

//   console.log("🔒 Encrypted (Base64):", base64Encrypted);

//   return base64Encrypted;
// };

// // Example usage
// const encryptedData = encryptData({ email: "deepanshi.singhal@vocso.com", employee_code: "ergfhn" });
// console.log("Final Encrypted Data:", encryptedData);

// // VTJGc2RHVmtYMTg1QkhYSjlQeG1PSGc4OU5YWTBwUm93cVptS0hLcXlVV2s1ajJkSjZyZFJhdHhVYTFYY1hoQVQyc0V6a21FdjVKbVBaTHhsMjhncFN3WVdzNzhMd2ptRWFNdEUyQzUvODRkYnBPWXBjYmFldklTdUJlc29xZCs=



const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY; // Must match backend

const encryptData = (userId, email) => {
  if (!SECRET_KEY) {
    throw new Error("Missing frontend SECRET_KEY.");
  }

  // ✅ Format data as "userId&email" and prepend with "deps"
  const plainText = `${SECRET_KEY}${userId}&${email}`;

  // ✅ Encode to Base64 (no AES)
  const base64Encrypted = Buffer.from(plainText).toString("base64");

  console.log("🔒 Encrypted (Base64):", base64Encrypted);

  return base64Encrypted;
};

// Example usage
const encryptedData = encryptData("2380BR", "Nitish.Kumar@rodicconsultants.com");
console.log("Final Encrypted Data:", encryptedData);


//ZGVwczYwMTVITyZWaW5lZXQuU2FjaGFuQHJvZGljY29uc3VsdGFudHMuY29t

// ZGVwczIzODBCUiZOaXRpc2guS3VtYXJAcm9kaWNjb25zdWx0YW50cy5jb20=
// ZGVwczIzODBCUiZOaXRpc2guS3VtYXJAcm9kaWNjb25zdWx0YW50cy5jb20=