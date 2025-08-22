"use client";
import MyCheckboxField from "@/components/custom-ui/MyCheckbox";
import { CardTitle } from "@/components/ui/card";
import { useStore } from "@/stores";
import React from "react";

const MemberPermissions = () => {
  const role = useStore((s) => s.member.role) as any;
  if (role?.name !== "Técnico") return <></>;
  return (
    <>
      <div className="flex flex-col mt-2">
        <CardTitle>Sobre ventas</CardTitle>
        <div className="flex flex-col ">
          <MyCheckboxField
            entity="member"
            field="can_view_amount_sale"
            id="can_view_amount_sale"
            text="Puede ver precios"
            className="mt-1 py-0.5"
          >
            Permite que el usuario vea los precios de los servicios de la venta.
          </MyCheckboxField>
        </div>
      </div>
      <div className="flex flex-col mt-2.5">
        <CardTitle>Sobre clientes</CardTitle>
        <div className="flex flex-col ">
          <MyCheckboxField
            entity="member"
            field="can_view_client"
            id="can_view_client"
            text="Puede ver pestaña"
            className="mt-1 py-0.5"
          >
            Permite que el usuario vea la pestaña de &quot;Clientes&quot;.
          </MyCheckboxField>

          <MyCheckboxField
            entity="member"
            field="can_edit_client"
            id="can_edit_client"
            text="Puede editar datos"
            className="py-0.5"
          >
            Permite que el usuario edite datos de clientes y sus vehículos.
          </MyCheckboxField>
          <MyCheckboxField
            entity="member"
            field="can_view_phone_client"
            id="can_view_phone_client"
            text="Puede ver teléfonos"
            className="py-0.5"
          >
            Permite que el usuario vea los teléfonos de los clientes. <br />
            <br />
            También posibilita el envío de mensajes de Whatsapp usando el envío
            ✋🏼 manual.
          </MyCheckboxField>
        </div>
      </div>
      <div className="flex flex-col mt-2.5">
        <CardTitle>Sobre cotizaciones</CardTitle>
        <div className="flex flex-col ">
          <MyCheckboxField
            entity="member"
            field="can_view_quote"
            id="can_view_quote"
            text="Puede ver pestaña"
            className="mt-1 py-0.5"
          >
            Permite que el usuario vea la pestaña de &quot;Cotizaciones&quot;.
          </MyCheckboxField>
          <MyCheckboxField
            entity="member"
            field="can_view_amount_quote"
            id="can_view_amount_quote"
            text="Puede ver precios"
            className="py-0.5"
          >
            Permite que el usuario vea los precios de los servicios de la
            cotizción.
          </MyCheckboxField>
        </div>
      </div>
      <div className="flex flex-col mt-2.5">
        <CardTitle>Sobre caja</CardTitle>
        <div className="flex flex-col">
          <MyCheckboxField
            entity="member"
            field="can_view_cashflow"
            id="can_view_cashflow"
            text="Puede ver pestaña"
            className="mt-1"
          >
            Permite que el usuario vea la pestaña de &quot;Caja&quot;.
          </MyCheckboxField>
        </div>
      </div>
      <div className="flex flex-col mt-2.5 mb-2">
        <CardTitle>Sobre servicios</CardTitle>
        <div className="flex flex-col">
          <MyCheckboxField
            entity="member"
            field="can_view_service"
            id="can_view_service"
            text="Puede ver pestaña"
            className="mt-1 py-0.5"
          >
            Permite que el usuario vea la pestaña de &quot;Servicios&quot;.
          </MyCheckboxField>
          <MyCheckboxField
            entity="member"
            field="can_view_amount_service"
            id="can_view_amount_service"
            text="Puede ver precios"
            className="py-0.5"
          >
            Permite que el usuario vea los precios de los servicios.
          </MyCheckboxField>
        </div>
      </div>
    </>
  );
};

export default MemberPermissions;
