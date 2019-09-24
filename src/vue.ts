import { calculer_points, get_score_joueur, Joueur, Partie, Points } from './tarot';

declare const Vue: any;
declare const $: any;

const joueurValidation = {
  rules: [
    {
      type   : 'empty',
      prompt : 'Veuillez entrer un nom de joueur'
    }
  ]
};

Vue.directive('form-joueurs', {
  bind: function () {
    $(this.el).form({
      fields: {
        'joueur-1': joueurValidation,
        'joueur-2': joueurValidation,
        'joueur-3': joueurValidation,
        'joueur-4': joueurValidation,
        'joueur-5': joueurValidation,
      }
    });
  },
});

const JoueursComponent = Vue.extend({
  props: {
    id: String,
    parentModel: {
    twoWay: true
    },
    joueurs: Array,
  },
  template: `<div class="">
      <select v-model="parentModel">
        <option v-for="joueur in joueurs" :value="joueur" track-by="$index">
          {{joueur}}
        </option>
      </select>
      <label>{{label}}</label>
    </div>`
});

Vue.component('joueurs', JoueursComponent);

type Score = {
  score: number,
  apris: boolean,
  estappele: boolean,
}

const nouveau_joueur = (): Joueur => ({ nom: '' });

const data = {
  page: 0 as number | string,
  parties: [] as Partial<Partie>[],
  scores: [] as Score[][],
  scoretotal: [] as number[],
  joueurs: [nouveau_joueur(), nouveau_joueur(), nouveau_joueur()] as Joueur[]
};

const methods = {
  ismax: function ismax(value: number, values: number[]) {
    return Math.max(...values) === value;
  },
  add_player: function add_player(this: VueSelf) {
    if (this.joueurs.length < 5) {
      this.joueurs.push(nouveau_joueur());
      this.scoretotal.push(0);
    }
  },
  start: function start(this: VueSelf) {
    for (let ind in this.joueurs) {
      if (!this.joueurs[ind]) {
        throw new Error("Joueur " + (1+parseInt(ind, 10)) + " vide");
      }
    }
    this.change_page(1);
  },
  change_page: function change_page(this: VueSelf, nextpage: number | string) {
    if (typeof nextpage === 'string') {
      this.page = nextpage;
      return;
    }
    if (typeof this.page === 'number' && this.page !== 0) {
      try {
        const partie = this.parties[this.page];
        this.update_scores(this.page, partie.quiapris!, partie.avecquelappele!, calculer_points(this.joueurs.length, partie));
        if (nextpage > this.parties.length) {
          this.parties.push({});
        }
        this.page = nextpage;
      } catch (e) {
        console.error(e);
      }
    }
  },
  update_scores: function update_scores(this: VueSelf, page: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) {
    const scoreLine: Score[] = [];
    for (const joueur of this.joueurs) {
      scoreLine.push({
        score: get_score_joueur(joueur, quiapris, avecquelappele, points),
        apris: quiapris === joueur,
        estappele: avecquelappele === joueur
      });
    }
    (this.scores as any).$set(page - 1, scoreLine);
    this.update_score_total();
  },
  update_score_total: function update_score_total(this: VueSelf) {
    let i=0, j, score_total=[];
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
};

type VueSelf = typeof data &
  { change_page: (nextpage: number | string) => void } &
  { update_scores: (page: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) => void } &
  { update_score_total: () => void };

export default new Vue({
  el: '#app',
  data: data,
  methods: methods,
});