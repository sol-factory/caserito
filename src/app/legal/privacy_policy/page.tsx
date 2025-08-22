import LegalPage from "@/components/custom-ui/LegalPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default function PoliticaPrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad">
      <p>
        En Aquapp valoramos tu privacidad y nos comprometemos a proteger tus
        datos personales. Esta política describe qué información recopilamos,
        cómo la usamos y qué derechos tenés sobre tus datos.
      </p>

      <h2 className="font-bold underline mt-3">Información que recopilamos</h2>
      <ul>
        <li>
          Datos personales que brindás al registrarte (nombre, email, teléfono).
        </li>
        <li>
          Información generada por el uso de la app (servicios, registros,
          mensajes, etc.).
        </li>
        <li>
          Datos técnicos como dirección IP y comportamiento de navegación.
        </li>
      </ul>

      <h2 className="font-bold underline mt-3">Cómo usamos tu información</h2>
      <ul>
        <li>Para ofrecer, mantener y mejorar los servicios de Aquapp.</li>
        <li>
          Para contactarte con notificaciones importantes o soporte técnico.
        </li>
        <li>Para cumplir con obligaciones legales y mejorar la seguridad.</li>
      </ul>

      <h2 className="font-bold underline mt-3">
        Con quién compartimos los datos
      </h2>
      <p>
        No vendemos ni alquilamos tus datos. Podemos compartir información con
        proveedores de servicios que actúan en nuestro nombre, bajo acuerdos
        estrictos de confidencialidad.
      </p>

      <h2 className="font-bold underline mt-3">Tus derechos</h2>
      <ul>
        <li>Acceder, modificar o eliminar tus datos personales.</li>
        <li>Solicitar la eliminación total de tu cuenta y su contenido.</li>
        <li>Revocar tu consentimiento para determinados usos.</li>
      </ul>

      <Alert className="bg-blue-50 dark:bg-blue-900/20">
        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">
          ¿Querés eliminar tus datos?
        </AlertTitle>
        <AlertDescription>
          Podés hacerlo desde tu cuenta o enviándonos un mail a{" "}
          <a className="underline mt-3" href="mailto:aquapp.lat@gmail.com">
            aquapp.lat@gmail.com
          </a>
          .
        </AlertDescription>
      </Alert>

      <p>
        Ante cualquier duda sobre esta política, escribinos a{" "}
        <a className="underline mt-3" href="mailto:aquapp.lat@gmail.com">
          aquapp.lat@gmail.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
