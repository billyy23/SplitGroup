import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  Firestore, collection, addDoc, doc,
  deleteDoc, query, where, collectionData, serverTimestamp
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Grupo } from './grupos-store.service';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private injector = inject(EnvironmentInjector); // ← añadir esto

  getGrupos(): Observable<Grupo[]> {
    return authState(this.auth).pipe(
      tap(user => console.log('[GrupoService] authState:', user?.uid ?? 'null')),
      switchMap(user => {
        if (!user) return of([]);

        // ↓ envolver aquí, donde se llama a collectionData
        return runInInjectionContext(this.injector, () => {
          const ref = collection(this.firestore, 'grupos');
          const q = query(ref, where('miembros', 'array-contains', user.uid));
          return collectionData(q, { idField: 'id' }) as Observable<Grupo[]>;
        });
      })
    );
  }

  async crearGrupo(nombre: string, moneda: string, participantes: string[]): Promise<string> {
    const uid = this.auth.currentUser?.uid;
    const ref = collection(this.firestore, 'grupos');

    const grupoRef = await addDoc(ref, {
      nombre,
      moneda,
      creadoPor: uid,
      creadoEn: serverTimestamp(),
      miembros: [uid],
      gastos: [],
      participantes: participantes
        .filter(n => n.trim())
        .map((nombre, i) => ({ id: i + 1, nombre: nombre.trim() }))
    });

    return grupoRef.id;
  }

  eliminarGrupo(grupoId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, 'grupos', grupoId));
  }
}