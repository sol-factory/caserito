import parsePhoneNumber, {
  AsYouType,
  isValidPhoneNumber,
} from "libphonenumber-js";

export const validatePhone = ({ number, countryCode }) => {
  if (!!number && !!countryCode) {
    const phoneNumber = parsePhoneNumber(number, countryCode);
    const nationalNumber = phoneNumber?.nationalNumber || "";
    const formattedNumber = !!nationalNumber
      ? new AsYouType(countryCode).input(nationalNumber)
      : "";
    const isValid = isValidPhoneNumber(nationalNumber, countryCode);

    return { ...phoneNumber, formattedNumber, isValid };
  } else {
    return {};
  }
};

export const formatPhoneToSendMessage = (phone) => {
  const { countryCallingCode, nationalNumber } = phone;

  // Países que requieren el "9" para móviles con WhatsApp
  const countriesRequiringNine = [
    "54", // Argentina ✅
    "55", // Brasil
    "56", // Chile
    "593", // Ecuador
    "51", // Perú
  ];

  // Países donde NO debe agregarse el "9"
  const countriesBlockingNine = [
    "52", // México ❌
    "57", // Colombia
    "591", // Bolivia
    "502", // Guatemala
    "503", // El Salvador
    "504", // Honduras
    "505", // Nicaragua
    "506", // Costa Rica
    "507", // Panamá
    "598", // Uruguay
    "34", // España
    "1", // Rep. Dominicana
    "53", // Cuba
    "595", // Paraguay
    "58", // Venezuela
  ];

  if (countriesBlockingNine.includes(countryCallingCode)) {
    return countryCallingCode + nationalNumber;
  }

  if (countriesRequiringNine.includes(countryCallingCode)) {
    return countryCallingCode + "9" + nationalNumber;
  }

  // Por defecto, número plano
  return countryCallingCode + nationalNumber;
};
