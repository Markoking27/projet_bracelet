import { Injectable } from '@angular/core';

export interface Malaise {
  date: string;
  type: string;
  age: string;
  sexe: string;
  zone: string;
  densite: string;
  event: string;
  gravite: string;
  intervention: string;
  heure: string;
}

@Injectable({
  providedIn: 'root'
})
export class MalaiseService {

 malaises: Malaise[] = [

      // ===== 2023 =====
    {date: '2023-01-12', type: 'vagal', age: '18-25', sexe: 'homme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '21:15'},
    {date: '2023-02-05', type: 'hypoglycémie', age: '26-40', sexe: 'femme', zone: 'avant', densite: 'moyenne', event: 'sport', gravite: 'modérée', intervention: 'ambulance', heure: '18:40'},
    {date: '2023-03-18', type: 'chute', age: '+60', sexe: 'homme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '14:10'},
    {date: '2023-04-22', type: 'alcool', age: '18-25', sexe: 'homme', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '23:05'},
    {date: '2023-05-10', type: 'déshydratation', age: '26-40', sexe: 'femme', zone: 'milieu', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '16:20'},
    {date: '2023-06-15', type: 'chaleur', age: '41-60', sexe: 'homme', zone: 'avant', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '15:30'},
    {date: '2023-07-01', type: 'vagal', age: '-18', sexe: 'femme', zone: 'arriere', densite: 'faible', event: 'sport', gravite: 'faible', intervention: 'place', heure: '12:10'},
    {date: '2023-08-09', type: 'chute', age: '26-40', sexe: 'np', zone: 'annexe', densite: 'moyenne', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '10:50'},
    {date: '2023-09-14', type: 'alcool', age: '18-25', sexe: 'femme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '22:45'},
    {date: '2023-10-03', type: 'hypoglycémie', age: '+60', sexe: 'homme', zone: 'avant', densite: 'moyenne', event: 'sport', gravite: 'élevée', intervention: 'ambulance', heure: '11:25'},
    {date: '2023-11-20', type: 'déshydratation', age: '41-60', sexe: 'femme', zone: 'arriere', densite: 'faible', event: 'politique', gravite: 'modérée', intervention: 'place', heure: '09:40'},
    {date: '2023-12-05', type: 'vagal', age: '18-25', sexe: 'np', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '20:30'},
    {date: '2023-12-18', type: 'chaleur', age: '26-40', sexe: 'homme', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '17:10'},
    {date: '2023-12-22', type: 'chute', age: '+60', sexe: 'femme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '13:00'},
    {date: '2023-12-30', type: 'alcool', age: '18-25', sexe: 'homme', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '00:15'},

    // ===== 2024 =====
    {date: '2024-01-10', type: 'vagal', age: '18-25', sexe: 'femme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '21:00'},
    {date: '2024-02-14', type: 'chaleur', age: '26-40', sexe: 'homme', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '16:45'},
    {date: '2024-03-01', type: 'alcool', age: '18-25', sexe: 'homme', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '23:30'},
    {date: '2024-04-18', type: 'chute', age: '+60', sexe: 'femme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '11:10'},
    {date: '2024-05-22', type: 'hypoglycémie', age: '41-60', sexe: 'np', zone: 'milieu', densite: 'moyenne', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '14:20'},
    {date: '2024-06-09', type: 'déshydratation', age: '26-40', sexe: 'femme', zone: 'avant', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '15:50'},
    {date: '2024-07-12', type: 'vagal', age: '-18', sexe: 'homme', zone: 'arriere', densite: 'faible', event: 'sport', gravite: 'faible', intervention: 'place', heure: '10:30'},
    {date: '2024-08-03', type: 'chute', age: '41-60', sexe: 'homme', zone: 'annexe', densite: 'moyenne', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '09:20'},
    {date: '2024-09-17', type: 'alcool', age: '18-25', sexe: 'femme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '22:10'},
    {date: '2024-10-08', type: 'chaleur', age: '26-40', sexe: 'np', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '17:00'},
    {date: '2024-11-21', type: 'vagal', age: '+60', sexe: 'femme', zone: 'arriere', densite: 'faible', event: 'politique', gravite: 'faible', intervention: 'place', heure: '08:45'},
    {date: '2024-12-02', type: 'hypoglycémie', age: '18-25', sexe: 'homme', zone: 'milieu', densite: 'moyenne', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '19:30'},
    {date: '2024-12-10', type: 'déshydratation', age: '41-60', sexe: 'femme', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '16:10'},
    {date: '2024-12-20', type: 'chute', age: '+60', sexe: 'homme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '12:40'},
    {date: '2024-12-28', type: 'alcool', age: '18-25', sexe: 'np', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '01:20'},

    // ===== 2026  =====
    {date: '2026-01-05', type: 'vagal', age: '18-25', sexe: 'homme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '21:10'},
    {date: '2026-01-20', type: 'chaleur', age: '26-40', sexe: 'femme', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '16:30'},
    {date: '2026-02-02', type: 'alcool', age: '18-25', sexe: 'homme', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '23:50'},
    {date: '2026-02-14', type: 'chute', age: '+60', sexe: 'femme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '11:00'},
    {date: '2026-02-28', type: 'hypoglycémie', age: '41-60', sexe: 'np', zone: 'milieu', densite: 'moyenne', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '14:10'},
    {date: '2026-03-05', type: 'déshydratation', age: '26-40', sexe: 'femme', zone: 'avant', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '15:20'},
    {date: '2026-03-12', type: 'vagal', age: '-18', sexe: 'homme', zone: 'arriere', densite: 'faible', event: 'sport', gravite: 'faible', intervention: 'place', heure: '10:10'},
    {date: '2026-03-18', type: 'chute', age: '41-60', sexe: 'homme', zone: 'annexe', densite: 'moyenne', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '09:00'},
    {date: '2026-03-22', type: 'alcool', age: '18-25', sexe: 'femme', zone: 'milieu', densite: 'forte', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '22:20'},
    {date: '2026-03-28', type: 'chaleur', age: '26-40', sexe: 'np', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '17:40'},
    {date: '2026-04-01', type: 'vagal', age: '+60', sexe: 'femme', zone: 'arriere', densite: 'faible', event: 'politique', gravite: 'faible', intervention: 'place', heure: '08:30'},
    {date: '2026-04-03', type: 'hypoglycémie', age: '18-25', sexe: 'homme', zone: 'milieu', densite: 'moyenne', event: 'musique', gravite: 'modérée', intervention: 'place', heure: '19:10'},
    {date: '2026-04-05', type: 'déshydratation', age: '41-60', sexe: 'femme', zone: 'avant', densite: 'forte', event: 'sport', gravite: 'modérée', intervention: 'place', heure: '16:00'},
    {date: '2026-04-07', type: 'chute', age: '+60', sexe: 'homme', zone: 'annexe', densite: 'faible', event: 'politique', gravite: 'élevée', intervention: 'ambulance', heure: '12:20'},
    {date: '2026-04-08', type: 'alcool', age: '18-25', sexe: 'np', zone: 'arriere', densite: 'forte', event: 'musique', gravite: 'faible', intervention: 'place', heure: '01:10'},


 ];

  addMalaise(m: Malaise) {
    this.malaises.unshift(m);
  }

  getMalaises(): Malaise[] {
    return this.malaises;
  }
}