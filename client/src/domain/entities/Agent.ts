/** Contrato de lectura del catálogo, independiente del origen de sus datos. */
export interface Agent {
  id: number;
  slug: string;
  name: string;
  desc: string;
  img: string;
  cat: string;
}
