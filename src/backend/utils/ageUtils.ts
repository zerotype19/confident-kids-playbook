export function calculateAgeRange(birthdate: Date): string | null {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 9) return '6-9';
  if (age >= 10 && age <= 13) return '10-13';
  return null;
} 