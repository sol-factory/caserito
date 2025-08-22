"server only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.NEXT_JWT_SECRET_KEY); // Usa una clave secreta segura

export type UserPayload = {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar_url: string;
  geo: {
    country: string;
    city: string;
    timezone: string;
  };
  company: {
    _id: string;
    name: string;
    slug: string;
    country: string;
    logo_url: string;
  };
  phone: {
    country: { _id: string; code: string; phone_code: string; flag: string };
    formatted_number: string;
    number: string;
  };
  role: string;
  store: {
    _id: string;
    name: string;
    address: string;
  };
  subscription: any;
  is_developer: boolean;
};

export function generateTokenPayload(user, membership) {
  const payload: UserPayload = {
    _id: user._id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    phone: user.phone,
    avatar_url: user.avatar_url,
    is_developer: user?.is_developer,
    geo: user.geo,
    role: membership ? membership.role.name : undefined,
    company: membership ? membership.company : undefined,
    store: membership ? membership.store : undefined,
    subscription: membership ? membership.subscription : undefined,
  };

  return payload;
}

// Función para crear el JWT
export async function createJWTandSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" }) // Define el algoritmo de firma
    .setIssuedAt() // Fecha de emisión
    .setExpirationTime("1 year") // Expiración en 1 año
    .sign(secret); // Firma con la clave secreta

  await createSession(token);

  return token;
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, secret); // Verificación con la clave secreta

    return payload as UserPayload; // Devuelve el payload si el token es válido
  } catch (error) {
    await deleteSession();
    return null;
  }
}

export async function createSession(token) {
  const cookieStore = await cookies();
  cookieStore.set("jwt", token, {
    httpOnly: true,
    maxAge: 180 * 24 * 60 * 60, // 6 meses
    path: "/",
    sameSite: "lax", // Clave para que se envíe la cookie cuando un usuario llega por haber hecho click en un link
  });
}

export async function deleteSession(tokenName = "jwt") {
  const cookieStore = await cookies();
  cookieStore.delete(tokenName);
}

export async function verifySession() {
  const cookiestList = await cookies();
  const token = cookiestList.get("jwt")?.value;

  if (!!token) {
    const user = await verifyJWT(token);
    return user;
  } else {
    return null;
  }
}
