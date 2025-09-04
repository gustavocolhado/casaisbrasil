window.embedder = function(path, defaultValue = undefined) {
    return path.split('.').reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : undefined;
    }, window.BackendEmbeds) || defaultValue;
}

window.config = function(path, defaultValue = undefined) {
    return embedder(`config.${path}`, defaultValue);
}

window.base_url = function(path = '', defaultValue = undefined) {
    return embedder(`links.base_url`) + path;
}
