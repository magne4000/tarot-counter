"use strict";

/* global Vue */
/* global $ */

var CorresBoutsPoints = [56, 51, 41, 36];

function printError(msg){
  console.error(msg);
  M.toast({ html: msg, classes: 'warn' });
  return false;
}

function callbackError(msg){
  return function() {
    printError(msg);
  };
}

$(document).ready(function() {
  $(".dropdown-trigger").dropdown();

  Vue.directive('select', {
    twoWay: true,
    bind: function (...args) {
      Vue.nextTick(() => {
        const $this = $(this.el);
        $this.formSelect();
      });
    },
    update: function (newValue, oldValue) {
        Vue.nextTick(() => {
            const instance = M.FormSelect.getInstance(this.el);
            if (instance) {
                instance.destroy();
                $(this.el).formSelect();
            }
        });
    },
    unbind: function () {
        M.FormSelect.getInstance(this.el).destroy();
    }
  });

  var JoueursComponent = Vue.extend({
    props: {
      id: String,
      parentModel: {
        twoWay: true,
      },
      joueurs: Array,
      label: String,
    },
    template: '<div class="input-field col s12">' +
      '<select v-select="joueurs" v-model="parentModel">' +
        '<option v-for="joueur in joueurs" value="P{{$index + 1}}" track-by="$index">' +
          '{{joueur}}' +
        '</option>' +
      '</select>' +
      '<label>{{label}}</label>' +
    '</div>'
  });

  Vue.component('joueurs', JoueursComponent);

  new Vue({
    el: '#app',
    data: {
      page: 0,
      parties: [],
      scores: [],
      scoretotal: [0, 0, 0],
      joueurs: ['', '', '']
    },
    methods: {
      ismax: function ismax(value, values) {
        return Math.max.apply(Math, values) === value;
      },
      add_player: function add_player(event) {
        if (this.joueurs.length < 5) {
          this.joueurs.push('');
          this.scoretotal.push(0);
        }
      },
      start: function start(event) {
        for (var ind in this.joueurs) {
          if (!this.joueurs[ind]) {
            return printError("Joueur " + (1+parseInt(ind, 10)) + " vide");
          }
        }
        this.change_page(1);
      },
      change_page: function change_page(nextpage) {
        if (typeof nextpage === 'string') {
          this.page = nextpage;
          return;
        }
        var ret = false;
        // Mise à jour des scores
        if (typeof this.page !== 'string' && this.page !== 0) {
          ret = this.calculer_points(this.page);
        }
        if (ret && nextpage > this.page) {
          ret();
        } else {
          // Nouvelle partie
          if (nextpage > this.parties.length) {
            this.parties.push({quiapris: 'P1'});
          }
          this.page = nextpage;
        }
      },
      get_score_joueur: function get_score_player(player, preneur, appel, nbPtsJoueurPreneur, nbPtsJoueurAppele, nbPtsJoueurDefense) {
        if (player === preneur)
          return nbPtsJoueurPreneur;
        if (player === appel)
          return nbPtsJoueurAppele;
        return nbPtsJoueurDefense;
      },
      update_score_total: function update_score_total() {
        var i=0, j, score_total=[];
        for (; i<this.scores.length; i++) {
          for (j=0; j<this.scores[i].length; j++) {
            if (!score_total[j]) score_total.push(this.scores[i][j].score);
            else {
              score_total[j] += this.scores[i][j].score;
            }
          }
        }
        this.scoretotal = score_total;
      },
      update_scores: function update_scores(page, quiapris, avecquelappele, nbPtsJoueurPreneur, nbPtsJoueurAppele, nbPtsJoueurDefense, faitede) {
        // console.log(
        //   'quiapris:', quiapris,
        //   '\navecquelappele:', avecquelappele,
        //   '\nnbPtsJoueurPreneur:', nbPtsJoueurPreneur,
        //   '\nnbPtsJoueurAppele:', nbPtsJoueurAppele,
        //   '\nnbPtsJoueurDefense:', nbPtsJoueurDefense,
        //   '\nfaitede:', faitede);
        var scoreLine = [], i = 1, scorePlayer;
        for (; i<=this.joueurs.length; i++) {
          scorePlayer = this.get_score_joueur('P'+i, quiapris, avecquelappele, nbPtsJoueurPreneur, nbPtsJoueurAppele, nbPtsJoueurDefense);
          scoreLine.push({
            score: scorePlayer,
            apris: quiapris === 'P'+i,
            estappele: avecquelappele === 'P'+i
          });
        }
        this.scores.$set(page - 1, scoreLine);
        this.update_score_total();
      },
      calculer_points: function calculer_points(ind){
        var multi = null;
        ind = (ind)?ind:this.parties.length;
        var quiapris = this.parties[ind-1].quiapris;
        var avecquelappele = this.parties[ind-1].avecquelappele;
        var quelcontrat = this.parties[ind-1].quelcontrat;
        var petitmeneauboutpar = this.parties[ind-1].petitmeneauboutpar;
        var nombredeboutsfaits = this.parties[ind-1].nombredeboutsfaits;
        var pointscomptesattaque = this.parties[ind-1].pointscomptesattaque;
        var poignee1annonceepar = this.parties[ind-1].poignee1annonceepar;
        var typedepoignee1 = this.parties[ind-1].typedepoignee1;
        var poignee2annonceepar = this.parties[ind-1].poignee2annonceepar;
        var typedepoignee2 = this.parties[ind-1].typedepoignee2;
        var chelemannoncepar = this.parties[ind-1].chelemannoncepar;
        var chelemrealisepar = this.parties[ind-1].chelemrealisepar;

        // console.log(
        //   'quiapris:', quiapris,
        //   '\navecquelappele:', avecquelappele,
        //   '\nquelcontrat:', quelcontrat,
        //   '\npetitmeneauboutpar:', petitmeneauboutpar,
        //   '\nnombredeboutsfaits:', nombredeboutsfaits,
        //   '\npointscomptesattaque:', pointscomptesattaque,
        //   '\npoignee1annonceepar:', poignee1annonceepar,
        //   '\ntypedepoignee1:', typedepoignee1,
        //   '\npoignee2annonceepar:', poignee2annonceepar,
        //   '\ntypedepoignee2:', typedepoignee2,
        //   '\nchelemannoncepar:', chelemannoncepar,
        //   '\nchelemrealisepar:', chelemrealisepar);

        //Vérifications
        if (!quiapris){
          return callbackError("Le champ “Qui à pris ?” doit être renseigné.");
        }
        if (!nombredeboutsfaits) {
          return callbackError("Le champ “Nombre de bouts faits ?” doit être renseigné.");
        }
        if (!pointscomptesattaque) {
          return callbackError("Le champ “Points comptés preneur” doit être renseigné.");
        }
        if ((poignee1annonceepar && !typedepoignee1) || (!poignee1annonceepar && typedepoignee1)){
          return callbackError("Poignée 1, informations incomplètes.");
        }
        if ((poignee2annonceepar && !typedepoignee2) || (!poignee2annonceepar && typedepoignee2)){
          return callbackError("Poignée 2, informations incomplètes.");
        }
        //Si pas d'erreur, on nettoie le possible précédent message d'erreur.
        $('.warn').empty();

        if (this.joueurs.length === 5){
          multi = 2;
          if (!avecquelappele) {
            avecquelappele = quiapris;
          }
        }else if (this.joueurs.length === 4){
          multi = 3;
          avecquelappele = null;
        }else if(this.joueurs.length === 3){
          multi = 2;
          avecquelappele = null;
        }

        var nbPtsJoueurAppele = null;
        var nbPtsJoueurPreneur = null;
        var nbPtsJoueurDefense = null;

        //Points dépendants du contrat
        var faitede = (pointscomptesattaque - (CorresBoutsPoints[nombredeboutsfaits]));
        if (faitede >= 0){
          nbPtsJoueurAppele = (faitede + 25) * quelcontrat;
        }else{
          nbPtsJoueurAppele = (faitede - 25) * quelcontrat;
        }
        if (petitmeneauboutpar === quiapris || petitmeneauboutpar === avecquelappele){
          nbPtsJoueurAppele += 10 * quelcontrat;
        }else if(petitmeneauboutpar){
          nbPtsJoueurAppele -= 10 * quelcontrat;
        }
        nbPtsJoueurPreneur = multi * nbPtsJoueurAppele;
        nbPtsJoueurDefense = -nbPtsJoueurAppele;
        //Points hors contrat
        if (poignee1annonceepar){
          if (faitede >= 0){//L'attaque a gagnée
            nbPtsJoueurAppele += typedepoignee1;
            nbPtsJoueurPreneur += multi * typedepoignee1;
            nbPtsJoueurDefense -= typedepoignee1;
          }else{
            nbPtsJoueurAppele -= typedepoignee1;
            nbPtsJoueurPreneur -= multi * typedepoignee1;
            nbPtsJoueurDefense += typedepoignee1;
          }
        }
        if (poignee2annonceepar){
          if (faitede >= 0){//L'attaque a gagnée
            nbPtsJoueurAppele += typedepoignee2;
            nbPtsJoueurPreneur += multi * typedepoignee2;
            nbPtsJoueurDefense -= typedepoignee2;
          }else{
            nbPtsJoueurAppele -= typedepoignee2;
            nbPtsJoueurPreneur -= multi * typedepoignee2;
            nbPtsJoueurDefense += typedepoignee2;
          }
        }

        if (chelemannoncepar === quiapris || chelemannoncepar === avecquelappele){
          //Annoncé par l'attaque et réalisé par l'attaque
          if (quiapris == chelemrealisepar || avecquelappele == chelemrealisepar){
            nbPtsJoueurAppele += 400;
            nbPtsJoueurPreneur += multi * 400;
            nbPtsJoueurDefense -= 400;
          }else{ //Annoncé par l'attaque et chutée par l'attaque
            nbPtsJoueurAppele -= 200;
            nbPtsJoueurPreneur -= multi * 200;
            nbPtsJoueurDefense += 200;
          }
        }else if (!chelemannoncepar){ //Non annoncé
          //Non annoncé et réalisé par l'attaque
          if (quiapris === chelemrealisepar || avecquelappele === chelemrealisepar){
            nbPtsJoueurAppele += 200;
            nbPtsJoueurPreneur += multi * 200;
            nbPtsJoueurDefense -= 200;
          }else if(chelemrealisepar){//Non annoncé et réalisé par la defense
            nbPtsJoueurAppele -= 200;
            nbPtsJoueurPreneur -= multi * 200;
            nbPtsJoueurDefense += 200;
          }
          //else par de chelem
        }else{ //Annoncé par la defense
          //Annoncé par la defense et réalisé par la defense
          if (chelemrealisepar && quiapris !== chelemrealisepar && avecquelappele !== chelemrealisepar){
            nbPtsJoueurAppele -= 200;
            nbPtsJoueurPreneur -= multi * 200;
            nbPtsJoueurDefense += 200;
          }else{ //Annoncé par la defense et chutée par la defense
            nbPtsJoueurAppele += 200;
            nbPtsJoueurPreneur += multi * 200;
            nbPtsJoueurDefense -= 200;
          }
        }
        if (quiapris === avecquelappele){
          nbPtsJoueurPreneur += nbPtsJoueurPreneur;
          nbPtsJoueurAppele = 0;
        }
        //Mise à jour des scores
        this.update_scores(ind, quiapris, avecquelappele, nbPtsJoueurPreneur, nbPtsJoueurAppele, nbPtsJoueurDefense, faitede);
        return false;
      }
    }
  });
});
