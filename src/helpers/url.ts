export const createQueryString = (
  searchParams: URLSearchParams | "",
  name: string | string[],
  value: string | string[],
  pathname: string
) => {
  const params = new URLSearchParams(
    searchParams ? searchParams.toString() : ""
  );
  if (typeof name === "string" && typeof value === "string") {
    params.set(name, value);
  }

  if (Array.isArray(name) && Array.isArray(value)) {
    name.forEach((n, index) => {
      params.set(n, value[index]);
    });
  }
  const paramsString = params.toString();

  localStorage.setItem(pathname, paramsString);
  return paramsString;
};

export const removeQueryString = (
  name: string,
  searchParams: URLSearchParams,
  pathname: string
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete(name);

  const paramsString = params.toString();
  localStorage.setItem(pathname, paramsString);
  return paramsString;
};
