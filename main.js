const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const form = document.querySelector("#solicitud form");
const requestType = form.elements.namedItem("tipo");
const material = form.elements.namedItem("material");
const status = form.querySelector(".status");
const statusText = status.querySelector("span");
const manualCopy = form.querySelector(".manual-copy");
const manualText = manualCopy.querySelector("textarea");
const quoteEmail = "comercial.jp.spa@outlook.com";

status.prepend(document.querySelector("#status-icon").content.cloneNode(true));

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  navigation.classList.toggle("open", open);
}

function showStatus(message) {
  statusText.textContent = message;
  status.hidden = !message;
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") === "false");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.querySelectorAll("[data-request]").forEach((button) => {
  button.addEventListener("click", () => {
    requestType.value = button.dataset.request;
    material.value = button.dataset.material;
    showStatus("");
    setMenu(false);
    window.location.hash = "solicitud";
    requestAnimationFrame(() => requestType.focus({ preventScroll: true }));
  });
});

function draftQuote() {
  if (!form.reportValidity()) return null;

  const fields = Object.fromEntries(new FormData(form));
  const type = fields.tipo === "retiro" ? "Retiro" : "Compra";
  const subject = `Solicitud de cotización — ${type} — ${fields.empresa}`;
  const body = [
    "Hola, equipo de Comercializadora y Transportes JP:",
    "",
    "Quisiera solicitar una cotización.",
    "",
    `Nombre: ${fields.nombre}`,
    `Empresa: ${fields.empresa}`,
    `Correo de contacto: ${fields.correo}`,
    `Teléfono: ${fields.telefono || "No informado"}`,
    `Tipo de solicitud: ${type}`,
    `Producto o material: ${fields.material}`,
    `Cantidad o volumen estimado: ${fields.cantidad}`,
    `Comuna: ${fields.comuna}`,
    "",
    "Mensaje:",
    fields.mensaje,
    "",
    "Quedo atento/a a la confirmación de disponibilidad, aceptación del material, cobertura y condiciones.",
    "Muchas gracias.",
  ].join("\n");

  return { subject, body };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const draft = draftQuote();
  if (!draft) return;

  const { subject, body } = draft;
  window.location.href = `mailto:${quoteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  showStatus(
    "Borrador preparado. Debes enviarlo desde tu aplicación de correo.",
  );
});

document.querySelector("#copy-request").addEventListener("click", async () => {
  const draft = draftQuote();
  if (!draft) return;

  const request = `Para: ${quoteEmail}\nAsunto: ${draft.subject}\n\n${draft.body}`;
  try {
    await navigator.clipboard.writeText(request);
    showStatus(
      `Solicitud copiada. Pégala en tu correo y envíala a ${quoteEmail}.`,
    );
    manualCopy.hidden = true;
    manualText.value = "";
  } catch {
    manualText.value = request;
    manualCopy.hidden = false;
    showStatus(
      "Tu navegador no permitió copiar automáticamente. Selecciona y copia el texto de abajo.",
    );
  }
});

manualText.addEventListener("focus", () => manualText.select());
