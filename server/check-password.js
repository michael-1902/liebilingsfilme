// Test if password needs URL encoding
const password = "AyskuJXQz0ccJBsR";
console.log("Original password:", password);
console.log("URL encoded password:", encodeURIComponent(password));

// Check if password contains special characters that need encoding
const specialChars = ['@', ':', '/', '?', '#', '[', ']', '%'];
const hasSpecialChars = specialChars.some(char => password.includes(char));
console.log("Contains special characters:", hasSpecialChars);

if (hasSpecialChars) {
  console.log("⚠️  Password may need URL encoding");
} else {
  console.log("✅ Password looks fine");
}
