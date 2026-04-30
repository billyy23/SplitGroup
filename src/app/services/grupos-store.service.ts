import { Injectable, signal } from '@angular/core';

export interface Participante {
  id: number;
  nombre: string;
}

export interface Gasto {
  id: number;
  concepto: string;
  importe: number;
  pagadoPor: number;
}

export interface Grupo {
  id: number;
  nombre: string;
  moneda: string;
  participantes: Participante[];
  gastos: Gasto[];
}

interface NuevoGrupoInput {
  nombre: string;
  moneda: string;
  participantes: string[];
}

@Injectable({ providedIn: 'root' })
export class GruposStoreService {
  private readonly gruposState = signal<Grupo[]>([
    { id: 1, nombre: 'Piso compartido', moneda: 'EUR', participantes: [], gastos: [] },
    { id: 2, nombre: 'Viaje a Roma', moneda: 'EUR', participantes: [], gastos: [] }
  ]);

  readonly grupos = this.gruposState.asReadonly();

  crearGrupo(input: NuevoGrupoInput): void {
    const nombre = input.nombre.trim();
    if (!nombre) return;

    const idBase = Date.now();
    const participantes = input.participantes
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((nombreParticipante, index) => ({
        id: idBase + index + 1,
        nombre: nombreParticipante
      }));

    const nuevoGrupo: Grupo = {
      id: idBase,
      nombre,
      moneda: input.moneda,
      participantes,
      gastos: []
    };

    this.gruposState.update((actual) => [...actual, nuevoGrupo]);
  }

  eliminarGrupo(id: number): void {
    this.gruposState.update((actual) => actual.filter((g) => g.id !== id));
  }

  obtenerGrupoPorId(id: number): Grupo | undefined {
    return this.gruposState().find((g) => g.id === id);
  }
}
