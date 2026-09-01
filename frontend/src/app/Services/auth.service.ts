import {  inject, Injectable, InputSignal, signal } from '@angular/core';

export interface CitizenSession{
    nom:string;
    email:string;
}
@Injectable({providedIn:'root'})
export class CitizenAuthService{
    //  TODO : a remplacer par le vrai flux (token + appel /api/auth/citizen/me)
    private readonly _currentCitizen = signal<CitizenSession | null>(null);

    readonly currentCitizen = this._currentCitizen.asReadonly();
    readonly isLoggedIn = signal(false);

    
    login(session:CitizenSession) : void{
        this._currentCitizen.set(session);
        this.isLoggedIn.set(true);
    }
    logout():void{
        this._currentCitizen.set(null);
        this.isLoggedIn.set(false);
    }
}