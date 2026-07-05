/**
 * Font Awesome — helper per classi icona unificate in tutta l'app.
 * @param {string} name — es. "mug-hot" oppure "fa-mug-hot"
 * @returns {string} es. "fa-solid fa-mug-hot"
 */
export const fa = (name) => {
    const icon = name?.startsWith('fa-') ? name.slice(3) : name;
    return `fa-solid fa-${icon}`;
};