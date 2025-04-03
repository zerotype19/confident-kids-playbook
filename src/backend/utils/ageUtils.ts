export function calculateAgeRange(birthdate: Date): string {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  if (age < 2) {
    return '0-2 years';
  } else if (age < 5) {
    return '2-5 years';
  } else if (age < 8) {
    return '5-8 years';
  } else if (age < 12) {
    return '8-12 years';
  } else {
    return '12+ years';
  }
} 