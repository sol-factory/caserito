"use client";

import WhatsappNumberRow from "./WhatsappNumberRow";

export default function WhatsappNumbersTable({ whatsapp_numbers, user }) {
  if (!Array.isArray(whatsapp_numbers) || !whatsapp_numbers) return <></>;

  return (
    <div
      className={`flex flex-col gap-2 max-h-60 -mt-1 mb-5 ${
        whatsapp_numbers.length > 2 ? "overflow-y-scroll" : ""
      }`}
    >
      {whatsapp_numbers.length > 0 ? (
        whatsapp_numbers.map((w, index) => (
          <WhatsappNumberRow key={w._id} w={w} userEmail={user.email} />
        ))
      ) : (
        <div className="w-full h-10 mt-5 text-xs font-extralight text-center text-muted-foreground">
          <span>Ningún número vinculado aún</span>
        </div>
      )}
    </div>
  );
}
