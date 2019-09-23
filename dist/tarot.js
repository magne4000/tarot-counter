var CorresBoutsPoints = [56, 51, 41, 36];
export var Contrat;
(function (Contrat) {
    Contrat[Contrat["Petite"] = 1] = "Petite";
    Contrat[Contrat["Garde"] = 2] = "Garde";
    Contrat[Contrat["GardeSans"] = 4] = "GardeSans";
    Contrat[Contrat["GardeContre"] = 6] = "GardeContre";
})(Contrat || (Contrat = {}));
export var Poignee;
(function (Poignee) {
    Poignee[Poignee["Simple"] = 20] = "Simple";
    Poignee[Poignee["Double"] = 30] = "Double";
    Poignee[Poignee["Triple"] = 40] = "Triple";
})(Poignee || (Poignee = {}));
export function check(nbJoueurs, params) {
    var avecquelappele = params.avecquelappele, nombredeboutsfaits = params.nombredeboutsfaits, pointscomptesattaque = params.pointscomptesattaque, quiapris = params.quiapris, poignee1annonceepar = params.poignee1annonceepar, typedepoignee1 = params.typedepoignee1, poignee2annonceepar = params.poignee2annonceepar, typedepoignee2 = params.typedepoignee2;
    //Vérifications
    if (!quiapris) {
        throw new Error("Le champ “Qui à pris ?” doit être renseigné.");
    }
    if (!nombredeboutsfaits) {
        throw new Error("Le champ “Nombre de bouts faits ?” doit être renseigné.");
    }
    if (!pointscomptesattaque) {
        throw new Error("Le champ “Points comptés preneur” doit être renseigné.");
    }
    if ((poignee1annonceepar && !typedepoignee1) || (!poignee1annonceepar && typedepoignee1)) {
        throw new Error("Poignée 1, informations incomplètes.");
    }
    if ((poignee2annonceepar && !typedepoignee2) || (!poignee2annonceepar && typedepoignee2)) {
        throw new Error("Poignée 2, informations incomplètes.");
    }
    if (nbJoueurs === 5 && !avecquelappele) {
        throw new Error("Le champ “Qui est appelé ?” doit être renseigné.");
    }
}
export var get_fait_de = function (pointscomptesattaque, nombredeboutsfaits) {
    return pointscomptesattaque - CorresBoutsPoints[nombredeboutsfaits];
};
export var get_points_appel = function (faitede, quelcontrat) {
    return (faitede + (faitede >= 0 ? 25 : -25)) * quelcontrat;
};
export var get_petit = function (petitmeneauboutpar, quiapris, avecquelappele, quelcontrat) {
    if (petitmeneauboutpar === quiapris || petitmeneauboutpar === avecquelappele) {
        return 10 * quelcontrat;
    }
    else if (petitmeneauboutpar) {
        return -10 * quelcontrat;
    }
    return 0;
};
export var get_poignee = function (poigneeannonceepar, typedepoignee, faitede) {
    if (poigneeannonceepar) {
        var sign = faitede >= 0 ? 1 : -1;
        return sign * typedepoignee;
    }
    return 0;
};
export var get_chelem_calc = function (annonceparattaque, annoncepardefense, realiseparattaque, realisepardefense) {
    var sign = realiseparattaque || (annoncepardefense && !realisepardefense) ? 1 : -1;
    var realisemulti = (annonceparattaque && realiseparattaque) || (annoncepardefense && realisepardefense) ? 2 : 1;
    return 200 * realisemulti * sign;
};
export var get_chelem = function (chelemannoncepar, chelemrealisepar, quiapris, avecquelappele) {
    if (chelemannoncepar || chelemrealisepar) {
        var annonceparattaque = chelemannoncepar === quiapris || chelemannoncepar === avecquelappele;
        var annoncepardefense = !annonceparattaque && Boolean(chelemannoncepar);
        var realiseparattaque = chelemrealisepar === quiapris || chelemrealisepar === avecquelappele;
        var realisepardefense = !realiseparattaque && Boolean(chelemrealisepar);
        return main.get_chelem_calc(annonceparattaque, annoncepardefense, realiseparattaque, realisepardefense);
    }
    return 0;
};
export function calculer_points(nbJoueurs, params) {
    check(nbJoueurs, params);
    var multi = nbJoueurs === 4 ? 3 : 2;
    var avecquelappele = params.avecquelappele, chelemannoncepar = params.chelemannoncepar, chelemrealisepar = params.chelemrealisepar, nombredeboutsfaits = params.nombredeboutsfaits, petitmeneauboutpar = params.petitmeneauboutpar, pointscomptesattaque = params.pointscomptesattaque, quelcontrat = params.quelcontrat, quiapris = params.quiapris, poignee1annonceepar = params.poignee1annonceepar, typedepoignee1 = params.typedepoignee1, poignee2annonceepar = params.poignee2annonceepar, typedepoignee2 = params.typedepoignee2;
    var faitede = get_fait_de(pointscomptesattaque, nombredeboutsfaits);
    var nbPtsJoueurAppele = get_points_appel(faitede, quelcontrat)
        + get_petit(petitmeneauboutpar, quiapris, avecquelappele, quelcontrat)
        + get_poignee(poignee1annonceepar, typedepoignee1, faitede)
        + get_poignee(poignee2annonceepar, typedepoignee2, faitede)
        + get_chelem(chelemannoncepar, chelemrealisepar, quiapris, avecquelappele);
    var nbPtsJoueurPreneur = multi * nbPtsJoueurAppele;
    var nbPtsJoueurDefense = -nbPtsJoueurAppele;
    if (quiapris === avecquelappele) {
        nbPtsJoueurPreneur += nbPtsJoueurPreneur;
        nbPtsJoueurAppele = 0;
    }
    return {
        appele: nbPtsJoueurAppele,
        defense: nbPtsJoueurDefense,
        preneur: nbPtsJoueurPreneur,
    };
}
var main = {
    get_chelem_calc: get_chelem_calc,
    get_chelem: get_chelem,
};
export default main;
