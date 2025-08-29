// Alternative connection string formats to try
const alternatives = [
  // Original format
  "mongodb+srv://tobertsenger:AyskuJXQz0ccJBsR@cluster0.8uan5ww.mongodb.net/moviesapp?retryWrites=true&w=majority",
  
  // Without database name
  "mongodb+srv://tobertsenger:AyskuJXQz0ccJBsR@cluster0.8uan5ww.mongodb.net/?retryWrites=true&w=majority",
  
  // With different options
  "mongodb+srv://tobertsenger:AyskuJXQz0ccJBsR@cluster0.8uan5ww.mongodb.net/moviesapp?retryWrites=true&w=majority&authSource=admin",
  
  // URL encoded password (just in case)
  "mongodb+srv://tobertsenger:" + encodeURIComponent("AyskuJXQz0ccJBsR") + "@cluster0.8uan5ww.mongodb.net/moviesapp?retryWrites=true&w=majority"
];

console.log("Alternative connection strings to try:");
alternatives.forEach((alt, index) => {
  console.log(`${index + 1}. ${alt}`);
});

console.log("\nTry updating your .env file with one of these alternatives.");
