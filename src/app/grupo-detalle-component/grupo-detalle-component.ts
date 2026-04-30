import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { GruposStoreService } from '../services/grupos-store.service';

type Pestana = 'gastos' | 'participantes' | 'saldos';

@Component({
  selector: 'app-grupo-detalle-component',
  imports: [CommonModule],
  templateUrl: './grupo-detalle-component.html',
  styleUrl: './grupo-detalle-component.css',
})
export class GrupoDetalleComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gruposStore = inject(GruposStoreService);
  private routeParamMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  grupoId = computed(() => Number(this.routeParamMap().get('id')));
  grupoActual = computed(() => this.gruposStore.obtenerGrupoPorId(this.grupoId()));
  nombreGrupo = computed(() => this.grupoActual()?.nombre ?? 'Grupo no encontrado');
  pestanaActiva = signal<Pestana>('gastos');

  participantes = computed(() => this.grupoActual()?.participantes ?? []);
  gastos = computed(() => this.grupoActual()?.gastos ?? []);

  totalGastos = computed(() =>
    this.gastos().reduce((acc, g) => acc + g.importe, 0)
  );

  nombreParticipante(id: number): string {
    return this.participantes().find(p => p.id === id)?.nombre ?? '—';
  }

  cambiarPestana(p: Pestana) {
    this.pestanaActiva.set(p);
  }

  volver() {
    this.router.navigate(['/grupos']);
  }

}
