import LegalPage from "@/components/custom-ui/LegalPage";

export default function EliminacionDatosPage() {
  return (
    <LegalPage title="Instrucciones para la Eliminación de Datos">
      <p>
        Si querés eliminar tus datos de Aquapp, puedes hacerlo en cualquier
        momento de manera sencilla. Acá te explicamos cómo:
      </p>

      <h2 className="font-bold underline mt-3">1. Desde tu cuenta</h2>
      <ul>
        <li>
          Ingresá con tu usuario y contraseña en{" "}
          <a className="underline mt-3" href="https://www.aquapp.lat">
            aquapp.lat
          </a>
          .
        </li>
        <li>Dirigite a Configuración &gt; Cuenta &gt; Eliminar cuenta.</li>
        <li>Confirmá la acción siguiendo las instrucciones en pantalla.</li>
      </ul>

      <h2 className="font-bold underline mt-3">2. Por email</h2>
      <ul>
        <li>
          Escribinos desde el correo registrado a{" "}
          <a className="underline mt-3" href="mailto:aquapp.lat@gmail.com">
            aquapp.lat@gmail.com
          </a>
          .
        </li>
        <li>Indicá en el asunto &quote;Eliminación de cuenta&quote;.</li>
        <li>Procesaremos tu solicitud dentro de los 7 días hábiles.</li>
      </ul>

      <h2 className="font-bold underline mt-3">Consideraciones</h2>
      <ul>
        <li>
          La eliminación es irreversible: se eliminarán tus datos, servicios,
          registros y configuraciones.
        </li>
        <li>
          Guardamos una constancia mínima para fines legales durante 6 meses.
        </li>
      </ul>

      <p>
        Si tenés dudas sobre este proceso, escribinos a{" "}
        <a className="underline mt-3" href="mailto:aquapp.lat@gmail.com">
          aquapp.lat@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
