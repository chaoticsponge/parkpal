export const ConvertIDtoParking = (id: string) => {
  // Hash the parking ID, take the first and/or second NUMBER from the hash
  // This is to make the parking ID more human-readable

  // Hash the parking ID
  const hash = id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  // Take the first and/or second NUMBER from the hash
  const number = hash.toString().split('').filter(char => !isNaN(parseInt(char))).slice(0, 2).join('');

  // take the first letter from the hash
  const letter = String.fromCharCode(hash % 26 + 65);

  return letter + number;
}