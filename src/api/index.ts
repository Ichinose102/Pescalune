const API_URL = '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorMessage = `Erreur serveur (${res.status})`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Si ce n'est pas du JSON, on peut essayer de lire le texte
      try {
        const text = await res.text();
        if (text && text.length < 100) errorMessage = text;
      } catch (e2) {
        // Ignorer
      }
    }
    throw new Error(errorMessage);
  }
  return res;
};

export const fetchPrestations = () => fetch(`${API_URL}/prestations`).then(handleResponse).then(res => res.json());
export const fetchClients = () => fetch(`${API_URL}/clients`).then(handleResponse).then(res => res.json());
export const fetchAdditions = () => fetch(`${API_URL}/additions`).then(handleResponse).then(res => res.json());
export const fetchAdditionItems = (id: number) => fetch(`${API_URL}/additions/${id}/items`).then(handleResponse).then(res => res.json());

export const createAddition = (addition: any) => fetch(`${API_URL}/additions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(addition)
}).then(handleResponse).then(res => res.json());

export const deleteAddition = (id: number) => fetch(`${API_URL}/additions/${id}`, {
  method: 'DELETE'
}).then(handleResponse);

export const createClient = (client: any) => fetch(`${API_URL}/clients`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(client)
}).then(handleResponse).then(res => res.json());

export const updateClient = (id: number, client: any) => fetch(`${API_URL}/clients/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(client)
}).then(handleResponse);

export const deleteClient = (id: number) => fetch(`${API_URL}/clients/${id}`, {
  method: 'DELETE'
}).then(handleResponse);

export const createPrestation = (prestation: any) => fetch(`${API_URL}/prestations`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prestation)
}).then(handleResponse).then(res => res.json());

export const updatePrestation = (id: number, prestation: any) => fetch(`${API_URL}/prestations/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prestation)
}).then(handleResponse);

export const deletePrestation = (id: number) => fetch(`${API_URL}/prestations/${id}`, {
  method: 'DELETE'
}).then(handleResponse);

export const deleteCategory = (category: string) => fetch(`${API_URL}/prestations/category/${encodeURIComponent(category.trim())}`, {
  method: 'DELETE'
}).then(handleResponse).then(res => res.json());




