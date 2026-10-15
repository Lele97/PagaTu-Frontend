/**
 * Classi CSS delle icone Font Awesome.
 * Accetta sia "fa-icona" sia "icona" e restituisce sempre la classe completa.
 */

export const fa = (name) => {
    const icon = name?.startsWith('fa-') ? name.slice(3) : name;
    return `fa-solid fa-${icon}`;
};