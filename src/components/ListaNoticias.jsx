import { useEffect, useState } from "react";

const URL_ARTICULOS = "https://api.spaceflightnewsapi.net/v4/articles/?limit=6";

function ListaNoticias({ seleccionado, onSeleccionar }) {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarArticulos() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(URL_ARTICULOS, {
          signal: controlador.signal,
          headers: { Accept: "application/json" },
        });

        if (!respuesta.ok) {
          throw new Error(`El API respondió con estado ${respuesta.status}.`);
        }

        const datos = await respuesta.json();
        if (!Array.isArray(datos.results)) {
          throw new Error("El API devolvió un formato inesperado.");
        }

        setArticulos(datos.results);
        if (datos.results.length > 0) {
          onSeleccionar(datos.results[0]);
        } else {
          onSeleccionar(null);
          setError("El API no devolvió artículos en este momento.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            `No hubo conexión con el API de noticias: ${err.message || "revisa tu internet"}.`,
          );
          console.error("Error cargando artículos:", err);
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }

    cargarArticulos();
    return () => controlador.abort();
  }, [onSeleccionar]);

  return (
    <section>
      <h2>Artículos</h2>

      {error && <p className="aviso">{error}</p>}
      {cargando && <p>Cargando noticias...</p>}

      <ul className="lista">
        {articulos.map((articulo) => (
          <li key={articulo.id}>
            <button
              type="button"
              className={
                seleccionado?.id === articulo.id ? "tarjeta activa" : "tarjeta"
              }
              onClick={() => onSeleccionar(articulo)}
            >
              {articulo.image_url && (
                <img
                  src={articulo.image_url}
                  alt=""
                  onError={(evento) => {
                    evento.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span className="medio">{articulo.news_site}</span>
              <strong>{articulo.title}</strong>
              <span className="fecha">
                {formatearFecha(articulo.published_at)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatearFecha(fecha) {
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) return "Fecha no disponible";

  return fechaValida.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default ListaNoticias;
