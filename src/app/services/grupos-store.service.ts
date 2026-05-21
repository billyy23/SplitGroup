import { DestroyRef, EnvironmentInjector, inject, Injectable, runInInjectionContext, signal } from '@angular/core';
import { GrupoService } from './grupo-service';
import { catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  id: string;      
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
  private grupoService = inject(GrupoService);
  private readonly injector = inject(EnvironmentInjector);
  private readonly gruposState = signal<Grupo[]>([]);
  readonly grupos = this.gruposState.asReadonly();
  private destroyRef = inject(DestroyRef);

  constructor() {
    runInInjectionContext(this.injector, () => {
      this.grupoService.getGrupos().pipe(
        catchError(err => {
          console.error('[GruposStore] Error:', err);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(grupos => {
        this.gruposState.set(grupos);
        console.log('[GruposStore] grupos:', grupos.length);
      });
    });
  }


  async crearGrupo(input: NuevoGrupoInput): Promise<void> {
    if (!input.nombre.trim()) return;
    await this.grupoService.crearGrupo(
      input.nombre,
      input.moneda,
      input.participantes
    );
    // No hace falta actualizar el signal manualmente,
    // el observable de Firestore lo actualiza solo
  }

  async eliminarGrupo(id: string): Promise<void> {
    await this.grupoService.eliminarGrupo(id);
  }

  obtenerGrupoPorId(id: string): Grupo | undefined {
    return this.gruposState().find(g => g.id === id);
  }
}
