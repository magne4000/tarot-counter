const CorresBoutsPoints: [number, number, number, number] = [56, 51, 41, 36];

export enum Contrat {
  Petite = 1,
  Garde = 2,
  GardeSans = 4,
  GardeContre = 6,
}

export enum Poignee {
  Simple = 20,
  Double = 30,
  Triple = 40,
}

export type Joueur = string;

export type Points = {
  appele: number,
  preneur: number,
  defense: number,
}

export type Partie = {
  quiapris: Joueur
  avecquelappele: Joueur
  quelcontrat: Contrat
  nombredeboutsfaits: 0 | 1 | 2 | 3
  pointscomptesattaque: number
  petitmeneauboutpar?: Joueur
  poignee1annonceepar: Joueur
  typedepoignee1: Poignee
  poignee2annonceepar: Joueur
  typedepoignee2: Poignee
  chelemannoncepar?: Joueur
  chelemrealisepar?: Joueur
}

export const get_score_joueur = (joueur: Joueur, preneur: Joueur, appele: Joueur, points: Points) => {
  if (joueur === preneur) return points.preneur;
  if (joueur === appele) return points.appele;
  return points.defense;
};

export const get_fait_de = (pointscomptesattaque: number, nombredeboutsfaits: number) =>
  pointscomptesattaque - CorresBoutsPoints[nombredeboutsfaits];

export const get_points_appel = (faitede: number, quelcontrat: Contrat) =>
  (faitede + (faitede >= 0 ? 25 : -25)) * quelcontrat

export const get_petit = (petitmeneauboutpar: Joueur | undefined, quiapris: Joueur, avecquelappele: Joueur, quelcontrat: Contrat) => {
  if (petitmeneauboutpar === quiapris || petitmeneauboutpar === avecquelappele) {
    return 10 * quelcontrat;
  } else if(petitmeneauboutpar) {
    return - 10 * quelcontrat;
  }
  return 0;
}

export const get_poignee = (poigneeannonceepar: Joueur, typedepoignee: Poignee, faitede: number) => {
  if (poigneeannonceepar) {
    const sign = faitede >= 0 ? 1 : -1;
    return sign * typedepoignee;
  }
  return 0;
}

export const get_chelem_calc = (annonceparattaque: boolean, annoncepardefense: boolean, realiseparattaque: boolean, realisepardefense: boolean) => {
  const sign = realiseparattaque || (annoncepardefense && !realisepardefense) ? 1 : -1;
  const realisemulti = (annonceparattaque && realiseparattaque) || (annoncepardefense && realisepardefense) ? 2 : 1;
  return 200 * realisemulti * sign;
}

export const get_chelem = (chelemannoncepar: Joueur | undefined, chelemrealisepar: Joueur | undefined, quiapris: Joueur, avecquelappele: Joueur) => {
  if (chelemannoncepar || chelemrealisepar) {
    const annonceparattaque = chelemannoncepar === quiapris || chelemannoncepar === avecquelappele;
    const annoncepardefense = !annonceparattaque && Boolean(chelemannoncepar);
    const realiseparattaque = chelemrealisepar === quiapris || chelemrealisepar === avecquelappele;
    const realisepardefense = !realiseparattaque && Boolean(chelemrealisepar);
    return main.get_chelem_calc(annonceparattaque, annoncepardefense, realiseparattaque, realisepardefense);
  }
  return 0;
}

export function calculer_points(nbJoueurs: number, partie: Partie): Points {
  let multi = nbJoueurs === 4 ? 3 : 2;
  const { avecquelappele, chelemannoncepar, chelemrealisepar, nombredeboutsfaits,
          petitmeneauboutpar, pointscomptesattaque, quelcontrat, quiapris,
          poignee1annonceepar, typedepoignee1, poignee2annonceepar, typedepoignee2 } = partie;

  const faitede = get_fait_de(pointscomptesattaque, nombredeboutsfaits);

  let nbPtsJoueurAppele = get_points_appel(faitede, quelcontrat)
    + get_petit(petitmeneauboutpar, quiapris, avecquelappele, quelcontrat)
    + get_poignee(poignee1annonceepar, typedepoignee1, faitede)
    + get_poignee(poignee2annonceepar, typedepoignee2, faitede)
    + get_chelem(chelemannoncepar, chelemrealisepar, quiapris, avecquelappele);
  let nbPtsJoueurPreneur = multi * nbPtsJoueurAppele;
  const nbPtsJoueurDefense = -nbPtsJoueurAppele;

  if (quiapris === avecquelappele){
    nbPtsJoueurPreneur += nbPtsJoueurPreneur;
    nbPtsJoueurAppele = 0;
  }

  return {
    appele: nbPtsJoueurAppele,
    defense: nbPtsJoueurDefense,
    preneur: nbPtsJoueurPreneur,
  };
}

const main = {
  get_chelem_calc,
  get_chelem,
};

export default  main;