import type { ApiResponse } from "../types/artwork";

const BASE_URL = "https://api.artic.edu/api/v1/artworks";

export const fetchArtworks = async (
  page: number,
  limit: number
): Promise<ApiResponse> => {
  const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
  return response.json();
};