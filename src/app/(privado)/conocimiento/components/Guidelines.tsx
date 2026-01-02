"use client";

import { useState } from "react";

export default function Guidelines() {
  const [open, setOpen] = useState<{
    sinonimos: boolean;
    institucional: boolean;
  }>({
    sinonimos: false,
    institucional: false,
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-medium text-gray-900">
          Guía para editar la base de conocimientos
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {/* ===== KB SINÓNIMOS ===== */}
        <section>
          <button
            onClick={() => setOpen((s) => ({ ...s, sinonimos: !s.sinonimos }))}
            className="w-full flex items-center justify-between px-4 py-3"
            aria-expanded={open.sinonimos}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">KB Sinónimos</div>
              <div className="text-xs text-gray-500">
                Alias, equivalencias y normalización
              </div>
            </div>
            <span
              className={`inline-block transition-transform ${open.sinonimos ? "rotate-90" : ""}`}
            >
              ▸
            </span>
          </button>

          {open.sinonimos && (
            <div className="px-4 pb-4">
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>
                  <b>Una regla por línea</b>. Usá la flecha <code>=&gt;</code>.
                  Las líneas inválidas se ignoran.
                </li>
                <li>
                  <b>Sinónimos simples:</b>{" "}
                  <code>{"<alias1>, <alias2> o <alias3> => <canonico>"}</code>
                </li>
                <li>
                  <b>Con “si te piden”:</b>{" "}
                  <code>{"si te piden <texto> => <canonico>"}</code>
                </li>
                <li>
                  <b>Fallback de medida:</b>{" "}
                  <code>
                    {
                      "si te piden de <N> y tenes/tenés de <M> ofrece/ofrecé ese"
                    }
                  </code>{" "}
                  (N/M con coma o punto).
                </li>
                <li>
                  No distingue mayúsculas/minúsculas;{" "}
                  <b>la última regla prevalece</b>. Preferí <b>singular</b> y
                  evitá palabras muy cortas.
                </li>
              </ol>

              <div className="mt-3 text-xs text-gray-500">
                <p className="mb-1">Ejemplos:</p>
                <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {`clavo, clavito o puntilla => clavo
si te piden barral para cortina => barral
si te piden de 70 y tenes de 69 ofrece ese`}
                </pre>
              </div>
            </div>
          )}
        </section>

        {/* ===== KB INSTITUCIONAL ===== */}
        <section>
          <button
            onClick={() =>
              setOpen((s) => ({ ...s, institucional: !s.institucional }))
            }
            className="w-full flex items-center justify-between px-4 py-3"
            aria-expanded={open.institucional}
          >
            <div className="text-left">
              <div className="font-medium text-gray-900">KB Institucional</div>
              <div className="text-xs text-gray-500">
                Medios de pago, envíos, horarios, devoluciones, etc.
              </div>
            </div>
            <span
              className={`inline-block transition-transform ${open.institucional ? "rotate-90" : ""}`}
            >
              ▸
            </span>
          </button>

          {open.institucional && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-700 mb-2">
                Para que el prompt lo entienda perfecto, usá{" "}
                <b>bloques etiquetados</b> (en mayúsculas, sin tildes) y pares
                <code> clave: valor</code>, una por línea. Separá secciones con
                una línea en blanco.
              </p>

              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>
                  Etiquetas sugeridas: <code>[MEDIOS_DE_PAGO]</code>,{" "}
                  <code>[ENVIOS]</code>, <code>[DEVOLUCIONES]</code>,{" "}
                  <code>[HORARIOS]</code>, <code>[CONTACTO]</code>,{" "}
                  <code>[SUCURSALES]</code>, <code>[GARANTIA]</code>,{" "}
                  <code>[FACTURACION]</code>, <code>[PROMOCIONES]</code>.
                </li>
                <li>
                  Usá <b>snake_case</b> en claves (
                  <code>tarjetas_aceptadas</code>, <code>gratis_desde</code>…).
                </li>
                <li>
                  Si algo no aplica, poné <code>N/A</code>. URLs completas
                  cuando apliquen.
                </li>
                <li>
                  El bot prioriza la info más reciente: repetí la clave para
                  actualizar (la <b>última</b> gana).
                </li>
              </ul>

              <div className="mt-3 text-xs text-gray-500">
                <p className="mb-1">
                  Plantilla sugerida (copiar/pegar y editar):
                </p>
                <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3">
                  {`[MEDIOS_DE_PAGO]
tarjetas_aceptadas: VISA, Mastercard, Amex
cuotas: 3, 6, 12 (con interes)
transferencias: alias MMakers.Tienda
efectivo: si (solo en sucursal)
link_pago: https://tu-pasarela/pago

[ENVIOS]
operador: Andreani
zonas: CABA, GBA, Interior
costos: CABA $2500 | GBA $3500 | Interior $4500
gratis_desde: $50000
retiro_en_tienda: si (Direccion Principal 123, CABA)
demora_estimada: CABA 24-48h | GBA 48-72h | Interior 3-6 dias
tracking: si (mail y whatsapp)

[DEVOLUCIONES]
plazo: 30 dias corridos
condiciones: sin uso, en empaque original, con comprobante
quien_cubre_envio: tipear motivo; fallas cubre la empresa

[HORARIOS]
atencion: lun-vie 09-18 | sab 10-14
feriados: cerrado

[CONTACTO]
whatsapp: +54 9 11 1234-5678
email: soporte@tuempresa.com
telefono: 011 4321-0000

[SUCURSALES]
principal: Direccion Principal 123, CABA
sucursal_2: Av. Siempre Viva 742, GBA

[GARANTIA]
tipo: oficial
plazo: 12 meses
procedimiento: contactar soporte con numero de orden

[FACTURACION]
tipos: A, B
datos_requeridos: razon_social, cuit, condicion_iva, domicilio

[PROMOCIONES]
ahora_12: si (bancos adheridos)
descuentos: 10% transferencia (no acumulable)`}
                </pre>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                <b>Tip:</b> mantené la redacción telegráfica (clave: valor). Si
                agregás texto libre, hacelo debajo de la clave correspondiente
                para que el parser lo asocie.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
