import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GruposStoreService } from '../services/grupos-store.service';

interface Participante {
  id: number;
  nombre: string;
}

interface NuevoGrupo {
  nombre: string;
  moneda: string;
  participantes: Participante[];
}

const MONEDAS = [
  { codigo: 'EUR', simbolo: '€', nombre: 'Euro' },
  { codigo: 'USD', simbolo: '$', nombre: 'Dólar estadounidense' },
  { codigo: 'GBP', simbolo: '£', nombre: 'Libra esterlina' },
  { codigo: 'JPY', simbolo: '¥', nombre: 'Yen japonés' },
  { codigo: 'CHF', simbolo: 'CHF', nombre: 'Franco suizo' },
  { codigo: 'CAD', simbolo: '$', nombre: 'Dólar canadiense' },
  { codigo: 'AUD', simbolo: '$', nombre: 'Dólar australiano' },
];

@Component({
  selector: 'app-grupos-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos-component.html',
  styleUrl: './grupos-component.css',
})
export class GruposComponent {

  private router = inject(Router);
  private gruposStore = inject(GruposStoreService);
  grupos = this.gruposStore.grupos;

  monedas = MONEDAS;
  mostrarFormulario = signal(false);

  nuevoGrupo = signal<NuevoGrupo>({
    nombre: '',
    moneda: 'EUR',
    participantes: [{ id: Date.now(), nombre: '' }]
  });

  // Modal confirmar eliminación
  modalVisible = signal(false);
  participanteAEliminar = signal<Participante | null>(null);

  abrirFormulario() {
    this.mostrarFormulario.set(true);
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.resetForm();
  }

  crearGrupo() {
    const data = this.nuevoGrupo();
    if (!data.nombre.trim()) return;

    this.gruposStore.crearGrupo({
      nombre: data.nombre,
      moneda: data.moneda,
      participantes: data.participantes.map((p) => p.nombre)
    });

    this.cancelar();
  }

  eliminarGrupo(id: string) {
    this.gruposStore.eliminarGrupo(id);
  }

  abrirGrupo(id: string) {
    this.router.navigate(['/grupos', id]);
  }

  // ── Participantes ──

  actualizarNombre(valor: string) {
    this.nuevoGrupo.update(g => ({ ...g, nombre: valor }));
  }

  actualizarMoneda(valor: string) {
    this.nuevoGrupo.update(g => ({ ...g, moneda: valor }));
  }

  actualizarParticipante(id: number, nombre: string) {
    this.nuevoGrupo.update(g => ({
      ...g,
      participantes: g.participantes.map(p => p.id === id ? { ...p, nombre } : p)
    }));
  }

  anadirParticipante() {
    this.nuevoGrupo.update(g => ({
      ...g,
      participantes: [...g.participantes, { id: Date.now(), nombre: '' }]
    }));
  }

  pedirConfirmacionEliminar(participante: Participante) {
    this.participanteAEliminar.set(participante);
    this.modalVisible.set(true);
  }

  confirmarEliminar() {
    const p = this.participanteAEliminar();
    if (!p) return;
    this.nuevoGrupo.update(g => ({
      ...g,
      participantes: g.participantes.filter(x => x.id !== p.id)
    }));
    this.cerrarModal();
  }

  cerrarModal() {
    this.modalVisible.set(false);
    this.participanteAEliminar.set(null);
  }

  private resetForm() {
    this.nuevoGrupo.set({
      nombre: '',
      moneda: 'EUR',
      participantes: [{ id: Date.now(), nombre: '' }]
    });
  }



}