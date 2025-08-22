export const toMoney = (
  number: number,
  abs: boolean = false,
  spaceAfterCurrencySign = true,
  currencySymbol: string = "$"
) => {
  const formattedNumber = Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs ? Math.abs(number) : number);

  const minusSign = formattedNumber.includes("-") ? "-" : "";
  const space = spaceAfterCurrencySign ? " " : "";

  return `${minusSign}${currencySymbol}${space}${formattedNumber.replace("-", "")}`;
};

export const showCreatorInfo = (user, fullname = false) => {
  const firstname = user.firstname?.trim();
  const lastname = user.lastname?.trim();
  const email = user.email?.trim();

  if (firstname && lastname) {
    return `${fullname ? firstname : `${firstname[0]}.`} ${lastname}`;
  } else if (firstname) {
    return firstname;
  } else if (lastname) {
    return lastname;
  } else if (email) {
    const username = email.split("@")[0];
    return username;
  }
  return "user desconocido"; // Caso opcional si no hay datos
};
