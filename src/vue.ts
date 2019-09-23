import { calculer_points, get_score_joueur, Joueur, Partie, Points } from './tarot';

declare const Vue: any;

const JoueursComponent = Vue.extend({
  props: {
    id: String,
    parentModel: {
    twoWay: true
    },
    joueurs: Array,
    n: Number
  },
  template: `<fieldset data-role="controlgroup" data-type="horizontal" data-mini="true">
    <template v-for="joueur in joueurs" track-by="$index">
    <input type="radio" v-model="parentModel" name="{{ id }}_{{n}}" id="{{ id }}_P{{$index + 1}}_{{n}}" value="P{{$index + 1}}" v-jqm-radio>
    <label for="{{ id }}_P{{$index + 1}}_{{n}}">{{joueur}}</label>
    </template>
  </fieldset>`
});

Vue.component('joueurs', JoueursComponent);

const data = {
  page: 0 as number | string,
  parties: [] as Partial<Partie>[],
  scores: [] as number[][],
  scoretotal: [] as number[],
  joueurs: [] as Joueur[]
};

const methods = {
  ismax: function ismax(value: number, values: number[]) {
    return Math.max(...values) === value;
  },
  add_player: function add_player(this: VueSelf) {
    if (this.joueurs.length < 5) {
      this.joueurs.push({ nom: '' });
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
    if (nextpage > this.parties.length) {
      this.parties.push({});
    }
    if (typeof this.page === 'number' && this.page !== 0) {
      try {
        const partie = this.parties[this.page];
        const ret = calculer_points(this.joueurs.length, partie);
        this.update_scores(this.page, partie.quiapris!, partie.avecquelappele!, ret);
        this.page = nextpage;
      } catch (e) {
        console.error(e);
      }
    }
  },
  update_scores: function update_scores(this: VueSelf, page: number, quiapris: Joueur, avecquelappele: Joueur, points: Points) {
    const scoreLine = [], i = 1, scorePlayer;
    for (const joueur of this.joueurs) {
      scorePlayer = get_score_joueur(joueur, quiapris, avecquelappele, points);
      scoreLine.push({
        score: scorePlayer,
        apris: quiapris === 'P'+i,
        estappele: avecquelappele === 'P'+i
      });
    }
    this.scores.$set(page - 1, scoreLine);
    this.update_score_total();
  },
  update_score_total: function update_score_total(this: VueSelf) {
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