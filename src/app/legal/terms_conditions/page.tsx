import LegalPage from "@/components/custom-ui/LegalPage";

export default function TerminosCondicionesPage() {
  return (
    <LegalPage title="Términos y Condiciones de Uso">
      <p>
        Al usar Aquapp, aceptas los siguientes términos y condiciones. Si no
        estás de acuerdo, por favor no utilices la plataforma.
      </p>

      <h2 className="font-bold underline mt-3">Uso permitido</h2>
      <ul>
        <li>
          Podés utilizar Aquapp para la gestión integral de tu negocio de
          prestación de servicios a vehículos de clientes.
        </li>
        <li>
          No podés usarla para actividades ilegales, fraudulentas o que
          infrinjan derechos de terceros.
        </li>
      </ul>

      <h2 className="font-bold underline mt-3">Propiedad intelectual</h2>
      <p>
        Todo el contenido, marca y diseño de Aquapp son propiedad de Martín
        Gesualdo. No está permitido copiar, modificar ni distribuir partes del
        software sin autorización.
      </p>

      <h2 className="font-bold underline mt-3">Responsabilidad</h2>
      <ul>
        <li>
          Nos comprometemos a ofrecer una plataforma estable y funcional, pero
          como todo software, pueden existir interrupciones o errores.
          Trabajamos constantemente para mejorar la experiencia.
        </li>
        <li>
          En cumplimiento con la legislación vigente, limitamos nuestra
          responsabilidad por pérdidas o daños derivados del uso de la
          plataforma.
        </li>
      </ul>

      <h2 className="font-bold underline mt-3">Suspensión de cuenta</h2>
      <p>
        Podemos suspender o eliminar cuentas que violen estos términos o que
        presenten actividad sospechosa.
      </p>

      <h2 className="font-bold underline mt-3">Modificaciones</h2>
      <p>
        Nos reservamos el derecho a modificar estos términos. Notificaremos
        cambios importantes por email o en la plataforma.
      </p>

      <p>
        Ante cualquier duda, escribinos a{" "}
        <a className="underline mt-3" href="mailto:contacto@aquapp.lat">
          contacto@aquapp.lat
        </a>
        .
      </p>
    </LegalPage>
  );
}
