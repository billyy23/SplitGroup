import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class UserService {
  private auth      = inject(Auth);
  private firestore = inject(Firestore);
  private injector  = inject(Injector);   // ← guardamos el injector

  async getNombreGuardado(): Promise<string> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return '';
    try {
      const snap = await runInInjectionContext(this.injector, () =>
        getDoc(doc(this.firestore, 'usuarios', uid))
      );
      return snap.exists() ? (snap.data()?.['nombre'] ?? '') : '';
    } catch {
      return '';
    }
  }

  async guardarNombre(nombre: string): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid || !nombre.trim()) return;
    await runInInjectionContext(this.injector, () =>
      setDoc(
        doc(this.firestore, 'usuarios', uid),
        { nombre: nombre.trim() },
        { merge: true }
      )
    );
  }
}