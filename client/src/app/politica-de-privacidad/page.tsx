import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { StorefrontTemplate } from "@/presentation/templates/StorefrontTemplate";
import { SectionEyebrow } from "@/presentation/atoms/SectionEyebrow";

export default function PoliticaDePrivacidadPage() {
  return (
    <StorefrontTemplate>
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
        </div>

        <header className="mb-10">
          <SectionEyebrow icon={Lock}>Seguridad y Transparencia</SectionEyebrow>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-heading tracking-tight mt-2">
            Política de Privacidad
          </h1>
          <div className="w-16 h-1 bg-[#18D6D1] rounded-full mt-2.5" />
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            Última actualización: Septiembre de 2026
          </p>
        </header>

        <div className="space-y-8 text-neutral-700 font-body leading-relaxed text-sm sm:text-base">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              1. Compromiso de Protección de Datos
            </h2>
            <p>
              En <strong>UNO COMPRAS</strong> nos comprometemos a garantizar la confidencialidad, integridad y seguridad de la información personal suministrada por nuestros usuarios y compradores al utilizar nuestra plataforma online. Cumplimos rigurosamente con los estándares y normativas vigentes en materia de protección de datos personales.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              2. Datos que Recopilamos
            </h2>
            <p className="mb-3">
              Para brindarte una experiencia ágil y segura, podemos solicitarte los siguientes datos en el proceso de registro, compra o suscripción:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Nombre completo y documento de identidad.</li>
              <li>Dirección de correo electrónico y teléfono de contacto.</li>
              <li>Domicilio de entrega y código postal para el despacho de pedidos.</li>
              <li>Información para facturación legal.</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              3. Finalidad del Tratamiento
            </h2>
            <p className="mb-3">Los datos recopilados se utilizan exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Gestionar, procesar y entregar tus compras en tiempo y forma.</li>
              <li>Enviarte actualizaciones del estado del envío y seguimiento logístico.</li>
              <li>Responder a tus consultas de soporte y atención al cliente.</li>
              <li>Enviarte ofertas exclusivas, cupones y novedades únicamente si aceptaste suscribirte a nuestro boletín.</li>
            </ul>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              4. Seguridad en los Pagos
            </h2>
            <p>
              UNO COMPRAS no almacena información de tarjetas de crédito o contraseñas bancarias. Todas las operaciones de pago se procesan a través de pasarelas electrónicas certificadas bajo protocolos internacionales de seguridad SSL y cifrado de extremo a extremo.
            </p>
          </section>

          <section className="bg-card rounded-2xl border border-border p-6 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading mb-3">
              5. Derechos del Titular de los Datos
            </h2>
            <p>
              Podés solicitar en cualquier momento el acceso, rectificación, actualización o baja total de tus datos personales enviando un correo a <strong>hola@unocompras.com</strong> con el asunto "Protección de Datos".
            </p>
          </section>
        </div>
      </div>
    </StorefrontTemplate>
  );
}
