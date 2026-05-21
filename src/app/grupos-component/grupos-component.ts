import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { GruposStoreService } from '../services/grupos-store.service';
import { UserService } from '../services/user-service';

interface Participante {
  id: number;
  nombre: string;
  uid: string | null;
}

interface NuevoGrupo {
  nombre: string;
  moneda: string;
  participantes: Participante[];
}

const MONEDAS = [
  { codigo: 'EUR', simbolo: '€',   nombre: 'Euro' },
  { codigo: 'USD', simbolo: '$',   nombre: 'Dólar estadounidense' },
  { codigo: 'GBP', simbolo: '£',   nombre: 'Libra esterlina' },
  { codigo: 'JPY', simbolo: '¥',   nombre: 'Yen japonés' },
  { codigo: 'CHF', simbolo: 'CHF', nombre: 'Franco suizo' },
  { codigo: 'CAD', simbolo: '$',   nombre: 'Dólar canadiense' },
  { codigo: 'AUD', simbolo: '$',   nombre: 'Dólar australiano' },
];

@Component({
  selector: 'app-grupos-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos-component.html',
  styleUrl: './grupos-component.css',
})
export class GruposComponent {
  private router      = inject(Router);
  private gruposStore = inject(GruposStoreService);
  private userService = inject(UserService);
  private auth        = inject(Auth);

  grupos  = this.gruposStore.grupos;
  monedas = MONEDAS;

  mostrarFormulario = signal(false);
  cargandoNombre    = signal(false);

  nuevoGrupo = signal<NuevoGrupo>({
    nombre: '',
    moneda: 'EUR',
    participantes: [{ id: Date.now(), nombre: '', uid: null }]
  });

  modalVisible          = signal(false);
  participanteAEliminar = signal<Participante | null>(null);

  async abrirFormulario() {
    this.mostrarFormulario.set(true);
    this.cargandoNombre.set(true);
    const nombreGuardado = await this.userService.getNombreGuardado();
    const uid = this.auth.currentUser?.uid ?? null;
    this.nuevoGrupo.set({
      nombre: '',
      moneda: 'EUR',
      participantes: [{ id: Date.now(), nombre: nombreGuardado, uid }]
    });
    this.cargandoNombre.set(false);
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.resetForm();
  }

  async crearGrupo() {
    const data = this.nuevoGrupo();
    if (!data.nombre.trim()) return;

    const yo = data.participantes[0];
    if (yo.nombre.trim()) {
      await this.userService.guardarNombre(yo.nombre.trim());
    }

    await this.gruposStore.crearGrupo({
      nombre: data.nombre,
      moneda: data.moneda,
      participantes: data.participantes.map(p => ({ nombre: p.nombre, uid: p.uid }))
    });

    this.cancelar();
  }

  eliminarGrupo(id: string) { this.gruposStore.eliminarGrupo(id); }
  abrirGrupo(id: string)    { this.router.navigate(['/grupos', id]); }

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
      participantes: [...g.participantes, { id: Date.now(), nombre: '', uid: null }]
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
      participantes: [{ id: Date.now(), nombre: '', uid: null }]
    });
  }
}