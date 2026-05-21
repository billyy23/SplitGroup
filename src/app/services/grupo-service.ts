import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  collectionData,
  addDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
// ↓ SDK directo para operaciones one-shot: sin interceptación de AngularFire RC
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { Grupo } from './grupos-store.service';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  firestore: Firestore = inject(Firestore);
  auth: Auth           = inject(Auth);

  getGrupos(): Observable<Grupo[]> {
    const user = this.auth.currentUser;
    if (!user) return of([]);

    const q = query(
      collection(this.firestore, 'grupos'),
      where('miembros', 'array-contains', user.uid)
    );

    return collectionData(q, { idField: 'id' }) as Observable<Grupo[]>;
  }

  async crearGrupo(
    nombre: string,
    moneda: string,
    participantes: { nombre: string; uid: string | null }[]
  ): Promise<string> {
    const uid = this.auth.currentUser?.uid;
    const grupoRef = await addDoc(collection(this.firestore, 'grupos'), {
      nombre,
      moneda,
      creadoPor:     uid,
      creadoEn:      serverTimestamp(),
      miembros:      [uid],
      gastos:        [],
      participantes: participantes
        .filter(p => p.nombre.trim())
        .map((p, i) => ({ id: i + 1, nombre: p.nombre.trim(), uid: p.uid })),
    });
    return grupoRef.id;
  }

  eliminarGrupo(grupoId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, 'grupos', grupoId));
  }

  async eliminarParticipante(grupoId: string, participanteId: number | string): Promise<void> {
    const grupoRef = doc(this.firestore, 'grupos', grupoId);
    const snap     = await getDoc(grupoRef);

    if (!snap.exists()) return;

    const array = snap.data()?.['participantes'] as any[] | undefined;

    if (array && array.length > 0) {
      await updateDoc(grupoRef, {
        participantes: array.filter(p => String(p.id) !== String(participanteId)),
      });
    } else {
      await deleteDoc(
        doc(this.firestore, `grupos/${grupoId}/participantes/${String(participanteId)}`)
      );
    }
  }
} 