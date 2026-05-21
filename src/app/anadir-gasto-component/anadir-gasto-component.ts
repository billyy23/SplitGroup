import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Participante } from '../services/grupos-store.service';

export type ModoDivision = 'igual' | 'fracciones' | 'manual';

interface ParticipanteUI {
  id: number | string;
  nombre: string;
  uid: string | null;
  esYo: boolean;
  seleccionado: boolean;
  fraccion: number;
  importeManual: string;
  importeManualEditado: boolean;
}

const MONEDAS = [
  { codigo: 'EUR', simbolo: '€' },
  { codigo: 'USD', simbolo: '$' },
  { codigo: 'GBP', simbolo: '£' },
  { codigo: 'JPY', simbolo: '¥' },
  { codigo: 'CHF', simbolo: 'CHF' },
  { codigo: 'CAD', simbolo: 'CA$' },
  { codigo: 'AUD', simbolo: 'A$' },
];

@Component({
  selector: 'app-anadir-gasto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anadir-gasto-component.html',
  styleUrl: './anadir-gasto-component.css',
})
export class AnadirGastoComponent implements OnInit {
  participantes = input.required<Participante[]>();
  monedaGrupo   = input<string>('EUR');
  miUid         = input<string | null>(null);

  cerrar = output<void>();

  readonly monedas = MONEDAS;

  titulo             = signal('');
  importe            = signal('');
  monedaSeleccionada = signal('EUR');
  pagadoPorId        = signal<number | string | null>(null);
  fechaStr           = signal('');
  modoDivision       = signal<ModoDivision>('igual');
  participantesUI    = signal<ParticipanteUI[]>([]);

  todosSeleccionados = computed(() =>
    this.participantesUI().length > 0 &&
    this.participantesUI().every(p => p.seleccionado)
  );

  algunoSeleccionado = computed(() =>
    this.participantesUI().some(p => p.seleccionado)
  );

  simboloMoneda = computed(
    () => this.monedas.find(m => m.codigo === this.monedaSeleccionada())?.simbolo ?? '€'
  );

  ngOnInit(): void {
    this.monedaSeleccionada.set(this.monedaGrupo());

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.fechaStr.set(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
      `T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );

    const ps: ParticipanteUI[] = this.participantes().map(p => ({
      id:                   p.id as number | string,
      nombre:               p.nombre,
      uid:                  p.uid ?? null,
      esYo:                 !!p.uid && p.uid === this.miUid(),
      seleccionado:         true,
      fraccion:             1,
      importeManual:        '',
      importeManualEditado: false,
    }));
    ps.sort((a, b) => (a.esYo ? -1 : b.esYo ? 1 : 0));
    this.participantesUI.set(ps);

    const yo = ps.find(p => p.esYo);
    this.pagadoPorId.set(yo?.id ?? ps[0]?.id ?? null);
  }

  displayNombre(p: ParticipanteUI): string { return p.esYo ? 'Yo' : p.nombre; }

  onToggleTodos(ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.participantesUI.update(ps =>
      ps.map(p => ({ ...p, seleccionado: checked, fraccion: checked ? 1 : 0, importeManualEditado: false }))
    );
  }

  onToggleParticipante(id: number | string, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.participantesUI.update(ps =>
      ps.map(p => p.id !== id ? p : { ...p, seleccionado: checked, fraccion: checked ? 1 : 0, importeManualEditado: false })
    );
  }

  cambiarFraccion(id: number | string, delta: number): void {
    this.participantesUI.update(ps =>
      ps.map(p => {
        if (p.id !== id) return p;
        const f = Math.max(0, p.fraccion + delta);
        return { ...p, fraccion: f, seleccionado: f > 0 };
      })
    );
  }

  onImporteManual(id: number | string, ev: Event): void {
    const val = (ev.target as HTMLInputElement).value;
    this.participantesUI.update(ps =>
      ps.map(p => p.id !== id ? p : { ...p, importeManual: val, importeManualEditado: true })
    );
  }

  onModoChange(modo: ModoDivision): void {
    this.modoDivision.set(modo);
    this.participantesUI.update(ps =>
      ps.map(p => ({ ...p, seleccionado: true, fraccion: 1, importeManual: '', importeManualEditado: false }))
    );
  }

  onCerrar(): void { this.cerrar.emit(); }
}