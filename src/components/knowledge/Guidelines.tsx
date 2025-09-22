export default function Guidelines() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <h2 className="font-medium text-gray-900 mb-2">
        Cómo escribir las reglas del documento
      </h2>

      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        <li>
          <b>Una regla por línea</b>. Usá la flecha <code>=&gt;</code>. Las
          líneas que no coinciden con un formato válido se ignoran.
        </li>
        <li>
          <b>Sinónimos simples:</b>{" "}
          <code>{"<alias1>, <alias2> o <alias3> => <canónico>"}</code>
        </li>
        <li>
          <b>Sinónimos con “si te piden”:</b>{" "}
          <code>{"si te piden <texto> => <canónico>"}</code>
        </li>
        <li>
          <b>Fallback de medida:</b>{" "}
          <code>
            {"si te piden de <N> y tenes/tenés de <M> ofrece/ofrecé ese>"}
          </code>{" "}
          (N y M aceptan coma o punto).
        </li>
        <li>
          El sistema no distingue mayúsculas/minúsculas; la{" "}
          <b>última regla prevalece</b> en caso de duplicado.
        </li>
        <li>
          Preferí alias en <b>singular</b> y evitá palabras muy cortas para no
          reemplazar dentro de otras.
        </li>
      </ol>

      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-1">Ejemplos:</p>
        <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3">
          {`clavo, clavito o puntilla => clavo
  si te piden barral para cortina => barral
  si te piden de 70 y tenes de 69 ofrece ese`}
        </pre>
      </div>
    </div>
  );
}
