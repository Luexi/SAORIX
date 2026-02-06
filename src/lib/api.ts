const API_PORT = 3001

function getApiHost() {
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        return '127.0.0.1'
    }
    return 'localhost'
}

export const API_URL = `http://${getApiHost()}:${API_PORT}/api`

export function apiPath(path: string) {
    if (!path.startsWith('/')) {
        return `${API_URL}/${path}`
    }
    return `${API_URL}${path}`
}
