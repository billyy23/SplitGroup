import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { GruposStoreService, Participante } from '../services/grupos-store.service';
import { GrupoService } from '../services/grupo-service';
import { AnadirGastoComponent } from '../anadir-gasto-component/anadir-gasto-component';

type Pestana = 'gastos' | 'participantes' | 'saldos' | 'historial';

interface EntradaHistorial {
  id: number;
  tipo: 'gasto_añadido' | 'gasto_eliminado' | 'participante_añadido' | 'participante_eliminado' | 'saldo_saldado';
  descripcion: string;
  autor: string;
  fecha: Date;
}

@Component({
  selector: 'app-grupo-detalle-component',
  imports: [CommonModule, DatePipe, AnadirGastoComponent],
  templateUrl: './grupo-detalle-component.html',
  styleUrl: './grupo-detalle-component.css',
})
export class GrupoDetalleComponent {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private gruposStore  = inject(GruposStoreService);
  private firestore    = inject(Firestore);
  private grupoService = inject(GrupoService);
  private auth         = inject(Auth);

  readonly miUid = this.auth.currentUser?.uid ?? null;

  private readonly idFromRoute = this.route.snapshot.paramMap.get('id') ?? '';

  private readonly participantesSubcol = toSignal(
    this.idFromRoute
      ? (collectionData(
          collection(this.firestore, `grupos/${this.idFromRoute}/participantes`),
          { idField: 'id' }
        ) as Observable<Participante[]>)
      : of([] as Participante[]),
    { initialValue: [] as Participante[] }
  );

  private routeParamMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  grupoId       = computed(() => this.routeParamMap().get('id') ?? '');
  grupoActual   = computed(() => this.gruposStore.obtenerGrupoPorId(this.grupoId()));
  nombreGrupo   = computed(() => this.grupoActual()?.nombre ?? 'Grupo no encontrado');
  pestanaActiva = signal<Pestana>('gastos');

  participantes = computed(() => {
    const fromDoc = this.grupoActual()?.participantes ?? [];
    return fromDoc.length > 0 ? fromDoc : this.participantesSubcol();
  });

  gastos = computed(() => this.grupoActual()?.gastos ?? []);

  totalGastos = computed(() =>
    this.gastos().reduce((acc, g) => acc + g.importe, 0)
  );

  // ── Modal eliminar participante ──
  modalEliminarVisible  = signal(false);
  participanteAEliminar = signal<Participante | null>(null);

  mostrarFormGasto = signal(false);

  esYo(p: Participante): boolean {
    return !!p.uid && p.uid === this.miUid;
  }

  pedirConfirmacionEliminar(p: Participante) {
    this.participanteAEliminar.set(p);
    this.modalEliminarVisible.set(true);
  }

  async confirmarEliminar() {
    const p = this.participanteAEliminar();
    if (!p) return;
    await this.grupoService.eliminarParticipante(this.grupoId(), p.id);
    this.cerrarModal();
  }

  cerrarModal() {
    this.modalEliminarVisible.set(false);
    this.participanteAEliminar.set(null);
  }

  // ── Historial (mock) ──
  historial = signal<EntradaHistorial[]>([
    { id: 1, tipo: 'participante_añadido', descripcion: 'Ana García añadida al grupo',             autor: 'Carlos López', fecha: new Date('2026-04-28T10:00:00') },
    { id: 2, tipo: 'gasto_añadido',        descripcion: 'Gasto "Supermercado" de 45.60€ añadido',  autor: 'Ana García',   fecha: new Date('2026-04-29T12:30:00') },
    { id: 3, tipo: 'gasto_eliminado',      descripcion: 'Gasto "Taxi" eliminado',                   autor: 'Ana García',   fecha: new Date('2026-04-30T09:15:00') },
    { id: 4, tipo: 'saldo_saldado',        descripcion: 'Carlos López saldó 20€ con Ana García',    autor: 'Carlos López', fecha: new Date('2026-05-01T18:00:00') },
  ]);

  iconoHistorial(tipo: string): string {
    const m: Record<string, string> = {
      gasto_añadido: '+', gasto_eliminado: '−',
      participante_añadido: '👤', participante_eliminado: '👤', saldo_saldado: '✓',
    };
    return m[tipo] ?? '·';
  }

  colorHistorial(tipo: string): string {
    const m: Record<string, string> = {
      gasto_añadido: 'historial-verde', gasto_eliminado: 'historial-rojo',
      participante_añadido: 'historial-azul', participante_eliminado: 'historial-rojo',
      saldo_saldado: 'historial-verde',
    };
    return m[tipo] ?? '';
  }

  nombreParticipante(id: number): string {
    return this.participantes().find(p => p.id === id)?.nombre ?? '—';
  }

  cambiarPestana(p: Pestana) { this.pestanaActiva.set(p); }
  volver() { this.router.navigate(['/grupos']); }
}