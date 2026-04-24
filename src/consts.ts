export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;
export const API_V1: string = `${API_BASE_URL}/api/v1`;
export const PUSHER_APP_KEY: string = import.meta.env.VITE_PUSHER_APP_KEY || '';
export const PUSHER_APP_CLUSTER: string = import.meta.env.VITE_PUSHER_APP_CLUSTER || '';

export const defaultPaginate = {
  current_page: 1,
  first_page_url: null,
  from: 1,
  last_page: 1,
  last_page_url: null,
  next_page_url: null,
  path: null,
  per_page: 1,
  prev_page_url: null,
  to: 1,
}
